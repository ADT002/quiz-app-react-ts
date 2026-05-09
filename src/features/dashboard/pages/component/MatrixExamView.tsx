import { memo, useMemo } from 'react';
import { useTopics } from '~/features/topic/useTopics';
import { useLevels } from '~/features/level/useLevels';
import type { Topic } from '~/features/topic/topicSlice';
import type { Level } from '~/features/level/levelSlice';
import type { MatrixExamData } from '~/features/test/pages/ManageTestModal';

interface MatrixExamViewProps {
    data: MatrixExamData[];
}

function MatrixExamView({ data }: MatrixExamViewProps) {
    const { map: topicMap } = useTopics();
    const { map: levelMap } = useLevels();

    const topics = useMemo<Topic[]>(() => {
        const ids = new Set(data.map((m) => m.topic).filter(Boolean));
        return Array.from(ids)
            .map((id) => topicMap[id])
            .filter(Boolean)
            .sort((a, b) => a.topic_no - b.topic_no);
    }, [data, topicMap]);

    const levels = useMemo<Level[]>(() => {
        const ids = new Set(data.map((m) => m.level).filter(Boolean));
        return Array.from(ids)
            .map((id) => levelMap[id])
            .filter(Boolean);
    }, [data, levelMap]);

    const matrix = useMemo(() => {
        const m: Record<string, MatrixExamData> = {};
        data.forEach((item) => {
            m[`${item.topic}_${item.level}`] = item;
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

    return (
        <div className="overflow-x-auto border rounded-xl bg-white shadow">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">Topic \\ Level</th>
                        {levels.map((level) => (
                            <th key={level._id} className="border px-4 py-2 text-center">
                                {level.level_name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {topics.map((topic) => (
                        <tr key={topic._id}>
                            <td className="border px-4 py-2 font-medium">{topic.topic_name}</td>
                            {levels.map((level) => {
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

export default memo(MatrixExamView);
