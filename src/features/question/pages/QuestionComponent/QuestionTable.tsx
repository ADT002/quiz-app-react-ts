import React, {
  useState,
  useCallback,
  useMemo,
  FormEvent,
  ChangeEvent,
  useEffect,
} from 'react';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchQuestions,
  incrementPage,
  resetQuestions
} from '~/features/question/questionSlice';

import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import QuestionList from './QuestionList';
import QuestionModal from './QuestionModal';

import { AppDispatch, RootState } from '~/app/store';
import { Question } from '~/shared/types/question';
import { INITIAL_FORM_DATA, QuestionFormData } from '~/shared/constants/formData';
import { TestFormData } from '~/features/test/pages/ManageTestModal';
import { generateObjectId } from '~/shared/utils/generateId';

// Backfill id cho item của câu hỏi cũ trong DB (legacy không có id) — tránh round-trip
// tiếp tục lưu thiếu id khi user save lại.
function backfillIds(q: QuestionFormData): QuestionFormData {
  const ensureId = <T extends { id?: string }>(arr?: T[]) =>
    arr?.map((it) => (it.id ? it : { ...it, id: generateObjectId() }));
  return {
    ...q,
    options: ensureId(q.options),
    fill_in_the_blanks: ensureId(q.fill_in_the_blanks),
    order_items: ensureId(q.order_items),
    match_items: ensureId(q.match_items),
    match_options: ensureId(q.match_options) ?? [],
  };
}

