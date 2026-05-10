import React, {
  useState,
  useCallback,
  useMemo,
  FormEvent,
  ChangeEvent,
} from 'react';
import { Plus, Layers, ChevronDown, X, Sparkles, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import QuestionList from './QuestionList';
import QuestionModal from './QuestionModal';

import { Question } from '~/shared/types/question';
import { INITIAL_FORM_DATA, QuestionFormData } from '~/shared/constants/formData';
import { TestFormData } from '~/features/test/pages/ManageTestModal';
import { generateObjectId } from '~/shared/utils/generateId';
import { useQuestions } from '~/features/question/useQuestions';

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
  formDataTest?: TestFormData;
  setFormDataTest?: React.Dispatch<React.SetStateAction<TestFormData>>;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  formDataTest,
  setFormDataTest,
}) => {
  const {
    items: questions,
    hasMore: hasMoreQuestions,
    isLoading: isQuestionLoading,
    loadMore,
    create,
    update,
    remove,
  } = useQuestions();

  /* ── Local state ── */
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

  const [questionSelected] = useState<string[]>([]);

  /* ── Search ── */
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value);

  /* ── Toggle question ── */
  const toggleQuestionSelection = useCallback(
    (question: Question) => {
      if (!setFormDataTest) return;
      setFormDataTest((prev) => {
        const ids = prev.question_ids ?? [];
        const existed = ids.includes(question._id);
        const newIds = existed ? ids.filter((id) => id !== question._id) : [...ids, question._id];
        const totalScore = newIds.reduce((sum, id) => {
          const q = questions.find((q) => q._id === id);
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

  /* ── Filter setters ── */
  const toggleTagSelection = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearTagFilter = () => setSelectedTags([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const topic: any = (q as any).topic;
      if (topic && typeof topic === 'object' && typeof topic.topic_name === 'string') {
        set.add(topic.topic_name);
      }
    });
    return Array.from(set).sort();
  }, [questions]);

  const allLevels = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const level: any = (q as any).level;
      if (level && typeof level === 'object' && typeof level.level_name === 'string') {
        set.add(level.level_name);
      }
    });
    return Array.from(set).sort();
  }, [questions]);

  const toggleTopicSelection = useCallback((topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }, []);

  const toggleLevelSelection = useCallback((level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }, []);

  const clearTopicLevelFilter = () => {
    setSelectedTopics([]);
    setSelectedLevels([]);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setSelectedTags([]);
    setSelectedTopics([]);
    setSelectedLevels([]);
  };

  /* ── Filter logic ── */
  const filteredData = useMemo(() => {
    const text = searchText.toLowerCase().trim();
    return questions.filter((q) => {
      const questionText = q.question_content?.content?.text?.toLowerCase() ?? '';
      const tagText = q.tags?.join(' ').toLowerCase() ?? '';
      const topicObj: any = (q as any).topic;
      const levelObj: any = (q as any).level;

      const topicName =
        topicObj && typeof topicObj === 'object' && typeof topicObj.topic_name === 'string'
          ? topicObj.topic_name.toLowerCase()
          : '';

      const levelName =
        levelObj && typeof levelObj === 'object' && typeof levelObj.level_name === 'string'
          ? levelObj.level_name.toLowerCase()
          : '';

      const matchSearch =
        !text ||
        questionText.includes(text) ||
        tagText.includes(text) ||
        topicName.includes(text) ||
        levelName.includes(text);

      const matchTag =
        selectedTags.length === 0 || q.tags?.some((t) => selectedTags.includes(t));
      const matchTopic =
        selectedTopics.length === 0 ||
        selectedTopics.includes((typeof (q as any).topic === 'object' && (q as any).topic?.topic_name)
          ? (q as any).topic.topic_name
          : '');

      const matchLevel =
        selectedLevels.length === 0 ||
        selectedLevels.includes((typeof (q as any).level === 'object' && (q as any).level?.level_name)
          ? (q as any).level.level_name
          : '');

      return matchSearch && matchTag && matchTopic && matchLevel;
    });
  }, [questions, searchText, selectedTags, selectedTopics, selectedLevels]);

  /* ── Modal ── */
  const handleOpenModal = (question: QuestionFormData | null = null) => {
    setIsEditing(!!question);
    setCurrentQuestion(question);
    setInternalFormData(question ? backfillIds(question) : INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = isEditing
      ? { ...internalFormData, _id: currentQuestion!._id }
      : internalFormData;
    if (isEditing) await update(payload as any);
    else await create(payload as any);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const totalActiveFilters =
    (searchText ? 1 : 0) + selectedTags.length + selectedTopics.length + selectedLevels.length;

  /* ── Render ── */
  return (
    <div className="space-y-4">
      {/* ─── Sticky toolbar ─── */}
      <div className="qz-card p-4 sticky z-20 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Search + tag toggle (component) */}
          <div className="flex-1">
            <SearchBar
              searchText={searchText}
              handleSearch={handleSearch}
              showTagFilter={showTagFilter}
              setShowTagFilter={setShowTagFilter}
              selectedTags={selectedTags}
            />
          </div>

          {/* Topic/Level toggle */}
          <button
            onClick={() => setShowTopicLevelFilter((p) => !p)}
            className={`qz-btn ${showTopicLevelFilter || selectedTopics.length || selectedLevels.length
              ? 'qz-btn-primary'
              : 'qz-btn-secondary'
              }`}
          >
            <Layers className="w-4 h-4" />
            Chủ đề / Cấp độ
            {(selectedTopics.length + selectedLevels.length) > 0 && (
              <span className="bg-white text-[var(--qz-violet-dark)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {selectedTopics.length + selectedLevels.length}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 transition ${showTopicLevelFilter ? 'rotate-180' : ''}`}
            />
          </button>

          {(
            <button
              onClick={() => handleOpenModal()}
              className="qz-btn qz-btn-primary shrink-0"
            >
              <Plus size={16} /> Tạo câu hỏi
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {totalActiveFilters > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--qz-border)]">
            <span className="qz-caption">Đang lọc:</span>
            {searchText && (
              <span className="qz-pill qz-pill-open">
                "{searchText}"
                <button onClick={() => setSearchText('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map((t) => (
              <span key={t} className="qz-pill qz-pill-open">
                #{t}
                <button onClick={() => toggleTagSelection(t)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedTopics.map((t) => (
              <span key={t} className="qz-pill qz-pill-success">
                {t}
                <button onClick={() => toggleTopicSelection(t)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedLevels.map((l) => (
              <span key={l} className="qz-pill qz-pill-warn">
                {l}
                <button onClick={() => toggleLevelSelection(l)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-[var(--qz-danger)] hover:underline ml-auto"
            >
              Xoá tất cả
            </button>
          </div>
        )}
      </div>

      {/* ─── Tag filter expandable ─── */}
      <AnimatePresence>
        {showTagFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <TagFilter
              allTags={allTags}
              selectedTags={selectedTags}
              toggleTagSelection={toggleTagSelection}
              clearTagFilter={clearTagFilter}
              setShowTagFilter={setShowTagFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Topic/Level filter expandable ─── */}
      <AnimatePresence>
        {showTopicLevelFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="qz-card p-5 space-y-4">
              {/* Topics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--qz-ink)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--qz-success)]" />
                    Chủ đề
                  </h4>
                  {selectedTopics.length > 0 && (
                    <span className="qz-pill qz-pill-success">
                      {selectedTopics.length} đang chọn
                    </span>
                  )}
                </div>
                {allTopics.length === 0 ? (
                  <p className="qz-caption">Chưa có chủ đề nào.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map((topic) => {
                      const isActive = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          onClick={() => toggleTopicSelection(topic)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${isActive
                            ? 'bg-[var(--qz-success)] text-white shadow-[var(--qz-shadow-focus)]'
                            : 'bg-[#dcfce7] text-[#15803d] hover:bg-[var(--qz-success)] hover:text-white'
                            }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Levels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--qz-ink)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--qz-warn)]" />
                    Cấp độ
                  </h4>
                  {selectedLevels.length > 0 && (
                    <span className="qz-pill qz-pill-warn">
                      {selectedLevels.length} đang chọn
                    </span>
                  )}
                </div>
                {allLevels.length === 0 ? (
                  <p className="qz-caption">Chưa có cấp độ nào.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allLevels.map((level) => {
                      const isActive = selectedLevels.includes(level);
                      return (
                        <button
                          key={level}
                          onClick={() => toggleLevelSelection(level)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${isActive
                            ? 'bg-[var(--qz-warn)] text-white shadow-[var(--qz-shadow-focus)]'
                            : 'bg-[#fff7ed] text-[#c2410c] hover:bg-[var(--qz-warn)] hover:text-white'
                            }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(selectedTopics.length > 0 || selectedLevels.length > 0) && (
                <button
                  onClick={clearTopicLevelFilter}
                  className="qz-btn qz-btn-ghost text-[var(--qz-danger)]"
                >
                  <X size={14} /> Xoá Chủ đề / Cấp độ
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Stats summary ─── */}
      <div className="flex items-center justify-between text-sm">
        <p className="qz-caption">
          Hiển thị <strong className="text-[var(--qz-ink)]">{filteredData.length}</strong> /{' '}
          {questions.length} câu hỏi
        </p>
        {formDataTest && (
          <p className="qz-pill qz-pill-open">
            Đã chọn: {formDataTest.question_ids?.length ?? 0} câu · {formDataTest.test_score} điểm
          </p>
        )}
      </div>

      {/* ─── Question list ─── */}
      {filteredData.length === 0 ? (
        <div className="qz-card flex flex-col items-center py-16 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[var(--qz-violet-soft)] flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[var(--qz-violet)]" />
          </div>
          <h3 className="qz-h3 mb-2">
            {totalActiveFilters > 0
              ? 'Không tìm thấy câu hỏi phù hợp'
              : 'Chưa có câu hỏi nào'}
          </h3>
          <p className="qz-caption mb-5 max-w-sm">
            {totalActiveFilters > 0
              ? 'Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm.'
              : 'Tạo câu hỏi đầu tiên để xây dựng ngân hàng đề.'}
          </p>
          {
            totalActiveFilters > 0 ?
              <><button onClick={clearAllFilters} className="qz-btn qz-btn-secondary">
                <X size={16} /> Xoá bộ lọc
              </button><button onClick={() => handleOpenModal()} className="qz-btn qz-btn-primary">
                  <Plus size={16} /> Tạo câu hỏi
                </button></>
              : ""
          }
        </div>
      ) : (
        <QuestionList
          filteredData={filteredData}
          questions={questions}
          handleOpenModalQuestion={handleOpenModal}
          handleDelete={handleDelete}
          toggleTagSelection={toggleTagSelection}
          selectedTags={selectedTags}
          selectedQuestionIds={formDataTest?.question_ids ?? questionSelected}
          toggleQuestionSelection={toggleQuestionSelection}
        />
      )}

      {/* ─── Load more ─── */}
      {hasMoreQuestions && filteredData.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isQuestionLoading}
            className="qz-btn qz-btn-secondary"
          >
            {isQuestionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>Tải thêm câu hỏi</>
            )}
          </button>
        </div>
      )}

      {/* ─── Modal ─── */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

export default QuestionTable;
