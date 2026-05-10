import { Plus, Trash2 } from 'lucide-react';
import type { FillInTheBlank, Question } from '../../types';
import { genId } from '../../utils/genId';
import { RichTextInput } from '../RichTextInput';

interface Props {
  q: Question;
  onChange: (q: Question) => void;
}

export function EdFill({ q, onChange }: Props) {
  const blanks = q.fill_in_the_blanks ?? [];

  const setBlank = (i: number, patch: Partial<FillInTheBlank>) => {
    onChange({
      ...q,
      fill_in_the_blanks: blanks.map((b, j) =>
        i === j ? { ...b, ...patch } : b,
      ),
    });
  };

  const addBlank = () => {
    onChange({
      ...q,
      fill_in_the_blanks: [
        ...blanks,
        {
          id: genId(),
          text_before: { text: '' },
          text_after: { text: '' },
          blank: '___',
          correct_submission: '',
        },
      ],
    });
  };

  const removeBlank = (i: number) => {
    onChange({ ...q, fill_in_the_blanks: blanks.filter((_, j) => j !== i) });
  };

  return (
    <div className="space-y-3">
      {blanks.map((b, i) => (
        <div
          key={b.id ?? i}
          className="p-3 rounded-lg border border-[var(--qz-border)] space-y-2"
        >
          <p className="qz-caption text-[var(--qz-slate)]">Chỗ trống #{i + 1}</p>
          <RichTextInput
            value={b.text_before}
            onChange={(t) => setBlank(i, { text_before: t })}
            placeholder="Phần trước chỗ trống"
            ariaLabel={`Trước chỗ trống ${i + 1}`}
          />
          <input
            type="text"
            value={b.correct_submission ?? ''}
            onChange={(e) => setBlank(i, { correct_submission: e.target.value })}
            placeholder="Đáp án đúng (BE so sánh case-insensitive)"
            aria-label={`Đáp án chỗ trống ${i + 1}`}
            className="qz-input w-full font-semibold text-[var(--qz-violet-dark)]"
          />
          <RichTextInput
            value={b.text_after}
            onChange={(t) => setBlank(i, { text_after: t })}
            placeholder="Phần sau chỗ trống"
            ariaLabel={`Sau chỗ trống ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => removeBlank(i)}
            disabled={blanks.length <= 1}
            className="qz-btn qz-btn-ghost"
          >
            <Trash2 size={14} /> Xoá chỗ trống này
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addBlank}
        className="qz-btn qz-btn-secondary"
      >
        <Plus size={16} /> Thêm chỗ trống
      </button>
    </div>
  );
}
