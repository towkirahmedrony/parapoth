import React, { memo } from 'react';
import { Layers } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Chapter } from '../types/content';

interface ChapterSelectorProps {
  isLoading: boolean;
  chapters: Pick<Chapter, 'id' | 'name_bn'>[];
  selectedChapter: string;
  selectedSubject: string;
  onSelect: (val: string) => void;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = memo(({ isLoading, chapters, selectedChapter, selectedSubject, onSelect }) => {
  return (
    <div className="mb-6 w-full group">
      <label className="text-sm md:text-base font-semibold mb-2.5 flex items-center gap-2 text-text-primary">
        <Layers size={18} className="opacity-70 group-focus-within:opacity-100 transition-opacity" /> অধ্যায় (ঐচ্ছিক)
      </label>
      {isLoading ? (
        <Skeleton className="w-full h-[54px] rounded-xl opacity-50" />
      ) : (
        <div className="relative">
          <select 
            className="w-full p-4 text-[15px] md:text-base border rounded-xl appearance-none bg-input-bg border-input-border text-text-primary outline-none transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md focus:border-border-color focus:ring-1 focus:ring-focus-ring"
            value={selectedChapter}
            onChange={(e) => onSelect(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="all" className="bg-surface text-text-primary">📚 সম্পূর্ণ বই (ডিফল্ট)</option>
            {chapters.map(chap => (
              <option key={chap.id} value={chap.id} className="bg-surface text-text-primary">
                {chap.name_bn}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
            <svg className="h-5 w-5 opacity-50 group-focus-within:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});

ChapterSelector.displayName = 'ChapterSelector';
