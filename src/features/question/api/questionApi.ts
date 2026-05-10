import API_ENDPOINTS from '~/app/config';
import http from '~/shared/services/axiosInstance';
import type {
  Level,
  PaginatedQuestions,
  Question,
  QuestionFilters,
  Topic,
} from '../types';

/**
 * Question CRUD client. Wraps the quiz-app Go endpoints. Per CLAUDE.md G2:
 *   - GET /questions returns Paginated<Question>
 *   - DELETE /questions/:id (URL param)
 */
export const questionApi = {
  list: (filters: QuestionFilters = {}) =>
    http
      .get<PaginatedQuestions>(API_ENDPOINTS.QUESTIONS, { params: filters })
      .then((r) => r.data),

  create: (q: Question) =>
    http.post<Question>(API_ENDPOINTS.QUESTIONS, q).then((r) => r.data),

  update: (q: Question) =>
    http.patch<Question>(API_ENDPOINTS.QUESTIONS, q).then((r) => r.data),

  remove: (id: string) =>
    http
      .delete<void>(`${API_ENDPOINTS.QUESTIONS}/${encodeURIComponent(id)}`)
      .then(() => undefined),
};

export const topicApi = {
  list: () => http.get<Topic[]>(API_ENDPOINTS.TOPIC).then((r) => r.data).catch((e) => console.log(e)),
  create: (t: Pick<Topic, 'topic_name' | 'topic_no'>) =>
    http.post<Topic>(API_ENDPOINTS.TOPIC, t).then((r) => r.data),
  update: (t: Topic) =>
    http.patch<Topic>(API_ENDPOINTS.TOPIC, t).then((r) => r.data),
  remove: (id: string) =>
    http.delete(API_ENDPOINTS.TOPIC, { data: { _id: id } }).then(() => undefined),
  /** Atomic bulk reorder: server assigns topic_no by index of orderedIDs. */
  reorder: (orderedIDs: string[]) =>
    http
      .post<void>(API_ENDPOINTS.TOPIC_REORDER, { ordered_ids: orderedIDs })
      .then(() => undefined),
};

export const levelApi = {
  list: () => http.get<Level[]>(API_ENDPOINTS.LEVEL).then((r) => r.data),
  create: (l: Pick<Level, 'level_name'>) =>
    http.post<Level>(API_ENDPOINTS.LEVEL, l).then((r) => r.data),
  update: (l: Level) =>
    http.patch<Level>(API_ENDPOINTS.LEVEL, l).then((r) => r.data),
  remove: (id: string) =>
    http.delete(API_ENDPOINTS.LEVEL, { data: { _id: id } }).then(() => undefined),
};
