import { Clock } from 'lucide-react';
import type { CountdownParts } from '../hooks/useCountdown';

interface Props {
  parts: CountdownParts;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export function CountdownTimer({ parts }: Props) {
  const danger = parts.totalSeconds <= 60;
  const warn = parts.totalSeconds <= 300 && !danger;

  const cls = parts.isOver
    ? 'qz-pill qz-pill-danger'
    : danger
      ? 'qz-pill qz-pill-danger'
      : warn
        ? 'qz-pill qz-pill-warn'
        : 'qz-pill qz-pill-open';

  return (
    <div role="timer" aria-live="polite" className={cls}>
      <Clock size={14} aria-hidden="true" />
      <span>
        {pad(parts.hours)}:{pad(parts.minutes)}:{pad(parts.seconds)}
      </span>
    </div>
  );
}
