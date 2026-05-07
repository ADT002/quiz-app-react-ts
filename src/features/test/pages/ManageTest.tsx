import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTestTemplates, createTest, saveTest, deleteTest } from '~/features/test/testSlice';
import { fetchQuestions, incrementPage } from '~/features/question/questionSlice';
import { RootState, AppDispatch } from '~/app/store'; // cần import types store

import { Plus, Filter, X } from 'lucide-react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import TagFilterComponent from './components/TagFilterComponent';
import ManageTestModal, { TestFormData } from './ManageTestModal';
import TestCardList from './TestTable';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from "framer-motion";

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
  user_submit: []
};

function ManageTest() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate: NavigateFunction = useNavigate();
  const { t } = useTranslation();

  const { questionsByPage, hasMoreQuestions, statusQuestion, errorQuestion } = useSelector(
    (state: RootState) => state.questions,
  );
  const { allTestTemplates, status, error } = useSelector((state: RootState) => state.tests);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<TestFormData>(initValue);


  const availableTags = useMemo(() => {
    if (!allTestTemplates) return [];
    const tagSet = new Set<string>();
    allTestTemplates.forEach((test) => {
      if (Array.isArray(test.tags)) {
        test.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [allTestTemplates]);

  const filteredTests = useMemo(() => {
    if (!allTestTemplates) return [];
    if (activeTagFilters.length === 0) return allTestTemplates;

    return allTestTemplates.filter((test) => {
      if (!Array.isArray(test.tags)) return false;
      return activeTagFilters.some((filterTag) => test.tags.includes(filterTag));
    });
  }, [allTestTemplates, activeTagFilters]);

  const fetchData = useCallback(async () => {
    try {
      await dispatch(fetchTestTemplates({ navigate }));
      await dispatch(fetchQuestions({ navigate }));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(t('error'));
    }
  }, [dispatch, navigate, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleOpenModal = (testData: TestFormData | null = null) => {
    setIsEditing(!!testData);
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

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    console
    if (!formData.test_name || formData.duration_minutes <= 0) {
      alert(t('error'));
      return;
    }
    const values: TestFormData = {
      ...formData,
      user_submit: formData.user_submit ? formData.user_submit : []
    };
    try {
      if (isEditing) {
        await dispatch(saveTest({ values, navigate }));
        alert(t('success'));
      } else {
        await dispatch(createTest({ values, navigate }));
        alert(t('success'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving test:', error);
      alert(t('error'));
    }
  }, [dispatch, isEditing, formData, navigate, t]);

  const handleDelete = useCallback(
    (testId: string) => {
      if (window.confirm(t('confirm_.delete_test'))) {
        dispatch(deleteTest({ _id: testId, navigate }))
          .then(() => alert(t('delete') + ' ' + t('success')))
          .catch(() => alert(t('error')));
        setIsModalOpen(false);
      }
    },
    [dispatch, navigate, t],
  );

  const handleTagFilter = useCallback((tag: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveTagFilters([]);
  }, []);


  const toggleFilterPanel = () => {
    setIsFilterOpen((prev) => !prev);
  };
  { console.log('questionsByPage: ', questionsByPage) }
  { console.log('allTestTemplates: ', allTestTemplates) }

  if (status === 'loading') return <div className="text-center p-4">{t('loading')}</div>;
  if (status === 'failed')
    return <div className="text-center p-4 text-red-500">{t('error')}: {error}</div>;
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-500 pb-2">
        {t('manageTest.manage_tests')}
      </h2>

      {/* Filter section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <button
              onClick={toggleFilterPanel}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition"
            >
              <Filter className="h-4 w-4" />
              {isFilterOpen ? t('manageTest.hide_filters') : t('manageTest.show_filters')}
            </button>

            {activeTagFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-2 flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" /> {t('manageTest.clear_all_filters')}
              </button>
            )}
          </div>
        </div>

        {isFilterOpen && (
          <TagFilterComponent
            availableTags={availableTags}
            activeTagFilters={activeTagFilters}
            onTagClick={handleTagFilter}
          />
        )}
      </div>
      <div className="w-full flex justify-between mb-6">
        <button
          onClick={() => handleOpenModal(null)}
          className="w-full flex justify-center items-center gap-2 text-black px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <TestCardList tests={filteredTests} onEdit={handleOpenModal} onFilterByTag={handleTagFilter} />
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <ManageTestModal
              isEditing={isEditing}
              onClose={handleCancel}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              formData={formData}
              setFormData={setFormData}
              questions={questionsByPage}
              selectable={false}
            />
          </motion.div>
        </motion.div>)}

    </div>
  );
}

export default ManageTest;
