import { Plus, Trash2 } from 'lucide-react';
import type { MatchItem, MatchOption, Question } from '../../types';
import { genId } from '../../utils/genId';
import { RichTextInput } from '../RichTextInput';

interface Props {
  q: Question;
  onChange: (q: Question) => void;
}

export function EdMatch({ q, onChange }: Props) {
  const items = q.match_items ?? [];
  const options = q.match_options ?? [];

  const setItem = (i: number, patch: Partial<MatchItem>) => {
    onChange({
      ...q,
      match_items: items.map((it, j) => (i === j ? { ...it, ...patch } : it)),
    });
  };

  const setOption = (i: number, patch: Partial<MatchOption>) => {
    onChange({
      ...q,
      match_options: options.map((o, j) => (i === j ? { ...o, ...patch } : o)),
    });
  };

  const addItem = () => {
    onChange({
      ...q,
      match_items: [...items, { id: genId(), text: { text: '' } }],
    });
  };

  const removeItem = (i: number) => {
    const removed = items[i];
    if (!removed?.id) return;
    onChange({
      ...q,
      match_items: items.filter((_, j) => j !== i),
      // Cascade: drop options that referenced the removed item.
      match_options: options.filter((o) => o.match_id !== removed.id),
    });
  };

  const addOption = (matchId: string | undefined) => {
    onChange({
      ...q,
      match_options: [
        ...options,
        { id: genId(), text: { text: '' }, match_id: matchId },
      ],
    });
  };

  const removeOption = (i: number) => {
    onChange({ ...q, match_options: options.filter((_, j) => j !== i) });
  };

  return (
    <div className="space-y-4">
      <p className="qz-caption text-[var(--qz-slate)]">
        Mỗi mục bên trái có thể ghép với 1 hoặc nhiều đáp án bên phải.
      </p>

      {/* LEFT: items */}
      <section className="space-y-2">
        <h4 className="qz-h3">Mục cần ghép</h4>
        {items.map((it, i) => (
          <div
            key={it.id ?? i}
            className="flex items-start gap-2 p-3 rounded-lg border border-[var(--qz-border)]"
          >
            <span className="font-semibold text-[var(--qz-slate)] w-6 text-center pt-2">
              {String.fromCharCode(65 + i)}
            </span>
            <RichTextInput
              className="flex-1"
              value={it.text}
              onChange={(t) => setItem(i, { text: t })}
              placeholder={`Mục ${i + 1}`}
              ariaLabel={`Mục ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={items.length <= 1}
              className="qz-btn qz-btn-ghost p-2"
              aria-label="Xoá mục"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="qz-btn qz-btn-secondary">
          <Plus size={16} /> Thêm mục
        </button>
      </section>

      {/* RIGHT: options */}
      <section className="space-y-2">
        <h4 className="qz-h3">Đáp án (chọn ghép với mục nào)</h4>
        {options.map((opt, i) => {
          const itemIdx = items.findIndex((it) => it.id === opt.match_id);
          return (
            <div
              key={opt.id ?? i}
              className="flex items-start gap-2 p-3 rounded-lg border border-[var(--qz-border)]"
            >
              <select
                value={opt.match_id ?? ''}
                onChange={(e) => setOption(i, { match_id: e.target.value })}
                className="qz-input"
                style={
                  { width: "40%" }
                }
                aria-label="Ghép với mục"
              >
                <option value="">— ghép với —</option>
                {items.map((it, j) => (
                  <option key={it.id} value={it.id}>
                    {String.fromCharCode(65 + j)}. {it.text?.text || `(mục ${j + 1})`}
                  </option>
                ))}
              </select>
              <RichTextInput
                className="flex-1 w-[100px]"
                value={opt.text}
                onChange={(t) => setOption(i, { text: t })}
                placeholder={`Đáp án ${i + 1}`}
                ariaLabel={`Đáp án ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 1}
                className="qz-btn qz-btn-ghost p-2"
                aria-label="Xoá đáp án"
              >
                <Trash2 size={14} />
              </button>
              {itemIdx === -1 && (
                <span className="qz-caption text-[var(--qz-warn)] self-center">
                  Chưa ghép
                </span>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => addOption(items[0]?.id)}
          className="qz-btn qz-btn-secondary"
        >
          <Plus size={16} /> Thêm đáp án
        </button>
      </section>
    </div>
  );
}
