import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useStartExam, useSubmitExam } from '../hooks/useExamSession';
import { useAutosave } from '../hooks/useAutosave';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { useCountdown } from '../hooks/useCountdown';
import { useExamDraftStore } from '../stores/examDraftStore';

import { CountdownTimer } from '../components/CountdownTimer';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { QuestionPalette } from '../components/QuestionPalette';
import { SubmitConfirmModal } from '../components/SubmitConfirmModal';
import { QuestionRenderer } from '../components/QuestionRenderer';
import type { PublicQuestion, StudentAnswer, SubmissionResult } from '../types';
import { renderText } from '../utils/renderText';

type ViewState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'submitted'; result: SubmissionResult }
  | { phase: 'exam'; submission_id: string };

export default function DoTest() {
  const { test_of_class_id = '' } = useParams<{ test_of_class_id: string }>();
  const navigate = useNavigate();

  const startMutation = useStartExam();
  const submitMutation = useSubmitExam();
  const draft = useExamDraftStore();

  const [view, setView] = useState<ViewState>({ phase: 'loading' });
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Heartbeat for the active session.
  const submissionId =
    view.phase === 'exam' ? view.submission_id : null;
  const { serverEndAt, serverNow, setSync } = useHeartbeat(submissionId);

  // Autosave draft to BE Redis (debounced).
  const answersList = useMemo(() => draft.toArray(), [draft.answers]);
  const autosave = useAutosave(submissionId, answersList);

  /* ── Initial start (or resume / submitted) ──────────────────────────────── */
  useEffect(() => {
    if (!test_of_class_id) return;
    startMutation
      .mutateAsync(test_of_class_id)
      .then((res) => {
        if (res.mode === 'submitted') {
          setView({ phase: 'submitted', result: res.submission as unknown as SubmissionResult });
          return;
        }
        if (res.mode === 'practice') {
          // Redirect to practice route; out of scope for DoTest.
          navigate(`/practice/${test_of_class_id}`, { replace: true });
          return;
        }
        // Exam mode
        setQuestions(res.questions);
        setSync(res.server_end_at, res.server_now);
        // Hydrate local draft for THIS submission. If switching submissions, clear.
        if (draft.submission_id !== res.submission_id) {
          draft.hydrate(res.submission_id, []);
        }
        setView({ phase: 'exam', submission_id: res.submission_id });
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Không thể bắt đầu bài thi.';
        setView({ phase: 'error', message: msg });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test_of_class_id]);

  /* ── Auto-submit when server time runs out ──────────────────────────────── */
  const handleTimeUp = () => {
    if (view.phase !== 'exam' || submitMutation.isPending) return;
    void doSubmit();
  };

  const countdown = useCountdown(serverEndAt, serverNow, handleTimeUp);

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const doSubmit = async () => {
    if (view.phase !== 'exam') return;
    try {
      const result = await submitMutation.mutateAsync({
        submission_id: view.submission_id,
        answers: draft.toArray(),
      });
      draft.clear();
      setView({ phase: 'submitted', result });
      setConfirmOpen(false);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Nộp bài lỗi. Thử lại.';
      setView({ phase: 'error', message: msg });
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (view.phase === 'loading') {
    return (
      <div className="flex justify-center py-32">
        <div className="qz-spinner" />
      </div>
    );
  }

  if (view.phase === 'error') {
    return (
      <main className="max-w-md mx-auto p-6">
        <div className="qz-card p-6">
          <h1 className="qz-h2 text-[var(--qz-danger)]">Lỗi</h1>
          <p className="qz-body mt-2">{view.message}</p>
          <button
            type="button"
            className="qz-btn qz-btn-secondary mt-4"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </main>
    );
  }

  if (view.phase === 'submitted') {
    return <SubmittedView result={view.result} onBack={() => navigate(-1)} />;
  }

  // exam phase
  const question = questions[current];
  const unansweredCount = questions.filter(
    (q) => !isAnsweredFlat(draft.answers[q._id]),
  ).length;

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <header className="qz-card p-4 sticky top-2 z-30 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <CountdownTimer parts={countdown} />
          <AutosaveIndicator
            state={autosave.state}
            lastSavedAt={autosave.lastSavedAt}
          />
        </div>
        <button
          type="button"
          className="qz-btn qz-btn-primary"
          onClick={() => setConfirmOpen(true)}
        >
          Nộp bài
        </button>
      </header>

      <div className="grid md:grid-cols-[1fr_320px] gap-4">
        <article className="qz-card p-6">
          <p className="qz-caption text-[var(--qz-slate)]">
            Câu {current + 1} / {questions.length}
          </p>
          <h2 className="qz-h2 mt-2">
            {renderText(question?.question_content?.content)}
          </h2>
          {question?.question_content?.image_url && (
            <img
              src={question.question_content.image_url}
              alt=""
              className="mt-3 max-h-80 rounded-lg"
            />
          )}
          <div className="mt-6">
            {question && (
              <QuestionRenderer
                question={question}
                answer={draft.answers[question._id]}
                onChange={(a: StudentAnswer) => draft.setAnswer(a)}
              />
            )}
          </div>
          <div className="flex justify-between mt-8">
            <button
              type="button"
              className="qz-btn qz-btn-secondary"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              <ChevronLeft size={16} /> Câu trước
            </button>
            <button
              type="button"
              className="qz-btn qz-btn-secondary"
              disabled={current === questions.length - 1}
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            >
              Câu sau <ChevronRight size={16} />
            </button>
          </div>
        </article>

        <aside>
          <QuestionPalette
            questions={questions}
            answers={draft.answers}
            current={current}
            onJump={setCurrent}
          />
        </aside>
      </div>

      <SubmitConfirmModal
        open={confirmOpen}
        totalQuestions={questions.length}
        unansweredCount={unansweredCount}
        isPending={submitMutation.isPending}
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}

function isAnsweredFlat(a: StudentAnswer | undefined): boolean {
  if (!a) return false;
  switch (a.type) {
    case 'single':
      return !!a.selected_id;
    case 'multiple':
      return (a.selected_ids?.length ?? 0) > 0;
    case 'fill_in_the_blank':
      return (a.fill_answers ?? []).some((f) => f.value.trim() !== '');
    case 'order_question':
      return (a.ordered_ids?.length ?? 0) > 0;
    case 'match_choice_question':
      return (a.match_answers ?? []).some(
        (m) => m.option_ids.length > 0,
      );
  }
}

function SubmittedView({
  result,
  onBack,
}: {
  result: SubmissionResult;
  onBack: () => void;
}) {
  const passed = result.score >= 50;
  return (
    <main className="max-w-md mx-auto p-6">
      <div className="qz-card p-6 text-center animate-scaleIn">
        <p className="qz-caption text-[var(--qz-slate)]">Kết quả</p>
        <p
          className={`qz-display mt-2 ${
            passed ? 'text-[var(--qz-success)]' : 'text-[var(--qz-danger)]'
          }`}
        >
          {result.score}
        </p>
        <p className="qz-body mt-2 text-[var(--qz-slate)]">
          {result.total_correct} / {result.total_questions} câu đúng ·{' '}
          {result.raw_score} / {result.max_score} điểm
        </p>
        <p className="qz-caption mt-2 text-[var(--qz-slate-light)]">
          Trạng thái:{' '}
          {result.status === 'auto_submitted'
            ? 'Tự động nộp khi hết giờ'
            : 'Đã nộp'}
        </p>
        <button type="button" className="qz-btn qz-btn-primary mt-6" onClick={onBack}>
          Quay lại lớp
        </button>
      </div>
    </main>
  );
}
