import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** Hard cap on tag count. Spec F4 = 10. */
  max?: number;
  ariaLabel?: string;
}

/**
 * Free-form tag chips input. Reusable for Question / Test / Class.
 * Behavior:
 *   - Enter / Comma → commit pending text as tag
 *   - Backspace on empty → remove last tag
 *   - Click X on chip → remove that tag
 *   - Tags are deduped + trimmed; empty/whitespace ignored
 */
export function TagInput({
  value,
  onChange,
  placeholder = 'Thêm tag...',
  max = 10,
  ariaLabel = 'Tags',
}: Props) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft('');
      return;
    }
    if (value.length >= max) return;
    onChange([...value, t]);
    setDraft('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      className="qz-input flex flex-wrap items-center gap-1.5 min-h-[2.5rem] p-1.5"
      onClick={(e) => {
        const target = e.currentTarget.querySelector('input');
        target?.focus();
      }}
      role="group"
      aria-label={ariaLabel}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="qz-pill qz-pill-muted gap-1.5 pr-1.5"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="hover:text-[var(--qz-danger)]"
            aria-label={`Xoá tag ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => commit(draft)}
          placeholder={value.length === 0 ? placeholder : ''}
          aria-label={ariaLabel}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      )}
    </div>
  );
}
