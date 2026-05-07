import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TagsInput = ({ formData, setFormData }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(() => {
    const newTag = inputValue.trim();
    if (!newTag || formData.tags?.includes(newTag)) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag],
    }));
    setInputValue('');
  }, [inputValue, formData.tags, setFormData]);

  const handleKeyDown = useCallback(
    (e) => {
      const isTriggerKey = e.key === '#' || e.key === 'Enter';
      const hasInput = inputValue.trim().length > 0;

      if (isTriggerKey && hasInput) {
        e.preventDefault();
        addTag();
      }
    },
    [inputValue, addTag],
  );

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleDragEnd = ({ source, destination }) => {
    if (!destination) return;

    const reorderedTags = Array.from(formData.tags);
    const [movedTag] = reorderedTags.splice(source.index, 1);
    reorderedTags.splice(destination.index, 0, movedTag);

    setFormData((prev) => ({
      ...prev,
      tags: reorderedTags,
    }));
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        placeholder="# hoặc Enter để thêm"
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tags" direction="horizontal">
          {(provided) => (
            <div
              className="flex flex-wrap gap-2 mb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {formData.tags?.map((tag: string, index: number) => (
                <Draggable key={tag} draggableId={tag} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TagsInput;
