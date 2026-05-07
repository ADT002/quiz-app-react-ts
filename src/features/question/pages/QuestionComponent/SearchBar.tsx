import React, { ChangeEvent } from 'react';
import { Filter } from 'lucide-react';

interface SearchBarProps {
  searchText: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  showTagFilter: boolean;
  setShowTagFilter: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  handleSearch,
  showTagFilter,
  setShowTagFilter,
  selectedTags,
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={handleSearch}
        className="w-full sm:w-52 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={() => setShowTagFilter(!showTagFilter)}
        className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${
          showTagFilter || selectedTags.length > 0
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-expanded={showTagFilter}
        aria-label="Filter by tags"
      >
        <Filter className="h-4 w-4" />
        {selectedTags.length > 0 && (
          <span className="bg-white text-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {selectedTags.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default SearchBar;
