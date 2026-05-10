import { Plus, Trash2 } from 'lucide-react';
import type { Option, Question } from '../../types';
import { genId } from '../../utils/genId';
import { RichTextInput } from '../RichTextInput';
import { FilePickerButton } from '../FilePickerButton';

interface Props {
  q: Question;
  onChange: (q: Question) => void;
  /** When true, only one option may be marked correct (single mode). */
  singleCorrect: boolean;
}

export function EdChoice({ q, onChange, singleCorrect }: Props) {
  const options = q.options ?? [];

  const setOpt = (i: number, patch: Partial<Option>) => {
    const next = options.map((o, j) => (i === j ? { ...o, ...patch } : o));
    onChange({ ...q, options: next });
  };

  const toggleCorrect = (i: number, checked: boolean) => {
    const next = singleCorrect
      ? options.map((o, j) => ({ ...o, is_correct: j === i ? checked : false }))
      : options.map((o, j) => (i === j ? { ...o, is_correct: checked } : o));
    onChange({ ...q, options: next });
  };

  const addOption = () => {
    onChange({
      ...q,
      options: [
        ...options,
        { id: genId(), text: { text: '' }, is_correct: false },
      ],
    });
  };

  const removeOption = (i: number) => {
    onChange({ ...q, options: options.filter((_, j) => j !== i) });
  };

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div
          key={opt.id ?? i}
          className="flex items-start gap-2 p-3 rounded-lg border border-[var(--qz-border)]"
        >
          <input
            type={singleCorrect ? 'radio' : 'checkbox'}
            name="correct"
            checked={!!opt.is_correct}
            onChange={(e) => toggleCorrect(i, e.target.checked)}
            className="accent-[var(--qz-violet)] mt-2"
            aria-label="Đáp án đúng"
          />
          <div className="flex-1 space-y-1">
            <RichTextInput
              value={opt.text}
              onChange={(t) => setOpt(i, { text: t })}
              placeholder={`Đáp án ${i + 1}`}
              ariaLabel={`Đáp án ${i + 1}`}
            />
            <FilePickerButton
              fileId={opt.file_id}
              onChange={(file_id) => setOpt(i, { file_id })}
              label="Hình minh hoạ"
            />
          </div>
          <button
            type="button"
            onClick={() => removeOption(i)}
            disabled={options.length <= 2}
            className="qz-btn qz-btn-ghost p-2"
            aria-label="Xoá đáp án"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="qz-btn qz-btn-secondary"
      >
        <Plus size={16} /> Thêm đáp án
      </button>
    </div>
  );
}
