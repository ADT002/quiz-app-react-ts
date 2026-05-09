import http from '~/shared/services/axiosInstance';
import API_ENDPOINTS from '~/app/config';
import type {
  DraftResponse,
  HeartbeatResponse,
  PracticeResponse,
  ResumeResponse,
  StartExamResponse,
  StudentAnswer,
  SubmissionResult,
} from '../types';

export const examApi = {
  start: (test_of_class_id: string) =>
    http
      .post<StartExamResponse>(API_ENDPOINTS.EXAM_START, { test_of_class_id })
      .then((r) => r.data),

  resume: (submission_id: string) =>
    http
      .get<ResumeResponse>(API_ENDPOINTS.EXAM_RESUME, {
        params: { submission_id },
      })
      .then((r) => r.data),

  saveDraft: (submission_id: string, answers: StudentAnswer[]) =>
    http
      .patch<DraftResponse>(API_ENDPOINTS.EXAM_DRAFT, {
        submission_id,
        answers,
      })
      .then((r) => r.data),

  heartbeat: (submission_id: string) =>
    http
      .post<HeartbeatResponse>(API_ENDPOINTS.EXAM_HEARTBEAT, { submission_id })
      .then((r) => r.data),

  submit: (submission_id: string, answers: StudentAnswer[]) =>
    http
      .post<SubmissionResult>(API_ENDPOINTS.EXAM_SUBMIT, {
        submission_id,
        answers,
      })
      .then((r) => r.data),

  practice: (test_of_class_id: string) =>
    http
      .get<PracticeResponse>(
        `${API_ENDPOINTS.EXAM_PRACTICE}/${test_of_class_id}`,
      )
      .then((r) => r.data),
};
