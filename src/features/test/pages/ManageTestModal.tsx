import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  X,
  Trash2,
  Check,
  BookOpenCheck,
  BookPlus,
  Info,
  CalendarClock,
  Tags,
  ListChecks,
  Grid2X2,
} from 'lucide-react';

import TestInfoForm from './components/TestInfoForm';
import TestTagsToggle from './components/TestTagsToggle';
import TestScheduleForm from './components/TestScheduleForm';
import MatrixExam from './components/MatrixExam';

import { SelectableQuestionTable } from '~/features/question/components/SelectableQuestionTable';
import { useLevels, useTopics } from '~/features/question/hooks/useTaxonomy';
import type { Level, Question, Topic } from '~/features/question/types';
import { formatDateTime } from '~/shared/utils/objectId';

export interface MatrixExamData {
  topic: string;
  level: string;
  quantity: number;
}

export interface UserSubmit {
  user_email: string;
  score: number;
  email_id: string;
}

export interface TestFormData {
  _id: string;
  test_name: string;
  descript: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_test: boolean;
  tags: string[];
  question_ids: string[];
  test_score: number;
  matrix_exam: MatrixExamData[];
  user_submit: UserSubmit[];
}

const TABS = [
  { id: 'test-info', label: 'Test Info', icon: <Info size={18} /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarClock size={18} /> },
  { id: 'tags', label: 'Tags', icon: <Tags size={18} /> },
  { id: 'questions', label: 'Questions', icon: <ListChecks size={18} /> },
  { id: 'matrix', label: 'Matrix Exam', icon: <Grid2X2 size={18} /> },
] as const;

interface ManageTestModalProps {
  isEditing: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: (id: string) => void;
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  /**
   * Map id → Question của các câu **đã chọn** (formData.question_ids).
   * Dùng để vẽ matrix progress dựa trên topic/level. Caller (ManageTest) bơm
   * dữ liệu từ React Query cache hoặc state cục bộ.
   */
  questions: Record<string, Question[]>;
}

const ManageTestModal: React.FC<ManageTestModalProps> = ({
  isEditing,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData,
  questions,
}) => {
  const topicsQ = useTopics();
  const levelsQ = useLevels();

  const topicMap = useMemo(() => {
    const map: Record<string, Topic> = {};
    for (const t of topicsQ.data ?? []) map[t._id] = t;
    return map;
  }, [topicsQ.data]);

  const levelMap = useMemo(() => {
    const map: Record<string, Level> = {};
    for (const l of levelsQ.data ?? []) map[l._id] = l;
    return map;
  }, [levelsQ.data]);

  const [activeTab, setActiveTab] = useState<string>('test-info');

  const matrixExam = useMemo<MatrixExamData[]>(
    () => (Array.isArray(formData.matrix_exam) ? formData.matrix_exam : []),
    [formData.matrix_exam],
  );

  /** Lookup map cho các câu đã chọn — phục vụ matrix progress. */
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of Object.values(questions).flat()) {
      if (q._id) map.set(q._id, q);
    }
    return map;
  }, [questions]);

  const selectedQuestions = useMemo<Question[]>(
    () =>
      (formData.question_ids ?? [])
        .map((id) => questionMap.get(id))
        .filter((q): q is Question => !!q),
    [formData.question_ids, questionMap],
  );

  const topicFilter = useMemo<Topic[]>(() => {
    const ids = new Set(matrixExam.map((m) => m.topic).filter(Boolean));
    return Array.from(ids)
      .map((id) => topicMap[id])
      .filter((t): t is Topic => !!t)
      .sort((a, b) => (a.topic_no ?? 0) - (b.topic_no ?? 0));
  }, [matrixExam, topicMap]);

  const levelFilter = useMemo<Level[]>(() => {
    const ids = new Set(matrixExam.map((m) => m.level).filter(Boolean));
    return Array.from(ids)
      .map((id) => levelMap[id])
      .filter((l): l is Level => !!l);
  }, [matrixExam, levelMap]);

  const selectedCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of selectedQuestions) {
      if (!q.topic || !q.level) continue;
      const key = `${q.topic}_${q.level}`;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [selectedQuestions]);

  const requiredMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of formData.matrix_exam ?? []) {
      map[`${m.topic}_${m.level}`] = m.quantity;
    }
    return map;
  }, [formData.matrix_exam]);

  const getRemaining = useCallback(
    (topicId: string, levelId: string) => {
      const key = `${topicId}_${levelId}`;
      const required = requiredMap[key] ?? 0;
      const selected = selectedCountMap[key] ?? 0;
      return Math.max(required - selected, 0);
    },
    [requiredMap, selectedCountMap],
  );

  const isCompleted = useCallback(
    (topicId: string, levelId: string) => {
      const key = `${topicId}_${levelId}`;
      return (selectedCountMap[key] ?? 0) >= (requiredMap[key] ?? 0);
    },
    [requiredMap, selectedCountMap],
  );

  const handleMatrixChange = useCallback(
    (matrix: MatrixExamData[]) =>
      setFormData((prev) => ({ ...prev, matrix_exam: matrix })),
    [setFormData],
  );

  const handleSelectionChange = useCallback(
    (ids: string[]) =>
      setFormData((prev) => ({ ...prev, question_ids: ids })),
    [setFormData],
  );

  return (
    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditing ? <BookOpenCheck /> : <BookPlus />}
        </h3>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto h-[56px]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            title={tab.label}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 flex items-center justify-center font-medium text-sm transition-colors focus:outline-none ${activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-4 flex-grow">
        {activeTab === 'test-info' && (
          <TestInfoForm formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'schedule' && (
          <TestScheduleForm formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'tags' && (
          <TestTagsToggle formData={formData} setFormData={setFormData} />
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            {matrixExam.length > 0 &&
              topicFilter.length > 0 &&
              levelFilter.length > 0 && (
                <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">Topic \ Level</th>
                        {levelFilter.map((level) => (
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
                      {topicFilter.map((topic) => (
                        <tr key={topic._id}>
                          <td className="border px-4 py-2 font-medium">
                            {topic.topic_name}
                          </td>
                          {levelFilter.map((level) => {
                            const required =
                              requiredMap[`${topic._id}_${level._id}`];
                            const remain = getRemaining(topic._id, level._id);
                            const done = isCompleted(topic._id, level._id);
                            return (
                              <td
                                key={`${topic._id}_${level._id}`}
                                className="border px-2 py-2 text-center"
                              >
                                {required ? (
                                  done ? (
                                    <span className="text-green-600 font-semibold">
                                      ✔
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                      {remain}
                                    </span>
                                  )
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
              )}

            <SelectableQuestionTable
              selectedIds={formData.question_ids ?? []}
              onChange={handleSelectionChange}
            />
          </div>
        )}

        {activeTab === 'matrix' && (
          <MatrixExam
            data={formData.matrix_exam ?? []}
            onChange={handleMatrixChange}
          />
        )}
      </div>

      {/* Test summary */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Test Summary</h4>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <p className="text-gray-500">Total score</p>
            <p className="font-medium text-gray-800">{formData.test_score}</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-medium text-gray-800">
              {formData.duration_minutes} minutes
            </p>
          </div>
          <div>
            <p className="text-gray-500">Start time</p>
            <p className="font-medium text-gray-800">
              {formatDateTime(formData.start_time)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">End time</p>
            <p className="font-medium text-gray-800">
              {formatDateTime(formData.end_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t">
        {isEditing && formData._id && (
          <button
            onClick={() => onDelete(formData._id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
        <button
          onClick={onSubmit}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          aria-label="Lưu"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default memo(ManageTestModal);
