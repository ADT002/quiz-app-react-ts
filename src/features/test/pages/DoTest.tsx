'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Send, CheckCircle2 } from 'lucide-react';
import { TfiReload } from 'react-icons/tfi';
import { useTranslation } from 'react-i18next';
import API_ENDPOINTS from '~/app/config';
import QuestionComponent, { type Submission } from '~/features/question/components/QuestionComponent';
import type { StudentAnswer, SubmitResponse, TestSubmission, QuestionResult } from '~/shared/types/quiz';
import type { Question } from '~/shared/types/question';
import { apiCallPost } from '~/shared/services/apiCallService';
import { FaRssSquare } from 'react-icons/fa';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface InfoTest {
  duration_minutes: number;
  is_test: boolean;
  end_time: string;
}

function fromQuestionAnswers(answers: QuestionResult[]): Record<string, Submission> {
  const map: Record<string, Submission> = {};
  for (const a of answers) {
    switch (a.type) {
      case 'single':
        map[a.question_id] = { type: 'single', submission: a.selected_id ?? '', id: a.question_id };
        break;
      case 'multiple':
        map[a.question_id] = { type: 'multiple', submission: a.selected_ids ?? [], id: a.question_id };
        break;
      case 'fill_in_the_blank':
        map[a.question_id] = {
          type: 'fill_in_the_blank',
          submission: Object.fromEntries((a.fill_answers ?? []).map((f) => [f.blank_id, f.value])),
          id: a.question_id,
          fill_in_the_blanks: [],
        };
        break;
      case 'order_question':
        map[a.question_id] = { type: 'order_question', submission: a.ordered_ids ?? [], id: a.question_id };
        break;
      case 'match_choice_question':
        map[a.question_id] = {
          type: 'match_choice_question',
          submission: Object.fromEntries((a.match_answers ?? []).map((m) => [m.item_id, m.option_ids])),
          id: a.question_id,
          match_items: [],
          match_options: [],
        };
        break;
    }
  }
  return map;
}

function toStudentAnswers(subs: Record<string, Submission>): StudentAnswer[] {
  return Object.entries(subs).map(([questionId, s]) => {
    switch (s.type) {
      case 'single':
        return { question_id: questionId, type: 'single' as const, selected_id: s.submission };
      case 'multiple':
        return { question_id: questionId, type: 'multiple' as const, selected_ids: s.submission };
      case 'fill_in_the_blank':
        return {
          question_id: questionId,
          type: 'fill_in_the_blank' as const,
          fill_answers: Object.entries(s.submission).map(([blank_id, value]) => ({ blank_id, value })),
        };
      case 'order_question':
        return { question_id: questionId, type: 'order_question' as const, ordered_ids: s.submission };
      case 'match_choice_question':
        return {
          question_id: questionId,
          type: 'match_choice_question' as const,
          match_answers: Object.entries(s.submission)
            .filter(([, ids]) => ids !== null)
            .map(([item_id, ids]) => ({ item_id, option_ids: ids as string[] })),
        };
    }
  });
}

