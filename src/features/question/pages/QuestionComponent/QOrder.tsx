import { ChevronUp, ChevronDown, MinusCircle, Plus } from "lucide-react";
import type { OrderItem } from "~/shared/types/question";
import { generateObjectId } from "~/shared/utils/generateId";

interface OrderQuestionEditorProps {
  options: OrderItem[];
  onChange: (options: OrderItem[]) => void;
}

export default function OrderQuestionEditor({
  options,
  onChange,
}: OrderQuestionEditorProps) {

  const moveOption = (index: number, direction: "up" | "down") => {
    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOptions.length) {
      [newOptions[index], newOptions[targetIndex]] = [
        newOptions[targetIndex],
        newOptions[index],
      ];
      onChange(newOptions);
    }
  };

  const updateOptionText = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      text: {
        ...newOptions[index].text,
        text: value,
      },
    };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        id: generateObjectId(),
        order: options.length + 1,
        text: {
          text: "",
          is_math: false,
        },
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={option.id || index} className="border rounded-md p-4 space-y-2">
          <textarea
            value={option.text.text}
            onChange={(e) => updateOptionText(index, e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2 h-20 resize-y"
            placeholder="Option text"
            required
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => moveOption(index, "up")}
              disabled={index === 0}
              className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronUp className="h-5 w-5" /> Up
            </button>

            <button
              type="button"
              onClick={() => moveOption(index, "down")}
              disabled={index === options.length - 1}
              className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronDown className="h-5 w-5" /> Down
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeOption(index)}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <MinusCircle className="h-5 w-5" /> Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-2 border border-dashed border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full hover:bg-blue-50"
      >
        <Plus className="h-5 w-5" /> Add Option
      </button>
    </div>
  );
}
