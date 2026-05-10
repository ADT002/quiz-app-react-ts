import { useState } from 'react';
import { Library, Pencil, Plus, Search, Settings, Trash2 } from 'lucide-react';

import {
  useDeleteQuestion,
  useQuestions,
} from '../hooks/useQuestions';
import { useLevels, useTopics } from '../hooks/useTaxonomy';
import { QUESTION_TYPES } from '../types';
import type { Question, QuestionFilters } from '../types';
import { QuestionEditor } from '../components/QuestionEditor';
import { TaxonomyManager } from '../components/TaxonomyManager';
import { renderText } from '~/features/exam/utils/renderText';

const PAGE_SIZE = 20;

export default function ManageQuestion() {
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Question | null | undefined>(
    undefined,
  );
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);

  const list = useQuestions(filters);
  const del = useDeleteQuestion();
  const topics = useTopics();
  const levels = useLevels();

  // Tag filter chỉ chạy phía client trên trang hiện tại — đơn giản hoá UX,
  // không round-trip BE. Caveat: lọc trong phạm vi PAGE_SIZE; nếu cần lọc
  // toàn bộ DB phải đẩy lên BE (xem QuestionFilters.Tags). Cho V1: client OK.
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const rawItems = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /** Tags xuất hiện trong các câu của trang hiện tại — feed cho chip filter. */
  const availableTags = Array.from(
    new Set(rawItems.flatMap((q) => q.tags ?? [])),
  ).sort();

  /** AND-match: câu hỏi phải có tất cả tag đang chọn. */
  const items =
    activeTags.length === 0
      ? rawItems
      : rawItems.filter((q) => {
        const set = new Set(q.tags ?? []);
        return activeTags.every((t) => set.has(t));
      });

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: search.trim() || undefined, page: 1 }));
  };

  const setFilter = (patch: Partial<QuestionFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const askDelete = async (id: string) => {
    if (!confirm('Xoá câu hỏi này?')) return;
    try {
      await del.mutateAsync(id);
    } catch {
      alert('Xoá thất bại.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero */}
      <header className="qz-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-6 md:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Library size={16} />
                Ngân hàng câu hỏi
              </div>
              <h1 className="qz-h1 text-white">Quản lý câu hỏi</h1>
              <p className="text-white/80 text-sm mt-1">
                {total} câu hỏi · 5 loại: trắc nghiệm 1/nhiều đáp án, điền chỗ trống, sắp xếp, nối cột
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTaxonomyOpen(true)}
                className="qz-btn qz-btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Settings size={16} /> Chủ đề & độ khó
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="qz-btn qz-btn-primary bg-white text-[var(--qz-violet-dark)]"
              >
                <Plus size={16} /> Tạo câu hỏi
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="qz-card p-4 flex flex-wrap items-end gap-3">
        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[200px] flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung..."
              className="qz-input pl-9 w-full"
              aria-label="Tìm câu hỏi"
            />
          </div>
          <button type="submit" className="qz-btn qz-btn-secondary">
            Tìm
          </button>
        </form>

        <select
          value={filters.type ?? ''}
          onChange={(e) =>
            setFilter({
              type: (e.target.value || undefined) as QuestionFilters['type'],
            })
          }
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

        <select
          value={filters.topic_id ?? ''}
          onChange={(e) =>
            setFilter({ topic_id: e.target.value || undefined })
          }
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

        <select
          value={filters.level_id ?? ''}
          onChange={(e) =>
            setFilter({ level_id: e.target.value || undefined })
          }
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
      </section>

      {/* Tag filter (client-side, AND match trên trang hiện tại) */}
      {availableTags.length > 0 && (
        <section className="qz-card p-3 flex flex-wrap items-center gap-2">
          <span className="qz-caption text-[var(--qz-slate)] mr-1">Tags:</span>
          {availableTags.map((tag) => {
            const on = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`qz-pill ${on ? 'qz-pill-success' : 'qz-pill-muted'}`}
                aria-pressed={on}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="qz-btn qz-btn-ghost text-xs ml-auto"
            >
              Xoá filter
            </button>
          )}
        </section>
      )}

      {/* List */}
      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <div className="qz-spinner" />
        </div>
      ) : list.isError ? (
        <div className="qz-card p-6 text-center">
          <p className="qz-pill qz-pill-danger">Không tải được danh sách.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="qz-btn qz-btn-secondary mt-3"
          >
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="qz-card p-10 text-center">
          <p className="qz-h3 text-[var(--qz-slate)]">Chưa có câu hỏi nào</p>
          <p className="qz-caption mt-2 text-[var(--qz-slate-light)]">
            Bấm "Tạo câu hỏi" để bắt đầu xây ngân hàng đề.
          </p>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="qz-btn qz-btn-primary mt-4"
          >
            <Plus size={16} /> Tạo câu hỏi đầu tiên
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((q) => (
            <li
              key={q._id}
              className="qz-card p-4 flex items-start gap-3 hover:ring-2 hover:ring-[var(--qz-violet-soft)]"
            >

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
              <span className="qz-pill qz-pill-muted whitespace-nowrap">
                {(() => {
                  const questionType = QUESTION_TYPES.find((t) => t.value === q.type);
                  const Icon = questionType?.icon;

                  return (
                    <div className="flex items-center">
                      {Icon && <Icon size={20} className="mr-2" />}
                      <span>{questionType?.label ?? q.type}</span>
                    </div>
                  );
                })()}
              </span>
              <button
                type="button"
                onClick={() => setEditing(q)}
                className="qz-btn qz-btn-ghost"
                aria-label="Sửa"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => q._id && askDelete(q._id)}
                className="qz-btn qz-btn-ghost text-[var(--qz-danger)]"
                aria-label="Xoá"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )
      }

      {/* Pagination */}
      {
        totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2" aria-label="Trang">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
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
              onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
              className="qz-btn qz-btn-secondary"
            >
              Sau ›
            </button>
          </nav>
        )
      }

      {/* Editor modal */}
      {
        editing !== undefined && (
          <QuestionEditor
            initial={editing}
            onClose={() => setEditing(undefined)}
            onSaved={() => setEditing(undefined)}
          />
        )
      }

      {/* Topic & Level manager */}
      <TaxonomyManager
        open={taxonomyOpen}
        onClose={() => setTaxonomyOpen(false)}
      />
    </div >
  );
}
