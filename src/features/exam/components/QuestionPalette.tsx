import type { PublicQuestion, StudentAnswer } from '../types';

interface Props {
  questions: PublicQuestion[];
  answers: Record<string, StudentAnswer>;
  current: number;
  onJump: (index: number) => void;
}

function isAnswered(a: StudentAnswer | undefined): boolean {
  if (!a) return false;
  switch (a.type) {
    case 'single':
      return !!a.selected_id;
    case 'multiple':
      return (a.selected_ids?.length ?? 0) > 0;
    case 'fill_in_the_blank':
      return (a.fill_answers?.length ?? 0) > 0 &&
        a.fill_answers.some((f) => f.value.trim() !== '');
    case 'order_question':
      return (a.ordered_ids?.length ?? 0) > 0;
    case 'match_choice_question':
      return (a.match_answers?.length ?? 0) > 0;
  }
}

export function QuestionPalette({ questions, answers, current, onJump }: Props) {
  return (
    <div className="qz-card p-4">
      <h3 className="qz-h3 mb-3">Bảng câu hỏi</h3>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {questions.map((q, i) => {
          const answered = isAnswered(answers[q._id]);
          const isCurrent = i === current;
          const base =
            'aspect-square rounded-md text-sm font-semibold flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--qz-violet)] outline-none';
          const cls = isCurrent
            ? `${base} bg-[var(--qz-violet)] text-white`
            : answered
              ? `${base} bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)]`
              : `${base} bg-[var(--qz-bg)] text-[var(--qz-slate)]`;
          return (
            <button
              key={q._id}
              type="button"
              className={cls}
              onClick={() => onJump(i)}
              aria-label={`Câu ${i + 1}${answered ? ' đã trả lời' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-[var(--qz-slate)]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--qz-violet)]" /> Hiện tại
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--qz-violet-soft)]" /> Đã trả lời
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--qz-bg)] border border-[var(--qz-border)]" />{' '}
          Chưa làm
        </span>
      </div>
    </div>
  );
}
