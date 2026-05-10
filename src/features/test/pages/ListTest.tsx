import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useEffect, useState, useCallback } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { apiCallPost } from '~/shared/services/apiCallService';
import API_ENDPOINTS from '~/app/config';

interface TestItem {
  id: string;
  test_name: string;
  descript: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_test: boolean;
}

import { GripVertical } from 'lucide-react'; // Thêm icon kéo nếu muốn đẹp

function SortableTestItem({ test, onClick }: { test: TestItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: test.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white p-4 mb-4 rounded-xl shadow hover:shadow-md transition border border-gray-200"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {/* Chỉ gán drag listeners vào icon kéo */}
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
          </div>
          <h2 className="text-lg font-semibold">{test.test_name}</h2>
        </div>
        <button
          onClick={onClick}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Làm bài
        </button>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{test.descript}</p>
      <div className="text-xs text-gray-500 mt-2">
        {new Date(test.start_time).toLocaleString()} - {new Date(test.end_time).toLocaleString()}
      </div>
      <div className="text-sm mt-1">Thời lượng: {test.duration_minutes} phút</div>
    </div>
  );
}

export default function ListTest() {
  const { classId, author } = useParams<{ classId?: string; author?: string }>();
  const navigate: NavigateFunction = useNavigate();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiCallPost<TestItem[]>(
        API_ENDPOINTS.GET_TESTS_OF_CLASS,
        { class_id: classId },
      );
      setTests(result);
    } catch (err) {
      setError('Lỗi khi tải danh sách bài kiểm tra.');
    } finally {
      setLoading(false);
    }
  }, [classId, navigate]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleStartTest = (testId: string, isTest: boolean) => {
    navigate(isTest ? '/do-test' : '/practice', {
      state: { author_mail: author, test_id: testId, class_id: classId },
    });
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tests.findIndex((item) => item.id === active.id);
      const newIndex = tests.findIndex((item) => item.id === over.id);
      setTests((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Danh sách bài kiểm tra</h1>

      {loading && <div className="text-center">Đang tải...</div>}
      {error && <div className="text-red-600 text-center">{error}</div>}

      {!loading && !error && tests && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tests.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tests.map((test) => (
              <SortableTestItem
                key={test.id}
                test={test}
                onClick={() => {
                  handleStartTest(test.id, test.is_test);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
