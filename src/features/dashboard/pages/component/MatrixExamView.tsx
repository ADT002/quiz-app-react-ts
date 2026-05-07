import { useMemo } from 'react';
import { Level } from '~/shared/components/common/LevelComponent';
import { Topic } from '~/shared/components/common/TopicComponent';
import { MatrixExamData } from '~/features/test/pages/ManageTestModal';

/* ================= PROPS ================= */

interface MatrixExamViewProps {
    data: MatrixExamData[];
}

/* ================= COMPONENT ================= */

export default function MatrixExamView({ data }: MatrixExamViewProps) {
    if (!data)
        return
    /* ===== GROUP TOPIC & LEVEL ===== */
    const topics = useMemo<Topic[]>(() => {
        const map = new Map<string, Topic>();
        data.forEach(item => map.set(item.topic._id, item.topic));
        return Array.from(map.values()).sort((a, b) => a.topic_no - b.topic_no);
    }, [data]);

    const levels = useMemo<Level[]>(() => {
        const map = new Map<string, Level>();
        data.forEach(item => map.set(item.level._id, item.level));
        return Array.from(map.values());
    }, [data]);

    const matrix = useMemo(() => {
        const m: Record<string, MatrixExamData> = {};
        data.forEach(item => {
            m[`${item.topic._id}_${item.level._id}`] = item;
        });
        return m;
    }, [data]);

    if (!data.length) {
        return (
            <div className="text-center text-gray-500 italic">
                Chưa có dữ liệu ma trận đề thi
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="overflow-x-auto border rounded-xl bg-white shadow">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">
                            Topic \\ Level
                        </th>
                        {levels.map(level => (
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
                    {topics.map(topic => (
                        <tr key={topic._id}>
                            <td className="border px-4 py-2 font-medium">
                                {topic.topic_name}
                            </td>

                            {levels.map(level => {
                                const cell = matrix[`${topic._id}_${level._id}`];

                                return (
                                    <td
                                        key={`${topic._id}_${level._id}`}
                                        className="border px-4 py-2 text-center"
                                    >
                                        {cell ? (
                                            <span className="font-semibold text-blue-600">
                                                {cell.quantity}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
