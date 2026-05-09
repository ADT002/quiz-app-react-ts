import { memo } from 'react';
import { Tag, Clock, Calendar, HelpCircle, CheckCircle, Lock, Trophy, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { TestFormData } from './ManageTestModal';

type Props = {
  tests: TestFormData[];
  onEdit: (test: TestFormData) => void;
  onFilterByTag: (tag: string) => void;
};

const STATUS_MAP = {
  draft: {
    label: 'Nháp',
    pillClass: 'qz-pill qz-pill-muted',
    accent: 'bg-[#f1f5f9]',
    icon: HelpCircle,
  },
  pending: {
    label: 'Chưa mở',
    pillClass: 'qz-pill qz-pill-warn',
    accent: 'bg-[#FFC38C]/40',
    icon: Clock,
  },
  active: {
    label: 'Đang mở',
    pillClass: 'qz-pill qz-pill-success',
    accent: 'bg-[#dcfce7]',
    icon: CheckCircle,
  },
  closed: {
    label: 'Đã đóng',
    pillClass: 'qz-pill qz-pill-danger',
    accent: 'bg-[#fee2e2]',
    icon: Lock,
  },
};

function getStatus(start: Date | null, end: Date | null) {
  if (!start || !end) return STATUS_MAP.draft;
  const now = Date.now();
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (now < startMs) return STATUS_MAP.pending;
  if (now > endMs) return STATUS_MAP.closed;
  return STATUS_MAP.active;
}

function TestCardList({ tests, onEdit, onFilterByTag }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tests.map((test, idx) => {
        const start = test.start_time ? new Date(test.start_time) : null;
        const end = test.end_time ? new Date(test.end_time) : null;
        const status = getStatus(start, end);
        const StatusIcon = status.icon;

        return (
          <motion.article
            key={test._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
            onClick={() => onEdit(test)}
            className="qz-card-interactive overflow-hidden cursor-pointer flex flex-col"
          >
            {/* Color accent strip */}
            <div className={`h-1.5 ${status.accent}`} />

            <div className="p-5 flex-1 flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="qz-h3 text-[var(--qz-ink)] line-clamp-2 flex-1">
                  {test.test_name || 'Bài thi chưa đặt tên'}
                </h3>
                <span className={`${status.pillClass} shrink-0`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              {/* Description */}
              {test.descript && (
                <p className="text-sm text-[var(--qz-slate)] line-clamp-2">{test.descript}</p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--qz-slate)]">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--qz-slate-light)]" />
                  {test.duration_minutes} phút
                </span>
                <span className="flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-[var(--qz-slate-light)]" />
                  {test.question_ids?.length ?? 0} câu
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy size={13} className="text-[var(--qz-slate-light)]" />
                  {test.test_score} điểm
                </span>
              </div>

              {/* Schedule */}
              {(start || end) && (
                <div className="flex items-start gap-1.5 text-xs text-[var(--qz-slate-light)] bg-[var(--qz-bg)] rounded p-2">
                  <Calendar size={13} className="mt-0.5 shrink-0" />
                  <span>
                    {start ? start.toLocaleString() : '—'}
                    <span className="mx-1">→</span>
                    {end ? end.toLocaleString() : '—'}
                  </span>
                </div>
              )}

              {/* Tags */}
              {test.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {test.tags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterByTag(tag);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)] hover:bg-[var(--qz-violet)] hover:text-white transition"
                    >
                      <Tag size={10} />
                      {tag}
                    </button>
                  ))}
                  {test.tags.length > 4 && (
                    <span className="qz-caption px-2 py-0.5">+{test.tags.length - 4}</span>
                  )}
                </div>
              )}

              {/* Footer / Edit hint */}
              <div className="mt-auto pt-3 border-t border-[var(--qz-border)] flex items-center justify-end gap-1 text-xs text-[var(--qz-slate-light)] group-hover:text-[var(--qz-violet)]">
                <Pencil size={12} />
                Click để chỉnh sửa
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export default memo(TestCardList);
