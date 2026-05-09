import type { MultipleAnswer, PublicQuestion } from '../../types';
import { renderText } from '../../utils/renderText';

interface Props {
  question: PublicQuestion;
  answer: MultipleAnswer | undefined;
  onChange: (a: MultipleAnswer) => void;
}

export function QMultiple({ question, answer, onChange }: Props) {
  const selected = new Set(answer?.selected_ids ?? []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({
      question_id: question._id,
      type: 'multiple',
      selected_ids: [...next],
    });
  };

  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const checked = selected.has(opt.id);
        return (
          <label
            key={opt.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              checked
                ? 'border-[var(--qz-violet)] bg-[var(--qz-violet-soft)]'
                : 'border-[var(--qz-border)] hover:border-[var(--qz-violet)]'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.id)}
              className="accent-[var(--qz-violet)]"
            />
            <span className="qz-body">{renderText(opt.text)}</span>
          </label>
        );
      })}
    </div>
  );
}
