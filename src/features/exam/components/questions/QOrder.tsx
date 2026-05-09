import { ArrowDown, ArrowUp } from 'lucide-react';
import type { OrderAnswer, PublicQuestion } from '../../types';
import { renderText } from '../../utils/renderText';

interface Props {
  question: PublicQuestion;
  answer: OrderAnswer | undefined;
  onChange: (a: OrderAnswer) => void;
}

/**
 * Simple up/down reorder UI. Drag-and-drop intentionally deferred — keep V1
 * accessible-by-default with keyboard buttons. CLAUDE.md mục 16: chỉ thêm
 * pattern khi tận dụng được nhiều chỗ.
 */
export function QOrder({ question, answer, onChange }: Props) {
  const items = question.order_items ?? [];
  const ids = answer?.ordered_ids?.length
    ? answer.ordered_ids
    : items.map((i) => i.id);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...ids];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({
      question_id: question._id,
      type: 'order_question',
      ordered_ids: next,
    });
  };

  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <ol className="space-y-2">
      {ids.map((id, i) => {
        const item = itemMap.get(id);
        if (!item) return null;
        return (
          <li
            key={id}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--qz-border)] bg-[var(--qz-surface)]"
          >
            <span className="text-[var(--qz-slate)] font-semibold w-6 text-center">
              {i + 1}
            </span>
            <span className="qz-body flex-1">{renderText(item.text)}</span>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="qz-btn qz-btn-ghost p-2"
              aria-label="Di chuyển lên"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === ids.length - 1}
              className="qz-btn qz-btn-ghost p-2"
              aria-label="Di chuyển xuống"
            >
              <ArrowDown size={16} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
