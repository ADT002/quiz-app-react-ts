import React from 'react';

type TagFilterComponentProps = {
  availableTags: string[];
  activeTagFilters: string[];
  onTagClick: (tag: string) => void;
};

function TagFilterComponent({
  availableTags,
  activeTagFilters,
  onTagClick,
}: TagFilterComponentProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2">Filter by Tags</h3>

      {availableTags.length === 0 ? (
        <p className="text-gray-500">No tags available</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTagFilters.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } transition-colors`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagFilterComponent;
