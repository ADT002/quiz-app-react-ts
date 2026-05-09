import type { FillAnswer, PublicQuestion } from '../../types';
import { renderText } from '../../utils/renderText';

interface Props {
  question: PublicQuestion;
  answer: FillAnswer | undefined;
  onChange: (a: FillAnswer) => void;
}

export function QFill({ question, answer, onChange }: Props) {
  const valueMap = new Map(
    (answer?.fill_answers ?? []).map((f) => [f.blank_id, f.value]),
  );

  const setValue = (blank_id: string, value: string) => {
    const next = new Map(valueMap);
    next.set(blank_id, value);
    onChange({
      question_id: question._id,
      type: 'fill_in_the_blank',
      fill_answers: [...next.entries()].map(([id, v]) => ({
        blank_id: id,
        value: v,
      })),
    });
  };

  return (
    <div className="space-y-3">
      {(question.fill_in_the_blanks ?? []).map((blank, i) => (
        <div key={blank.id} className="qz-body leading-relaxed">
          <span>{renderText(blank.text_before)}</span>
          <input
            type="text"
            value={valueMap.get(blank.id) ?? ''}
            onChange={(e) => setValue(blank.id, e.target.value)}
            aria-label={`Chỗ trống ${i + 1}`}
            className="qz-input inline-block mx-1 min-w-[120px] w-auto"
          />
          <span>{renderText(blank.text_after)}</span>
        </div>
      ))}
    </div>
  );
}
