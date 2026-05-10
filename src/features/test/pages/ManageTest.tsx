import { useState, useCallback, useMemo } from 'react';
import { Plus, Filter, X, FlaskConical, Search, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';

import TagFilterComponent from './components/TagFilterComponent';
import ManageTestModal, { TestFormData } from './ManageTestModal';
import TestCardList from './TestTable';
import { useTranslation } from 'react-i18next';
import { useTestTemplates } from '~/features/test/useTests';
import { useQuestions } from '~/features/question/useQuestions';
import type { Question as CanonicalQuestion, QuestionType } from '~/features/question/types';
import { QUESTION_TYPES } from '~/features/question/types';

const initValue: TestFormData = {
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

function ManageTest() {
  const { t } = useTranslation();
  const {
    items: allTestTemplates,
    isLoading,
    isError,
    error,
    create,
    update,
    remove,
  } = useTestTemplates();
  const { items: questionsFlat } = useQuestions();

  // Map shared Question -> canonical features/question/types.Question
  const questionsByPage = useMemo(() => {
    const toCanonical = (q: any): CanonicalQuestion => {
      const typeStr: string | undefined = q?.type;
      const isValidType = (QUESTION_TYPES as Array<{ value: QuestionType }>).some(
        (t) => t.value === typeStr,
      );

      return {
        ...q,
        _id: q?._id,
        type: (isValidType ? typeStr : 'single') as QuestionType,
      };
    };

    return {
      1: (questionsFlat ?? []).map(toCanonical),
    };
  }, [questionsFlat]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState<TestFormData>(initValue);

  const availableTags = useMemo(() => {
    if (!allTestTemplates) return [];
    const tagSet = new Set<string>();
    allTestTemplates.forEach((test) => {
      if (Array.isArray(test.tags)) test.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [allTestTemplates]);

  const filteredTests = useMemo(() => {
    if (!allTestTemplates) return [];
    const text = searchText.trim().toLowerCase();
    return allTestTemplates.filter((test) => {
      const matchTag =
        activeTagFilters.length === 0 ||
        (Array.isArray(test.tags) && activeTagFilters.some((f) => test.tags.includes(f)));
      const matchSearch =
        !text ||
        test.test_name?.toLowerCase().includes(text) ||
        test.descript?.toLowerCase().includes(text);
      return matchTag && matchSearch;
    });
  }, [allTestTemplates, activeTagFilters, searchText]);

  const handleOpenModal = (testData: TestFormData | null = null) => {
    setIsEditing(!!testData);
    console.log(testData)
    if (testData) {
      setFormData({
        ...testData,
        start_time: testData.start_time || '',
        end_time: testData.end_time || '',
      });
    } else {
      setFormData({ ...initValue });
    }
    setIsModalOpen(true);
  };

  const handleCancel = useCallback(() => setIsModalOpen(false), []);

  const handleSubmit = useCallback(async () => {
    if (!formData.test_name || formData.duration_minutes <= 0) {
      toast.error(t('error'));
      return;
    }
    const values: TestFormData = {
      ...formData,
      user_submit: formData.user_submit ? formData.user_submit : [],
    };
    try {
      if (isEditing) await update(values);
      else await create(values);
      toast.success(t('success'));
      setIsModalOpen(false);
    } catch {
      toast.error(t('error'));
    }
  }, [isEditing, formData, create, update, t]);

  const handleDelete = useCallback(
    async (testId: string) => {
      if (!window.confirm(t('confirm_.delete_test'))) return;
      try {
        await remove(testId);
        toast.success(t('delete') + ' ' + t('success'));
        setIsModalOpen(false);
      } catch {
        toast.error(t('error'));
      }
    },
    [remove, t],
  );

  const handleTagFilter = useCallback((tag: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveTagFilters([]);
    setSearchText('');
  }, []);

  const toggleFilterPanel = () => setIsFilterOpen((prev) => !prev);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="qz-spinner" />
        <p className="qz-caption mt-4">{t('loading')}</p>
      </div>
    );
  }

  /* ── Error ── */
  if (isError) {
    return (
      <div className="qz-card max-w-md mx-auto p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6 text-[var(--qz-danger)]" />
        </div>
        <p className="text-[var(--qz-danger)] font-bold">
          {t('error')}: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─────────── Hero ─────────── */}
      <header className="qz-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-6 md:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-32 w-12 h-12 rounded-full bg-[#FFC38C]/40 hidden md:block" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <FlaskConical size={16} />
                Ngân hàng đề thi
              </div>
              <h1 className="qz-h1 text-white">{t('manageTest.manage_tests')}</h1>
              <p className="text-white/80 text-sm mt-1">
                {allTestTemplates?.length ?? 0} mẫu bài thi · Tạo, chỉnh sửa, gán vào lớp
              </p>
            </div>

            <button
              onClick={() => handleOpenModal(null)}
              className="qz-btn bg-white text-[var(--qz-violet-dark)] hover:bg-white/90"
            >
              <Plus size={16} /> Tạo bài thi mới
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-[var(--qz-border)] bg-white">
          <div className="p-4 text-center">
            <p className="qz-caption">Tổng số</p>
            <p className="qz-h3 text-[var(--qz-ink)]">{allTestTemplates?.length ?? 0}</p>
          </div>
          <div className="p-4 text-center">
            <p className="qz-caption">Đang lọc</p>
            <p className="qz-h3 text-[var(--qz-violet)]">{filteredTests.length}</p>
          </div>
          <div className="p-4 text-center">
            <p className="qz-caption">Tags</p>
            <p className="qz-h3 text-[var(--qz-ink)]">{availableTags.length}</p>
          </div>
        </div>
      </header>

      {/* ─────────── Sticky toolbar ─────────── */}
      <div className="qz-card p-4 sticky top-20 z-20 flex flex-col md:flex-row gap-3 md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)] w-4 h-4" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo tên bài thi hoặc mô tả..."
            className="qz-input pl-11"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--qz-bg)]"
            >
              <X className="w-4 h-4 text-[var(--qz-slate)]" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFilterPanel}
            className={`qz-btn ${isFilterOpen || activeTagFilters.length > 0
              ? 'qz-btn-primary'
              : 'qz-btn-secondary'
              }`}
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
            {activeTagFilters.length > 0 && (
              <span className="bg-white text-[var(--qz-violet-dark)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeTagFilters.length}
              </span>
            )}
          </button>

          {(activeTagFilters.length > 0 || searchText) && (
            <button onClick={clearAllFilters} className="qz-btn qz-btn-ghost text-[var(--qz-danger)]">
              <X className="h-3 w-3" /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* ─────────── Filter panel ─────────── */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <TagFilterComponent
              availableTags={availableTags}
              activeTagFilters={activeTagFilters}
              onTagClick={handleTagFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────── Test grid ─────────── */}
      {filteredTests.length === 0 ? (
        <div className="qz-card flex flex-col items-center py-16 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[var(--qz-violet-soft)] flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[var(--qz-violet)]" />
          </div>
          <h2 className="qz-h3 mb-2">
            {searchText || activeTagFilters.length > 0
              ? 'Không tìm thấy bài thi phù hợp'
              : 'Chưa có bài thi nào'}
          </h2>
          <p className="qz-caption mb-5 max-w-sm">
            {searchText || activeTagFilters.length > 0
              ? 'Thử điều chỉnh bộ lọc hoặc xóa từ khoá tìm kiếm.'
              : 'Tạo bài thi đầu tiên để xây dựng ngân hàng đề.'}
          </p>
          {searchText || activeTagFilters.length > 0 ? (
            <button onClick={clearAllFilters} className="qz-btn qz-btn-secondary">
              <X size={16} /> Xóa bộ lọc
            </button>
          ) : (
            <button onClick={() => handleOpenModal(null)} className="qz-btn qz-btn-primary">
              <Plus size={16} /> Tạo bài thi mới
            </button>
          )}
        </div>
      ) : (
        <TestCardList
          tests={filteredTests}
          onEdit={handleOpenModal}
          onFilterByTag={handleTagFilter}
        />
      )}

      {/* ─────────── Floating CTA (mobile) ─────────── */}
      <button
        onClick={() => handleOpenModal(null)}
        className="md:hidden fixed bottom-6 right-6 z-30 qz-btn qz-btn-primary shadow-[0_8px_24px_rgba(66,85,255,0.35)] py-3 px-5"
      >
        <Plus size={18} />
      </button>

      {/* ─────────── Modal ─────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 20, opacity: 0 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-2xl"
            >
              <ManageTestModal
                isEditing={isEditing}
                onClose={handleCancel}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                formData={formData}
                setFormData={setFormData}
                questions={questionsByPage}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageTest;
