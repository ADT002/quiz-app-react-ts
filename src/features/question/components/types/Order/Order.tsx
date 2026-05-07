'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OrderSubmission } from '../../QuestionComponent';
import { OrderItem, Question } from '~/shared/types/question';
import Latex from 'react-latex-next';

interface OrderQuestionProps {
  //order_items: OrderItem[];
  question: Question
  onSubmissionChange: (updatedSubmission: any) => void;
  submission?: OrderSubmission; // mảng string[] các id theo thứ tự người dùng sắp xếp
  isDone: boolean;
  showSubmission: boolean;
}

const SortableItem: React.FC<{
  item: OrderItem; isDragging?: boolean; isDone: boolean,
}> = ({
  item,
  isDragging: externalDragging,
  isDone
}) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: internalDragging,
    } = useSortable({ id: item.id as string, disabled: isDone });

    const isDragging = externalDragging ?? internalDragging;

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`p-5 bg-white border-2 border-gray-300 rounded-xl shadow-md cursor-grab active:cursor-grabbing select-none text-lg font-medium text-gray-800 ${isDragging ? 'bg-purple-500 text-white border-purple-600 shadow-2xl' : ''
          }`}
      >
        {item.text.is_math ? <Latex>{item.text.text}</Latex> : <span>{item.text.text}</span>}
      </li>
    );
  };

const OrderQuestion: React.FC<OrderQuestionProps> = ({
  // order_items,
  question,
  onSubmissionChange,
  submission = [],
  isDone,
  showSubmission,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Tính toán thứ tự hiển thị
  const displayItems = useMemo<OrderItem[]>(() => {
    const itemsCopy = [...question?.order_items ?? []];

    if (showSubmission) {
      // Hiển thị theo đáp án đúng (dựa vào trường order trong data)
      return itemsCopy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    if (submission && submission.length > 0) {
      // Sắp xếp theo thứ tự người dùng đã kéo (submission là mảng id)
      const orderMap = new Map(submission.map((id, index) => [id, index]));
      return itemsCopy.sort((a, b) => {
        const aIndex = orderMap.has(a.id as string) ? orderMap.get(a.id as string)! : Infinity;
        const bIndex = orderMap.has(b.id as string) ? orderMap.get(b.id as string)! : Infinity;
        return aIndex - bIndex;
      });
    }

    // Mặc định: giữ nguyên thứ tự ban đầu
    return itemsCopy;
  }, [question.order_items, submission, showSubmission]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || isDone || showSubmission) return;

    const oldIndex = displayItems.findIndex((item) => item.id === active.id);
    const newIndex = displayItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(displayItems, oldIndex, newIndex);
    const newOrder = newItems.map((item) => item.id as string);

    onSubmissionChange({
      type: 'order_question', // nếu cần
      submission: newOrder,
    });
  };

  const activeItem = activeId
    ? displayItems.find((item) => item.id === activeId)
    : null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Câu hỏi: {question.question_content?.content.text || 'Không có nội dung'}
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayItems.map((item) => item.id as string)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-6">
            {displayItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                isDragging={item.id === activeId}
                isDone={isDone}
              />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <div className="p-5 bg-purple-500 text-white rounded-xl shadow-2xl text-lg font-medium rotate-3">
              {activeItem.text.is_math ? <Latex>{activeItem.text.text}</Latex> : <span>{activeItem.text.text}</span>}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default React.memo(OrderQuestion);