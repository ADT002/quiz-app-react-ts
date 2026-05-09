import React, { ChangeEvent } from 'react';
import { Filter, Search, X } from 'lucide-react';

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
  const isFilterActive = showTagFilter || selectedTags.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)] w-4 h-4" />
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi, tag, chủ đề..."
          value={searchText}
          onChange={handleSearch}
          className="qz-input pl-11"
        />
        {searchText && (
          <button
            onClick={() =>
              handleSearch({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--qz-bg)]"
            aria-label="Xoá tìm kiếm"
          >
            <X className="w-4 h-4 text-[var(--qz-slate)]" />
          </button>
        )}
      </div>

      {/* Tag filter toggle */}
      <button
        onClick={() => setShowTagFilter(!showTagFilter)}
        className={`qz-btn ${isFilterActive ? 'qz-btn-primary' : 'qz-btn-secondary'}`}
        aria-expanded={showTagFilter}
        aria-label="Lọc theo tag"
      >
        <Filter className="w-4 h-4" />
        Tags
        {selectedTags.length > 0 && (
          <span className="bg-white text-[var(--qz-violet-dark)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {selectedTags.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default SearchBar;