interface QuestionTableProps {
  selectable?: boolean;
  formDataTest?: TestFormData;
  setFormDataTest?: React.Dispatch<React.SetStateAction<TestFormData>>;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  selectable = false,
  formDataTest,
  setFormDataTest,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    questionsByPage,
    hasMoreQuestions,
    statusQuestion,
  } = useSelector((state: RootState) => state.questions);
  console.log(questionsByPage)
  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchQuestions({ navigate }));
  }, [dispatch, navigate]);

  /* ================= FLATTEN QUESTIONS ================= */
  const questions: Question[] = useMemo(
    () => Object.values(questionsByPage).flat(),
    [questionsByPage],
  );

  /* ================= LOCAL STATE ================= */
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showTopicLevelFilter, setShowTopicLevelFilter] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData | null>(null);
  const [internalFormData, setInternalFormData] =
    useState<QuestionFormData>(INITIAL_FORM_DATA);

  const [questionSelected, setQuestionSelected] = useState<string[]>([]);


  const resetQuestionList = useCallback(async () => {
    dispatch(resetQuestions());
  }, [dispatch, hasMoreQuestions, statusQuestion, navigate]);


  /* ================= LOAD MORE ================= */
  const loadMore = useCallback(async () => {
    if (!hasMoreQuestions || statusQuestion === 'loading') return;

    dispatch(incrementPage());
    dispatch(fetchQuestions({ navigate }));
  }, [dispatch, hasMoreQuestions, statusQuestion, navigate]);

  /* ================= SEARCH ================= */
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  /* ================= SELECT QUESTION ================= */
  const toggleQuestionSelection = useCallback(
    (question: Question) => {
      if (!setFormDataTest) return;

      setFormDataTest(prev => {
        const ids = prev.question_ids ?? [];
        const existed = ids.includes(question._id);
        const newIds = existed
          ? ids.filter(id => id !== question._id)
          : [...ids, question._id];
        console.log(ids, newIds, question)

        const totalScore = newIds.reduce((sum, id) => {
          const q = questions.find(q => q._id === id);
          return sum + (q?.score ?? 0);
        }, 0);

        return {
          ...prev,
          question_ids: newIds,
          test_score: totalScore,
        };
      });
    },
    [setFormDataTest, questions],
  );


  /* ================= TAG FILTER ================= */
  const toggleTagSelection = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearTagFilter = () => setSelectedTags([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => q.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => {
      if (typeof q.topic === 'object' && q.topic?.topic_name) {
        set.add(q.topic.topic_name);
      }
    });
    return Array.from(set).sort();
  }, [questions]);

  const allLevels = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => {
      if (typeof q.level === 'object' && q.level?.level_name) {
        set.add(q.level.level_name);
      }
    });
    return Array.from(set).sort();
  }, [questions]);

  const toggleTopicSelection = useCallback((topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic],
    );
  }, []);

  const toggleLevelSelection = useCallback((level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level],
    );
  }, []);

  const clearTopicLevelFilter = () => {
    setSelectedTopics([]);
    setSelectedLevels([]);
  };


  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return questions.filter(q => {
      const questionText =
        q.question_content?.content?.text?.toLowerCase() ?? '';

      const tagText =
        q.tags?.join(' ').toLowerCase() ?? '';

      const topicName =
        typeof q.topic === 'object'
          ? q.topic?.topic_name?.toLowerCase() ?? ''
          : '';

      const levelName =
        typeof q.level === 'object'
          ? q.level?.level_name?.toLowerCase() ?? ''
          : '';

      const matchSearch =
        !text ||
        questionText.includes(text) ||
        tagText.includes(text) ||
        topicName.includes(text) ||
        levelName.includes(text);

      const matchTag =
        selectedTags.length === 0 ||
        q.tags?.some(t => selectedTags.includes(t));

      const matchTopic =
        selectedTopics.length === 0 ||
        selectedTopics.includes(q.topic?.topic_name ?? "");

      const matchLevel =
        selectedLevels.length === 0 ||
        selectedLevels.includes(q.level?.level_name ?? "");

      return matchSearch && matchTag && matchTopic && matchLevel;
    });
  }, [
    questions,
    searchText,
    selectedTags,
    selectedTopics,
    selectedLevels,
  ]);

  /* ================= MODAL ================= */
  const handleOpenModal = (question: QuestionFormData | null = null) => {
    setIsEditing(!!question);
    setCurrentQuestion(question);
    setInternalFormData(question ? backfillIds(question) : INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(currentQuestion)
    const action = isEditing
      ? updateQuestion({ ...internalFormData, _id: currentQuestion!._id })
      : createQuestion(internalFormData);

    await dispatch(action);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteQuestion(id));
  };

  /* ================= RENDER ================= */
  return (

    <div className="space-y-4">
      <button
        onClick={() => setShowTopicLevelFilter(prev => !prev)}
        className="px-3 py-1 rounded-md bg-gray-200"
      >
        Filter Topic / Level
      </button>

      {showTopicLevelFilter && (
        <div className="space-y-3 bg-gray-50 p-3 rounded-md">
          {/* ===== TOPIC ===== */}
          <div>
            <div className="font-semibold mb-1">Topic</div>
            <div className="flex flex-wrap gap-2">
              {allTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleTopicSelection(topic)}
                  className={`px-2 py-1 text-xs rounded-full ${selectedTopics.includes(topic)
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* ===== LEVEL ===== */}
          <div>
            <div className="font-semibold mb-1">Level</div>
            <div className="flex flex-wrap gap-2">
              {allLevels.map(level => (
                <button
                  key={level}
                  onClick={() => toggleLevelSelection(level)}
                  className={`px-2 py-1 text-xs rounded-full ${selectedLevels.includes(level)
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={clearTopicLevelFilter}
            className="text-sm text-red-500 underline"
          >
            Clear Topic / Level
          </button>
        </div>
      )}


      <SearchBar
        searchText={searchText}
        handleSearch={handleSearch}
        showTagFilter={showTagFilter}
        setShowTagFilter={setShowTagFilter}
        selectedTags={selectedTags}
      />

      {showTagFilter && (
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTagSelection={toggleTagSelection}
          clearTagFilter={clearTagFilter}
          setShowTagFilter={setShowTagFilter}
        />
      )}




      <button
        onClick={() => handleOpenModal()}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        <Plus size={18} /> Add Question
      </button>
      {hasMoreQuestions && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Load more
          </button>
        </div>
      )}
      <QuestionList
        filteredData={filteredData}
        questions={questions}
        handleOpenModalQuestion={handleOpenModal}
        handleDelete={handleDelete}
        toggleTagSelection={toggleTagSelection}
        selectedTags={selectedTags}
        selectable={selectable}
        selectedQuestionIds={formDataTest?.question_ids ?? questionSelected}
        toggleQuestionSelection={toggleQuestionSelection}
      />



      {isModalOpen && (
        <QuestionModal
          isModalOpen
          isEditing={isEditing}
          formData={internalFormData}
          setFormData={setInternalFormData}
          handleSubmit={handleSubmit}
          handleCancel={() => setIsModalOpen(false)}
          allTags={allTags}
        />
      )}
    </div>
  );
};

export default QuestionTable;
