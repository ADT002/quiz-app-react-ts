import type React from 'react';
import FillInTheBlankQuestion from './types/Fill/Fill';
import MultipleChoiceQuestion from './types/Multiple/Multiple';
import OrderQuestion from './types/Order/Order';
import SingleChoiceQuestion from './types/Single/Single';
import MatchQuestion from './types/Match/Match';
import { FillInTheBlank, MatchItem, MatchOption, OrderItem, Question, Option } from '~/shared/types/question';
import { useCallback } from 'react';

export type FillInTheBlankSubmission = { [key: string]: string }; // Câu hỏi điền vào chỗ trống, ví dụ: { "67f805c2523b149f092198e8": "ngôn ngữ" }

export type MultipleChoiceSubmission = string[]; // Câu hỏi trắc nghiệm nhiều lựa chọn, chỉ lưu id của đáp án đúng

export type SingleChoiceSubmission = string; // Câu hỏi trắc nghiệm nhiều lựa chọn, chỉ lưu id của đáp án đúng

export type OrderSubmission = string[]; // Câu hỏi sắp xếp, lưu danh sách id của các lựa chọn

export type MatchSubmission = Record<string, string[] | null>; // { optionId: matchid | null }

// Định nghĩa chung cho các kiểu câu hỏi
export type Submission =
  | {
    type: 'fill_in_the_blank';
    submission: FillInTheBlankSubmission;
    id: string;
    fill_in_the_blanks: FillInTheBlank[];
  }
  | {
    type: 'single';
    submission: SingleChoiceSubmission;
    id: string;
    options?: any;
  }
  | {
    type: 'multiple';
    submission: MultipleChoiceSubmission;
    id: string;
    options?: any[];
  }
  | {
    type: 'order_question';
    submission: OrderSubmission;
    id: string;
    order_items?: OrderItem[];
  }
  | {
    type: 'match_choice_question';
    submission: MatchSubmission;
    id: string;
    match_items: MatchItem[];
    match_options: MatchOption[];
  };



// Define shared props
interface QuestionBaseProps {
  question: Question; // You can replace `any` with a proper `Question` type/interface
  author: string;
  onSubmissionChange: (submission: Submission) => void;
  submission: Submission | null;
  isDone: boolean;
  showSubmission: boolean;
}

const QuestionComponent: React.FC<QuestionBaseProps> = ({
  question,
  author,
  onSubmissionChange,
  submission,
  isDone,
  showSubmission,
}) => {
  console.log(submission)
  const handleSubmissionChange = useCallback(
    (questionType: string, updatedSubmission: any) => {
      let typedSubmission: Submission;

      switch (questionType) {
        case 'fill_in_the_blank':
          typedSubmission = {
            type: 'fill_in_the_blank',
            submission: updatedSubmission.submission || {},
            id: question._id,
            fill_in_the_blanks: updatedSubmission.fill_in_the_blank || [],
          };
          break;

        case 'single':
          typedSubmission = {
            type: "single",
            submission: updatedSubmission.submission || "",
            id: question._id
          };
          break;

        case 'multiple':
          typedSubmission = {
            type: 'multiple',
            submission: updatedSubmission.submission || [],
            id: question._id,
          };
          break;

        case 'order_question':
          typedSubmission = {
            type: 'order_question',
            submission: updatedSubmission.submission || [],
            id: question._id,
            order_items: updatedSubmission.order_items || [],
          };
          break;

        case 'match_choice_question':
          typedSubmission = {
            type: 'match_choice_question',
            submission: updatedSubmission.submission || {},
            id: question._id,
            match_items: updatedSubmission.match_items || [],
            match_options: updatedSubmission.match_options || [],
          };
          break;

        default:
          return;
      }

      onSubmissionChange(typedSubmission);
    },
    [question._id, onSubmissionChange],
  );


  const renderQuestion = () => {
    const handleSubmissionUpdate = useCallback(
      (updatedSubmission: any) => {

        if (question.type) {
          handleSubmissionChange(question.type, updatedSubmission);
        }
      },
      [question.type, handleSubmissionChange],
    );


    // Extract the submission data based on question type
    const getTypedSubmission = (type: string) => {
      if (!submission) return null;

      // Ensure submission type matches the expected type
      if (submission.type === type) {
        return submission.submission;
      }

      return null;
    };

    switch (question.type) {
      case 'fill_in_the_blank':
        return (
          <FillInTheBlankQuestion
            question={question}
            onSubmissionChange={handleSubmissionUpdate}
            submission={getTypedSubmission('fill_in_the_blank') as FillInTheBlankSubmission}
            isDone={isDone || showSubmission}
            showSubmission={showSubmission}
          />
        );
      case 'single':
        return (
          <SingleChoiceQuestion
            question={question}
            author={author ?? ''}
            onSubmissionChange={handleSubmissionUpdate}
            submission={getTypedSubmission('single') as SingleChoiceSubmission}
            isDone={isDone || showSubmission}
            showSubmission={showSubmission}
          />
        );
      case 'multiple':
        return (
          <MultipleChoiceQuestion
            question={question}
            author={author ?? ''}
            onSubmissionChange={handleSubmissionUpdate}
            submission={getTypedSubmission('multiple') as MultipleChoiceSubmission}
            isDone={isDone || showSubmission}
            showSubmission={showSubmission}
          />
        );
      case 'order_question':
        return (
          <OrderQuestion
            // order_items={question.order_items as OrderItem[]}
            question={question}
            onSubmissionChange={handleSubmissionUpdate}
            submission={getTypedSubmission('order_question') as OrderSubmission}
            isDone={isDone || showSubmission}
            showSubmission={showSubmission}
          />
        );



      case 'match_choice_question':
        return (
          <MatchQuestion
            question={question}
            onSubmissionChange={handleSubmissionUpdate}
            submission={getTypedSubmission('match_choice_question') as MatchSubmission}
            isDone={isDone || showSubmission}
            showSubmission={showSubmission}
          />
        );

      default:
        return <div className="text-center text-red-500">Unsupported question type</div>;
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto my-4">
      <div className="bg-gray-100 p-4 rounded-lg">{renderQuestion()}</div>
    </div>
  );
};

export default QuestionComponent;
