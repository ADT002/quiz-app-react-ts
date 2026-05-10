import { Users, Hourglass, ClipboardList, Eye, EyeOff } from 'lucide-react';
import { ClassFormData } from '../ManageClass';

export type ClassData = {
  id: string;
  class_name: string;
  tags: string[];
  is_public: boolean;
  students_accept?: string[];
  students_wait?: string[];
  test_id?: string[];
};

interface ClassCardProps {
  classData: ClassFormData;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-72 max-w-full h-auto m-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:border-purple-500 cursor-pointer transition duration-300 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            {classData.class_name}
          </h2>
        </div>
        <div className="text-gray-500">
          {classData.is_public ? (
            <Eye className="w-5 h-5" xlinkTitle="Công khai" />
          ) : (
            <EyeOff className="w-5 h-5" xlinkTitle="Riêng tư" />
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto scrollbar-thin">
        {classData.tags ?? [].map((tag, idx) => (
          <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 mt-2 text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {classData.students_accept?.length || 0} học sinh
          </span>
          <span className="flex items-center gap-1">
            <Hourglass className="w-4 h-4" />
            {classData.students_wait?.length || 0} chờ duyệt
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ClipboardList className="w-4 h-4" />
          {classData.test_id?.length || 0} bài kiểm tra
        </div>
      </div>
    </div>
  );
};

interface ClassListProps {
  data: ClassFormData[];
  onClick: (classData: ClassFormData) => void;
}

const ClassList: React.FC<ClassListProps> = ({ data, onClick }) => {
  if (data.length === 0) {
    return <p className="text-center text-gray-500 mt-10">Không có lớp học nào.</p>;
  }

  return (
    <div className="flex flex-wrap justify-start">
      {data.map((classData) => (
        <ClassCard key={classData._id} classData={classData} onClick={() => onClick(classData)} />
      ))}
    </div>
  );
};

export default ClassList;
