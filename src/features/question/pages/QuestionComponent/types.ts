export type { QuestionFormData } from '~/shared/constants/formData';

// Mapping between QUESTION_TYPES string values and local QuestionType keys
export const QUESTION_TYPE_MAP: Record<string, string> = {
  single_choice_question: 'SINGLE',
  multiple_choice_question: 'MULTIPLE',
  match_choice_question: 'MATCH',
  order_question: 'ORDER',
  fill_in_the_blank: 'FILL',
  file_upload_question: 'FILE',
};
