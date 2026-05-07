import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
  AlertTriangle,
  CalendarDays,
  Plus,
  X,
  Eye,
} from 'lucide-react';
import API_ENDPOINTS from '~/app/config';
import { apiCallPost } from '~/shared/services/apiCallService';
import JoinClass from '~/features/class/components/JoinClass';
import MatrixExamView from './component/MatrixExamView';
import { MatrixExamData } from '~/features/test/pages/ManageTestModal';

/* ─────────────────────── Types ─────────────────────── */

interface DashboardTest {
  _id: string;
  test_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  matrix_exam: MatrixExamData[];
  is_test: boolean;
  hasSubmitted: boolean;
}

interface DashboardClass {
  _id: string;
  class_name: string;
  author_mail: string;
  tests: DashboardTest[];
}

interface ConfirmTestState {
  class_id: string;
  author_mail: string;
  test_id: string;
  test_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  matrix_exam: MatrixExamData[];
}

/* ─────────────────────── TestCard ─────────────────────── */

interface TestCardProps {
  test: DashboardTest;
  authorMail: string;
  classId: string;
  onConfirm: (state: ConfirmTestState) => void;
}

const TestCard = memo(({ test, authorMail, classId, onConfirm }: TestCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const now = Date.now();
  const start = new Date(test.start_time).getTime();
  const end = new Date(test.end_time).getTime();
  const isActive = now >= start && now <= end;
  const isExpired = now > end;

  const handleStartTest = useCallback(() => {
    onConfirm({
      class_id: classId,
      author_mail: authorMail,
      test_id: test._id,
      test_name: test.test_name,
      start_time: test.start_time,
      end_time: test.end_time,
      duration_minutes: test.duration_minutes,
      matrix_exam: test.matrix_exam,
    });
  }, [onConfirm, classId, authorMail, test]);

  const handleReview = useCallback(() => {
    navigate('/do-test', {
      state: { author_mail: authorMail, test_id: test._id, class_id: classId },
    });
  }, [navigate, authorMail, test._id, classId]);

  // Status mapping
  const status = test.hasSubmitted
    ? { pill: 'qz-pill-success', label: t('dashboard.submitted'), icon: <CheckCircle2 size={12} /> }
    : isExpired
    ? { pill: 'qz-pill-danger', label: t('dashboard.closed'), icon: <X size={12} /> }
    : isActive
    ? { pill: 'qz-pill-open', label: t('dashboard.open'), icon: <PlayCircle size={12} /> }
    : { pill: 'qz-pill-muted', label: t('dashboard.not_open'), icon: <Clock size={12} /> };

  // Decorative accent stripe per state
  const accent = test.hasSubmitted
    ? 'bg-[#dcfce7]'
    : isActive
    ? 'bg-[var(--qz-violet-soft)]'
    : isExpired
    ? 'bg-[#fee2e2]'
    : 'bg-[#f1f5f9]';

  return (
    <article className="qz-card-interactive overflow-hidden flex flex-col">
      {/* Color stripe */}
      <div className={`h-1.5 ${accent}`} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="qz-h3 text-[var(--qz-ink)] line-clamp-2">{test.test_name}</h3>
          <span className={`qz-pill ${status.pill} shrink-0`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        <div className="space-y-2 text-sm text-[var(--qz-slate)] mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[var(--qz-slate-light)]" />
            <span>{new Date(test.start_time).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--qz-slate-light)]" />
            <span>
              {test.duration_minutes} {t('dashboard.minutes')}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          {test.hasSubmitted ? (
            <button onClick={handleReview} className="qz-btn qz-btn-secondary w-full">
              <Eye size={16} /> {t('dashboard.review')}
            </button>
          ) : isActive ? (
            <button onClick={handleStartTest} className="qz-btn qz-btn-primary w-full">
              <PlayCircle size={16} /> {t('dashboard.take_exam')}
            </button>
          ) : (
            <button disabled className="qz-btn qz-btn-secondary w-full opacity-60 cursor-not-allowed">
              {t('dashboard.not_available')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

/* ─────────────────────── ConfirmModal ─────────────────────── */

interface ConfirmModalProps {
  confirmTest: ConfirmTestState;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal = memo(({ confirmTest, onCancel, onConfirm }: ConfirmModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn p-4">
    <div className="qz-card w-full max-w-lg overflow-hidden animate-scaleIn">
      {/* Hero header */}
      <div className="bg-[var(--qz-violet)] text-white p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#423ED8] opacity-50" />
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h2 className="qz-h2 text-white">Sẵn sàng làm bài?</h2>
          <p className="text-white/80 text-sm mt-1">{confirmTest.test_name}</p>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="qz-card-flat p-3">
            <p className="qz-caption">Thời gian làm</p>
            <p className="font-bold text-[var(--qz-ink)]">{confirmTest.duration_minutes} phút</p>
          </div>
          <div className="qz-card-flat p-3">
            <p className="qz-caption">Hết hạn</p>
            <p className="font-semibold text-[var(--qz-ink)] text-sm">
              {new Date(confirmTest.end_time).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex gap-3 p-4 rounded-lg bg-[#fff7ed] border border-[#fed7aa]">
          <AlertTriangle className="w-5 h-5 text-[#c2410c] shrink-0 mt-0.5" />
          <div className="text-sm text-[#9a3412]">
            <p className="font-semibold mb-1">Lưu ý quan trọng</p>
            <ul className="list-disc ml-5 space-y-0.5 text-xs">
              <li>Bài thi chỉ được làm <strong>một lần</strong></li>
              <li>Thoát trang có thể bị tính là nộp bài</li>
            </ul>
          </div>
        </div>

        {/* Matrix */}
        {confirmTest.matrix_exam?.length > 0 && (
          <div>
            <p className="qz-caption mb-2">Cấu trúc đề thi</p>
            <MatrixExamView data={confirmTest.matrix_exam} />
          </div>
        )}
      </div>

      <div className="flex gap-3 p-5 border-t border-[var(--qz-border)] bg-[var(--qz-bg)]">
        <button onClick={onCancel} className="qz-btn qz-btn-secondary flex-1">
          Huỷ
        </button>
        <button onClick={onConfirm} className="qz-btn qz-btn-primary flex-1">
          <PlayCircle size={16} /> Bắt đầu
        </button>
      </div>
    </div>
  </div>
));

/* ─────────────────────── Dashboard ─────────────────────── */

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<DashboardClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [confirmTest, setConfirmTest] = useState<ConfirmTestState | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCallPost<DashboardClass[]>(
        API_ENDPOINTS.STUDENT_CLASSES,
        {},
        navigate,
      );
      setClasses(data);
    } catch {
      toast.error(t('dashboard.fetchError', 'Không thể tải danh sách lớp học'));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleConfirmTest = useCallback((state: ConfirmTestState) => setConfirmTest(state), []);
  const handleCancelConfirm = useCallback(() => setConfirmTest(null), []);
  const handleJoinClassClose = useCallback(() => setIsJoinClassOpen(false), []);
  const handleJoined = useCallback(() => {
    setIsJoinClassOpen(false);
    fetchClasses();
  }, [fetchClasses]);

  const handleDoTest = useCallback(() => {
    if (!confirmTest) return;
    navigate('/do-test', {
      state: {
        author_mail: confirmTest.author_mail,
        test_id: confirmTest.test_id,
        class_id: confirmTest.class_id,
      },
    });
  }, [navigate, confirmTest]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="qz-spinner" />
        <p className="qz-caption mt-4">{t('dashboard.loading')}</p>
      </div>
    );
  }

  /* ── Aggregate stats ── */
  const totalTests = classes.reduce((sum, c) => sum + (c.tests?.length ?? 0), 0);
  const submittedTests = classes.reduce(
    (sum, c) => sum + (c.tests?.filter((t) => t.hasSubmitted).length ?? 0),
    0,
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Hero ─── */}
      <header className="qz-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-6 md:p-8">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-32 w-12 h-12 rounded-full bg-[#FFC38C]/40" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <GraduationCap size={16} />
                Bảng điều khiển học sinh
              </div>
              <h1 className="qz-h1 text-white">Chào mừng trở lại 👋</h1>
              <p className="text-white/80 mt-1 text-sm">Chọn một lớp học bên dưới để bắt đầu.</p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 min-w-[88px]">
                <p className="text-white/70 text-xs">Lớp</p>
                <p className="text-white text-2xl font-bold">{classes.length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 min-w-[88px]">
                <p className="text-white/70 text-xs">Bài thi</p>
                <p className="text-white text-2xl font-bold">
                  {submittedTests}/{totalTests}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Class list ─── */}
      {classes.length > 0 ? (
        <div className="space-y-10">
          {classes.map((cls) => (
            <section key={cls._id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--qz-violet-soft)] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[var(--qz-violet)]" />
                  </div>
                  <div>
                    <h2 className="qz-h2 text-[var(--qz-ink)]">{cls.class_name}</h2>
                    <p className="qz-caption">
                      {t('dashboard.teacher')}: {cls.author_mail}
                    </p>
                  </div>
                </div>
                <span className="qz-pill qz-pill-muted">
                  {cls.tests?.length ?? 0} bài thi
                </span>
              </div>

              {cls.tests?.length === 0 ? (
                <div className="qz-card-flat p-8 text-center">
                  <p className="qz-caption">Chưa có bài thi nào trong lớp này.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {cls.tests?.map((test) => (
                    <TestCard
                      key={test._id}
                      test={test}
                      authorMail={cls.author_mail}
                      classId={cls._id}
                      onConfirm={handleConfirmTest}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="qz-card flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-20 h-20 rounded-full bg-[var(--qz-violet-soft)] flex items-center justify-center mb-4">
            <GraduationCap className="w-10 h-10 text-[var(--qz-violet)]" />
          </div>
          <h2 className="qz-h2 mb-2">Bắt đầu hành trình học của bạn</h2>
          <p className="qz-caption max-w-md mb-6">
            Bạn chưa tham gia lớp học nào. Hỏi giáo viên mã lớp và tham gia ngay.
          </p>
          <button onClick={() => setIsJoinClassOpen(true)} className="qz-btn qz-btn-primary">
            <Plus size={16} /> Tham gia lớp học
          </button>
        </div>
      )}

      {/* ─── Floating join button ─── */}
      {classes.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsJoinClassOpen(true)}
            className="qz-btn qz-btn-primary shadow-[0_8px_24px_rgba(66,85,255,0.35)] py-3 px-5"
            title="Tham gia lớp học"
          >
            <Plus size={18} /> Tham gia lớp
          </button>
        </div>
      )}

      {/* ─── Modals ─── */}
      {confirmTest && (
        <ConfirmModal
          confirmTest={confirmTest}
          onCancel={handleCancelConfirm}
          onConfirm={handleDoTest}
        />
      )}

      <JoinClass isOpen={isJoinClassOpen} onClose={handleJoinClassClose} onJoined={handleJoined} />
    </div>
  );
};

export default Dashboard;
