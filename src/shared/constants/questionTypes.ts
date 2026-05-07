import { OrderItem, MatchItem, MatchOption, FillInTheBlank, Option } from '~/shared/types/question';

// Question types constants
export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  MATCH: 'match_choice_question',
  ORDER: 'order_question',
  FILL: 'fill_in_the_blank',
  FILE: 'file_upload_question',
};

export const TYPE_STYLES = {
  [QUESTION_TYPES.ORDER]: { bgColor: 'bg-orange-500', label: 'ORDER' },
  [QUESTION_TYPES.MULTIPLE]: { bgColor: 'bg-orange-300', label: 'MULTIPLE' },
  [QUESTION_TYPES.FILL]: { bgColor: 'bg-blue-500', label: 'FILL' },
  [QUESTION_TYPES.MATCH]: { bgColor: 'bg-green-500', label: 'MATCH' },
  [QUESTION_TYPES.SINGLE]: { bgColor: 'bg-purple-500', label: 'SINGLE' },
};

export const TYPE_SPECIFIC_FIELDS = {
  [QUESTION_TYPES.SINGLE]: {
    options: [{ text: { is_math: false, text: "" }, imageurl: '', is_correct: false }] as Option[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.MULTIPLE]: {
    options: [{ text: { is_math: false, text: "" }, imageurl: '', is_correct: false }] as Option[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.MATCH]: {
    match_options: [] as MatchOption[],
    match_items: [] as MatchItem[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.ORDER]: {
    options: [] as OrderItem[], // Ensure it's typed as OrderItem[]
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.FILL]: {
    fill_in_the_blanks: [
      {
        id: '', // added missing id property
        text_before: {
          is_math: false,
          text: ""
        },
        blank: '_____',
        text_after: {
          is_math: false,
          text: ""
        },
        correct_submission: '',
      },
    ] as FillInTheBlank[], // Ensure it's typed as FillInTheBlank[]
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.FILE]: {
    metadata: {},
    suggestion: '',
  },
};
