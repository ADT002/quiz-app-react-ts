import React, { useCallback } from 'react';
import { QUESTION_TYPES, TYPE_SPECIFIC_FIELDS } from '~/shared/constants/questionTypes';
import FillInTheBlankEditor from './QFill';
import MatchChoiceEditor from './QMatch';
import OrderQuestionEditor from './QOrder';
import MultipleChoiceQuestionUploader from './QMultiple';
import TagsInput from './TagInput';
import { QuestionFormData } from './types';
import QuestionMultiUploader from './QMultiple';
import { FillInTheBlank, MatchItem, MatchOption, Option } from '~/shared/types/question';
import QuestionSingleForm, { QuestionSingleFormProps } from './QSingle';
import TopicManagement, { Topic } from '~/shared/components/common/TopicComponent';
import LevelManagement, { Level } from '~/shared/components/common/LevelComponent';
import CollapsibleSection from '~/shared/components/ui/CollapsibleSection';
import { useMediaQuery } from 'react-responsive';
import QuestionContentEditor from './ContentEditor';
import ContentEditor from './ContentEditor';
import { CheckCircle, Edit3, FileText, Settings, Tag } from 'lucide-react';

type QuestionType = keyof typeof QUESTION_TYPES;
type QuestionTab = 'content' | 'config' | 'submission' | 'tags';

const QUESTION_TABS: Record<
  QuestionTab,
  {
    label: string;
    icon: React.ReactNode;
    disabled?: (formData: QuestionFormData) => boolean;
    done?: (formData: QuestionFormData) => boolean;
  }
> = {
  content: {
    label: 'Nội dung',
    icon: <FileText size={16} />,
    done: (f) => !!f.question_content?.content?.text,
  },
  config: {
    label: 'Cấu hình',
    icon: <Settings size={16} />,
    done: (f) => !!f.type && f.score > 0,
  },
  submission: {
    label: 'Đáp án',
    icon: <Edit3 size={16} />,
    disabled: (f) => !f.type,
  },
  tags: {
    label: 'Thẻ',
    icon: <Tag size={16} />,
  },
};


interface QuestionModalProps {
  isEditing: boolean;
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
  isModalOpen: boolean;
  allTags: string[];
}

const QUESTION_TYPE_OPTIONS = {
  single_type: {
    type: QUESTION_TYPES.SINGLE,
    text: 'Single Choice',
  },
  multiple_type: {
    type: QUESTION_TYPES.MULTIPLE,
    text: 'Multiple Choice',
  },
  order_type: {
    type: QUESTION_TYPES.ORDER,
    text: 'Order',
  },
  fill_type: {
    type: QUESTION_TYPES.FILL,
    text: 'Fill in the blank',
  },
  match_type: {
    type: QUESTION_TYPES.MATCH,
    text: 'Match',
  },
};

