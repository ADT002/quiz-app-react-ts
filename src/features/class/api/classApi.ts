import API_ENDPOINTS from '~/app/config';
import http from '~/shared/services/axiosInstance';
import type { Class, CreateClassInput } from '../types';

/**
 * Class CRUD client (quiz-app Go). Per CLAUDE.md G2:
 *   - DELETE /class/:id (URL param)
 *   - POST /class/:id/approve, /reject (body { student_id })
 *   - POST /class/code-class (teacher) → string code
 *   - POST /class/join-class (student) → 200 message
 */
export const classApi = {
  list: () => http.get<Class[]>(API_ENDPOINTS.CLASSES).then((r) => r.data),

  create: (input: CreateClassInput) =>
    http.post<Class>(API_ENDPOINTS.CLASSES, input).then((r) => r.data),

  update: (cls: Class) =>
    http.patch<Class>(API_ENDPOINTS.CLASSES, cls).then((r) => r.data),

  remove: (id: string) =>
    http.delete<void>(API_ENDPOINTS.CLASS_DELETE(id)).then(() => undefined),

  approveStudent: (classId: string, studentId: string) =>
    http
      .post<void>(API_ENDPOINTS.CLASS_APPROVE(classId), { student_id: studentId })
      .then(() => undefined),

  rejectStudent: (classId: string, studentId: string) =>
    http
      .post<void>(API_ENDPOINTS.CLASS_REJECT(classId), { student_id: studentId })
      .then(() => undefined),

  /**
   * Generate invite code. Server returns the raw code string (legacy shape).
   * `minute` controls Redis TTL — per F3 default 24h * 60.
   */
  generateInviteCode: (classId: string, minute = 24 * 60) =>
    http
      .post<string>(API_ENDPOINTS.CLASS_CODE, { class_id: classId, minute })
      .then((r) => r.data),

  joinByCode: (code: string) =>
    http
      .post<{ success: boolean; message: string }>(API_ENDPOINTS.JOIN_CLASS, {
        key: code,
      })
      .then((r) => r.data),
};
