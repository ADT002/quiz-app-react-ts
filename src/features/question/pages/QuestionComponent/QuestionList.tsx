import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

import { Question } from '~/shared/types/question';
import { QuestionFormData } from '~/shared/constants/formData';
import { TYPE_STYLES } from '~/shared/constants/questionTypes';
import Latex from 'react-latex-next';
import QuestionTooltip from './QuestionTooltip';

interface QuestionListProps {
  filteredData: Question[];
  questions: Question[];
  handleOpenModalQuestion: (question: QuestionFormData) => void;
  toggleTagSelection: (tag: string) => void;
  selectedTags: string[];
  handleDelete: (id: string) => void;
  selectedQuestionIds: string[];
  toggleQuestionSelection: (question: Question) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  filteredData,
  questions,
  handleOpenModalQuestion,
  toggleTagSelection,
  selectedTags,
  handleDelete,
  selectedQuestionIds,
  toggleQuestionSelection,
}) => {
  const data = useMemo(() => filteredData, [filteredData]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  /* ================= SELECT HELPERS ================= */
  const isSelected = (question: Question) => selectedQuestionIds.includes(question._id);

  const toggleAllVisibleCheckboxes = (questions: Question[]) => {
    const allSelected = questions.every(question => selectedQuestionIds.includes(question._id));

    questions.forEach(question => {
      if (allSelected) {
        toggleQuestionSelection(question);
      } else if (!selectedQuestionIds.includes(question._id)) {
        toggleQuestionSelection(question);
      }
    });
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnDef<Question>[] = useMemo(
    () => [
      {
        id: 'select',
        enableSorting: false,
        header: ({ table }) => {
          const questions = table.getRowModel().rows.map(r => r.original);

          return (
            <input
              type="checkbox"
              checked={questions.length > 0 && questions.every(isSelected)}
              onChange={e => {
                e.stopPropagation();
                toggleAllVisibleCheckboxes(questions);
              }}
              onClick={e => e.stopPropagation()}
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={isSelected(row.original)}
            onChange={e => {
              e.stopPropagation();
              toggleQuestionSelection(row.original);
            }}
            onClick={e => e.stopPropagation()}
          />
        ),
      },

      {
        accessorKey: 'question_content.content.text',
        header: () => `Total ${filteredData.length}/${questions.length} Questions`,
        cell: ({ row }) => {
          const content = row.original.question_content?.content;
          if (!content?.text) return null;

          // if (content.is_math) {
          //   const latexText = content.text.includes('$')
          //     ? content.text
          //     : `$${content.text}$`;

          //   return (
          //     <div className="prose max-w-none text-lg">
          //       <Latex>{latexText}</Latex>
          //     </div>
          //   );
          // }

          // return <span>{content.text}</span>;
          return (
            <QuestionTooltip
              text={content.text}
              isMath={content.is_math}
            />
          );
        },

      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => {
          const type = row.original.type || '';
          const { bgColor, label } = TYPE_STYLES[type] || {
            bgColor: 'bg-gray-400',
            label: type,
          };

          return (
            <span className={`${bgColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {label}
            </span>
          );
        },
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.tags || []).map(tag => (
              <button
                key={tag}
                onClick={e => {
                  e.stopPropagation();
                  toggleTagSelection(tag);
                }}
                className={`px-2 py-0.5 text-xs rounded-full ${selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        ),
      },
    ],
    [filteredData.length, questions.length, selectedTags, selectedQuestionIds],
  );

  /* ================= TABLE ================= */
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ================= DELETE BULK ================= */
  const handleDeleteSelected = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedQuestionIds.length} selected question(s)?`,
      )
    ) {
      selectedQuestionIds.forEach(id => handleDelete(id));
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="overflow-x-auto">
      {(
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            Selected: {selectedQuestionIds.length}
          </div>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedQuestionIds.length === 0}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th
                  key={header.id}
                  className="border border-gray-300 p-2 text-left text-sm font-semibold cursor-pointer"
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' 🔼'}
                  {header.column.getIsSorted() === 'desc' && ' 🔽'}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`cursor-pointer hover:bg-gray-50 ${isSelected(row.original) ? 'bg-blue-50' : ''
                  }`}
                onClick={e => {
                  const target = e.target as HTMLElement;
                  if (target.closest('input[type="checkbox"]')) return;

                  const q = row.original;
                  const normalized: QuestionFormData = {
                    ...q,
                    metadata: q.metadata ?? {},
                    options: q.options ?? [],
                    match_items: q.match_items ?? [],
                    match_options: q.match_options ?? [],
                    order_items: q.order_items ?? [],
                    fill_in_the_blanks: q.fill_in_the_blanks ?? [],
                    question_content: q.question_content ?? {},
                    suggestion: q.suggestion ?? [''],
                    tags: q.tags ?? [],
                    type: q.type ?? '',
                    score: q.score ?? 0,
                    correct_map: q.correct_map ?? [],
                    level: q.level ?? null,
                    topic: q.topic ?? null,
                  };

                  handleOpenModalQuestion(normalized);
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border border-gray-300 p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="text-sm text-gray-600">
          Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
