'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import type { MultipleChoiceSubmission } from '../../QuestionComponent';
import { Option, Question } from '~/shared/types/question';
import Latex from 'react-latex-next';

interface Props {
  question: Question;
  author?: string;
  onSubmissionChange: (submissionData: any) => void;
  submission?: MultipleChoiceSubmission;
  isDone: boolean;
  showSubmission: boolean;
}

const MultipleChoiceQuestion: React.FC<Props> = ({
  question,
  onSubmissionChange,
  submission,
  isDone,
  showSubmission,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    () => submission ?? [],
  );

  const handleCheckboxChange = (optionId: string) => {
    if (isDone || showSubmission) return;

    const newSelectedValues = selectedValues.includes(optionId)
      ? selectedValues.filter((id) => id !== optionId)
      : [...selectedValues, optionId];

    setSelectedValues(newSelectedValues);

    // Format for API
    const options = newSelectedValues.map((id) => ({ id }));
    const submissionValue = newSelectedValues;

    onSubmissionChange({
      submission: submissionValue,
      options: options,
    });
  };

  const isChecked = (option: Option) => {
    if (showSubmission) return option.is_correct;
    return selectedValues.includes(option.id as string);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2>Câu hỏi:</h2>
      {
        question.question_content.content.is_math ? <Latex>{question.question_content.content.text}</Latex> : <h2 className="text-2xl font-semibold text-gray-800 mb-6"> {question.question_content.content.text}        </h2>
      }

      <div className="space-y-6">
        {question.options?.map((option) => {
          const checked = isChecked(option);
          const isCorrect = option.is_correct;

          const highlight = ''
          // showSubmission && isCorrect
          //   ? 'border-green-500 bg-green-50'
          //   : !showSubmission && checked
          //     ? 'border-blue-500 bg-blue-50'
          //     : 'border-gray-300 hover:border-blue-500';

          return (
            <label
              key={option.id}
              className={`flex items-center p-2 border rounded-lg transition-all duration-300 cursor-pointer ${highlight} ${isDone || showSubmission ? 'cursor-not-allowed opacity-70' : ''
                }`}
            >
              <input
                type="checkbox"
                value={option.id}
                checked={checked}
                onChange={() => handleCheckboxChange(option.id as string)}
                disabled={isDone || showSubmission}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
              />
              <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                {option.text.is_math ? <Latex>{option.text.text}</Latex> : <span className="flex-1 text-gray-800 text-lg font-medium text-center sm:text-left">
                  {option.text.text}
                </span>}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(MultipleChoiceQuestion);
