import { useState } from 'react';
import { X } from 'lucide-react';
import { useJoinClass } from '../hooks/useClasses';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function JoinClassDialog({ open, onClose }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const join = useJoinClass();

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const r = await join.mutateAsync(code.trim().toUpperCase());
      setSuccess(r.message ?? 'Đã gửi yêu cầu tham gia.');
      setCode('');
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Mã không hợp lệ hoặc đã hết hạn.',
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="qz-card w-full max-w-md mx-4 p-6 animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="qz-h2">Tham gia lớp học</h2>
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-ghost"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <p className="qz-caption text-[var(--qz-slate)] mb-3">
          Nhập mã 6 ký tự giáo viên gửi cho bạn.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VD: A2B7K9"
          className="qz-input w-full text-center text-2xl tracking-[0.5em] font-mono uppercase"
          maxLength={6}
          aria-label="Mã lớp học"
          autoFocus
        />

        {error && <p className="qz-pill qz-pill-danger mt-3">{error}</p>}
        {success && <p className="qz-pill qz-pill-success mt-3">{success}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-secondary"
          >
            Đóng
          </button>
          <button
            type="submit"
            className="qz-btn qz-btn-primary"
            disabled={code.length < 4 || join.isPending}
          >
            {join.isPending ? 'Đang gửi...' : 'Tham gia'}
          </button>
        </div>
      </form>
    </div>
  );
}
