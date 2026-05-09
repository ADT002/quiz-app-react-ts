import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  CirclePlus,
  RefreshCcwDot,
  Trash2,
  Check,
  Pencil,
  BookOpen,
  Library,
} from 'lucide-react';
import ManageTestModal, { TestFormData } from '~/features/test/pages/ManageTestModal';
import { useTestTemplates, useTestsOfClass } from '~/features/test/useTests';
import { useQuestions } from '~/features/question/useQuestions';
import type { CreateTestOfClassPayload } from '~/features/test/testSlice';
import { ClassFormData } from '../ManageClass';
import UserSubmitComponent from './UserSubmitComponent';

interface Props {
  formData: ClassFormData;
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

export default function TestManagement({ formData }: Props) {
  const classExists = !!formData._id;

  const { items: allTestTemplates } = useTestTemplates();
  const {
    items: allTestOfClass,
    create: createOfClass,
    update: updateOfClass,
    remove: removeOfClass,
    reset: resetOfClass,
  } = useTestsOfClass(formData._id);
  const { items: questionsFlat } = useQuestions(false);

  const [modalTest, setModalTest] = useState<TestFormData>(initTestValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<TestFormData | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [templateTag, setTemplateTag] = useState('');
  const [isAddingToClass, setIsAddingToClass] = useState(false);

  /* Map flatten lại thành Record<page, Question[]> để truyền vào ManageTestModal */
  const questionsByPage = useMemo(
    () => ({ 1: questionsFlat }),
    [questionsFlat],
  );

  /* Derived */
  const templateTags = useMemo<string[]>(
    () => [...new Set(allTestTemplates.flatMap((t) => t.tags ?? []))].filter(Boolean),
    [allTestTemplates],
  );

  const filteredTemplates = useMemo(
    () =>
      templateTag
        ? allTestTemplates.filter((t) => t.tags?.includes(templateTag))
        : allTestTemplates,
    [allTestTemplates, templateTag],
  );

  const classTestNames = useMemo(
    () => new Set(allTestOfClass.map((t) => t.test_name)),
    [allTestOfClass],
  );

  /* Handlers */
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
        await updateOfClass(payload);
        toast.success('Đã cập nhật bài thi trong lớp.');
      } else {
        await createOfClass(payload);
        toast.success('Đã tạo bài thi cho lớp.');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Có lỗi xảy ra khi lưu bài thi.');
    }
  }, [modalTest, isEditing, formData._id, createOfClass, updateOfClass]);

  const handleDeleteTestOfClass = useCallback(
    async (_id: string) => {
      if (!window.confirm('Xóa bài thi này khỏi lớp?')) return;
      try {
        await removeOfClass(_id);
        toast.success('Đã xóa bài thi khỏi lớp.');
        setIsModalOpen(false);
      } catch {
        toast.error('Lỗi khi xóa bài thi.');
      }
    },
    [removeOfClass],
  );

  const handleReset = useCallback(
    async (test: TestFormData) => {
      try {
        await resetOfClass(test._id);
        toast.success('Đã reset bài thi.');
      } catch {
        toast.error('Lỗi khi reset bài thi.');
      }
    },
    [resetOfClass],
  );

  const toggleTemplateSelect = useCallback((id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
        selected.map((tmpl) =>
          createOfClass({ ...tmpl, _id: '', class_id: formData._id!, user_submit: [] }),
        ),
      );

      let successCount = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') successCount++;
        else toast.error(`Lỗi khi thêm "${selected[i].test_name}"`);
      });

      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} bài thi vào lớp.`);
        setSelectedTemplateIds(new Set());
      }
    } finally {
      setIsAddingToClass(false);
    }
  }, [selectedTemplateIds, allTestTemplates, formData._id, createOfClass]);

  /* Render */
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

      {/* Section 1 — Bài thi trong lớp */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-[var(--qz-violet)]" />
          <h3 className="text-sm font-semibold text-[var(--qz-ink)]">Bài thi trong lớp</h3>
          {allTestOfClass.length > 0 && (
            <span className="qz-pill qz-pill-muted">{allTestOfClass.length}</span>
          )}
        </div>

        {!classExists ? (
          <p className="text-sm text-[var(--qz-slate-light)] italic py-3 text-center">
            Lưu lớp trước để quản lý bài thi.
          </p>
        ) : allTestOfClass.length === 0 ? (
          <p className="text-sm text-[var(--qz-slate-light)] italic py-3 text-center">
            Chưa có bài thi nào trong lớp.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {allTestOfClass.map((test) => {
              const hasSubmit = (test.user_submit?.length ?? 0) > 0;
              return (
                <div
                  key={test._id}
                  className="qz-card-flat p-3 flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{test.test_name}</p>
                    {test.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {test.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)] px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasSubmit && (
                      <button
                        onClick={() => setSubmitTarget(test)}
                        className="mt-1.5 text-xs text-[var(--qz-violet)] hover:underline"
                      >
                        📊 {test.user_submit!.length} bài nộp
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(test, hasSubmit)}
                      title={hasSubmit ? 'Xem thông tin' : 'Sửa'}
                      className="p-1.5 rounded text-[var(--qz-slate)] hover:bg-[var(--qz-bg)]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleReset(test)}
                      title="Reset cache bài thi"
                      className="p-1.5 rounded text-[var(--qz-success)] hover:bg-[#dcfce7]"
                    >
                      <RefreshCcwDot size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTestOfClass(test._id)}
                      title="Xóa khỏi lớp"
                      className="p-1.5 rounded text-[var(--qz-danger)] hover:bg-[#fee2e2]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {classExists && (
          <button
            onClick={openCreateModal}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-[var(--qz-slate)] rounded-md border border-dashed border-[var(--qz-border)] hover:border-[var(--qz-violet)] hover:text-[var(--qz-violet)] transition"
          >
            <CirclePlus size={16} />
            Tạo bài thi mới cho lớp
          </button>
        )}
      </section>

      <div className="border-t border-[var(--qz-border)]" />

      {/* Section 2 — Thư viện đề thi mẫu */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Library size={18} className="text-[var(--qz-violet-dark)]" />
            <h3 className="text-sm font-semibold text-[var(--qz-ink)]">Thư viện đề thi mẫu</h3>
          </div>
          {selectedTemplateIds.size > 0 && (
            <button
              onClick={handleAddTemplatesToClass}
              disabled={isAddingToClass || !classExists}
              className="qz-btn qz-btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              <Check size={14} />
              {isAddingToClass ? 'Đang thêm...' : `Thêm ${selectedTemplateIds.size} bài`}
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
                    ? 'bg-[var(--qz-violet)] text-white'
                    : 'bg-[var(--qz-bg)] text-[var(--qz-slate)] hover:bg-[var(--qz-violet-soft)]'
                }`}
              >
                {tag || 'Tất cả'}
              </button>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <p className="text-sm text-[var(--qz-slate-light)] italic py-3 text-center">
            Chưa có đề thi mẫu nào.
          </p>
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
                    isSelected
                      ? 'border-[var(--qz-violet)] bg-[var(--qz-violet-soft)]'
                      : 'border-[var(--qz-border)] bg-white hover:border-[var(--qz-slate-light)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[var(--qz-violet)] border-[var(--qz-violet)]'
                            : 'border-[var(--qz-border)]'
                        }`}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                      <p className="text-sm font-medium truncate">{tmpl.test_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {alreadyInClass && (
                        <span className="qz-pill qz-pill-success text-xs">Đã có</span>
                      )}
                      <span className="text-xs text-[var(--qz-slate-light)]">
                        {tmpl.duration_minutes}ph
                      </span>
                    </div>
                  </div>
                  {tmpl.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
                      {tmpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-[var(--qz-bg)] text-[var(--qz-slate)] px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!classExists && selectedTemplateIds.size > 0 && (
          <p className="mt-2 text-xs text-[var(--qz-warn)] text-center">
            Lưu lớp trước để thêm bài thi vào lớp.
          </p>
        )}
      </section>
    </div>
  );
}
