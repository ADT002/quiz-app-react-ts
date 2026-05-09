'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  Pencil,
  Trash2,
  Save,
  X,
  Tags,
} from 'lucide-react';
import { useTopics } from '~/features/topic/useTopics';
import type { Topic } from '~/features/topic/topicSlice';
import CollapsibleSection from '../ui/CollapsibleSection';

export type { Topic };

interface TopicManagementProps {
  topic: string | null;
  onSelect: (topic: Topic) => void;
  onDeselect: () => void;
}

export default function TopicManagement({ topic, onSelect, onDeselect }: TopicManagementProps) {
  const { items, map, create, update, remove, move, saveOrder } = useTopics();

  const [newTopic, setNewTopic] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = async () => {
    if (!newTopic.trim()) return;
    await create(newTopic);
    setNewTopic('');
  };

  const handleUpdateName = async (_id: string) => {
    if (!editingName.trim()) return;
    await update(_id, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Bạn có chắc muốn xoá chủ đề này?')) return;
    await remove(_id);
    if (topic === _id) onDeselect();
  };

  if (!items || !topic) return null;

  return (
    <CollapsibleSection title="Chủ đề" subtitle={map[topic]?.topic_name}>
      <div className="qz-card-flat p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--qz-ink)] font-semibold text-sm">
            <Tags size={16} />
            <span>{items.length} chủ đề</span>
          </div>
          <button
            onClick={saveOrder}
            title="Lưu thứ tự"
            className="p-2 rounded-md bg-[var(--qz-success)] text-white hover:opacity-90"
          >
            <Save size={16} />
          </button>
        </div>

        {/* Selected badge */}
        {topic && (
          <div className="qz-pill qz-pill-success w-fit">
            <Check size={12} />
            {map[topic]?.topic_name}
            <button onClick={onDeselect}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Add */}
        <div className="flex gap-2">
          <input
            className="qz-input flex-1"
            placeholder="Thêm chủ đề mới..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="p-2 rounded-md bg-[var(--qz-violet)] text-white hover:bg-[var(--qz-violet-dark)]"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {items.map((t, index) => {
            const isSelected = topic === t._id;
            return (
              <li
                key={t._id}
                className={`flex items-center gap-2 border rounded-md px-3 py-2 ${
                  isSelected
                    ? 'bg-[#dcfce7] border-[var(--qz-success)]'
                    : 'border-[var(--qz-border)] hover:bg-[var(--qz-bg)]'
                }`}
              >
                <div className="flex flex-col text-[var(--qz-slate-light)]">
                  <button
                    disabled={index === 0}
                    onClick={() => move(index, 'up')}
                    className="disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 'down')}
                    className="disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === t._id ? (
                    <input
                      className="qz-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(t._id)}
                    />
                  ) : (
                    <span className="text-sm font-medium truncate">{t.topic_name}</span>
                  )}
                </div>

                <div className="flex gap-1">
                  {editingId === t._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateName(t._id)}
                        className="p-1.5 text-[var(--qz-success)]"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-[var(--qz-slate-light)]"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled={isSelected}
                        onClick={() => onSelect(t)}
                        className={`p-1.5 rounded ${
                          isSelected
                            ? 'text-[var(--qz-success)]'
                            : 'text-[var(--qz-slate)] hover:text-[var(--qz-success)]'
                        }`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(t._id);
                          setEditingName(t.topic_name);
                        }}
                        className="p-1.5 text-[var(--qz-warn)] hover:opacity-80"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-1.5 text-[var(--qz-danger)] hover:opacity-80"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {items.length === 0 && (
          <div className="text-sm text-[var(--qz-slate-light)] text-center py-4">
            Chưa có chủ đề
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
