// ================= BASE URL =================
const API_BASE_URL_AUTH = 'http://localhost:8080';       // auth
const API_BASE_URL_MANAGE_TEST = 'http://localhost:8081';  // test, class, question, topic, level, type-question
const API_BASE_URL_DO_TEST = 'http://localhost:8083';              // file, s3
// ================= API ENDPOINTS =================
const API_ENDPOINTS = {
  // ========= AUTH / USER =========
  // GOOGLE_LOGIN: `${API_BASE_URL}/api/google/login`,
  LOGIN: `${API_BASE_URL_AUTH}/auth/login`,
  USERS: `${API_BASE_URL_MANAGE_TEST}/users`,

  // ========= HOST / TEACHER =========
  TESTS: `${API_BASE_URL_MANAGE_TEST}/test-templates`,
  TEST_OF_CLASS: `${API_BASE_URL_MANAGE_TEST}/test-of-class`,
  CLASSES: `${API_BASE_URL_MANAGE_TEST}/class`,
  GENERATE_CLASS_CODE: `${API_BASE_URL_MANAGE_TEST}/code-class`,
  QUESTIONS: `${API_BASE_URL_MANAGE_TEST}/questions`,
  TOPIC: `${API_BASE_URL_MANAGE_TEST}/topic`,
  LEVEL: `${API_BASE_URL_MANAGE_TEST}/level`,
  TYPE_QUESTION: `${API_BASE_URL_MANAGE_TEST}/type-question`,
  RESET_TEST: `${API_BASE_URL_MANAGE_TEST}/class/reset-test`,
  CREATE_FROM_TEMPLATE: `${API_BASE_URL_MANAGE_TEST}/class/create-from-template`,


  // ========= STUDENT =========
  JOIN_CLASS: `${API_BASE_URL_MANAGE_TEST}/class/join-class`,

  // ========= TEST PROCESS (legacy aliases — being migrated) =========
  STUDENT_CLASSES: `${API_BASE_URL_DO_TEST}/class-test/get-class`,
  GET_TESTS_OF_CLASS: `${API_BASE_URL_DO_TEST}/class-test/get-test-of-class`,
  /** @deprecated Use EXAM_START. Old route was removed in BE Phase 3. */
  START_TEST: `${API_BASE_URL_DO_TEST}/exam/start`,
  /** @deprecated Use EXAM_SUBMIT. */
  SUBMIT_TEST: `${API_BASE_URL_DO_TEST}/exam/submit`,

  // ========= EXAM (Phase 3 BE refactor) =========
  EXAM_START: `${API_BASE_URL_DO_TEST}/exam/start`,
  EXAM_RESUME: `${API_BASE_URL_DO_TEST}/exam/resume`,
  EXAM_DRAFT: `${API_BASE_URL_DO_TEST}/exam/draft`,
  EXAM_HEARTBEAT: `${API_BASE_URL_DO_TEST}/exam/heartbeat`,
  EXAM_SUBMIT: `${API_BASE_URL_DO_TEST}/exam/submit`,
  EXAM_PRACTICE: `${API_BASE_URL_DO_TEST}/exam/practice`,

  // ========= FILE / S3 =========
  // New file API (file_id-based, S3 keys opaque). See CLAUDE.md F10 + E#15.
  FILES: `${API_BASE_URL_MANAGE_TEST}/files`,
  FILE_URL: (fileId: string) =>
    `${API_BASE_URL_MANAGE_TEST}/files/${encodeURIComponent(fileId)}/url`,
  FILE_DELETE: (fileId: string) =>
    `${API_BASE_URL_MANAGE_TEST}/files/${encodeURIComponent(fileId)}`,

  /** @deprecated removed in BE refactor — use FILES (POST). */
  UPLOAD: `${API_BASE_URL_MANAGE_TEST}/files`,
  /** @deprecated removed in BE refactor — use FILE_URL(fileId). */
  DOWNLOAD: `${API_BASE_URL_MANAGE_TEST}/files`,
  /** @deprecated use FILES (GET). */
  ALLFILE: `${API_BASE_URL_MANAGE_TEST}/files`,

  USER: `${API_BASE_URL_MANAGE_TEST}/user`,

  USER_ME: `${API_BASE_URL_MANAGE_TEST}/user/me`,

  EXPORT_SUBMISSION_PDF: `${API_BASE_URL_MANAGE_TEST}/submissions/export/pdf`


};

export default API_ENDPOINTS;
