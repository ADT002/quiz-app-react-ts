// Thin compatibility shim. New code should import from
// `~/shared/services/fileApi` directly.
import { fileApi, type FileMeta } from '~/shared/services/fileApi';

/**
 * @deprecated Use `fileApi.presignAndUpload(file)`.
 * Returns the new file_id-based metadata. The legacy second `navigate` arg
 * is ignored (axios interceptor handles 401).
 */
export async function uploadFileToS3(file: File): Promise<FileMeta> {
  return fileApi.presignAndUpload(file);
}

/**
 * @deprecated Use `fileApi.getSignedURL(file_id).then(r => r.url)`.
 * Privacy: this helper no longer accepts `author_mail` — server resolves
 * owner via file_id alone (CLAUDE.md E#16).
 */
export async function getPresignedDownloadUrl(file_id: string): Promise<string> {
  const r = await fileApi.getSignedURL(file_id);
  return r.url;
}
