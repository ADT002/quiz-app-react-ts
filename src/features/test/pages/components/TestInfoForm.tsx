import React, { FC, ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TestFormData } from '../ManageTestModal';

interface TestInfoFormProps {
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
}

const TestInfoForm: FC<TestInfoFormProps> = ({ formData, setFormData }) => {
  const handleChange =
    <K extends keyof TestFormData>(key: K) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =
          e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.value;

        setFormData(prev => ({
          ...prev,
          [key]: value,
        }));
      };

  return (
    <>
      {/* Test name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Test Name
        </label>
        <input
          type="text"
          value={formData.test_name ?? ''}
          onChange={handleChange('test_name')}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          maxLength={51}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <TextareaAutosize
          minRows={3}
          maxRows={10}
          value={formData.descript ?? ''}
          onChange={handleChange('descript')}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Is test toggle */}
      <div className="flex flex-col">
        <label className="inline-flex items-center cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={!!formData.is_test}
            className="sr-only peer"
            onChange={handleChange('is_test')}
          />

          <div
            className="
              relative w-14 h-7 bg-gray-200
              peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
              rounded-full peer
              peer-checked:after:translate-x-full
              after:content-[''] after:absolute after:top-0.5 after:left-[4px]
              after:bg-white after:border after:border-gray-300 after:rounded-full
              after:h-6 after:w-6 after:transition-all
              peer-checked:bg-blue-600
            "
          />

          <span className="ms-3 text-sm font-medium text-gray-900">
            IS TEST?
          </span>
        </label>
      </div>

    </>
  );
};

export default TestInfoForm;
