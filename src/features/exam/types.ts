/**
 * Types khớp shape BE quiz-do-test-nestjs ExamController + Submission entity.
 * Source of truth: CLAUDE.md mục D2, F6, G2.
 */

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'fill_in_the_blank'
  | 'order_question'
  | 'match_choice_question';

/** BE wraps strings to support math/LaTeX rendering. See Text entity. */
export interface RichText {
  is_math?: boolean;
  text?: string;
}

export interface QuestionContent {
  content?: RichText;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
}

export interface PublicOption {
  id: string;
  text?: RichText;
}

export interface PublicFillBlank {
  id: string;
  text_before?: RichText;
  text_after?: RichText;
  blank?: string;
}

export interface PublicOrderItem {
  id: string;
  text?: RichText;
}

export interface PublicMatchItem {
  id: string;
  text?: RichText;
}

/**
 * Question as served to student during exam — answer keys stripped server-side.
 * Server may also shuffle options/items per (test, student).
 */
export interface PublicQuestion {
  _id: string;
  type: QuestionType;
  question_content?: QuestionContent;
  score?: number;
  tags?: string[];
  suggestion?: string;
  options?: PublicOption[];
  fill_in_the_blanks?: PublicFillBlank[];
  order_items?: PublicOrderItem[];
  match_items?: PublicMatchItem[];
  match_options?: PublicOption[];
}

/* ── Student answer payloads (gửi qua /draft + /submit) ──────────────────── */

export interface SingleAnswer {
  question_id: string;
  type: 'single';
  selected_id: string;
}

export interface MultipleAnswer {
  question_id: string;
  type: 'multiple';
  selected_ids: string[];
}

export interface FillAnswer {
  question_id: string;
  type: 'fill_in_the_blank';
  fill_answers: { blank_id: string; value: string }[];
}

export interface OrderAnswer {
  question_id: string;
  type: 'order_question';
  ordered_ids: string[];
}

export interface MatchAnswer {
  question_id: string;
  type: 'match_choice_question';
  match_answers: { item_id: string; option_ids: string[] }[];
}

export type StudentAnswer =
  | SingleAnswer
  | MultipleAnswer
  | FillAnswer
  | OrderAnswer
  | MatchAnswer;

/* ── Endpoint responses ─────────────────────────────────────────────────── */

export interface TestInfo {
  _id?: string;
  test_name?: string;
  duration_minutes?: number;
  is_test?: boolean;
  start_time?: string;
  end_time?: string;
  test_score?: number;
}

export type SubmissionStatus =
  | 'in_progress'
  | 'submitted'
  | 'auto_submitted'
  | 'expired';

export interface StartExamResponseExam {
  mode: 'exam';
  submission_id: string;
  test_info: TestInfo;
  questions: PublicQuestion[];
  server_end_at: string;
  server_now: string;
  remaining_seconds?: number;
}

export interface StartExamResponsePractice {
  mode: 'practice';
  test_info: TestInfo;
  questions: PublicQuestion[];
  server_now: string;
}

export interface StartExamResponseSubmitted {
  mode: 'submitted';
  submission_id: string;
  submission: SubmissionResult;
  server_now: string;
}

export type StartExamResponse =
  | StartExamResponseExam
  | StartExamResponsePractice
  | StartExamResponseSubmitted;

export interface ResumeResponse {
  mode: 'exam';
  submission_id: string;
  test_info: TestInfo;
  questions: PublicQuestion[];
  draft_answers: StudentAnswer[];
  last_saved_at: string | null;
  server_end_at: string;
  server_now: string;
}

export interface DraftResponse {
  submission_id: string;
  last_saved_at: string;
}

export interface HeartbeatResponse {
  submission_id: string;
  server_end_at: string;
  server_now: string;
}

export interface AnswerResult {
  question_id: string;
  type: string;
  is_correct: boolean;
  score_earned: number;
  [extra: string]: unknown;
}

export interface SubmissionResult {
  submission_id: string;
  status: SubmissionStatus;
  score: number;
  raw_score: number;
  max_score: number;
  total_correct: number;
  total_questions: number;
  submitted_at: string | null;
  answers: AnswerResult[];
}

export interface PracticeResponse {
  mode: 'practice';
  test_info: TestInfo;
  questions: PublicQuestion[];
}
