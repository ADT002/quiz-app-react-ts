import React from 'react';
import { X } from 'lucide-react';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
  clearTagFilter: () => void;
  setShowTagFilter: (condition: boolean) => void;
}

const TagFilter = ({
  allTags,
  selectedTags,
  toggleTagSelection,
  clearTagFilter,
  setShowTagFilter,
}: TagFilterProps) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Filter by Tags</h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setShowTagFilter(false)}
          aria-label="Close tag filter"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTagSelection(tag)}
            className={`px-2 py-1 text-xs rounded-full transition ${
              selectedTags.includes(tag)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button onClick={clearTagFilter} className="text-xs text-blue-600 hover:text-blue-800">
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default TagFilter;
