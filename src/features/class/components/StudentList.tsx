import { Check, X } from 'lucide-react';
import {
  useApproveStudent,
  useRejectStudent,
} from '../hooks/useClasses';
import type { StudentInfo } from '../types';

interface Props {
  classId: string;
  pending: StudentInfo[];
  accepted: StudentInfo[];
}

export function StudentList({ classId, pending, accepted }: Props) {
  const approve = useApproveStudent();
  const reject = useRejectStudent();

  return (
    <div className="space-y-6">
      <section>
        <h3 className="qz-h3 flex items-center gap-2">
          Chờ duyệt
          {pending.length > 0 && (
            <span className="qz-pill qz-pill-warn">{pending.length}</span>
          )}
        </h3>
        {pending.length === 0 ? (
          <p className="qz-caption text-[var(--qz-slate-light)] mt-2">
            Không có học sinh chờ duyệt.
          </p>
        ) : (
          <ul className="space-y-2 mt-3">
            {pending.map((s) => (
              <li
                key={s.user_id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--qz-border)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="qz-body truncate">{s.name || s.email}</p>
                  <p className="qz-caption text-[var(--qz-slate)] truncate">
                    {s.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    approve.mutate({ classId, studentId: s.user_id })
                  }
                  disabled={approve.isPending}
                  className="qz-btn qz-btn-primary"
                  aria-label="Duyệt"
                >
                  <Check size={14} /> Duyệt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    reject.mutate({ classId, studentId: s.user_id })
                  }
                  disabled={reject.isPending}
                  className="qz-btn qz-btn-secondary text-[var(--qz-danger)]"
                  aria-label="Từ chối"
                >
                  <X size={14} /> Từ chối
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="qz-h3">Học sinh trong lớp ({accepted.length})</h3>
        {accepted.length === 0 ? (
          <p className="qz-caption text-[var(--qz-slate-light)] mt-2">
            Chưa có học sinh.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {accepted.map((s) => (
              <li
                key={s.user_id}
                className="p-3 rounded-lg border border-[var(--qz-border)] bg-[var(--qz-surface)]"
              >
                <p className="qz-body truncate">{s.name || s.email}</p>
                <p className="qz-caption text-[var(--qz-slate)] truncate">
                  {s.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
