import { useState } from 'react';
import { Search } from 'lucide-react';

import { useQuestions } from '../hooks/useQuestions';
import { useLevels, useTopics } from '../hooks/useTaxonomy';
import { QUESTION_TYPES } from '../types';
import type { Question, QuestionFilters, QuestionType } from '../types';
import { renderText } from '~/features/exam/utils/renderText';

const PAGE_SIZE = 20;

interface Props {
  /** IDs đang được chọn (sống trong formData của ManageTestModal). */
  selectedIds: string[];
  /** Callback khi danh sách selected thay đổi. */
  onChange: (ids: string[]) => void;

  /**
   * Optional: cố định filter từ ngoài (dùng khi caller muốn show câu hỏi
   * thuộc 1 (topic, level) duy nhất — ví dụ matrix exam constraint).
   */
  lockedFilter?: Partial<Pick<QuestionFilters, 'topic_id' | 'level_id' | 'type'>>;
}

/**
 * Picker câu hỏi cho test/quiz. Thay thế component QuestionTable cũ
 * (~500 LOC, Redux-based). Dùng React Query + filter server-side.
 *
 * Dependency chỉ vào features/question — không kéo theo legacy slice.
 */
export function SelectableQuestionTable({
  selectedIds,
  onChange,
  lockedFilter,
}: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [type, setType] = useState<QuestionType | ''>('');
  const [topicId, setTopicId] = useState(lockedFilter?.topic_id ?? '');
  const [levelId, setLevelId] = useState(lockedFilter?.level_id ?? '');

  const filters: QuestionFilters = {
    page,
    limit: PAGE_SIZE,
    q: committedSearch || undefined,
    type: (lockedFilter?.type ?? type) || undefined,
    topic_id: (lockedFilter?.topic_id ?? topicId) || undefined,
    level_id: (lockedFilter?.level_id ?? levelId) || undefined,
  };

  const list = useQuestions(filters);
  const topics = useTopics();
  const levels = useLevels();

  const items: Question[] = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selectedSet = new Set(selectedIds);

  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCommittedSearch(search.trim());
    setPage(1);
  };

  const lockedTopic = !!lockedFilter?.topic_id;
  const lockedLevel = !!lockedFilter?.level_id;
  const lockedType = !!lockedFilter?.type;

  return (
    <div className="space-y-3">
      {/* Filters */}
      {(
        <div className="flex flex-wrap items-end gap-2">
          <form onSubmit={submitSearch} className="flex-1 min-w-[180px] flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm câu hỏi..."
                className="qz-input pl-9 w-full"
                aria-label="Tìm câu hỏi"
              />
            </div>
            <button type="submit" className="qz-btn qz-btn-secondary">
              Tìm
            </button>
          </form>

          {!lockedType && (
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as QuestionType | '');
                setPage(1);
              }}
              className="qz-input"
              aria-label="Loại"
            >
              <option value="">Mọi loại</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          )}

          {!lockedTopic && (
            <select
              value={topicId}
              onChange={(e) => {
                setTopicId(e.target.value);
                setPage(1);
              }}
              className="qz-input"
              aria-label="Chủ đề"
            >
              <option value="">Mọi chủ đề</option>
              {(topics.data ?? []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.topic_name}
                </option>
              ))}
            </select>
          )}

          {!lockedLevel && (
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setPage(1);
              }}
              className="qz-input"
              aria-label="Độ khó"
            >
              <option value="">Mọi độ khó</option>
              {(levels.data ?? []).map((l) => (
                <option key={l._id} value={l._id}>
                  {l.level_name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Counter */}
      <p className="qz-caption text-[var(--qz-slate)]">
        Đã chọn <strong>{selectedIds.length}</strong> câu
        {` · ${total} câu khả dụng`}
      </p>

      {/* List */}
      {list.isLoading ? (
        <div className="flex justify-center py-8">
          <div className="qz-spinner" />
        </div>
      ) : list.isError ? (
        <div className="qz-card p-4 text-center">
          <p className="qz-pill qz-pill-danger">Không tải được câu hỏi.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="qz-btn qz-btn-secondary mt-2"
          >
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-[var(--qz-slate)] text-center py-6">
          Không có câu hỏi nào khớp.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((q) => {
            const id = q._id ?? '';
            const checked = selectedSet.has(id);
            return (
              <li
                key={id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition ${checked
                  ? 'border-[var(--qz-violet)] bg-[var(--qz-violet-soft)]'
                  : 'border-[var(--qz-border)] bg-[var(--qz-surface)]'
                  }`}
              >
                {(
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(id)}
                    aria-label={`Chọn câu ${id}`}
                    className="accent-[var(--qz-violet)] mt-1"
                  />
                )}
                <span className="qz-pill qz-pill-muted whitespace-nowrap">
                  {QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="qz-body truncate">
                    {renderText(q.question_content?.content) || (
                      <span className="text-[var(--qz-slate-light)]">
                        (chưa có nội dung)
                      </span>
                    )}
                  </p>
                  <p className="qz-caption text-[var(--qz-slate)] mt-1">
                    {q.score ?? 0} điểm
                    {q.tags?.length ? ` · ${q.tags.join(', ')}` : ''}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2" aria-label="Trang">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="qz-btn qz-btn-secondary"
          >
            ‹ Trước
          </button>
          <span className="qz-caption">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="qz-btn qz-btn-secondary"
          >
            Sau ›
          </button>
        </nav>
      )}
    </div>
  );
}
