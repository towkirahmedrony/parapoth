import React, { memo } from 'react';
import { Layers } from 'lucide-react';
import { Skeleton } from '../../../shared/components/ui/Skeleton';
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
    <div className="mb-6">
      <label 
        className="block text-sm font-semibold mb-2 flex items-center gap-2"
        style={{ color: 'var(--dyn-text)' }}
      >
        <Layers size={16} style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}/> অধ্যায় (ঐচ্ছিক)
      </label>
      {isLoading ? (
        <Skeleton className="w-full h-[50px] rounded-xl" />
      ) : (
        <select 
          className="w-full p-3 border rounded-xl outline-none transition-all disabled:opacity-50 focus:ring-2 focus:border-[var(--dyn-primary)] focus:ring-[var(--dyn-primary)]"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 50%, var(--dyn-card) 50%)',
            borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
            color: 'var(--dyn-text)'
          }}
          value={selectedChapter}
          onChange={(e) => onSelect(e.target.value)}
          disabled={!selectedSubject}
        >
          <option value="all">📚 সম্পূর্ণ বই (ডিফল্ট)</option>
          {chapters.map(chap => (
            <option key={chap.id} value={chap.id}>{chap.name_bn}</option>
          ))}
        </select>
      )}
    </div>
  );
});

ChapterSelector.displayName = 'ChapterSelector';
