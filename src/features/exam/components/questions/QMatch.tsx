import type { MatchAnswer, PublicQuestion } from '../../types';
import { renderText } from '../../utils/renderText';

interface Props {
  question: PublicQuestion;
  answer: MatchAnswer | undefined;
  onChange: (a: MatchAnswer) => void;
}

/**
 * Match-choice: each `match_item` (left) accepts one or more `match_options` (right).
 * UI: per item, show all options as toggles. Server scores by exact set match per item.
 */
export function QMatch({ question, answer, onChange }: Props) {
  const items = question.match_items ?? [];
  const options = question.match_options ?? [];

  const selectedMap = new Map(
    (answer?.match_answers ?? []).map((m) => [m.item_id, new Set(m.option_ids)]),
  );

  const toggle = (item_id: string, option_id: string) => {
    const next = new Map(selectedMap);
    const set = new Set(next.get(item_id) ?? []);
    if (set.has(option_id)) set.delete(option_id);
    else set.add(option_id);
    next.set(item_id, set);

    onChange({
      question_id: question._id,
      type: 'match_choice_question',
      match_answers: [...next.entries()].map(([id, s]) => ({
        item_id: id,
        option_ids: [...s],
      })),
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const selected = selectedMap.get(item.id) ?? new Set<string>();
        return (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-[var(--qz-border)] bg-[var(--qz-surface)]"
          >
            <p className="qz-body font-semibold mb-2">{renderText(item.text)}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const checked = selected.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(item.id, opt.id)}
                    className={`qz-pill ${
                      checked ? 'qz-pill-success' : 'qz-pill-muted'
                    }`}
                    aria-pressed={checked}
                  >
                    {renderText(opt.text)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
