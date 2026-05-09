import { useEffect, useState } from 'react';
import { fileApi } from '~/shared/services/fileApi';

interface Props {
  fileId: string;
  contentType?: string;
  filename?: string;
  className?: string;
}

const CACHE_TTL_MS = 14 * 60 * 1000; // < signed URL TTL (15min) so we never serve stale

interface CachedURL {
  url: string;
  contentType: string;
  expiresAt: number;
}

function readCache(fileId: string): CachedURL | null {
  const raw = sessionStorage.getItem('fileurl:' + fileId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedURL;
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem('fileurl:' + fileId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(fileId: string, url: string, contentType: string) {
  sessionStorage.setItem(
    'fileurl:' + fileId,
    JSON.stringify({
      url,
      contentType,
      expiresAt: Date.now() + CACHE_TTL_MS,
    } satisfies CachedURL),
  );
}

/**
 * Render a file (image/audio/video/pdf) by file_id via short-lived signed URL.
 * Privacy: does NOT accept author_mail / owner_id — server resolves via file_id.
 */
export default function FileViewer({
  fileId,
  contentType,
  filename,
  className,
}: Props) {
  const [url, setUrl] = useState<string>('');
  const [type, setType] = useState<string | undefined>(contentType);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);

    const cached = readCache(fileId);
    if (cached) {
      setUrl(cached.url);
      setType(cached.contentType);
      return;
    }

    fileApi
      .getSignedURL(fileId)
      .then((res) => {
        if (!mounted) return;
        writeCache(fileId, res.url, res.content_type);
        setUrl(res.url);
        setType(res.content_type);
      })
      .catch(() => {
        if (mounted) setError('Không tải được file.');
      });

    return () => {
      mounted = false;
    };
  }, [fileId]);

  if (error)
    return <span className="text-[var(--qz-danger)] text-sm">{error}</span>;
  if (!url) return <div className="qz-spinner" aria-label="Đang tải file" />;

  const t = type ?? guessContentType(filename ?? '');

  if (t.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={filename ?? ''}
        className={className ?? 'max-w-full rounded'}
      />
    );
  }
  if (t.startsWith('audio/')) {
    return (
      <audio controls className="w-full">
        <source src={url} type={t} />
      </audio>
    );
  }
  if (t.startsWith('video/')) {
    return (
      <video controls className={className ?? 'w-full rounded'}>
        <source src={url} type={t} />
      </video>
    );
  }
  if (t === 'application/pdf') {
    return (
      <iframe
        src={url}
        className={className ?? 'w-full h-[600px] border rounded'}
        title={filename ?? 'PDF'}
      />
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="qz-btn qz-btn-secondary">
      Tải xuống {filename ?? ''}
    </a>
  );
}

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image/' + ext;
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'mp4':
    case 'webm':
      return 'video/' + ext;
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
