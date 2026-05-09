import React, { memo, useCallback, useMemo, useState } from 'react';
import { X, Trash2, Check, BookOpenCheck, BookPlus, Info, CalendarClock, Tags, ListChecks, Grid2X2 } from 'lucide-react';
import TestInfoForm from './components/TestInfoForm';
import TestTagsToggle from './components/TestTagsToggle';
import TestScheduleForm from './components/TestScheduleForm';
import QuestionTable from '~/features/question/pages/QuestionComponent/QuestionTable';
import MatrixExam from './components/MatrixExam';
import { Topic } from '~/shared/components/common/TopicComponent';
import { Level } from '~/shared/components/common/LevelComponent';
import { formatDateTime } from '~/shared/utils/objectId';
import { Question } from '~/shared/types/question';
import { useTopics } from '~/features/topic/useTopics';
import { useLevels } from '~/features/level/useLevels';

export interface MatrixExamData {
  topic: string,
  level: string,
  quantity: number
}

export interface UserSubmit {
  user_email: string;
  score: number;
  email_id: string;
}

// Type định nghĩa cho dữ liệu bài test
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
  test_score: number
  matrix_exam: MatrixExamData[]
  user_submit: UserSubmit[]
}


/* Tabs definition tĩnh — không tái tạo mỗi render */
const TABS = [
  { id: 'test-info', label: 'Test Info', icon: <Info size={18} /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarClock size={18} /> },
  { id: 'tags', label: 'Tags', icon: <Tags size={18} /> },
  { id: 'questions', label: 'Questions', icon: <ListChecks size={18} /> },
  { id: 'matrix', label: 'Matrix Exam', icon: <Grid2X2 size={18} /> },
] as const;

interface SelectableQuestionTableProps {
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  selectable?: boolean;
}

const SelectableQuestionTable: React.FC<SelectableQuestionTableProps> = ({
  // questions,
  formData,
  setFormData,
  selectable,
}) => {
  return (
    <QuestionTable
      formDataTest={formData}
      setFormDataTest={setFormData}
      selectable={selectable}
    />
  );
};

// Props cho component chính
interface ManageTestModalProps {
  isEditing: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: (id: string) => void;
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  questions: Record<string, any[]>; // You can replace `any` with your `Question` type
  selectable?: boolean;

}

const ManageTestModal: React.FC<ManageTestModalProps> = ({
  isEditing,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData,
  questions,
  selectable
}) => {
  const { map: topicMap } = useTopics();
  const { map: levelMap } = useLevels();

  const [activeTab, setActiveTab] = useState<string>('test-info');
  const matrixExam = useMemo<MatrixExamData[]>(
    () => (Array.isArray(formData.matrix_exam) ? formData.matrix_exam : []),
    [formData.matrix_exam],
  );

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    Object.values(questions).flat().forEach((q) => map.set(q._id, q));
    return map;
  }, [questions]);

  const selectedQuestions = useMemo<Question[]>(
    () => (formData.question_ids ?? []).map((id) => questionMap.get(id)).filter(Boolean) as Question[],
    [formData.question_ids, questionMap],
  );


  /** Topic IDs xuất hiện trong matrix → resolve qua topicMap */
  const topicFilter = useMemo<Topic[]>(() => {
    const ids = new Set(matrixExam.map((m) => m.topic).filter(Boolean));
    return Array.from(ids)
      .map((id) => topicMap[id])
      .filter(Boolean)
      .sort((a, b) => a.topic_no - b.topic_no);
  }, [matrixExam, topicMap]);

  /** Level IDs xuất hiện trong matrix → resolve qua levelMap */
  const levelFilter = useMemo<Level[]>(() => {
    const ids = new Set(matrixExam.map((m) => m.level).filter(Boolean));
    return Array.from(ids)
      .map((id) => levelMap[id])
      .filter(Boolean);
  }, [matrixExam, levelMap]);

  const selectedCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    (selectedQuestions ?? []).forEach((q) => {
      console.log(selectedQuestions)
      if (!q.topic || !q.level) return;
      const key = `${q.topic}_${q.level}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [selectedQuestions]);

  /** matrix_exam giờ chỉ chứa string IDs */
  const requiredMap = useMemo(() => {
    const map: Record<string, number> = {};
    (formData.matrix_exam ?? []).forEach((m) => {
      map[`${m.topic}_${m.level}`] = m.quantity;
    });
    return map;
  }, [formData.matrix_exam]);

  // const canSelectQuestion = (q: Question) => {
  //   if (!q.topic?._id || !q.level?._id) return false;

  //   const key = `${q.topic._id}_${q.level._id}`;
  //   const required = requiredMap[key] ?? 0;
  //   const selected = selectedCountMap[key] ?? 0;

  //   return selected < required;
  // };


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



  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
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
      <div className="flex border-b overflow-x-auto h-[80px]">
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
        {activeTab === 'tags' &&
          <TestTagsToggle formData={formData} setFormData={setFormData} />
        }
        {activeTab === 'questions' && (
          <>
            {matrixExam.length > 0 && (
              <div className="overflow-x-auto border rounded-xl bg-white shadow">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Topic \\ Level</th>
                      {levelFilter.map((level) => (
                        <th key={level._id} className="border px-4 py-2 text-center">
                          {level.level_name}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {topicFilter.map((topic) => (
                      <tr key={topic._id}>
                        <td className="border px-4 py-2 font-medium">{topic.topic_name}</td>

                        {levelFilter.map((level) => {
                          const remain = getRemaining(topic._id, level._id);
                          const done = isCompleted(topic._id, level._id);

                          return (
                            <td
                              key={`${topic._id}_${level._id}`}
                              className="border px-2 py-2 text-center"
                            >
                              {requiredMap[`${topic._id}_${level._id}`] ? (
                                done ? (
                                  <span className="text-green-600 font-semibold">✔</span>
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
              // questions={questions}
              formData={formData}
              setFormData={setFormData}
              selectable={selectable}
            />
          </>
        )}
        {activeTab === 'matrix' && (
          <MatrixExam data={formData.matrix_exam ?? []} onChange={handleMatrixChange} />
        )}

      </div>
      {/* Test summary */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Test Summary
        </h4>

        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <p className="text-gray-500">Total score</p>
            <p className="font-medium text-gray-800">
              {formData.test_score}
            </p>
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
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div >
  );
};

export default memo(ManageTestModal);
