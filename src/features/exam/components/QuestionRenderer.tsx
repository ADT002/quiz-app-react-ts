import type {
  FillAnswer,
  MatchAnswer,
  MultipleAnswer,
  OrderAnswer,
  PublicQuestion,
  SingleAnswer,
  StudentAnswer,
} from '../types';
import { QSingle } from './questions/QSingle';
import { QMultiple } from './questions/QMultiple';
import { QFill } from './questions/QFill';
import { QOrder } from './questions/QOrder';
import { QMatch } from './questions/QMatch';

interface Props {
  question: PublicQuestion;
  answer: StudentAnswer | undefined;
  onChange: (a: StudentAnswer) => void;
}

export function QuestionRenderer({ question, answer, onChange }: Props) {
  switch (question.type) {
    case 'single':
      return (
        <QSingle
          question={question}
          answer={answer as SingleAnswer | undefined}
          onChange={onChange}
        />
      );
    case 'multiple':
      return (
        <QMultiple
          question={question}
          answer={answer as MultipleAnswer | undefined}
          onChange={onChange}
        />
      );
    case 'fill_in_the_blank':
      return (
        <QFill
          question={question}
          answer={answer as FillAnswer | undefined}
          onChange={onChange}
        />
      );
    case 'order_question':
      return (
        <QOrder
          question={question}
          answer={answer as OrderAnswer | undefined}
          onChange={onChange}
        />
      );
    case 'match_choice_question':
      return (
        <QMatch
          question={question}
          answer={answer as MatchAnswer | undefined}
          onChange={onChange}
        />
      );
    default:
      return (
        <p className="text-[var(--qz-danger)]">
          Loại câu hỏi không hỗ trợ: {(question as { type: string }).type}
        </p>
      );
  }
}