const QuestionModal: React.FC<QuestionModalProps> = ({
  isEditing,
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
}) => {

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const [activeTab, setActiveTab] = React.useState<QuestionTab>('content');

  const handleTypeChange = useCallback(
    (type: QuestionType) => {
      setFormData((prev) => {
        // single ↔ multiple dùng chung `options` — giữ lại id của option khi đổi qua lại.
        const sharesOptions =
          (prev.type === QUESTION_TYPES.SINGLE || prev.type === QUESTION_TYPES.MULTIPLE) &&
          (type === QUESTION_TYPES.SINGLE || type === QUESTION_TYPES.MULTIPLE);

        const next: QuestionFormData = {
          ...prev,
          type,
          options:
            type === QUESTION_TYPES.SINGLE || type === QUESTION_TYPES.MULTIPLE
              ? sharesOptions
                ? prev.options ?? []
                : []
              : [],
          fill_in_the_blanks: type === QUESTION_TYPES.FILL ? prev.fill_in_the_blanks ?? [] : [],
          order_items: type === QUESTION_TYPES.ORDER ? prev.order_items ?? [] : [],
          match_items: type === QUESTION_TYPES.MATCH ? prev.match_items ?? [] : [],
          match_options: type === QUESTION_TYPES.MATCH ? prev.match_options ?? [] : [],
        };

        if (type === QUESTION_TYPES.ORDER) {
          next.order_items = next.order_items?.map((item) => ({
            ...item,
            order: item.order || 0,
          }));
        }
        return next;
      });
    },
    [setFormData],
  );

  const handleSelectLevel = useCallback((level: Level) => {
    setFormData(prev => ({
      ...prev,
      level: level._id,
    }));
  }, [setFormData]);

  const handleDeselectLevel = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      level: null,
    }));
  }, [setFormData]);

  const handleSelectTopic = useCallback((topic: Topic) => {
    setFormData(prev => ({
      ...prev,
      topic: topic._id,
    }));
  }, [setFormData]);

  const handleDeselectTopic = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      topic: null,
    }));
  }, [setFormData]);


  const updateQuestionFileUrl = useCallback(
    (file_url: string) => {
      setFormData((prev) => ({
        ...prev,
        question_content: { ...prev.question_content, file_url },
      }));
    },
    [setFormData],
  );

  const updateFillItems = (items: FillInTheBlank[]) => {
    setFormData((prev) => ({ ...prev, fill_in_the_blanks: items }));
  };

  const updateScore = (score: string) => setFormData((prev) => ({ ...prev, score: Number(score) }));

  const renderEditorByType = useCallback(() => {
    switch (formData.type) {
      case QUESTION_TYPES.SINGLE:
        return (
          <QuestionSingleForm
            options={formData.options ?? []}
            updateOption={updateOptions}
            fileUrl={formData.question_content.file_url ?? ''}
            onChange={updateQuestionFileUrl}
          />
        );
      case QUESTION_TYPES.MULTIPLE:
        return (
          <QuestionMultiUploader
            options={formData.options ?? []}
            updateOption={updateOptions}
            fileUrl={formData.question_content.file_url ?? ''}
            onChange={updateQuestionFileUrl}
          />
        );
      case QUESTION_TYPES.FILL:
        return (
          <FillInTheBlankEditor
            fill_in_the_blanks={formData.fill_in_the_blanks ?? []}
            onChange={updateFillItems}
          />
        );
      case QUESTION_TYPES.ORDER:
        return (
          <OrderQuestionEditor options={formData.order_items ?? []} onChange={updateOderItems} />
        );
      case QUESTION_TYPES.MATCH:
        return (
          <MatchChoiceEditor
            match_items={formData.match_items ?? []}
            match_options={formData.match_options}
            onChangeOptions={updateMatchOptions}
            onChangeItems={updateMatchItems}
          />
        );

      default:
        return null;
    }
  }, [
    formData.type,
    formData.question_content?.file_url,
    formData.fill_in_the_blanks,
    formData.options,
    setFormData,
    updateQuestionFileUrl,
    updateFillItems,
  ]);

  const updateOptions = (options: Option[]) =>
    setFormData((prev) => ({ ...prev, options: options }));


  const updateMatchOptions = (options: MatchOption[]) =>
    setFormData((prev) => ({ ...prev, match_options: options }));

  const updateMatchItems = (items: MatchItem[]) =>
    setFormData((prev) => ({ ...prev, match_items: items }));

  const updateOderItems = (items: any[]) =>
    setFormData((prev) => ({ ...prev, order_items: items }));

  const modalWidth = isMobile ? 'w-full' : isTablet ? 'max-w-4xl' : 'max-w-3xl';




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${modalWidth} max-h-[90vh] flex flex-col`}
      >
        {/* ===== HEADER ===== */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-green-700">
            {isEditing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
          </h3>

          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* ===== TABS ===== */}
        <div className="px-6 pt-4 border-b">
          <div className="flex gap-2">
            {(Object.keys(QUESTION_TABS) as QuestionTab[]).map((tab) => {
              const config = QUESTION_TABS[tab];
              const isDisabled = config.disabled?.(formData);
              const isDone = config.done?.(formData);

              return (
                <button
                  key={tab}
                  disabled={isDisabled}
                  onClick={() => setActiveTab(tab)}
                  className={`
                  relative flex items-center gap-2 px-4 py-2
                  text-sm font-medium rounded-t-md transition
                  ${activeTab === tab
                      ? 'bg-white border border-b-0 text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                `}
                >
                  {config.icon}
                  {!isMobile && <span>{config.label}</span>}

                  {isDone && (
                    <CheckCircle
                      size={14}
                      className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* TAB: CONTENT */}
          {activeTab === 'content' && (
            <ContentEditor
              label="Nội dung câu hỏi"
              value={formData.question_content.content.text}
              isMath={formData.question_content.content.is_math}
              onChangeValue={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  question_content: {
                    ...prev.question_content,
                    content: {
                      ...prev.question_content.content,
                      text,
                    },
                  },
                }))
              }
              onChangeIsMath={(is_math) =>
                setFormData((prev) => ({
                  ...prev,
                  question_content: {
                    ...prev.question_content,
                    content: {
                      ...prev.question_content.content,
                      is_math,
                    },
                  },
                }))
              }
            />
          )}

          {/* TAB: CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-4">

              <TopicManagement
                topic={formData.topic ?? null}
                onSelect={handleSelectTopic}
                onDeselect={handleDeselectTopic}
              />

              <LevelManagement
                level={formData.level ?? null}
                onSelect={handleSelectLevel}
                onDeselect={handleDeselectLevel}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Loại câu hỏi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      handleTypeChange(e.target.value as QuestionType);
                      setActiveTab('submission');
                    }}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Chọn loại</option>
                    {Object.values(QUESTION_TYPE_OPTIONS).map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Điểm</label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => updateScore(e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBMISSION */}
          {activeTab === 'submission' && (
            <>
              {!formData.type ? (
                <p className="text-gray-500 italic">
                  Vui lòng chọn loại câu hỏi trước
                </p>
              ) : (
                renderEditorByType()
              )}
            </>
          )}

          {/* TAB: TAGS */}
          {activeTab === 'tags' && (
            <TagsInput formData={formData} setFormData={setFormData} />
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 border-t flex justify-end gap-3"
        >
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </form>
      </div>
    </div >
  );

};

export default QuestionModal;
