'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Level } from '~/shared/components/common/LevelComponent';
import { Topic } from '~/shared/components/common/TopicComponent';
import API_ENDPOINTS from '~/app/config';
import { apiCallGet } from '~/shared/services/apiCallService';

/* ================= TYPES ================= */


export interface MatrixExamData {
    topic: Topic;
    level: Level;
    quantity: number;
}

interface MatrixExamProps {
    data?: MatrixExamData[]; // edit mode
    onChange?: (matrix: MatrixExamData[]) => void;
}

/* ================= COMPONENT ================= */

export default function MatrixExam({
    data = [],
    onChange,
}: MatrixExamProps) {
    /* ===== SELECT ===== */
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopics();
        fetchLevels();
    }, []);

    const fetchTopics = async () => {
        const data = await apiCallGet<Topic[]>(API_ENDPOINTS.TOPIC, navigate);
        const sorted = [...data].sort((a, b) => a.topic_no - b.topic_no);
        setTopics(sorted);
    };

    const fetchLevels = async () => {
        const data = await apiCallGet<Level[]>(API_ENDPOINTS.LEVEL, navigate);
        setLevels(data);
    };
    /* ===== MATRIX ===== */
    const [matrix, setMatrix] = useState<Record<string, MatrixExamData>>({});

    /* ===== INIT EDIT MODE ===== */
    useEffect(() => {
        if (!data.length) return;

        const initMatrix: Record<string, MatrixExamData> = {};
        const topicMap = new Map<string, Topic>();
        const levelMap = new Map<string, Level>();

        data.forEach(cell => {
            const key = `${cell.topic._id}_${cell.level._id}`;
            initMatrix[key] = cell;
            topicMap.set(cell.topic._id, cell.topic);
            levelMap.set(cell.level._id, cell.level);
        });

        setMatrix(initMatrix);
        setSelectedTopics(Array.from(topicMap.values()));
        setSelectedLevels(Array.from(levelMap.values()));
    }, [data]);

    /* ===== TOGGLE CELL ===== */
    const toggleCell = (topic: Topic, level: Level) => {
        const key = `${topic._id}_${level._id}`;

        setMatrix(prev => {
            const updated = { ...prev };

            if (updated[key]) {
                // ❌ đã có → remove (uncheck)
                delete updated[key];
            } else {
                // ✅ chưa có → thêm mới
                const { user_id: _, ...cleanTopic } = topic;
                const { user_id: __, ...cleanLevel } = level;

                updated[key] = {
                    topic: cleanTopic,
                    level: cleanLevel,
                    quantity: 1,
                };
            }

            onChange?.(Object.values(updated));
            return updated;
        });
    };


    /* ===== CHANGE QUANTITY ===== */
    const changeQuantity = (
        topicId: string,
        levelId: string,
        quantity: number,
    ) => {
        const key = `${topicId}_${levelId}`;

        setMatrix(prev => {
            if (!prev[key]) return prev;

            const updated = {
                ...prev,
                [key]: { ...prev[key], quantity },
            };

            onChange?.(Object.values(updated));
            return updated;
        });
    };

    const sortedTopics = useMemo(() => {
        return [...selectedTopics].sort((a, b) => a.topic_no - b.topic_no);
    }, [selectedTopics]);

    /* ================= UI ================= */

    return (
        <div className="space-y-6">

            {/* ===== SELECT TOPIC ===== */}
            <div>
                <h3 className="font-semibold mb-2">📘 Chọn chương</h3>
                <div className="flex flex-wrap gap-3">
                    {topics && topics.map(topic => {
                        const checked = selectedTopics.some(t => t._id === topic._id);
                        return (
                            <label key={topic._id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        setSelectedTopics(prev =>
                                            checked
                                                ? prev.filter(t => t._id !== topic._id)
                                                : [...prev, topic],
                                        )
                                    }
                                />
                                {topic.topic_name}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* ===== SELECT LEVEL ===== */}
            <div>
                <h3 className="font-semibold mb-2">📊 Chọn mức độ</h3>
                <div className="flex flex-wrap gap-3">
                    {levels && levels.map(level => {
                        const checked = selectedLevels.some(l => l._id === level._id);
                        return (
                            <label key={level._id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        setSelectedLevels(prev =>
                                            checked
                                                ? prev.filter(l => l._id !== level._id)
                                                : [...prev, level],
                                        )
                                    }
                                />
                                {level.level_name}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* ===== MATRIX ===== */}
            {selectedTopics.length > 0 && selectedLevels.length > 0 && (
                <div className="overflow-x-auto border rounded-xl bg-white shadow">
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2 text-left">
                                    Topic \\ Level
                                </th>
                                {selectedLevels.map(level => (
                                    <th
                                        key={level._id}
                                        className="border px-4 py-2 text-center"
                                    >
                                        {level.level_name}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedTopics.map(topic => (
                                <tr key={topic._id}>
                                    <td className="border px-4 py-2 font-medium">
                                        {topic.topic_name}
                                    </td>

                                    {selectedLevels.map(level => {
                                        const key = `${topic._id}_${level._id}`;
                                        const cell = matrix[key];

                                        return (
                                            <td
                                                key={key}
                                                className="border px-2 py-2 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!cell}
                                                        onChange={() =>
                                                            toggleCell(topic, level)
                                                        }
                                                    />
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        disabled={!cell}
                                                        className="w-16 border rounded px-1 py-0.5 text-center disabled:bg-gray-100"
                                                        value={cell?.quantity ?? ''}
                                                        onChange={e =>
                                                            changeQuantity(
                                                                topic._id,
                                                                level._id,
                                                                Number(e.target.value),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
