'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import type { FillInTheBlankSubmission } from '../../QuestionComponent';
import { FillInTheBlank, Question } from '~/shared/types/question';
import Latex from 'react-latex-next';

interface Props {
  question: Question;
  onSubmissionChange: (submissionData: any) => void;
  submission?: FillInTheBlankSubmission;
  isDone: boolean;
  showSubmission: boolean;
}

const FillInTheBlankQuestion: React.FC<Props> = ({
  question,
  onSubmissionChange,
  submission,
  isDone,
  showSubmission,
}) => {
  const [submissions, setSubmissions] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialSubmissions: Record<string, string> = {};
    // Ensure submission is properly typed
    if (submission) {
      Object.entries(submission).forEach(([id, value]) => {
        initialSubmissions[id] = value || '';
      });
    }

    setSubmissions(initialSubmissions);
  }, [submission]);

  const handleInputChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Avoid unnecessary re-renders if the value is not changing
    if (submissions[id] === value) return;

    const updatedSubmissions = { ...submissions, [id]: value };
    setSubmissions(updatedSubmissions);

    // Create fill_in_the_blank array for API format
    const fillInTheBlankArray = Object.entries(updatedSubmissions).map(([key, val]) => ({
      id: key,
      correct_submission: val,
    }));

    // Notify the parent component about the change with a flat structure
    onSubmissionChange({
      submission: updatedSubmissions, // This is the simple key-value map for the component
      fill_in_the_blank: fillInTheBlankArray, // This is the array format for the API
    });
  };

  const calculateInputWidth = (text = '') => {
    const characterWidth = 10;
    return Math.max(80, text.length * characterWidth);
  };

  const getInputValue = (item: FillInTheBlank): string => {
    if (showSubmission) {
      return item.correct_submission || '';
    }

    if (isDone) {
      return submissions[`${item.id}`] || '';
    }

    return submissions[`${item.id}`] || '';
  };

  return (
    <div className="max-w-full bg-white rounded-lg shadow-lg border border-gray-300 p-4">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Câu hỏi: {question.question_content?.content.text || 'Không có nội dung'}
      </h2>
      <div className="text-gray-800 lg:text-lg sm:text-sm flex flex-wrap items-center gap-2">
        {question.fill_in_the_blanks?.map((item) => (
          <span key={item.id} className="flex items-center flex-wrap">
            {item.text_before?.is_math ? <Latex>{item.text_before?.text}</Latex> : <span className="text-gray-700">{item.text_before?.text}</span>}
            <input
              type="text"
              placeholder={item.blank}
              value={getInputValue(item)}
              maxLength={30}
              onChange={isDone ? undefined : (e) => handleInputChange(item.id as string, e)}
              disabled={isDone}
              className="mx-1 p-1 border border-blue-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{
                minWidth: '80px',
                maxWidth: '200px',
                width: `${calculateInputWidth(getInputValue(item)) + 20}px`,
              }}
            />
            {item.text_after?.is_math ? <Latex>{item.text_after?.text}</Latex> : <span className="text-gray-700">{item.text_after?.text}</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default React.memo(FillInTheBlankQuestion);
