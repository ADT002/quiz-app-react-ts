import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CirclePlus, RefreshCcwDot, Trash2, Check, Pencil, BookOpen, Library } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import ManageTestModal, { TestFormData } from '~/features/test/pages/ManageTestModal';
import {
  fetchTestTemplates,
  fetchTestOfClass,
  createTestOfClass,
  saveTestOfClass,
  deleteTestOfClass,
  resetTest,
  clearTestOfClass,
  CreateTestOfClassPayload,
} from '~/features/test/testSlice';
import { fetchQuestions } from '~/features/question/questionSlice';
import { RootState, AppDispatch } from '~/app/store';
import { ClassFormData } from '../ManageClass';
import UserSubmitComponent from './UserSubmitComponent';

interface Props {
  formData: ClassFormData;
  navigate: NavigateFunction;
}

const initTestValue: TestFormData = {
  _id: '',
  test_name: '',
  descript: '',
  duration_minutes: 0,
  start_time: '',
  end_time: '',
  is_test: false,
  tags: [],
  question_ids: [],
  matrix_exam: [],
  test_score: 0,
  user_submit: [],
};

export default function TestManagement({ formData, navigate }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { allTestTemplates, allTestOfClass } = useSelector((state: RootState) => state.tests);
  const { questionsByPage } = useSelector((state: RootState) => state.questions);

  const [modalTest, setModalTest] = useState<TestFormData>(initTestValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<TestFormData | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [templateTag, setTemplateTag] = useState('');
  const [isAddingToClass, setIsAddingToClass] = useState(false);

  const classExists = !!formData._id;

  useEffect(() => {
    dispatch(clearTestOfClass());
    dispatch(fetchTestTemplates({ navigate }));
    dispatch(fetchQuestions({ navigate }));
    if (classExists) {
      dispatch(fetchTestOfClass({ class_id: formData._id!, navigate }));
    }
  }, [classExists, formData._id, dispatch, navigate]);

  const templateTags = useMemo<string[]>(
    () => [...new Set(allTestTemplates.flatMap((t) => t.tags ?? []))].filter(Boolean),
    [allTestTemplates],
  );

  const filteredTemplates = useMemo(
    () => templateTag ? allTestTemplates.filter((t) => t.tags?.includes(templateTag)) : allTestTemplates,
    [allTestTemplates, templateTag],
  );

  // O(1) lookup to show "Đã có" badge on templates already in this class
  const classTestNames = useMemo(
    () => new Set(allTestOfClass.map((t) => t.test_name)),
    [allTestOfClass],
  );

  // TestOfClass handlers

  const openCreateModal = useCallback(() => {
    setModalTest({ ...initTestValue });
    setIsEditing(false);
    setIsReadOnly(false);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((test: TestFormData, readOnly = false) => {
    setModalTest({ ...initTestValue, ...test });
    setIsEditing(true);
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(async () => {
    if (!modalTest.test_name || modalTest.duration_minutes <= 0) {
      toast.error('Vui lòng điền tên và thời gian làm bài.');
      return;
    }

    const payload: CreateTestOfClassPayload = {
      ...modalTest,
      class_id: formData._id!,
      start_time: modalTest.start_time ? new Date(modalTest.start_time).toISOString() : '',
      end_time: modalTest.end_time ? new Date(modalTest.end_time).toISOString() : '',
    };

    try {
      if (isEditing) {
        await dispatch(saveTestOfClass({ values: payload, navigate })).unwrap();
        toast.success('Đã cập nhật bài thi trong lớp.');
      } else {
        await dispatch(createTestOfClass({ values: payload, navigate })).unwrap();
        toast.success('Đã tạo bài thi cho lớp.');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Có lỗi xảy ra khi lưu bài thi.');
    }
  }, [modalTest, isEditing, formData._id, dispatch, navigate]);

  const handleDeleteTestOfClass = useCallback(
    async (_id: string) => {
      if (!window.confirm('Xóa bài thi này khỏi lớp?')) return;
      try {
        await dispatch(deleteTestOfClass({ _id, navigate })).unwrap();
        toast.success('Đã xóa bài thi khỏi lớp.');
        setIsModalOpen(false);
      } catch {
        toast.error('Lỗi khi xóa bài thi.');
      }
    },
    [dispatch, navigate],
  );

  const handleReset = useCallback(
    async (test: TestFormData) => {
      try {
        await dispatch(
          resetTest({ values: { class_id: formData._id!, test_id: test._id }, navigate }),
        ).unwrap();
        toast.success('Đã reset bài thi.');
      } catch {
        toast.error('Lỗi khi reset bài thi.');
      }
    },
    [formData._id, dispatch, navigate],
  );

  // Template selection handlers

  const toggleTemplateSelect = useCallback((id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddTemplatesToClass = useCallback(async () => {
    if (!formData._id) {
      toast.warning('Hãy lưu lớp trước khi thêm bài thi.');
      return;
    }
    if (selectedTemplateIds.size === 0) return;

    setIsAddingToClass(true);
    const selected = allTestTemplates.filter((t) => selectedTemplateIds.has(t._id));

    try {
      const results = await Promise.allSettled(
        selected.map((tmpl) => {
          const payload: CreateTestOfClassPayload = {
            ...tmpl,
            _id: '',
            class_id: formData._id!,
            user_submit: [],
          };
          return dispatch(createTestOfClass({ values: payload, navigate })).unwrap();
        }),
      );

      let successCount = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          successCount++;
        } else {
          toast.error(`Lỗi khi thêm "${selected[i].test_name}"`);
        }
      });

      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} bài thi vào lớp.`);
        setSelectedTemplateIds(new Set());
      }
    } finally {
      setIsAddingToClass(false);
    }
  }, [selectedTemplateIds, allTestTemplates, formData._id, dispatch, navigate]);

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <ManageTestModal
          questions={questionsByPage}
          onClose={() => setIsModalOpen(false)}
          onSubmit={isReadOnly ? () => setIsModalOpen(false) : handleModalSubmit}
          formData={modalTest}
          setFormData={setModalTest}
          isEditing={isEditing}
          selectable={!isReadOnly}
          onDelete={handleDeleteTestOfClass}
        />
      )}

      {submitTarget && formData._id && (
        <UserSubmitComponent
          classID={formData._id}
          testID={submitTarget._id}
          testName={submitTarget.test_name}
          userSubmits={submitTarget.user_submit}
          onClose={() => setSubmitTarget(null)}
        />
      )}

      {/* Section 1 — Bài thi trong lớp (TestOfClass) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Bài thi trong lớp</h3>
          {allTestOfClass.length > 0 && (
            <span className="text-xs text-gray-400">({allTestOfClass.length})</span>
          )}
        </div>

        {renderTestOfClassBody()}

        {classExists && (
          <button
            onClick={openCreateModal}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 rounded-md border border-dashed hover:border-blue-400 hover:text-blue-600 transition"
          >
            <CirclePlus size={16} />
            Tạo bài thi mới cho lớp
          </button>
        )}
      </section>

      <div className="border-t border-gray-200" />

      {/* Section 2 — Thư viện đề thi mẫu (TestTemplate) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Library size={18} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-800">Thư viện đề thi mẫu</h3>
          </div>
          {selectedTemplateIds.size > 0 && (
            <button
              onClick={handleAddTemplatesToClass}
              disabled={isAddingToClass || !classExists}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Check size={14} />
              {isAddingToClass ? 'Đang thêm...' : `Thêm ${selectedTemplateIds.size} bài vào lớp`}
            </button>
          )}
        </div>

        {templateTags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {['', ...templateTags].map((tag) => (
              <button
                key={tag || '__all__'}
                onClick={() => setTemplateTag(tag)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  templateTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag || 'Tất cả'}
              </button>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-3 text-center">Chưa có đề thi mẫu nào.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => {
              const isSelected = selectedTemplateIds.has(tmpl._id);
              const alreadyInClass = classTestNames.has(tmpl.test_name);
              return (
                <div
                  key={tmpl._id}
                  onClick={() => toggleTemplateSelect(tmpl._id)}
                  className={`border rounded-lg p-3 cursor-pointer transition select-none ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                      <p className="text-sm font-medium truncate">{tmpl.test_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {alreadyInClass && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Đã có</span>
                      )}
                      <span className="text-xs text-gray-400">{tmpl.duration_minutes}ph</span>
                    </div>
                  </div>
                  {tmpl.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
                      {tmpl.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!classExists && selectedTemplateIds.size > 0 && (
          <p className="mt-2 text-xs text-amber-600 text-center">Lưu lớp trước để thêm bài thi vào lớp.</p>
        )}
      </section>
    </div>
  );

  function renderTestOfClassBody() {
    if (!classExists) {
      return <p className="text-sm text-gray-400 italic py-3 text-center">Lưu lớp trước để quản lý bài thi.</p>;
    }
    if (allTestOfClass.length === 0) {
      return <p className="text-sm text-gray-400 italic py-3 text-center">Chưa có bài thi nào trong lớp.</p>;
    }
    return (
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {allTestOfClass.map((test) => {
          const hasSubmit = (test.user_submit?.length ?? 0) > 0;
          return (
            <div
              key={test._id}
              className="border rounded-lg p-3 bg-white shadow-sm flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{test.test_name}</p>
                {test.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {test.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
                {hasSubmit && (
                  <button
                    onClick={() => setSubmitTarget(test)}
                    className="mt-1.5 text-xs text-indigo-600 hover:underline"
                  >
                    📊 {test.user_submit!.length} bài nộp
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(test, hasSubmit)}
                  title={hasSubmit ? 'Xem thông tin' : 'Sửa'}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleReset(test)}
                  title="Reset cache bài thi"
                  className="p-1.5 rounded text-green-700 hover:bg-green-50"
                >
                  <RefreshCcwDot size={14} />
                </button>
                <button
                  onClick={() => handleDeleteTestOfClass(test._id)}
                  title="Xóa khỏi lớp"
                  className="p-1.5 rounded text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
