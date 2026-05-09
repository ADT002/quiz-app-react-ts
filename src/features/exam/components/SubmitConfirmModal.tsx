interface Props {
  open: boolean;
  totalQuestions: number;
  unansweredCount: number;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitConfirmModal({
  open,
  totalQuestions,
  unansweredCount,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-confirm-title"
    >
      <div className="qz-card max-w-md w-full mx-4 p-6 animate-scaleIn">
        <h2 id="submit-confirm-title" className="qz-h2">
          Xác nhận nộp bài
        </h2>
        <p className="qz-body mt-3 text-[var(--qz-slate)]">
          Bạn đã trả lời{' '}
          <strong className="text-[var(--qz-ink)]">
            {totalQuestions - unansweredCount}/{totalQuestions}
          </strong>{' '}
          câu.
          {unansweredCount > 0 && (
            <>
              {' '}
              Còn <strong className="text-[var(--qz-warn)]">{unansweredCount}</strong>{' '}
              câu chưa trả lời.
            </>
          )}
        </p>
        <p className="qz-caption mt-2 text-[var(--qz-slate-light)]">
          Sau khi nộp, bạn không thể chỉnh sửa đáp án.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="qz-btn qz-btn-secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Tiếp tục làm
          </button>
          <button
            type="button"
            className="qz-btn qz-btn-primary"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </div>
  );
}
