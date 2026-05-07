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
  GENERATE_CLASS_CODE: `${API_BASE_URL_MANAGE_TEST}/codeclass`,
  QUESTIONS: `${API_BASE_URL_MANAGE_TEST}/questions`,
  TOPIC: `${API_BASE_URL_MANAGE_TEST}/topic`,
  LEVEL: `${API_BASE_URL_MANAGE_TEST}/level`,
  TYPE_QUESTION: `${API_BASE_URL_MANAGE_TEST}/type-question`,
  RESET_TEST: `${API_BASE_URL_MANAGE_TEST}/class/reset-test`,
  CREATE_FROM_TEMPLATE: `${API_BASE_URL_MANAGE_TEST}/class/create-from-template`,


  // ========= STUDENT =========
  JOIN_CLASS: `${API_BASE_URL_MANAGE_TEST}/class/joinclass`,

  // ========= TEST PROCESS =========
  STUDENT_CLASSES: `${API_BASE_URL_DO_TEST}/class-test/get-class`,
  GET_TESTS_OF_CLASS: `${API_BASE_URL_DO_TEST}/class-test/get-test-of-class`,
  START_TEST: `${API_BASE_URL_DO_TEST}/test-process/start`,
  SUBMIT_TEST: `${API_BASE_URL_DO_TEST}/test-process/submit`,

  // ========= FILE / S3 =========

  DOWNLOAD: `${API_BASE_URL_MANAGE_TEST}/files/presign-download`,
  UPLOAD: `${API_BASE_URL_MANAGE_TEST}/files/presign-upload`,
  ALLFILE: `${API_BASE_URL_MANAGE_TEST}/files/get-files`,

  USER: `${API_BASE_URL_MANAGE_TEST}/user`,

  USER_ME: `${API_BASE_URL_MANAGE_TEST}/user/me`,

  EXPORT_SUBMISSION_PDF: `${API_BASE_URL_MANAGE_TEST}/submissions/export/pdf`


};

export default API_ENDPOINTS;
