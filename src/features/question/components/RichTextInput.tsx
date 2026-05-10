import type { RichText } from '../types';

interface Props {
  value: RichText | undefined;
  onChange: (v: RichText) => void;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  className?: string;
}

/**
 * Plain text input with a "math" toggle. When toggled, BE/FE renders the
 * value as LaTeX (see features/exam/utils/renderText). Server-side this maps
 * to the `Text {is_math, text}` wrapper.
 */
export function RichTextInput({
  value,
  onChange,
  placeholder,
  rows = 1,
  ariaLabel,
  className = '',
}: Props) {
  const text = value?.text ?? '';
  const isMath = !!value?.is_math;

  const Tag = rows > 1 ? 'textarea' : 'input';

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <Tag
        type="text"
        value={text}
        rows={rows > 1 ? rows : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) =>
          onChange({ is_math: isMath, text: e.target.value })
        }
        className="qz-input flex-1"
      />
      <label className="flex items-center gap-1 text-xs text-[var(--qz-slate)] whitespace-nowrap pt-2">
        <input
          type="checkbox"
          checked={isMath}
          onChange={(e) => onChange({ is_math: e.target.checked, text })}
          className="accent-[var(--qz-violet)]"
        />
        LaTeX
      </label>
    </div>
  );
}
