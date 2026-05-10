import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';

import {
  useCreateLevel,
  useCreateTopic,
  useDeleteLevel,
  useDeleteTopic,
  useLevels,
  useReorderTopics,
  useTopics,
  useUpdateLevel,
  useUpdateTopic,
} from '../hooks/useTaxonomy';
import type { Level, Topic } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal tách 2 tab: Topic (kèm reorder) + Level (CRUD đơn).
 * - Topic order là source-of-truth qua `topic_no`; reorder gửi 1 batch atomic
 *   tới `POST /topic/reorder`.
 * - Tất cả mutation dùng React Query → list tự reload khi đóng modal nhờ
 *   query key invalidation.
 */
export function TaxonomyManager({ open, onClose }: Props) {
  const [tab, setTab] = useState<'topic' | 'level'>('topic');
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="taxonomy-title"
    >
      <div className="qz-card w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col animate-scaleIn">
        <header className="px-5 py-4 border-b border-[var(--qz-border)] flex justify-between items-center">
          <h2 id="taxonomy-title" className="qz-h2">Quản lý chủ đề & độ khó</h2>
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-ghost"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-3 border-b border-[var(--qz-border)] flex gap-2">
          <button
            type="button"
            onClick={() => setTab('topic')}
            className={`qz-pill ${tab === 'topic' ? 'qz-pill-success' : 'qz-pill-muted'}`}
            aria-pressed={tab === 'topic'}
          >
            Chủ đề
          </button>
          <button
            type="button"
            onClick={() => setTab('level')}
            className={`qz-pill ${tab === 'level' ? 'qz-pill-success' : 'qz-pill-muted'}`}
            aria-pressed={tab === 'level'}
          >
            Độ khó
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'topic' ? <TopicSection /> : <LevelSection />}
        </div>

        <footer className="px-5 py-3 border-t border-[var(--qz-border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-secondary"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ── Topic ────────────────────────────────────────────────────────────── */

function TopicSection() {
  const list = useTopics();
  const create = useCreateTopic();
  const update = useUpdateTopic();
  const remove = useDeleteTopic();
  const reorder = useReorderTopics();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const items = list.data ?? [];

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await create.mutateAsync({
      topic_name: trimmed,
      topic_no: items.length + 1,
    });
    setName('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const orig = items.find((t) => t._id === editing.id);
    if (!orig) return;
    await update.mutateAsync({ ...orig, topic_name: editing.name.trim() });
    setEditing(null);
  };

  const move = (idx: number, dir: -1 | 1) => {
    console.log(idx, dir)
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    reorder.mutate(next.map((t) => t._id));
  };

  const askDelete = async (id: string) => {
    if (!confirm('Xoá chủ đề này? Câu hỏi đang tham chiếu sẽ trống chủ đề.'))
      return;
    await remove.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Add new */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chủ đề mới"
          className="qz-input flex-1"
          aria-label="Tên chủ đề mới"
        />
        <button
          type="submit"
          className="qz-btn qz-btn-primary"
          disabled={!name.trim() || create.isPending}
        >
          <Plus size={16} /> Thêm
        </button>
      </form>

      {/* List */}
      {list.isLoading ? (
        <div className="flex justify-center py-8">
          <div className="qz-spinner" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[var(--qz-slate)] text-center py-8">
          Chưa có chủ đề nào.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li
              key={t._id}
              className="flex items-center gap-2 p-3 rounded-lg border border-[var(--qz-border)] bg-[var(--qz-surface)]"
            >
              <span className="qz-pill qz-pill-muted w-10 justify-center">
                #{i + 1}
              </span>
              {editing?.id === t._id ? (
                <>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="qz-input flex-1"
                    aria-label="Sửa tên chủ đề"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="qz-btn qz-btn-primary p-2"
                    aria-label="Lưu"
                    disabled={!editing.name.trim()}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Huỷ"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="qz-body flex-1 truncate">{t.topic_name}</span>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || reorder.isPending}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Lên"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1 || reorder.isPending}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Xuống"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing({ id: t._id, name: t.topic_name })}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Sửa"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(t._id)}
                    className="qz-btn qz-btn-ghost p-2 text-[var(--qz-danger)]"
                    aria-label="Xoá"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Level ────────────────────────────────────────────────────────────── */

function LevelSection() {
  const list = useLevels();
  const create = useCreateLevel();
  const update = useUpdateLevel();
  const remove = useDeleteLevel();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const items = list.data ?? [];

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await create.mutateAsync({ level_name: trimmed });
    setName('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const orig = items.find((l) => l._id === editing.id);
    if (!orig) return;
    await update.mutateAsync({ ...orig, level_name: editing.name.trim() } as Level);
    setEditing(null);
  };

  const askDelete = async (id: string) => {
    if (!confirm('Xoá độ khó này?')) return;
    await remove.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên độ khó mới (vd: Dễ, Trung bình, Khó)"
          className="qz-input flex-1"
          aria-label="Tên độ khó mới"
        />
        <button
          type="submit"
          className="qz-btn qz-btn-primary"
          disabled={!name.trim() || create.isPending}
        >
          <Plus size={16} /> Thêm
        </button>
      </form>

      {list.isLoading ? (
        <div className="flex justify-center py-8">
          <div className="qz-spinner" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[var(--qz-slate)] text-center py-8">
          Chưa có độ khó nào.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((l) => (
            <li
              key={l._id}
              className="flex items-center gap-2 p-3 rounded-lg border border-[var(--qz-border)] bg-[var(--qz-surface)]"
            >
              {editing?.id === l._id ? (
                <>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="qz-input flex-1"
                    aria-label="Sửa tên độ khó"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="qz-btn qz-btn-primary p-2"
                    aria-label="Lưu"
                    disabled={!editing.name.trim()}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Huỷ"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="qz-body flex-1 truncate">{l.level_name}</span>
                  <button
                    type="button"
                    onClick={() => setEditing({ id: l._id, name: l.level_name })}
                    className="qz-btn qz-btn-ghost p-2"
                    aria-label="Sửa"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(l._id)}
                    className="qz-btn qz-btn-ghost p-2 text-[var(--qz-danger)]"
                    aria-label="Xoá"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
