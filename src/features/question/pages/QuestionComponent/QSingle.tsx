import { MinusCircle, Plus, Upload, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import ContentEditor from './ContentEditor';
import { Option } from '~/shared/types/question';
import FileViewer from '~/shared/components/common/FileViewer';
import AllFileComponent from '~/shared/components/common/FilesComponent';
import { generateObjectId } from '~/shared/utils/generateId';

export interface QuestionSingleFormProps {
  options: Option[];
  fileUrl: string;
  onChange: (fileName: string) => void;
  updateOption: (options: Option[]) => void;
}

export default function QuestionSingleForm({
  options,
  fileUrl,
  onChange,
  updateOption,
}: QuestionSingleFormProps) {
  const [isModalImageOpen, setIsModalImageOpen] = useState(false);
  const [isOptionImageOpen, setIsOptionImageOpen] = useState<number | null>(null);

  /* ================= QUESTION IMAGE ================= */

  const handleSelectFile = useCallback(
    (fileName: string) => {
      onChange(fileName);
      setIsModalImageOpen(false);
    },
    [onChange],
  );

  /* ================= OPTION HANDLERS ================= */

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      text: { ...newOptions[index].text, text },
    };
    updateOption(newOptions);
  };

  const updateOptionIsMath = (index: number, is_math: boolean) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      text: { ...newOptions[index].text, is_math },
    };
    updateOption(newOptions);
  };

  const updateOptionImage = (index: number, imageurl: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], imageurl };
    updateOption(newOptions);
  };

  const selectCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index, // ✅ SINGLE
    }));
    updateOption(newOptions);
  };

  const removeOption = (index: number) => {
    updateOption(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    updateOption([
      ...options,
      {
        id: generateObjectId(),
        text: { text: '', is_math: false },
        imageurl: '',
        is_correct: false,
      },
    ]);
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* ===== Question Image ===== */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Question Image
        </label>

        <div className="flex items-center gap-2">
          <input
            value={fileUrl}
            disabled
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <button type="button" onClick={() => onChange('')}>
            <X className="h-5 w-5 text-red-500" />
          </button>
        </div>
        <FileViewer fileId={fileUrl} />
        <button
          type="button"
          onClick={() => setIsModalImageOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md"
        >
          <Upload className="h-5 w-5" />
          Upload File
        </button>

        {<AllFileComponent
          isOpen={isModalImageOpen}
          onClose={() => {
            setIsModalImageOpen(false);
          }}
          onSelect={(f) => handleSelectFile(f.file_id)}
        />}

      </div>

      {/* ===== OPTIONS ===== */}
      <div className="space-y-4 mt-6">
        {options.map((option, index) => (
          <div key={index} className="border rounded-md p-4 space-y-4">
            <ContentEditor
              label={`Option ${index + 1}`}
              value={option.text?.text ?? ''}
              isMath={option.text?.is_math ?? false}
              onChangeValue={(v) => updateOptionText(index, v)}
              onChangeIsMath={(m) => updateOptionIsMath(index, m)}
            />

            {/* Image */}
            {/* <div className="flex items-center gap-2">
              <input
                value={option.imageurl ?? ''}
                disabled
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <button type="button" onClick={() => updateOptionImage(index, '')}>
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOptionImageOpen(index)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md"
            >
              <Upload className="h-5 w-5" />
              Upload Option Image
            </button> */}

            {/* Correct (RADIO) */}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="single-correct"
                checked={option.is_correct ?? false}
                onChange={() => selectCorrect(index)}
              />
              <span className="text-sm">Correct submission</span>
            </div>

            <button
              type="button"
              onClick={() => removeOption(index)}
              className="flex items-center gap-2 text-red-500"
            >
              <MinusCircle className="h-5 w-5" />
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 border border-dashed border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full"
        >
          <Plus className="h-5 w-5" />
          Add Option
        </button>
      </div>
    </>
  );
}
