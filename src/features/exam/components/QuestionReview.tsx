import { Check, X } from 'lucide-react';
import type {
  AnswerResult,
  FillAnswer,
  MatchAnswer,
  MultipleAnswer,
  OrderAnswer,
  ReviewQuestion,
  SingleAnswer,
  StudentAnswer,
} from '../types';
import { renderText } from '../utils/renderText';
import FileViewer from '~/shared/components/common/FileViewer';

interface Props {
  question: ReviewQuestion;
  /**
   * Câu trả lời của học sinh nếu có:
   *   - StudentAnswer (FE practice draft)
   *   - AnswerResult (BE submitted)
   * undefined → không có câu trả lời, chỉ render đáp án đúng (Practice toggle).
   */
  studentAnswer?: StudentAnswer | AnswerResult;
  /** Có hiển thị đáp án đúng không (mặc định true). */
  showCorrect?: boolean;
}

/**
 * Read-only review widget cho 5 question type. Phân biệt:
 *   - ✓ green: đáp án đúng (BE flag)
 *   - ●  blue: học sinh chọn (đúng → hiển thị cùng dấu ✓ green)
 *   - ✗ red: học sinh chọn nhưng sai
 *
 * Không nhận onChange — không phải input. Dành cho mode 'submitted' + practice
 * with-answer. Để input mode dùng QuestionRenderer.
 */
