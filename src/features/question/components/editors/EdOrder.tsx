import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { OrderItem, Question } from '../../types';
import { genId } from '../../utils/genId';
import { RichTextInput } from '../RichTextInput';

interface Props {
  q: Question;
  onChange: (q: Question) => void;
}

export function EdOrder({ q, onChange }: Props) {
  const items = q.order_items ?? [];

  const update = (next: OrderItem[]) => {
    // Re-stamp `order` from array position so BE validation (unique orders) passes.
    onChange({
      ...q,
      order_items: next.map((it, i) => ({ ...it, order: i + 1 })),
    });
  };

  const setText = (i: number, text: OrderItem['text']) => {
    update(items.map((it, j) => (i === j ? { ...it, text } : it)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  return (
    <div className="space-y-2">
      <p className="qz-caption text-[var(--qz-slate)]">
        Sắp xếp các mục theo đúng thứ tự đáp án. Học sinh sẽ thấy thứ tự xáo trộn.
      </p>
      {items.map((it, i) => (
        <div
          key={it.id ?? i}
          className="flex items-start gap-2 p-3 rounded-lg border border-[var(--qz-border)]"
        >
          <span className="font-semibold text-[var(--qz-slate)] w-6 text-center pt-2">
            {i + 1}
          </span>
          <RichTextInput
            className="flex-1"
            value={it.text}
            onChange={(t) => setText(i, t)}
            placeholder={`Mục ${i + 1}`}
            ariaLabel={`Mục ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => move(i, -1)}
            disabled={i === 0}
            className="qz-btn qz-btn-ghost p-2"
            aria-label="Lên"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            disabled={i === items.length - 1}
            className="qz-btn qz-btn-ghost p-2"
            aria-label="Xuống"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => update(items.filter((_, j) => j !== i))}
            disabled={items.length <= 2}
            className="qz-btn qz-btn-ghost p-2"
            aria-label="Xoá"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          update([...items, { id: genId(), text: { text: '' }, order: items.length + 1 }])
        }
        className="qz-btn qz-btn-secondary"
      >
        <Plus size={16} /> Thêm mục
      </button>
    </div>
  );
}
