import React from 'react';
import { Library } from 'lucide-react';
import QuestionTable from './QuestionComponent/QuestionTable';

const ManageQuestion: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─────────── Hero ─────────── */}
      <header className="qz-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--qz-violet)] to-[var(--qz-violet-dark)] p-6 md:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-32 w-12 h-12 rounded-full bg-[#EEAAFF]/40 hidden md:block" />

          <div className="relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Library size={16} />
              Ngân hàng câu hỏi
            </div>
            <h1 className="qz-h1 text-white">Quản lý câu hỏi</h1>
            <p className="text-white/80 text-sm mt-1">
              5 loại câu hỏi: trắc nghiệm 1 đáp án, nhiều đáp án, điền chỗ trống, sắp xếp, nối cột
            </p>
          </div>
        </div>
      </header>

      {/* ─────────── Body ─────────── */}
      <QuestionTable />
    </div>
  );
};

export default ManageQuestion;
