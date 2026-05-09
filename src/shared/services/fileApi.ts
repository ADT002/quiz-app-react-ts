import API_ENDPOINTS from '~/app/config';
import http from './axiosInstance';

export interface FileMeta {
  file_id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

interface PresignUploadResponse extends FileMeta {
  upload_url: string;
  expires_in: number;
}

interface SignedURLResponse {
  url: string;
  content_type: string;
  expires_at: string;
}

interface PaginatedFiles {
  items: FileMeta[];
  total: number;
  page: number;
  limit: number;
}

export const fileApi = {
  /**
   * Owner upload flow:
   *   1. Call presignAndUpload(file) → returns FileMeta with file_id.
   *   2. Caller stores file_id on the question/test entity.
   *
   * S3 key is opaque (file_id-based), no email/user_id leak.
   */
  presignAndUpload: async (file: File): Promise<FileMeta> => {
    const presign = await http
      .post<PresignUploadResponse>(API_ENDPOINTS.FILES, {
        filename: file.name,
        content_type: file.type,
        size: file.size,
      })
      .then((r) => r.data);

    const put = await fetch(presign.upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!put.ok) throw new Error('Upload to S3 failed');

    return {
      file_id: presign.file_id,
      filename: presign.filename,
      content_type: presign.content_type,
      size: presign.size,
      created_at: new Date().toISOString(),
    };
  },

  list: (params?: {
    type?: 'image' | 'audio' | 'video';
    page?: number;
    limit?: number;
  }) =>
    http
      .get<PaginatedFiles>(API_ENDPOINTS.FILES, { params })
      .then((r) => r.data),

  /** Get a short-lived signed URL by file_id. Response contains NO owner info. */
  getSignedURL: (file_id: string) =>
    http
      .get<SignedURLResponse>(API_ENDPOINTS.FILE_URL(file_id))
      .then((r) => r.data),

  remove: (file_id: string) =>
    http.delete(API_ENDPOINTS.FILE_DELETE(file_id)).then(() => undefined),
};
