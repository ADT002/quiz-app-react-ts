'use client';

import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MatchSubmission } from '../../QuestionComponent';
import { MatchItem, MatchOption, Question } from '~/shared/types/question';
import Latex from 'react-latex-next';

interface MatchQuestionProps {
  question: Question
  // match_items: MatchItem[];
  // match_options: MatchOption[];
  onSubmissionChange: (updatedSubmission: any) => void;
  submission: MatchSubmission; // { [itemId]: string[] }
  isDone: boolean;
  showSubmission: boolean;
}

const SortableMatch: React.FC<{
  id: string;
  content: any;
  isCorrect?: boolean;
  showSubmission: boolean;
  isDone: boolean;
}> = ({ id, content, isCorrect, showSubmission, isDone }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isDone,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const bgColor = showSubmission
    ? isCorrect
      ? 'bg-green-200'
      : 'bg-red-200'
    : 'bg-purple-200';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`p-2 ${bgColor} m-1 rounded-md shadow text-center font-medium cursor-pointer select-none`}
    >
      {content}
    </div>
  );
};

const DroppableBox: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap min-h-[60px] border p-2 rounded-md ${isOver ? 'bg-green-50' : 'bg-gray-100'
        } transition-all`}
    >
      {children}
      <div className="min-h-[32px] w-full" />
    </div>
  );
};

const MatchQuestion: React.FC<MatchQuestionProps> = ({
  question,
  // match_items,
  // match_options,
  onSubmissionChange,
  submission,
  isDone,
  showSubmission,




}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor)
  );
  const currentMatches = useMemo<Record<string, string[]>>(() => {
    const matches: Record<string, string[]> = {};

    if (!submission) return matches;

    if (question && question.match_items) {

    }

    question && question.match_items && question?.match_items.forEach((item) => {
      matches[item.id as string] = submission[item.id as string] ?? [];
    });
    return matches;
  }, [submission, question.match_items]);

  // All matched option IDs
  const matchedOptionIds = useMemo(() => {
    return Object.values(currentMatches).flat();
  }, [currentMatches]);

  // Unmatched options (kho đáp án)
  const unmatchedOptions = useMemo(() => {
    return question?.match_options?.filter(
      (opt) => !matchedOptionIds.includes(opt.id as string)
    );
  }, [question.match_options, matchedOptionIds]);

  // Khi showSubmission → hiển thị theo đáp án đúng
  const displayMatches = useMemo<Record<string, string[]>>(() => {
    if (!showSubmission) return currentMatches;

    const correct: Record<string, string[]> = {};

    question.match_items?.forEach((item) => {
      const itemId = item.id as string;
      correct[itemId] =
        question.match_options
          ?.filter(opt => opt.match_id === itemId)
          .map(opt => opt.id as string) ?? [];
    });

    return correct;
  }, [showSubmission, currentMatches, question.match_items, question.match_options]);

  const displayUnmatched = useMemo<MatchOption[]>(() => {
    if (showSubmission) {
      // khi show đáp án → chỉ hiển thị option KHÔNG có match_id
      return question.match_options?.filter(opt => !opt.match_id) ?? [];
    }

    return unmatchedOptions ?? [];
  }, [showSubmission, unmatchedOptions, question.match_options]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const isBank = overId === 'match-bank';
    const isItem = question?.match_items?.some((item) => item.id === overId);

    if (!isBank && !isItem) return;

    // Nếu đang show đáp án hoặc đã nộp → không cho thay đổi
    if (isDone || showSubmission) return;

    // Tạo bản sao mới của submission hiện tại
    const newMatches: Record<string, string[]> = {};

    // Copy tất cả các cặp hiện tại
    question?.match_items?.forEach((item) => {
      const itemId = item.id as string;
      const current = currentMatches[itemId] ?? [];
      newMatches[itemId] = current.filter((id) => id !== activeId);
    });

    // Nếu thả vào một item → thêm vào đó
    if (isItem) {
      newMatches[overId] = [...(newMatches[overId] ?? []), activeId];
    }

    // Gửi lên parent (chỉ gửi phần submission mapping)
    onSubmissionChange({
      type: 'match_choice_question',
      submission: newMatches,
    });
  };

  const getOptionText = (id: string) => {
    const match_option = question?.match_options?.find((opt) => opt.id === id);
    return match_option?.text.is_math ? <Latex>{match_option?.text.text}</Latex> : match_option?.text.text;
  };

  const isCorrectMatch = (itemId: string, optionId: string) => {
    const correctItemId = question?.match_options?.find((opt) => opt.id === optionId)?.match_id;
    return correctItemId === itemId;
  };

  const activeOptionText = activeId ? getOptionText(activeId) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Câu hỏi: {question.question_content?.content.text || 'Không có nội dung'}
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {question?.match_items?.map((item) => (
            <div
              key={item.id}
              className="p-5 border rounded-lg bg-white shadow-md space-y-3"
            >
              <div className="font-semibold text-gray-800 text-lg">

                {item.text.is_math ? <Latex>{item.text.text}</Latex> : item.text.text}
              </div>

              <SortableContext
                items={displayMatches[item.id as string] ?? []}
                strategy={rectSortingStrategy}
              >
                <DroppableBox id={item.id as string}>
                  {(displayMatches[item.id as string] ?? []).map((optId) => (
                    <SortableMatch
                      key={optId}
                      id={optId}
                      content={getOptionText(optId)}
                      isCorrect={isCorrectMatch(item.id as string, optId)}
                      showSubmission={showSubmission}
                      isDone={isDone}
                    />
                  ))}
                </DroppableBox>
              </SortableContext>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-lg mb-3 text-gray-700">Kho đáp án</h3>

          <SortableContext
            items={displayUnmatched?.map((opt) => opt.id as string)}
            strategy={rectSortingStrategy}
          >
            <DroppableBox id="match-bank">
              {displayUnmatched?.map((opt) => (
                <SortableMatch
                  key={opt.id}
                  id={opt.id as string}
                  content={opt.text.text as string}
                  showSubmission={false}
                  isDone={isDone}
                />
              ))}
            </DroppableBox>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId && activeOptionText ? (
            <div className="p-3 bg-purple-300 rounded-lg shadow-lg text-center font-medium">
              {activeOptionText}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default React.memo(MatchQuestion);