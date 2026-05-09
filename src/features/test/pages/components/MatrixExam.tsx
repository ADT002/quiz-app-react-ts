'use client';

import { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { useTopics } from '~/features/topic/useTopics';
import { useLevels } from '~/features/level/useLevels';
import type { MatrixExamData } from '../ManageTestModal';

export type { MatrixExamData };

interface MatrixExamProps {
    /** Edit mode: data lưu sẵn từ test (chỉ chứa ObjectId của topic & level + quantity) */
    data: MatrixExamData[];
    onChange: (matrix: MatrixExamData[]) => void;
}

/**
 * Matrix exam editor.
 *
 * Thiết kế: matrix được DERIVE từ prop `data` (không duplicate state).
 * Mọi thay đổi gọi onChange trực tiếp → tránh useEffect loop khi onChange không stable.
 * Chỉ giữ local state cho UI selection (topic/level đang tick chưa có cell).
 */
function MatrixExam({ data, onChange }: MatrixExamProps) {

    const { items: allTopics, map: topicMap } = useTopics();
    const { items: allLevels, map: levelMap } = useLevels();

    /* UI selection: topic/level user tick — có thể bao gồm cả ID chưa có cell */
    const [tickedTopicIds, setTickedTopicIds] = useState<string[]>([]);
    const [tickedLevelIds, setTickedLevelIds] = useState<string[]>([]);

    /* Sync ticked sets khi prop `data` đổi (edit mode hoặc reset) */
    useEffect(() => {
        if (!data?.length) return;
        setTickedTopicIds((prev) => {
            const fromData = Array.from(new Set(data.map((c) => c.topic)));
            // Giữ các tick hiện có + thêm những topic ID có trong data
            const merged = new Set([...prev, ...fromData]);
            return Array.from(merged);
        });
        setTickedLevelIds((prev) => {
            const fromData = Array.from(new Set(data.map((c) => c.level)));
            const merged = new Set([...prev, ...fromData]);
            return Array.from(merged);
        });
    }, [data]);

    /* Map nhanh để check có cell chưa */
    const matrixMap = useMemo(() => {
        const m: Record<string, MatrixExamData> = {};
        data?.forEach((c) => {
            m[`${c.topic}_${c.level}`] = c;
        });
        return m;
    }, [data]);

    /* ── Toggle cell ── trực tiếp gọi onChange */
    const toggleCell = useCallback(
        (topicId: string, levelId: string) => {
            console.log(data)
            const key = `${topicId}_${levelId}`;
            if (matrixMap[key]) {
                onChange(data.filter((c) => `${c.topic}_${c.level}` !== key));
            } else {
                onChange([...data, { topic: topicId, level: levelId, quantity: 1 }]);
            }
        },
        [matrixMap, data, onChange],
    );

    /* ── Change quantity ── */
    const changeQuantity = useCallback(
        (topicId: string, levelId: string, quantity: number) => {
            const key = `${topicId}_${levelId}`;
            if (!matrixMap[key]) return;
            onChange(
                data.map((c) =>
                    `${c.topic}_${c.level}` === key ? { ...c, quantity } : c,
                ),
            );
        },
        [matrixMap, data, onChange],
    );

    const toggleTopic = useCallback((id: string) => {
        setTickedTopicIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);

    const toggleLevel = useCallback((id: string) => {
        setTickedLevelIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);

    /* Sort topics theo topic_no */
    const sortedTickedTopics = useMemo(
        () =>
            tickedTopicIds
                .map((id) => topicMap[id])
                .filter(Boolean)
                .sort((a, b) => a.topic_no - b.topic_no),
        [tickedTopicIds, topicMap],
    );

    const sortedTickedLevels = useMemo(
        () => tickedLevelIds.map((id) => levelMap[id]).filter(Boolean),
        [tickedLevelIds, levelMap],
    );

    return (
        <div className="space-y-6">
            {/* ── Select Topic ── */}
            <div>
                <h3 className="font-semibold mb-2">📘 Chọn chương</h3>
                <div className="flex flex-wrap gap-3">
                    {allTopics.map((topic) => (
                        <label key={topic._id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={tickedTopicIds.includes(topic._id)}
                                onChange={() => toggleTopic(topic._id)}
                            />
                            {topic.topic_name}
                        </label>
                    ))}
                </div>
            </div>

            {/* ── Select Level ── */}
            <div>
                <h3 className="font-semibold mb-2">📊 Chọn mức độ</h3>
                <div className="flex flex-wrap gap-3">
                    {allLevels.map((level) => (
                        <label key={level._id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={tickedLevelIds.includes(level._id)}
                                onChange={() => toggleLevel(level._id)}
                            />
                            {level.level_name}
                        </label>
                    ))}
                </div>
            </div>

            {/* ── Matrix table ── */}
            {sortedTickedTopics.length > 0 && sortedTickedLevels.length > 0 && (
                <div className="overflow-x-auto border rounded-xl bg-white shadow">
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2 text-left">Topic \\ Level</th>
                                {sortedTickedLevels.map((level) => (
                                    <th key={level._id} className="border px-4 py-2 text-center">
                                        {level.level_name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTickedTopics.map((topic) => (
                                <tr key={topic._id}>
                                    <td className="border px-4 py-2 font-medium">{topic.topic_name}</td>
                                    {sortedTickedLevels.map((level) => {
                                        const key = `${topic._id}_${level._id}`;
                                        const cell = matrixMap[key];
                                        return (
                                            <td key={key} className="border px-2 py-2 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!cell}
                                                        onChange={() => toggleCell(topic._id, level._id)}
                                                    />
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        disabled={!cell}
                                                        className="w-16 border rounded px-1 py-0.5 text-center disabled:bg-gray-100"
                                                        value={cell?.quantity ?? ''}
                                                        onChange={(e) =>
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

export default memo(MatrixExam);
