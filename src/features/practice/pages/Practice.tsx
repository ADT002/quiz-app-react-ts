import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCcw } from 'lucide-react';

import { examApi } from '~/features/exam/api/examApi';
import { QuestionRenderer } from '~/features/exam/components/QuestionRenderer';
import { QuestionReview } from '~/features/exam/components/QuestionReview';
import { renderText } from '~/features/exam/utils/renderText';
import type {
  ReviewQuestion,
  StudentAnswer,
} from '~/features/exam/types';
import FileViewer from '~/shared/components/common/FileViewer';

/**
 * Practice page — không countdown, không submit, chỉ render câu hỏi để học sinh ôn.
 * Reuse component từ `features/exam` để image rendering qua `file_id` hoạt động
 * giống lúc thi (CLAUDE.md F7).
 *
 * Local state cho draft, không persist (khác exam — practice không lưu submission).
 */
export default function Practice() {
  const { test_of_class_id = '' } = useParams<{ test_of_class_id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!test_of_class_id) {
      setError('Thiếu mã đề ôn tập.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    examApi
      .practice(test_of_class_id)
      .then((res) => {
        if (cancelled) return;
        // Practice mode trả full Question kèm answer keys + suggestion (BE
        // exam.service.practice). FE giữ shape ReviewQuestion để bật toggle
        // hiện đáp án + suggestion.
        setQuestions(res.questions as unknown as ReviewQuestion[]);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Không tải được đề ôn tập.';
        setError(msg);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [test_of_class_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="qz-spinner" />
      </div>
    );
  }
  if (error) {
    return (
      <main className="max-w-md mx-auto p-6">
        <div className="qz-card p-6">
          <h1 className="qz-h2 text-[var(--qz-danger)]">Lỗi</h1>
          <p className="qz-body mt-2">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="qz-btn qz-btn-secondary mt-4"
          >
            Quay lại
          </button>
        </div>
      </main>
    );
  }
  if (questions.length === 0) {
    return (
      <main className="max-w-md mx-auto p-6">
        <p className="qz-card p-6 text-center">Không có câu hỏi nào.</p>
      </main>
    );
  }

  const question = questions[current];
  const reset = () => {
    if (!confirm('Xoá câu trả lời và bắt đầu lại?')) return;
    setAnswers({});
    setCurrent(0);
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <header className="qz-card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="qz-caption text-[var(--qz-slate)]">Ôn tập</p>
          <p className="qz-body font-semibold">
            Câu {current + 1} / {questions.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            className={`qz-btn ${showAnswer ? 'qz-btn-primary' : 'qz-btn-secondary'}`}
            aria-pressed={showAnswer}
          >
            {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
            {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="qz-btn qz-btn-ghost"
            aria-label="Làm lại từ đầu"
          >
            <RefreshCcw size={14} /> Làm lại
          </button>
        </div>
      </header>

      <article className="qz-card p-6">
        <h2 className="qz-h2">{renderText(question.question_content?.content)}</h2>

        {question.question_content?.file_id && (
          <div className="mt-3">
            <FileViewer
              fileId={question.question_content.file_id}
              className="max-h-80 rounded-lg"
            />
          </div>
        )}
        {question.files?.map((f) => (
          <div key={f.file_id} className="mt-3">
            <FileViewer fileId={f.file_id} className="max-h-80 rounded-lg" />
          </div>
        ))}

        <div className="mt-6">
          {showAnswer ? (
            <QuestionReview
              question={question}
              studentAnswer={answers[question._id]}
              showCorrect
            />
          ) : (
            <QuestionRenderer
              question={question}
              answer={answers[question._id]}
              onChange={(a) =>
                setAnswers((prev) => ({ ...prev, [question._id]: a }))
              }
            />
          )}
        </div>

        {showAnswer && question.suggestion && (
          <p className="qz-caption text-[var(--qz-slate)] mt-3 p-2 rounded bg-[var(--qz-bg)]">
            💡{' '}
            {Array.isArray(question.suggestion)
              ? question.suggestion.join(' ')
              : question.suggestion}
          </p>
        )}

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
            onClick={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
          >
            Câu sau <ChevronRight size={16} />
          </button>
        </div>
      </article>

      {/* Question palette */}
      <section className="qz-card p-4">
        <h3 className="qz-caption text-[var(--qz-slate)] mb-3">Bảng câu hỏi</h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {questions.map((q, i) => {
            const answered = !!answers[q._id];
            const cur = i === current;
            const cls = cur
              ? 'bg-[var(--qz-violet)] text-white'
              : answered
                ? 'bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)]'
                : 'bg-[var(--qz-bg)] text-[var(--qz-slate)]';
            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`aspect-square rounded-md text-sm font-semibold flex items-center justify-center ${cls}`}
                aria-label={`Câu ${i + 1}`}
                aria-current={cur ? 'true' : undefined}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
