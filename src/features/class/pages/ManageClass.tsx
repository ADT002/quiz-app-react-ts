import React, { useState, useCallback, FormEvent } from 'react';
import ClassCodeComponent from './ClassCodeComponent';
import TestManagement from './TestManager/TestManager';
import { Check, CirclePlus, Trash, X, FileText } from 'lucide-react';
import { TestFormData } from '~/features/test/pages/ManageTestModal';
import { toast } from 'react-toastify';
import ManageClassList from './DataTable/ManageClassList';
import TagManagement from './component/TagManagement';
import { ClassTabs } from './component/ClassTab';
import { useTranslation } from 'react-i18next';
import { useClasses } from '~/features/class/useClasses';

export interface StudentInfo {
  user_id: string;
  email: string;
}

export interface ClassFormData {
  _id?: string;
  class_name: string;
  is_public: boolean;
  tags: string[];
  test_id: string[];
  students_accept: StudentInfo[];
  students_wait: StudentInfo[];
  test: TestFormData[];
}

const defaultFormData: ClassFormData = {
  class_name: '',
  is_public: false,
  tags: [],
  test_id: [],
  students_accept: [],
  students_wait: [],
  test: [],
};

function ManageClass() {
  const { t } = useTranslation();
  const { items: allClass, isLoading, isError, error, create, update, remove } = useClasses();

  const [newStudent, setNewStudent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ClassFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<
    'class-info' | 'tests' | 'tags' | 'students'
  >('class-info');

  const handleAddClass = useCallback(() => {
    setIsEditing(false);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  }, []);

  const handleEditClass = useCallback((classData: ClassFormData) => {
    setIsEditing(true);
    setFormData({
      ...classData,
      students_accept: classData.students_accept || [],
      students_wait: classData.students_wait || [],
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (isEditing) await update(formData);
        else await create(formData);
        toast.success(isEditing ? t('success') : t('manageClass.add_class') + ' ' + t('success'));
        setIsModalOpen(false);
      } catch {
        toast.error(t('error'));
      }
    },
    [isEditing, formData, create, update, t],
  );

  const handleDelete = useCallback(
    async (values: { id?: string }) => {
      if (!values.id) return;
      if (!window.confirm(t('confirm_.delete_class'))) return;
      try {
        await remove(values.id);
        toast.success(t('delete') + ' ' + t('success'));
      } catch {
        toast.error(t('error'));
      } finally {
        setIsModalOpen(false);
      }
    },
    [remove, t],
  );

  const updateStudentList = useCallback(
    (
      student: StudentInfo,
      fromList: 'students_wait' | 'students_accept',
      toList: 'students_wait' | 'students_accept',
    ) => {
      setFormData((prev) => {
        const from = prev[fromList];
        const to = prev[toList];

        return {
          ...prev,
          [fromList]: from.filter((s) => s.email !== student.email),
          [toList]: to.some((s) => s.email === student.email)
            ? to
            : [...to, student],
        };
      });
    },
    [],
  );


  const handleApproveStudent = useCallback(
    (student: StudentInfo) =>
      updateStudentList(student, 'students_wait', 'students_accept'),
    [updateStudentList],
  );

  const handleRemoveAcceptedStudent = useCallback(
    (student: StudentInfo) =>
      updateStudentList(student, 'students_accept', 'students_wait'),
    [updateStudentList],
  );
  const handleAddStudent = useCallback(() => {
    const email = newStudent.trim();
    if (!email) return;

    const exists = formData.students_accept.some(
      (s) => s.email === email,
    );

    if (exists) {
      toast.warning(t('error'));
      return;
    }

    const newStudentInfo: StudentInfo = {
      email,
      user_id: crypto.randomUUID(), // hoặc '' nếu backend generate
    };

    setFormData((prev) => ({
      ...prev,
      students_accept: [...prev.students_accept, newStudentInfo],
    }));

    setNewStudent('');
  }, [newStudent, formData.students_accept, t]);

  if (isLoading) return <p className="text-center">{t('loading')}</p>;
  if (isError) return <p className="text-center text-red-600">{t('error')}: {error}</p>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero header */}
      <header className="qz-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-6 md:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/80 text-sm">Quản lý lớp học</p>
              <h1 className="qz-h1 text-white">{t('leftbar.manageClass')}</h1>
              <p className="text-white/70 text-sm mt-1">
                {allClass?.length ?? 0} lớp đang hoạt động
              </p>
            </div>
            <button onClick={handleAddClass} className="qz-btn qz-btn-primary bg-white text-[var(--qz-violet-dark)] hover:bg-white/90">
              <CirclePlus size={16} /> Tạo lớp mới
            </button>
          </div>
        </div>
      </header>

      {/* Class list */}
      {allClass?.length > 0 ? (
        <div className="qz-card p-2">
          <ManageClassList data={allClass} onClick={handleEditClass} />
        </div>
      ) : (
        <div className="qz-card flex flex-col items-center py-16 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[var(--qz-violet-soft)] flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[var(--qz-violet)]" />
          </div>
          <h2 className="qz-h3 mb-2">Chưa có lớp học nào</h2>
          <p className="qz-caption mb-5 max-w-sm">
            Tạo lớp đầu tiên để bắt đầu quản lý học sinh và bài thi.
          </p>
          <button onClick={handleAddClass} className="qz-btn qz-btn-primary">
            <CirclePlus size={16} /> Tạo lớp mới
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--qz-ink)]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="qz-card w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-[var(--qz-border)]">
              <h3 className="qz-h3 text-[var(--qz-ink)]">
                {isEditing ? formData.class_name || 'Chỉnh sửa lớp' : 'Tạo lớp mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--qz-slate)] hover:text-[var(--qz-ink)] p-1.5 rounded-full hover:bg-[var(--qz-bg)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-2 border-b border-[var(--qz-border)] bg-[var(--qz-bg)]">
              <ClassTabs activeTab={activeTab} setActiveTab={setActiveTab} formData={formData} />
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'class-info' && (
                <div className="space-y-5">
                  {isEditing && (
                    <ClassCodeComponent id={formData._id ?? ''} test_id={formData.test_id ?? ''} />
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--qz-ink)] mb-1.5">
                      {t('manageClass.class_name')}
                    </label>
                    <input
                      type="text"
                      value={formData.class_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, class_name: e.target.value }))
                      }
                      maxLength={30}
                      placeholder={t('manageClass.enter_class_name')}
                      className="qz-input"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-lg border border-[var(--qz-border)] hover:bg-[var(--qz-bg)] cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
                      }
                      className="h-4 w-4 accent-[var(--qz-violet)]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--qz-ink)]">
                        {t('manageClass.public')}
                      </p>
                      <p className="qz-caption">Cho phép học sinh tự tìm và tham gia lớp</p>
                    </div>
                  </label>
                </div>
              )}

              {activeTab === 'tests' && <TestManagement formData={formData} />}

              {activeTab === 'tags' && (
                <TagManagement
                  tags={formData.tags}
                  onAddTag={(tag) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
                    }))
                  }
                  onRemoveTag={(tag) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((t) => t !== tag),
                    }))
                  }
                />
              )}

              {activeTab === 'students' && (
                <div className="space-y-6">
                  {/* Accepted */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-[var(--qz-ink)]">
                        {t('manageClass.accepted_students')}
                      </label>
                      <span className="qz-pill qz-pill-success">
                        {formData.students_accept.length} học sinh
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.students_accept.length === 0 ? (
                        <p className="qz-caption text-center py-6">Chưa có học sinh nào.</p>
                      ) : (
                        formData.students_accept.map((student) => (
                          <div
                            key={student.user_id}
                            className="flex justify-between items-center px-4 py-2.5 bg-[var(--qz-bg)] rounded-lg"
                          >
                            <span className="text-sm">{student.email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAcceptedStudent(student)}
                              className="qz-btn qz-btn-ghost text-[var(--qz-danger)]"
                            >
                              {t('manageClass.remove')}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="email"
                        value={newStudent}
                        onChange={(e) => setNewStudent(e.target.value)}
                        placeholder={t('manageClass.enter_email')}
                        className="qz-input"
                      />
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="qz-btn qz-btn-primary shrink-0"
                      >
                        {t('manageClass.add')}
                      </button>
                    </div>
                  </section>

                  {/* Waiting */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-[var(--qz-ink)]">
                        {t('manageClass.waiting_students')}
                      </label>
                      <span className="qz-pill qz-pill-warn">
                        {formData.students_wait.length} chờ duyệt
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.students_wait.length === 0 ? (
                        <p className="qz-caption text-center py-6">Không có học sinh nào đang chờ.</p>
                      ) : (
                        formData.students_wait.map((student) => (
                          <div
                            key={student.user_id}
                            className="flex justify-between items-center px-4 py-2.5 bg-[#fff7ed] rounded-lg"
                          >
                            <span className="text-sm">{student.email}</span>
                            <button
                              type="button"
                              onClick={() => handleApproveStudent(student)}
                              className="qz-btn qz-btn-ghost"
                            >
                              {t('manageClass.approve')}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-2 px-6 py-4 border-t border-[var(--qz-border)] bg-[var(--qz-bg)]">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => handleDelete({ id: formData._id })}
                  className="qz-btn qz-btn-danger"
                >
                  <Trash size={16} /> Xóa lớp
                </button>
              ) : (
                <span />
              )}
              <button type="submit" onClick={handleSubmit} className="qz-btn qz-btn-primary">
                <Check size={16} /> {isEditing ? 'Lưu' : 'Tạo lớp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClass;
