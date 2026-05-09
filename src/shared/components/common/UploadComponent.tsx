import { useState } from 'react';
import { fileApi, type FileMeta } from '~/shared/services/fileApi';

interface Props {
  /** Called with the resulting file metadata after a successful upload. */
  onUploaded?: (file: FileMeta) => void;
}

export default function UploadFile({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      const meta = await fileApi.presignAndUpload(file);
      setFile(null);
      onUploaded?.(meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="qz-input"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="qz-btn qz-btn-primary"
      >
        {loading ? 'Đang tải...' : 'Tải lên'}
      </button>
      {error && <span className="text-[var(--qz-danger)] text-sm">{error}</span>}
    </div>
  );
}
