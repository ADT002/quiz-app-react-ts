import React, { useMemo, useState } from 'react';
import { ClassFormData } from '../ManageClass';
import ClassList from './ClassList';

interface Props {
  data: ClassFormData[];
  onClick: (classData: ClassFormData) => void;
}

const ManageClassList: React.FC<Props> = ({ data, onClick }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    data.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedTag) return data;
    return data.filter(classItem => classItem.tags.includes(selectedTag));
  }, [data, selectedTag]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center px-4">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 rounded-full border ${!selectedTag ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
        >
          Tất cả
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full border ${
              selectedTag === tag ? 'bg-purple-500 text-white' : 'bg-gray-100'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      <ClassList data={filteredData} onClick={onClick} />
    </div>
  );
};

export default ManageClassList;
