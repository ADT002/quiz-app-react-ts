// ─── Student answer shapes (frontend → backend) ───────────────────────────────

interface FillAnswerItem {
  blank_id: string;
  value: string;
}

interface MatchAnswerItem {
  item_id: string;
  option_ids: string[];
}

export interface StudentSingleAnswer {
  question_id: string;
  type: 'single';
  selected_id: string;
}

export interface StudentMultipleAnswer {
  question_id: string;
  type: 'multiple';
  selected_ids: string[];
}

export interface StudentFillAnswer {
  question_id: string;
  type: 'fill_in_the_blank';
  fill_answers: FillAnswerItem[];
}

export interface StudentOrderAnswer {
  question_id: string;
  type: 'order_question';
  ordered_ids: string[];
}

export interface StudentMatchAnswer {
  question_id: string;
  type: 'match_choice_question';
  match_answers: MatchAnswerItem[];
}

export type StudentAnswer =
  | StudentSingleAnswer
  | StudentMultipleAnswer
  | StudentFillAnswer
  | StudentOrderAnswer
  | StudentMatchAnswer;

// ─── Submit request ───────────────────────────────────────────────────────────

export interface TestSubmission {
  submission_id: string;
  test_id: string;
  class_id: string;
  user_id: string;
  author_mail: string;
  answers: StudentAnswer[];
}

// ─── Submit response (backend → frontend) ─────────────────────────────────────

export interface QuestionResult {
  question_id: string;
  type: string;
  is_correct: boolean;
  score_earned: number;
  selected_id?: string;
  selected_ids?: string[];
  fill_answers?: { blank_id: string; value: string }[];
  ordered_ids?: string[];
  match_answers?: { item_id: string; option_ids: string[] }[];
}

export interface SubmitResponse {
  score: number;
  max_score: number;
  answers: QuestionResult[];
}
