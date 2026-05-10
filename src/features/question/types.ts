/**
 * Canonical Question types — match BE Go entity (quiz-app/internal/domain/entity/question.go)
 * + CLAUDE.md D2.
 *
 * File references use `file_id` only (E#17). Server-only fields like
 * `is_correct`, `correct_submission`, `match_id`, `order` ARE present here
 * because teacher view needs them; they are stripped server-side when serving
 * to students (see PublicQuestion in `features/exam/types.ts`).
 */
import { CircleDot, CheckSquare, PencilLine, ListOrdered, Combine } from 'lucide-react';

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'fill_in_the_blank'
  | 'order_question'
  | 'match_choice_question';


export const QUESTION_TYPES = [
  {
    value: 'single',
    label: 'Một đáp án',
    icon: CircleDot
  },
  {
    value: 'multiple',
    label: 'Nhiều đáp án',
    icon: CheckSquare
  },
  {
    value: 'fill_in_the_blank',
    label: 'Điền từ',
    icon: PencilLine
  },
  {
    value: 'order_question',
    label: 'Sắp xếp',
    icon: ListOrdered
  },
  {
    value: 'match_choice_question',
    label: 'Ghép đôi',
    icon: Combine
  },
];
export interface RichText {
  is_math?: boolean;
  text?: string;
}

export interface FileRef {
  file_id: string;
}

export interface QuestionContent {
  content?: RichText;
  file_id?: string;
}

export interface Option {
  id?: string;
  text?: RichText;
  file_id?: string;
  is_correct?: boolean;
}

export interface FillInTheBlank {
  id?: string;
  text_before?: RichText;
  text_after?: RichText;
  blank?: string;
  correct_submission?: string;
}

export interface OrderItem {
  id?: string;
  text?: RichText;
  order?: number;
}

export interface MatchItem {
  id?: string;
  text?: RichText;
}

export interface MatchOption {
  id?: string;
  text?: RichText;
  match_id?: string;
}

export interface Metadata {
  user_id?: string;
}

export interface Question {
  _id?: string;
  type: QuestionType;
  question_content: QuestionContent;
  metadata?: Metadata;
  tags?: string[];
  suggestion?: string[];
  score?: number;
  level?: string;
  topic?: string;
  files?: FileRef[];

  options?: Option[];
  fill_in_the_blanks?: FillInTheBlank[];
  order_items?: OrderItem[];
  match_items?: MatchItem[];
  match_options?: MatchOption[];

  created_at?: string;
  updated_at?: string;
}

export interface QuestionFilters {
  topic_id?: string;
  level_id?: string;
  type?: QuestionType;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedQuestions {
  items: Question[];
  total: number;
  page: number;
  limit: number;
}

export interface Topic {
  _id: string;
  topic_name: string;
  topic_no?: number;
  user_id?: string;
}

export interface Level {
  _id: string;
  level_name: string;
  user_id?: string;
}