export function QuestionReview({
  question,
  studentAnswer,
  showCorrect = true,
}: Props) {
  switch (question.type) {
    case 'single':
    case 'multiple':
      return (
        <ChoiceReview
          question={question}
          studentAnswer={studentAnswer as SingleAnswer | MultipleAnswer | undefined}
          showCorrect={showCorrect}
          multiple={question.type === 'multiple'}
        />
      );
    case 'fill_in_the_blank':
      return (
        <FillReview
          question={question}
          studentAnswer={studentAnswer as FillAnswer | undefined}
          showCorrect={showCorrect}
        />
      );
    case 'order_question':
      return (
        <OrderReview
          question={question}
          studentAnswer={studentAnswer as OrderAnswer | undefined}
          showCorrect={showCorrect}
        />
      );
    case 'match_choice_question':
      return (
        <MatchReview
          question={question}
          studentAnswer={studentAnswer as MatchAnswer | undefined}
          showCorrect={showCorrect}
        />
      );
    default:
      return null;
  }
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function rowCls(picked: boolean, correct: boolean) {
  if (correct && picked)
    return 'border-[var(--qz-success)] bg-[var(--qz-success)]/10';
  if (correct) return 'border-[var(--qz-success)] bg-[var(--qz-success)]/5';
  if (picked) return 'border-[var(--qz-danger)] bg-[var(--qz-danger)]/10';
  return 'border-[var(--qz-border)]';
}

function Mark({ correct, picked }: { correct: boolean; picked: boolean }) {
  if (correct)
    return (
      <span className="text-[var(--qz-success)]" aria-label="Đáp án đúng">
        <Check size={16} />
      </span>
    );
  if (picked)
    return (
      <span className="text-[var(--qz-danger)]" aria-label="Bạn chọn (sai)">
        <X size={16} />
      </span>
    );
  return <span className="w-4" />;
}

/* ── Single / Multiple ────────────────────────────────────────────────── */

function ChoiceReview({
  question,
  studentAnswer,
  showCorrect,
  multiple,
}: {
  question: ReviewQuestion;
  studentAnswer: SingleAnswer | MultipleAnswer | undefined;
  showCorrect: boolean;
  multiple: boolean;
}) {
  const pickedSet = new Set(
    multiple
      ? ((studentAnswer as MultipleAnswer | undefined)?.selected_ids ?? [])
      : studentAnswer
        ? [(studentAnswer as SingleAnswer).selected_id].filter(Boolean)
        : [],
  );

  return (
    <ul className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const picked = pickedSet.has(opt.id);
        const correct = !!opt.is_correct && showCorrect;
        return (
          <li
            key={opt.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${rowCls(picked, correct)}`}
          >
            <Mark correct={correct} picked={picked && !correct} />
            <span className="qz-body flex-1">{renderText(opt.text)}</span>
            {opt.file_id && (
              <FileViewer fileId={opt.file_id} className="max-h-20 rounded" />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Fill in the blank ────────────────────────────────────────────────── */

function FillReview({
  question,
  studentAnswer,
  showCorrect,
}: {
  question: ReviewQuestion;
  studentAnswer: FillAnswer | undefined;
  showCorrect: boolean;
}) {
  const fillMap = new Map(
    (studentAnswer?.fill_answers ?? []).map((f) => [f.blank_id, f.value]),
  );

  return (
    <ol className="space-y-2">
      {(question.fill_in_the_blanks ?? []).map((b, i) => {
        const userVal = (fillMap.get(b.id) ?? '').trim();
        const correctVal = (b.correct_submission ?? '').trim();
        const isCorrect =
          userVal.toLowerCase() === correctVal.toLowerCase() && correctVal !== '';
        return (
          <li
            key={b.id}
            className={`p-3 rounded-lg border ${
              isCorrect
                ? 'border-[var(--qz-success)] bg-[var(--qz-success)]/5'
                : userVal
                  ? 'border-[var(--qz-danger)] bg-[var(--qz-danger)]/10'
                  : 'border-[var(--qz-border)]'
            }`}
          >
            <p className="qz-caption text-[var(--qz-slate)]">Chỗ trống #{i + 1}</p>
            <p className="qz-body mt-1">
              {renderText(b.text_before)}
              <span className="font-mono mx-1 px-2 py-0.5 rounded bg-[var(--qz-bg)]">
                {userVal || <em className="text-[var(--qz-slate-light)]">— bỏ trống —</em>}
              </span>
              {renderText(b.text_after)}
            </p>
            {showCorrect && (
              <p className="qz-caption mt-1">
                Đáp án đúng:{' '}
                <strong className="text-[var(--qz-success)]">{correctVal}</strong>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Order ────────────────────────────────────────────────────────────── */

function OrderReview({
  question,
  studentAnswer,
  showCorrect,
}: {
  question: ReviewQuestion;
  studentAnswer: OrderAnswer | undefined;
  showCorrect: boolean;
}) {
  const items = question.order_items ?? [];
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const userOrder = studentAnswer?.ordered_ids ?? [];
  const correctOrder = [...items]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((i) => i.id);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <section>
        <h4 className="qz-caption text-[var(--qz-slate)] mb-2">Bạn sắp xếp</h4>
        <ol className="space-y-1">
          {userOrder.length === 0 ? (
            <li className="text-[var(--qz-slate-light)] qz-caption">— bỏ trống —</li>
          ) : (
            userOrder.map((id, i) => {
              const correct = correctOrder[i] === id;
              return (
                <li
                  key={id}
                  className={`flex items-center gap-2 p-2 rounded border ${rowCls(true, correct && showCorrect)}`}
                >
                  <Mark correct={correct && showCorrect} picked={!correct} />
                  <span className="qz-body">
                    {i + 1}. {renderText(itemMap.get(id)?.text)}
                  </span>
                </li>
              );
            })
          )}
        </ol>
      </section>
      {showCorrect && (
        <section>
          <h4 className="qz-caption text-[var(--qz-success)] mb-2">Thứ tự đúng</h4>
          <ol className="space-y-1">
            {correctOrder.map((id, i) => (
              <li
                key={id}
                className="flex items-center gap-2 p-2 rounded border border-[var(--qz-success)]/40 bg-[var(--qz-success)]/5"
              >
                <span className="qz-body">
                  {i + 1}. {renderText(itemMap.get(id)?.text)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ── Match ────────────────────────────────────────────────────────────── */

function MatchReview({
  question,
  studentAnswer,
  showCorrect,
}: {
  question: ReviewQuestion;
  studentAnswer: MatchAnswer | undefined;
  showCorrect: boolean;
}) {
  const items = question.match_items ?? [];
  const options = question.match_options ?? [];
  const userMap = new Map(
    (studentAnswer?.match_answers ?? []).map((m) => [m.item_id, new Set(m.option_ids)]),
  );
  const correctMap = new Map<string, Set<string>>();
  for (const opt of options) {
    if (!opt.match_id) continue;
    if (!correctMap.has(opt.match_id)) correctMap.set(opt.match_id, new Set());
    correctMap.get(opt.match_id)!.add(opt.id);
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const userSet = userMap.get(item.id) ?? new Set<string>();
        const correctSet = correctMap.get(item.id) ?? new Set<string>();
        return (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-[var(--qz-border)]"
          >
            <p className="qz-body font-semibold mb-2">{renderText(item.text)}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const picked = userSet.has(opt.id);
                const correct = correctSet.has(opt.id) && showCorrect;
                if (!picked && !correct) return null;
                return (
                  <span
                    key={opt.id}
                    className={`qz-pill ${
                      correct && picked
                        ? 'qz-pill-success'
                        : correct
                          ? 'qz-pill-success'
                          : 'qz-pill-danger'
                    }`}
                  >
                    {renderText(opt.text)}
                  </span>
                );
              })}
              {userSet.size === 0 && (
                <span className="qz-caption text-[var(--qz-slate-light)]">
                  — bỏ trống —
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
