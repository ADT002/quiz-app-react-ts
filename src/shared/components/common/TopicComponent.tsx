'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/app/config';
import {
    apiCallGet,
    apiCallPost,
    apiCallPatch,
    apiCallDelete,
} from '~/shared/services/apiCallService';
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

/* ================= TYPES ================= */

export interface Topic {
    _id: string;
    user_id?: string;
    topic_name: string;
    topic_no: number;
}

interface TopicManagementProps {
    topic: Topic | null;
    onSelect: (topic: Topic) => void;
    onDeselect: () => void;
}

/* ================= COMPONENT ================= */

export default function TopicManagement({
    topic,
    onSelect,
    onDeselect,
}: TopicManagementProps) {
    const navigate = useNavigate();

    const [orderedTopics, setOrderedTopics] = useState<Topic[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    /* ================= LOAD ================= */

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        const data = await apiCallGet<Topic[]>(API_ENDPOINTS.TOPIC, navigate);
        const sorted = [...data].sort((a, b) => a.topic_no - b.topic_no);
        setOrderedTopics(sorted);
    };

    /* ================= ADD ================= */

    const handleAdd = async () => {
        if (!newTopic.trim()) return;

        const created = await apiCallPost<Topic>(
            API_ENDPOINTS.TOPIC,
            {
                topic_name: newTopic,
                topic_no: orderedTopics.length + 1,
            },
            navigate,
        );

        setOrderedTopics(prev => [...prev, created]);
        setNewTopic('');
    };

    /* ================= UPDATE NAME ================= */

    const handleUpdateName = async (_id: string) => {
        if (!editingName.trim()) return;

        const updated = await apiCallPatch<Topic>(
            API_ENDPOINTS.TOPIC,
            { _id: _id, topic_name: editingName },
            navigate,
        );

        setOrderedTopics(prev =>
            prev.map(t => (t._id === _id ? { ...t, topic_name: updated.topic_name } : t)),
        );

        setEditingId(null);
        setEditingName('');
    };

    /* ================= MOVE ORDER (LOCAL ONLY) ================= */

    const moveTopicLocal = (index: number, direction: 'up' | 'down') => {
        setOrderedTopics(prev => {
            const arr = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= arr.length) return prev;

            [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
            return arr;
        });
    };

    /* ================= SAVE ORDER ================= */

    const saveOrder = async () => {
        await Promise.all(
            orderedTopics.map((t, index) =>
                apiCallPatch(
                    API_ENDPOINTS.TOPIC,
                    { _id: t._id, topic_no: index + 1, topic_name: t.topic_name },
                    navigate,
                ),
            ),
        );

        fetchTopics();
    };

    /* ================= DELETE ================= */

    const handleDelete = async (_id: string) => {
        if (!confirm('Bạn có chắc muốn xoá topic này?')) return;

        await apiCallDelete(API_ENDPOINTS.TOPIC, { _id: _id }, navigate);

        setOrderedTopics(prev => prev.filter(t => t._id !== _id));
        if (topic?._id === _id) onDeselect();
    };

    /* ================= UI ================= */

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg border p-4 space-y-4">

                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Tags size={18} />
                        <span>{orderedTopics.length}</span>
                    </div>

                    <button
                        onClick={saveOrder}
                        title="Lưu thứ tự"
                        className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                        <Save size={16} />
                    </button>
                </div>

                {/* ===== SELECTED ===== */}
                {topic && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded text-sm w-fit">
                        <Check size={14} />
                        {topic.topic_name}
                        <button onClick={onDeselect}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ===== ADD ===== */}
                <div className="flex gap-2">
                    <input
                        className="
            flex-1 border rounded-md px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
                        placeholder="Topic mới..."
                        value={newTopic}
                        onChange={e => setNewTopic(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* ===== LIST ===== */}
                <ul className="space-y-2">
                    {orderedTopics.map((t, index) => {
                        const isSelected = topic?._id === t._id;

                        return (
                            <li
                                key={t._id}
                                className={`
                flex items-center gap-2
                border rounded-md px-3 py-2
                ${isSelected ? 'bg-green-50 border-green-400' : 'hover:bg-gray-50'}
              `}
                            >
                                {/* ORDER */}
                                <div className="flex flex-col items-center text-gray-400">
                                    <button
                                        disabled={index === 0}
                                        onClick={() => moveTopicLocal(index, 'up')}
                                        className="disabled:opacity-30"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        disabled={index === orderedTopics.length - 1}
                                        onClick={() => moveTopicLocal(index, 'down')}
                                        className="disabled:opacity-30"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* NAME */}
                                <div className="flex-1 min-w-0">
                                    {editingId === t._id ? (
                                        <input
                                            className="w-full border rounded px-2 py-1 text-sm"
                                            value={editingName}
                                            onChange={e => setEditingName(e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-sm font-medium truncate">
                                            {t.topic_name}
                                        </span>
                                    )}
                                </div>

                                {/* ACTION */}
                                <div className="flex gap-1">
                                    {editingId === t._id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateName(t._id)}
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
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                disabled={isSelected}
                                                onClick={() => onSelect(t)}
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
                                                    setEditingId(t._id);
                                                    setEditingName(t.topic_name);
                                                }}
                                                className="p-1.5 text-yellow-500 hover:text-yellow-600"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(t._id)}
                                                className="p-1.5 text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {/* EMPTY */}
                {orderedTopics.length === 0 && (
                    <div className="text-sm text-gray-400 text-center py-4">
                        Chưa có topic
                    </div>
                )}
            </div>
        </div>
    );

}
