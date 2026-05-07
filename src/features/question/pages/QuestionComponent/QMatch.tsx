import ContentEditor from './ContentEditor';
import { MatchItem, MatchOption } from '~/shared/types/question';
import { generateObjectId } from '~/shared/utils/generateId';

interface MatchChoiceEditorProps {
  match_items: MatchItem[];
  match_options: MatchOption[];
  onChangeItems: (items: MatchItem[]) => void;
  onChangeOptions: (options: MatchOption[]) => void;
}

export default function MatchChoiceEditor({
  match_items,
  match_options,
  onChangeItems,
  onChangeOptions,
}: MatchChoiceEditorProps) {

  /* ================= ITEM ================= */

  const updateItemText = (index: number, text: string) => {
    const newItems = [...match_items];
    newItems[index] = {
      ...newItems[index],
      text: {
        ...newItems[index].text,
        text,
      },
    };
    onChangeItems(newItems);
  };

  const updateItemIsMath = (index: number, is_math: boolean) => {
    const newItems = [...match_items];
    newItems[index] = {
      ...newItems[index],
      text: {
        ...newItems[index].text,
        is_math,
      },
    };
    onChangeItems(newItems);
  };

  const addItem = () => {
    onChangeItems([
      ...match_items,
      {
        id: generateObjectId(),
        text: { text: '', is_math: false },
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    onChangeItems(match_items.filter((item) => item.id !== itemId));
    onChangeOptions(match_options.filter((opt) => opt.match_id !== itemId));
  };

  /* ================= OPTION ================= */

  const updateOptionText = (optionId: string, text: string) => {
    onChangeOptions(
      match_options.map((opt) =>
        opt.id === optionId
          ? { ...opt, text: { ...opt.text, text } }
          : opt,
      ),
    );
  };

  const updateOptionIsMath = (optionId: string, is_math: boolean) => {
    onChangeOptions(
      match_options.map((opt) =>
        opt.id === optionId
          ? { ...opt, text: { ...opt.text, is_math } }
          : opt,
      ),
    );
  };

  const addOptionToItem = (matchId: string) => {
    onChangeOptions([
      ...match_options,
      {
        id: generateObjectId(),
        match_id: matchId,
        text: { text: '', is_math: false },
      },
    ]);
  };

  const removeOption = (optionId: string) => {
    onChangeOptions(match_options.filter((opt) => opt.id !== optionId));
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Danh sách các đích nối (Match)
      </h3>

      {match_items.map((item, index) => {
        const optionsForItem = match_options.filter(
          (opt) => opt.match_id === item.id,
        );

        return (
          <div
            key={item.id}
            className="border rounded p-4 bg-gray-50 space-y-4"
          >
            {/* ITEM */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <ContentEditor
                  label={`Item ${index + 1}`}
                  value={item.text?.text ?? ''}
                  isMath={item.text?.is_math ?? false}
                  onChangeValue={(v) => updateItemText(index, v)}
                  onChangeIsMath={(m) => updateItemIsMath(index, m)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id!)}
                className="text-red-500 font-bold mt-2"
              >
                ✕
              </button>
            </div>

            {/* OPTIONS */}
            <div className="ml-4 space-y-3">
              {optionsForItem.map((opt, optIndex) => (
                <div key={opt.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <ContentEditor
                      label={`Lựa chọn ${optIndex + 1}`}
                      value={opt.text?.text ?? ''}
                      isMath={opt.text?.is_math ?? false}
                      onChangeValue={(v) =>
                        updateOptionText(opt.id!, v)
                      }
                      onChangeIsMath={(m) =>
                        updateOptionIsMath(opt.id!, m)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeOption(opt.id!)}
                    className="text-red-500 font-bold mt-2"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOptionToItem(item.id!)}
                className="text-blue-600 text-sm"
              >
                + Thêm lựa chọn
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="text-green-600"
      >
        + Thêm đích nối (item)
      </button>
    </div>
  );
}