const DoTest: React.FC = () => {
  const location = useLocation();
  const { author_mail, test_id, class_id } = location.state || {};
  const { t } = useTranslation();


  const questionCache = `questions_${test_id}`;
  const submissionCache = `quizSubmissions_${test_id}`;

  const countdownTime: CountdownTime = { hours: 0, minutes: 0, seconds: 0 };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionId, setSubmissionId] = useState()
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(() => {
    const saved = localStorage.getItem(submissionCache);
    return saved ? JSON.parse(saved) : {};
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isDone, setIsDone] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const resetTest = () => {
    if (!window.confirm(t('doTest.confirm_reset') ?? 'Xoá bài đang làm và tải lại?')) return;
    localStorage.removeItem(questionCache);
    localStorage.removeItem(submissionCache);
    window.location.reload();
  };

  const handleSubmissionChange = (questionId: string, submission: Submission) => {
    setSaveStatus('saving');
    setSubmissions((prev) => {
      const updated = { ...prev, [questionId]: submission };
      try {
        localStorage.setItem(submissionCache, JSON.stringify(updated));
        setTimeout(() => setSaveStatus('saved'), 500);
      } catch {
        setSaveStatus('error');
      }
      return updated;
    });
  };

  const apiSendTest = async (): Promise<SubmitResponse> => {
    const payload: TestSubmission = {
      author_mail: author_mail as string,
      class_id: class_id as string,
      test_id: test_id as string,
      submission_id: submissionId ?? '',
      answers: toStudentAnswers(submissions),
      user_id: 'a',
    };

    return apiCallPost<SubmitResponse>(API_ENDPOINTS.SUBMIT_TEST, payload);
  };

  const handleSendTest = async () => {
    if (!window.confirm(t('doTest.confirm_submit'))) return;
    try {
      setSaveStatus('saving');
      const res = await apiSendTest();
      setSaveStatus('saved');
      setScore(res.score);
      setMaxScore(res.max_score);
      setSubmissions(fromQuestionAnswers(res.answers));
      setIsDone(true);
      localStorage.removeItem(questionCache);
      localStorage.removeItem(submissionCache);
    } catch {
      setSaveStatus('error');
      alert(t('doTest.submit_error'));
    }
  };

  useEffect(() => {
    const initSession = (_testInfo: InfoTest, qs: Question[], submission?: any) => {
      setQuestions(qs || []);
      if (submission?.status == 'submitted') {
        setSubmissionId(submission._id)
        setIsDone(true);
        setScore(submission.score);
        setMaxScore(submission.max_score ?? 0);
        setSubmissions(fromQuestionAnswers(submission.answers ?? []));
        return;
      }

      if (submission?.start_time) {
        const saved = localStorage.getItem(submissionCache);
        if (saved) setSubmissions(JSON.parse(saved));
      }
    };

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const cached = localStorage.getItem(questionCache);
        if (cached) {
          const parsed = JSON.parse(cached);
          initSession(parsed.test_info, parsed.questions, parsed.submission);
          return;
        }
        const res = await apiCallPost<any>(
          API_ENDPOINTS.START_TEST,
          { class_id, author_mail, test_of_class_id: test_id },
        );
        console.log(res)
        localStorage.setItem(
          questionCache,
          JSON.stringify({
            test_info: res.test_info,
            questions: res.questions,

            mode: res.mode,
            server_now: res.server_now,

            submission_id: res.submission_id,
            submission: res.submission
          }),
        );
        setSubmissionId(res.submission_id)
        initSession(res.test_info, res.questions, res.submission);
      } catch {
        setError(t('doTest.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [test_id, author_mail, class_id]);

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const currentQuestion = questions[currentQuestionIndex];
  const submissionedCount = Object.keys(submissions).length;
  const progressPercentage = questions.length ? (submissionedCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="qz-spinner" />
        <p className="qz-caption mt-4">Đang tải bài thi...</p>
      </div>
    );
  }

  if (error)
    return (
      <div className="qz-card max-w-md mx-auto p-8 text-center mt-12">
        <p className="text-[var(--qz-danger)] font-bold text-lg">{error}</p>
      </div>
    );

  const saveStatusBadge = {
    saving: { color: 'bg-amber-50 text-amber-700', label: t('doTest.saving') },
    saved: { color: 'bg-green-50 text-green-700', label: t('doTest.saved') },
    error: { color: 'bg-red-50 text-red-700', label: t('doTest.save_error') },
  }[saveStatus];

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn">
      {/* ─── Status bar ─── */}
      {!isDone && (
        <div className="qz-card p-5 sticky top-20 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            {/* Timer */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#fee2e2] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--qz-danger)]" />
              </div>
              <div>
                <p className="qz-caption">{t('doTest.time_remaining')}</p>
                <p className="font-bold text-[var(--qz-ink)] tabular-nums">
                  {String(countdownTime.hours).padStart(2, '0')}:
                  {String(countdownTime.minutes).padStart(2, '0')}:
                  {String(countdownTime.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`qz-pill ${saveStatusBadge.color} font-medium`}>{saveStatusBadge.label}</span>
              <button onClick={handleSendTest} className="qz-btn qz-btn-primary">
                <Send size={14} />
                {t('doTest.submit_test')}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[var(--qz-slate)]">
              <span>{t('doTest.submissioned')}</span>
              <span className="font-semibold">
                {submissionedCount}/{questions.length} {t('doTest.questions_count')}
              </span>
            </div>
            <div className="w-full bg-[var(--qz-bg)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[var(--qz-violet)] rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Score banner (done state) ─── */}
      {isDone && (
        <div className="qz-card overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-8 text-center text-white">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
            <p className="text-white/80 text-sm mb-2">{t('doTest.score')}</p>
            <p className="text-5xl font-bold">
              {score}
              <span className="text-2xl text-white/60">/{maxScore || totalScore}</span>
            </p>
          </div>
        </div>
      )}
      <button
        onClick={resetTest}
        title="Tải lại bài thi"
        className="qz-btn qz-btn-ghost text-[var(--qz-slate)]"
      >
        <TfiReload size={14} />
      </button>
      {/* ─── Question content ─── */}
      {currentQuestion && (
        <div className="qz-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--qz-border)]">
            <span className="qz-pill qz-pill-open">
              {t('question')} {currentQuestionIndex + 1}/{questions.length}
            </span>

          </div>

          <QuestionComponent
            question={currentQuestion}
            isDone={isDone}
            showSubmission={isDone}
            submission={submissions[currentQuestion._id] || null}
            onSubmissionChange={(s) => handleSubmissionChange(currentQuestion._id, s)}
            author={author_mail || ''}
          />
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="flex justify-between items-center gap-3">
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
          disabled={currentQuestionIndex === 0}
          className="qz-btn qz-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> {t('doTest.previous_question')}
        </button>
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          className="qz-btn qz-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('doTest.next_question')} <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Question palette ─── */}
      <div className="qz-card p-4">
        <p className="qz-caption mb-3">Bảng điều hướng câu hỏi</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const hasSubmission = !!submissions[q._id];
            const isCurrent = currentQuestionIndex === i;
            return (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition ${isCurrent
                  ? 'bg-[var(--qz-violet)] text-white shadow-[var(--qz-shadow-focus)]'
                  : hasSubmission
                    ? 'bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)] border border-[var(--qz-violet)]/30'
                    : 'bg-white border border-[var(--qz-border)] text-[var(--qz-slate)] hover:border-[var(--qz-violet)]/50'
                  }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-[var(--qz-border)] text-xs text-[var(--qz-slate)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--qz-violet)]" /> Đang xem
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--qz-violet-soft)] border border-[var(--qz-violet)]/30" /> Đã làm
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-[var(--qz-border)]" /> Chưa làm
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoTest;
