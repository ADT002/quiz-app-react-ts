import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type { Question, QuestionType } from '../types';
import { QUESTION_TYPES } from '../types';
import { useCreateQuestion, useUpdateQuestion } from '../hooks/useQuestions';
import { useLevels, useTopics } from '../hooks/useTaxonomy';
import { blankQuestion } from '../utils/blankQuestion';
import { RichTextInput } from './RichTextInput';
import { FilePickerButton } from './FilePickerButton';
import { EdChoice } from './editors/EdSingle';
import { EdFill } from './editors/EdFill';
import { EdOrder } from './editors/EdOrder';
import { EdMatch } from './editors/EdMatch';
import { TagInput } from '~/shared/components/ui/TagInput';

interface Props {
  initial: Question | null;
  onClose: () => void;
  onSaved: () => void;
}

export function QuestionEditor({ initial, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<Question>(
    () => initial ?? blankQuestion('single'),
  );
  const [error, setError] = useState<string | null>(null);

  const create = useCreateQuestion();
  const update = useUpdateQuestion();
  const topics = useTopics();
  const levels = useLevels();

  useEffect(() => {
    if (initial) setDraft(initial);
  }, [initial]);

  const switchType = (next: QuestionType) => {
    if (next === draft.type) return;
    if (
      !confirm(
        'Đổi loại câu hỏi sẽ xoá đáp án hiện tại. Tiếp tục?',
      )
    )
      return;
    setDraft({
      ...blankQuestion(next),
      _id: draft._id,
      question_content: draft.question_content,
      tags: draft.tags,
      score: draft.score,
      level: draft.level,
      topic: draft.topic,
    });
  };

  const save = async () => {
    setError(null);
    try {
      if (draft._id) {
        await update.mutateAsync(draft);
      } else {
        await create.mutateAsync(draft);
      }
      onSaved();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Lưu thất bại.';
      setError(msg);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-editor-title"
    >
      <div className="qz-card w-full max-w-3xl mx-4 max-h-[92vh] flex flex-col animate-scaleIn">
        <header className="px-5 py-4 border-b border-[var(--qz-border)] flex justify-between items-center">
          <h2 id="question-editor-title" className="qz-h2">
            {draft._id ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-ghost"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Type */}
          <div>
            <label className="qz-caption text-[var(--qz-slate)] block mb-1">
              Loại câu hỏi
            </label>
            <select
              value={draft.type}
              onChange={(e) => switchType(e.target.value as QuestionType)}
              className="qz-input w-full"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="qz-caption text-[var(--qz-slate)] block mb-1">
              Nội dung câu hỏi
            </label>
            <RichTextInput
              value={draft.question_content?.content}
              onChange={(t) =>
                setDraft({
                  ...draft,
                  question_content: { ...draft.question_content, content: t },
                })
              }
              rows={3}
              placeholder="Câu hỏi..."
              ariaLabel="Nội dung câu hỏi"
            />
            <div className="mt-2">
              <FilePickerButton
                fileId={draft.question_content?.file_id}
                onChange={(file_id) =>
                  setDraft({
                    ...draft,
                    question_content: { ...draft.question_content, file_id },
                  })
                }
                label="Đính file vào câu hỏi"
              />
            </div>
          </div>

          {/* Score / Topic / Level */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="qz-caption text-[var(--qz-slate)] block mb-1">
                Điểm
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={draft.score ?? 1}
                onChange={(e) =>
                  setDraft({ ...draft, score: parseFloat(e.target.value) || 0 })
                }
                className="qz-input w-full"
              />
            </div>
            <div>
              <label className="qz-caption text-[var(--qz-slate)] block mb-1">
                Chủ đề
              </label>
              <select
                value={draft.topic ?? ''}
                onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                className="qz-input w-full"
              >
                <option value="">—</option>
                {(topics.data ?? []).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.topic_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="qz-caption text-[var(--qz-slate)] block mb-1">
                Độ khó
              </label>
              <select
                value={draft.level ?? ''}
                onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                className="qz-input w-full"
              >
                <option value="">—</option>
                {(levels.data ?? []).map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.level_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags — F4 max 10. */}
          <div>
            <label className="qz-caption text-[var(--qz-slate)] block mb-1">
              Tags ({draft.tags?.length ?? 0}/10)
            </label>
            <TagInput
              value={draft.tags ?? []}
              onChange={(tags) => setDraft({ ...draft, tags })}
              placeholder="Enter hoặc , để thêm tag"
              max={10}
              ariaLabel="Tags câu hỏi"
            />
          </div>

          {/* Type-specific editor */}
          <div>
            <label className="qz-caption text-[var(--qz-slate)] block mb-2">
              Đáp án
            </label>
            {(draft.type === 'single' || draft.type === 'multiple') && (
              <EdChoice
                q={draft}
                onChange={setDraft}
                singleCorrect={draft.type === 'single'}
              />
            )}
            {draft.type === 'fill_in_the_blank' && (
              <EdFill q={draft} onChange={setDraft} />
            )}
            {draft.type === 'order_question' && (
              <EdOrder q={draft} onChange={setDraft} />
            )}
            {draft.type === 'match_choice_question' && (
              <EdMatch q={draft} onChange={setDraft} />
            )}
          </div>

          {error && (
            <p className="qz-pill qz-pill-danger">{error}</p>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-[var(--qz-border)] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-secondary"
            disabled={isPending}
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={save}
            className="qz-btn qz-btn-primary"
            disabled={isPending}
          >
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
        </footer>
      </div>
    </div>
  );
}
