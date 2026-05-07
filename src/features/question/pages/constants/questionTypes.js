// Question types constants
export const QUESTION_TYPES = {
  SINGLE: "single_choice_question",
  MULTIPLE: "multiple_choice_question",
  MATCH: "match_choice_question",
  ORDER: "order_question",
  FILL: "fill_in_the_blank",
  FILE: "file_upload_question",
};

export const TYPE_STYLES = {
  [QUESTION_TYPES.ORDER]: { bgColor: "bg-orange-500", label: "ORDER" },
  [QUESTION_TYPES.MULTIPLE]: { bgColor: "bg-orange-300", label: "MULTIPLE" },
  [QUESTION_TYPES.FILL]: { bgColor: "bg-blue-500", label: "FILL" },
  [QUESTION_TYPES.MATCH]: { bgColor: "bg-green-500", label: "MATCH" },
  [QUESTION_TYPES.SINGLE]: { bgColor: "bg-purple-500", label: "SINGLE" },
};

export const TYPE_SPECIFIC_FIELDS = {
  [QUESTION_TYPES.SINGLE]: {
    options: [{ text: "", imageurl: "", is_correct: false }],
  },
  [QUESTION_TYPES.MULTIPLE]: {
    options: [{ text: "", imageurl: "", is_correct: false }],
  },
  [QUESTION_TYPES.MATCH]: { options: [{ text: "", match: "" }] },
  [QUESTION_TYPES.ORDER]: { options: [{ text: "", order: 1 }] },
  [QUESTION_TYPES.FILL]: {
    fill_in_the_blank: [
      {
        text_before: "",
        blank: "_____",
        text_after: "",
        correct_submission: "",
      },
    ],
  },
  [QUESTION_TYPES.FILE]: {},
};