'use client';

import { useState } from 'react';
import { Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useLevels } from '~/features/level/useLevels';
import type { Level } from '~/features/level/levelSlice';
import CollapsibleSection from '../ui/CollapsibleSection';

export type { Level };

interface LevelManagementProps {
  level: string | null;
  onSelect: (level: Level) => void;
  onDeselect: () => void;
}

export default function LevelManagement({ level, onSelect, onDeselect }: LevelManagementProps) {
  const { items, map, create, update, remove } = useLevels();

  const [newLevel, setNewLevel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = async () => {
    if (!newLevel.trim()) return;
    await create(newLevel);
    setNewLevel('');
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    await update(id, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá cấp độ này?')) return;
    await remove(id);
    if (level === id) onDeselect();
  };

  return (
    <CollapsibleSection title="Mức độ" subtitle={map[level ?? '']?.level_name ?? ''}>
      <div className="qz-card-flat p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--qz-ink)] font-semibold text-sm">
            <Layers size={16} />
            <span>{items.length} cấp độ</span>
          </div>

          {level && map[level] && (
            <button
              type="button"
              onClick={onDeselect}
              className="qz-pill qz-pill-success"
            >
              <Check size={12} />
              {map[level].level_name}
              <X size={12} />
            </button>
          )}
        </div>

        {/* Add */}
        <div className="flex gap-2">
          <input
            className="qz-input flex-1"
            placeholder="Thêm cấp độ mới..."
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="bg-[var(--qz-violet)] text-white p-2 rounded-md hover:bg-[var(--qz-violet-dark)]"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* List */}
        {items.length === 0 ? (
          <div className="text-sm text-[var(--qz-slate-light)] text-center py-4">
            Chưa có cấp độ
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((l) => {
              const isSelected = level === l._id;
              return (
                <li
                  key={l._id}
                  className={`flex items-center justify-between border rounded-md px-3 py-2 ${
                    isSelected
                      ? 'bg-[#dcfce7] border-[var(--qz-success)]'
                      : 'border-[var(--qz-border)] hover:bg-[var(--qz-bg)]'
                  }`}
                >
                  {editingId === l._id ? (
                    <div className="flex gap-2 w-full">
                      <input
                        className="qz-input flex-1"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(l._id)}
                      />
                      <button
                        onClick={() => handleUpdate(l._id)}
                        className="text-[var(--qz-success)] px-2"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[var(--qz-slate-light)] px-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium truncate">{l.level_name}</span>

                      <div className="flex gap-1">
                        <button
                          disabled={isSelected}
                          onClick={() => onSelect(l)}
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
                            setEditingId(l._id);
                            setEditingName(l.level_name);
                          }}
                          className="p-1.5 text-[var(--qz-warn)] hover:opacity-80"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(l._id)}
                          className="p-1.5 text-[var(--qz-danger)] hover:opacity-80"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CollapsibleSection>
  );
}
