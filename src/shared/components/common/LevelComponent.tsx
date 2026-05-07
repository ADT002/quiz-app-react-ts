'use client';

import { Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/app/config';
import {
    apiCallGet,
    apiCallPost,
    apiCallPatch,
    apiCallDelete,
} from '~/shared/services/apiCallService';

/* ================= TYPES ================= */

export interface Level {
    _id: string;
    user_id?: string;
    level_name: string;
}

interface LevelManagementProps {
    level: Level | null;                 // level đang được chọn
    onSelect: (level: Level) => void;    // chọn level
    onDeselect: () => void;              // bỏ chọn
}

/* ================= COMPONENT ================= */

export default function LevelManagement({
    level,
    onSelect,
    onDeselect,
}: LevelManagementProps) {
    const navigate = useNavigate();

    const [levels, setLevels] = useState<Level[]>([]);
    const [newLevel, setNewLevel] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    /* ================= LOAD ================= */

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        const data = await apiCallGet<Level[]>(API_ENDPOINTS.LEVEL, navigate);
        setLevels(data);
    };

    /* ================= ADD ================= */

    const handleAdd = async () => {
        if (!newLevel.trim()) return;

        const created = await apiCallPost<Level>(
            API_ENDPOINTS.LEVEL,
            { level_name: newLevel },
            navigate,
        );

        setLevels(prev => [...prev ?? [], created]);
        setNewLevel('');
    };

    /* ================= UPDATE ================= */

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        const updated = await apiCallPatch<Level>(
            API_ENDPOINTS.LEVEL,
            { id: id, level_name: editingName },
            navigate,
        );

        setLevels(prev => prev.map(l => (l._id === id ? updated : l)));
        setEditingId(null);
        setEditingName('');
    };

    /* ================= DELETE ================= */

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xoá level này?')) return;

        await apiCallDelete(API_ENDPOINTS.LEVEL, { _id: id }, navigate);

        setLevels(prev => prev.filter(l => l._id !== id));

        // nếu xoá level đang chọn → bỏ chọn
        if (level?._id === id) {
            onDeselect();
        }
    };

    /* ================= UI ================= */

    return (
        <div className="w-full">
            {levels && levels.length === 0 ?
                (<div className="text-sm text-gray-400 text-center py-4">
                    Chưa có level
                </div>) : (<div className="bg-white rounded-lg border p-4 space-y-4">

                    {/* ===== HEADER ===== */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Layers size={18} />
                            <span>{levels && levels.length}</span>
                        </div>

                        {level && (
                            <button
                                type="button"
                                onClick={onDeselect}
                                className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded"
                            >
                                <Check size={14} />
                                {level.level_name}
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* ===== ADD ===== */}
                    <div className="flex gap-2">
                        <input
                            className="
            flex-1 rounded-md border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
                            placeholder="Level mới..."
                            value={newLevel}
                            onChange={e => setNewLevel(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* ===== LIST ===== */}
                    <ul className="space-y-2">
                        {levels && levels.map(l => {
                            const isSelected = level?._id === l._id;

                            return (
                                <li
                                    key={l._id}
                                    className={`
                flex items-center justify-between
                border rounded-md px-3 py-2
                ${isSelected ? 'bg-green-50 border-green-400' : 'hover:bg-gray-50'}
              `}
                                >
                                    {editingId === l._id ? (
                                        <div className="flex gap-2 w-full">
                                            <input
                                                className="flex-1 border rounded px-2 py-1 text-sm"
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleUpdate(l._id)}
                                                className="text-green-600"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="text-gray-400"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium truncate">
                                                {l.level_name}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    disabled={isSelected}
                                                    onClick={() => onSelect(l)}
                                                    className={`
                        p-1.5 rounded
                        ${isSelected
                                                            ? 'text-green-600'
                                                            : 'text-gray-500 hover:text-green-600'}
                      `}
                                                >
                                                    <Check size={18} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setEditingId(l._id);
                                                        setEditingName(l.level_name);
                                                    }}
                                                    className="p-1.5 text-yellow-500 hover:text-yellow-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(l._id)}
                                                    className="p-1.5 text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                </div>)}
        </div>
    );

}
