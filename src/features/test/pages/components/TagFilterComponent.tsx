import React from 'react';
import { Tags, Sparkles } from 'lucide-react';

type TagFilterComponentProps = {
  availableTags: string[];
  activeTagFilters: string[];
  onTagClick: (tag: string) => void;
};

const TagFilterComponent: React.FC<TagFilterComponentProps> = ({
  availableTags,
  activeTagFilters,
  onTagClick,
}) => {
  return (
    <div className="qz-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Tags className="w-4 h-4 text-[var(--qz-violet)]" />
        <h3 className="text-sm font-semibold text-[var(--qz-ink)]">Lọc theo Tags</h3>
        {activeTagFilters.length > 0 && (
          <span className="qz-pill qz-pill-open ml-auto">
            {activeTagFilters.length} đang chọn
          </span>
        )}
      </div>

      {availableTags.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-[var(--qz-slate-light)] text-sm">
          <Sparkles className="w-4 h-4" />
          Chưa có tag nào.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isActive = activeTagFilters.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[var(--qz-violet)] text-white shadow-[var(--qz-shadow-focus)]'
                    : 'bg-[var(--qz-violet-soft)] text-[var(--qz-violet-dark)] hover:bg-[var(--qz-violet)] hover:text-white'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TagFilterComponent;
