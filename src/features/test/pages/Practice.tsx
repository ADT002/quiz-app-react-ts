'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_ENDPOINTS from '~/app/config';
import QuestionComponent, { type Submission } from '~/features/question/components/QuestionComponent';
import type { Question } from '~/shared/types/question';
import { apiCallPost } from '~/shared/services/apiCallService';
import { TfiReload } from 'react-icons/tfi';

interface PracticeStartResponse {
  test_info: { is_test: boolean };
  questions: Question[];
  mode: 'practice' | 'exam';
}

const Practice: React.FC = () => {
  const location = useLocation();
  const { author_mail, test_id, class_id } = location.state || {};
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubmission, setShowSubmission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!test_id || !class_id || !author_mail) {
      setError(t('doTest.load_error'));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await apiCallPost<PracticeStartResponse>(
          API_ENDPOINTS.START_TEST,
          { class_id, test_id, author_mail, test_of_class_id: test_id },
        );
        setQuestions(res.questions ?? []);
      } catch {
        setError(t('doTest.load_error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [test_id, class_id, author_mail, t]);

  const current = questions[currentIndex];

  const handleSubmissionChange = (submission: Submission) => {
    if (!current) return;
    setSubmissions((prev) => ({ ...prev, [current._id]: submission }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) return <div className="text-red-600 text-center p-6 text-lg">{error}</div>;

  const resetTest = () => {
    if (!window.confirm(t('doTest.confirm_reset') ?? 'Xoá bài đang làm và tải lại?')) return;

    const questionCache = `questions_${test_id}`;
    const submissionCache = `quizSubmissions_${test_id}`;
    localStorage.removeItem(questionCache);
    localStorage.removeItem(submissionCache);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{t('practice') ?? 'Ôn tập'}</h1>
        <button
          onClick={resetTest}
          title="Tải lại bài thi"
          className="qz-btn qz-btn-ghost text-[var(--qz-slate)]"
        >
          <TfiReload size={14} />
        </button>
        <button
          onClick={() => setShowSubmission((p) => !p)}
          className={`px-4 py-2 rounded-full font-semibold ${showSubmission ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
        >
          {showSubmission ? t('doTest.hide_submission') : t('doTest.show_submission')}
        </button>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="mr-2" /> {t('doTest.previous_question')}
        </button>

        <div className="text-sm text-gray-600 flex items-center">
          {t('question')} {currentIndex + 1}/{questions.length}
        </div>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {t('doTest.next_question')} <ChevronRight className="ml-2" />
        </button>
      </div>

      {current && (
        <QuestionComponent
          question={current}
          isDone={false}
          showSubmission={showSubmission}
          submission={submissions[current._id] ?? null}
          onSubmissionChange={handleSubmissionChange}
          author={author_mail || ''}
        />
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {questions.map((q, i) => {
          const answered = !!submissions[q._id];
          return (
            <button
              key={q._id}
              onClick={() => setCurrentIndex(i)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentIndex === i
                ? 'bg-blue-600 text-white'
                : answered
                  ? 'bg-green-100 border-green-500'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Practice;
