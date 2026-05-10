import { genId } from './genId';
import type { Question, QuestionType } from '../types';

/**
 * Build an empty Question of the given type with sensible defaults.
 * Used by "Create new" + when teacher switches type in the editor.
 */
export function blankQuestion(type: QuestionType): Question {
  const base: Question = {
    type,
    question_content: { content: { text: '' } },
    score: 1,
    tags: [],
  };
  switch (type) {
    case 'single':
    case 'multiple':
      return {
        ...base,
        options: [
          { id: genId(), text: { text: '' }, is_correct: type === 'single' },
          { id: genId(), text: { text: '' }, is_correct: false },
        ],
      };
    case 'fill_in_the_blank':
      return {
        ...base,
        fill_in_the_blanks: [
          {
            id: genId(),
            text_before: { text: '' },
            text_after: { text: '' },
            blank: '___',
            correct_submission: '',
          },
        ],
      };
    case 'order_question':
      return {
        ...base,
        order_items: [
          { id: genId(), text: { text: '' }, order: 1 },
          { id: genId(), text: { text: '' }, order: 2 },
        ],
      };
    case 'match_choice_question': {
      const itemId = genId();
      return {
        ...base,
        match_items: [{ id: itemId, text: { text: '' } }],
        match_options: [
          { id: genId(), text: { text: '' }, match_id: itemId },
        ],
      };
    }
  }
}
