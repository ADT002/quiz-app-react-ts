import { Check, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import type { AutosaveState } from '../hooks/useAutosave';

interface Props {
  state: AutosaveState;
  lastSavedAt: string | null;
}

export function AutosaveIndicator({ state, lastSavedAt }: Props) {
  if (state === 'saving') {
    return (
      <span className="qz-pill qz-pill-muted">
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        <span>Đang lưu...</span>
      </span>
    );
  }
  if (state === 'offline') {
    return (
      <span className="qz-pill qz-pill-warn">
        <CloudOff size={14} aria-hidden="true" />
        <span>Ngoại tuyến — đáp án giữ ở thiết bị</span>
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="qz-pill qz-pill-danger">
        <AlertCircle size={14} aria-hidden="true" />
        <span>Lưu lỗi — sẽ thử lại</span>
      </span>
    );
  }
  if (state === 'saved' && lastSavedAt) {
    const t = new Date(lastSavedAt);
    return (
      <span className="qz-pill qz-pill-success">
        <Check size={14} aria-hidden="true" />
        <span>
          Đã lưu lúc {t.getHours().toString().padStart(2, '0')}:
          {t.getMinutes().toString().padStart(2, '0')}
        </span>
      </span>
    );
  }
  return null;
}
