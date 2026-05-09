import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import type { RichText } from '../types';

/**
 * Render BE Text wrapper. BE returns `{ is_math?: boolean; text?: string }`
 * to allow LaTeX in questions/options/blanks.
 *
 * Empty / null → empty fragment (avoid `[object Object]` regression).
 */
export function renderText(t: RichText | string | undefined | null) {
  if (t == null) return null;
  if (typeof t === 'string') return t;
  const value = t.text ?? '';
  if (!value) return null;
  if (t.is_math) return <Latex>{`$${value}$`}</Latex>;
  return value;
}
