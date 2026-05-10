'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Option, Question } from '~/shared/types/question';
import Latex from 'react-latex-next';
import FileViewer from '~/shared/components/common/FileViewer';
import { SingleChoiceSubmission } from '../../QuestionComponent';

interface Props {
  question: Question;
  author: string;
  onSubmissionChange: (submissionData: any) => void;
  submission?: SingleChoiceSubmission;
  isDone: boolean;
  showSubmission: boolean;
}

const SingleChoiceQuestion: React.FC<Props> = ({
  question,
  onSubmissionChange,
  submission,
  isDone,
  showSubmission,
}) => {

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  useEffect(() => {
    if (submission) {
      setSelectedChoice(submission);
    } else {
      setSelectedChoice(null);
    }
  }, [submission]);

  const handleOptionChange = (optionId: string) => {
    if (isDone) return;
    setSelectedChoice(optionId);

    const options = [{ id: optionId }];

    onSubmissionChange({
      submission: optionId,
      options: options,
    });
  };

  const getOptionClass = (option: Option) => {
    if (showSubmission) {
      return option.is_correct
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300 hover:border-blue-500';
    }

    return selectedChoice === option.id
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-300 hover:border-blue-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">

      <h2>Câu hỏi:</h2>
      {
        question.question_content.content.is_math ? <Latex>{question.question_content.content.text}</Latex> : <h2 className="text-2xl font-semibold text-gray-800 mb-6"> {question.question_content.content.text}        </h2>
      }

      {question.question_content.file_url && (
        <div className="flex justify-center mb-6">
          <FileViewer fileId={question.question_content.file_url} />
        </div>
      )}

      <div className="space-y-6">
        {question.options?.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-2 border rounded-lg transition-all duration-300 cursor-pointer ${getOptionClass(
              option,
            )} ${isDone ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <input
              type="radio"
              value={option.id}
              checked={showSubmission ? !!option.is_correct : selectedChoice === option.id}
              onChange={() => handleOptionChange(option.id)}
              disabled={isDone}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500 mr-4"
            />
            <div className="flex flex-col sm:flex-row items-center w-full gap-4">
              {option.text.is_math ? <Latex>{option.text.text}</Latex> : <span className="flex-1 text-gray-800 text-lg font-medium text-center sm:text-left">
                {option.text.text}
              </span>}
            </div>
          </label>
        ))}
      </div>
    </div >
  );
};

export default React.memo(SingleChoiceQuestion);
