import { MinusCircle, Plus } from 'lucide-react';
import { FillInTheBlank } from '~/shared/types/question';
import ContentEditor, { RenderText } from './ContentEditor';
import { generateObjectId } from '~/shared/utils/generateId';

interface FillInTheBlankEditorProps {
  fill_in_the_blanks: FillInTheBlank[];
  onChange: (fill_in_the_blanks: FillInTheBlank[]) => void;
}

export default function FillInTheBlankEditor({
  fill_in_the_blanks,
  onChange,
}: FillInTheBlankEditorProps) {

  const updateItem = (
    index: number,
    updater: (item: FillInTheBlank) => FillInTheBlank
  ) => {
    const newItems = [...fill_in_the_blanks];
    newItems[index] = updater(newItems[index]);
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    onChange(fill_in_the_blanks.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([
      ...fill_in_the_blanks,
      {
        id: generateObjectId(),
        text_before: { text: '', is_math: false },
        blank: '_____',
        text_after: { text: '', is_math: false },
        correct_submission: '',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {fill_in_the_blanks.map((item, index) => (
        <div
          key={item.id ?? index}
          className="border rounded-md p-4 space-y-4 bg-white"
        >
          {/* TEXT BEFORE */}

          <ContentEditor
            label="Text trước chỗ trống"
            value={item.text_before?.text ?? ''}
            isMath={item.text_before?.is_math ?? false}
            onChangeValue={(text) =>
              updateItem(index, (it) => ({
                ...it,
                text_before: { ...it.text_before, text, is_math: it.text_before?.is_math ?? false },
              }))
            }
            onChangeIsMath={(is_math) =>
              updateItem(index, (it) => ({
                ...it,
                text_before: { ...it.text_before, is_math, text: it.text_before?.text ?? "" },
              }))
            }
          />

          {/* BLANK */}
          <input
            value={item.blank ?? ''}
            onChange={(e) =>
              updateItem(index, (it) => ({ ...it, blank: e.target.value }))
            }
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Ký hiệu chỗ trống (vd: _____)"
            required
          />

          {/* TEXT AFTER */}
          <ContentEditor
            label="Text sau chỗ trống"
            value={item.text_after?.text ?? ''}
            isMath={item.text_after?.is_math ?? false}
            onChangeValue={(text) =>
              updateItem(index, (it) => ({
                ...it,
                text_after: { ...it.text_after, text, is_math: it.text_after?.is_math ?? false },
              }))
            }
            onChangeIsMath={(is_math) =>
              updateItem(index, (it) => ({
                ...it,
                text_after: { ...it.text_after, is_math, text: it.text_after?.text ?? "" },
              }))
            }
          />

          {/* CORRECT SUBMISSION */}
          <input
            value={item.correct_submission ?? ''}
            onChange={(e) =>
              updateItem(index, (it) => ({
                ...it,
                correct_submission: e.target.value,
              }))
            }
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Đáp án đúng"
            required
          />

          {/* PREVIEW */}
          <div className="text-sm text-gray-600 italic">
            Preview:
            <div className="mt-1 flex items-center flex-wrap gap-1">
              <RenderText text={item.text_before} />

              <span className="underline mx-1 text-gray-800 font-medium">
                {item.blank}
              </span>

              <RenderText text={item.text_after} />
            </div>
          </div>

          {/* REMOVE */}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <MinusCircle className="h-5 w-5" /> Remove
          </button>
        </div>
      ))}

      {/* ADD */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 border border-dashed border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full hover:bg-blue-50"
      >
        <Plus className="h-5 w-5" /> Add Blank
      </button>
    </div>
  );
}
