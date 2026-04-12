import React, { memo } from 'react';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '../../../shared/components/ui/Skeleton';
import { Subject } from '../types/content';

interface SubjectSelectorProps {
  isLoading: boolean;
  subjects: Pick<Subject, 'id' | 'name_bn'>[];
  selectedSubject: string;
  onSelect: (val: string) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = memo(({ isLoading, subjects, selectedSubject, onSelect }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--dyn-text)' }}>
        <BookOpen size={16}/> বিষয় নির্বাচন করুন
      </label>
      {isLoading ? (
        <Skeleton className="w-full h-[50px] rounded-xl" />
      ) : (
        <select 
          className="w-full p-3 border rounded-xl outline-none transition-all focus:ring-2 focus:border-[var(--dyn-primary)] focus:ring-[var(--dyn-primary)]"
          value={selectedSubject}
          onChange={(e) => onSelect(e.target.value)}
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
            color: 'var(--dyn-text)'
          }}
        >
          <option value="" disabled>বিষয় নির্বাচন করুন...</option>
          {subjects.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.name_bn}</option>
          ))}
        </select>
      )}
    </div>
  );
});

SubjectSelector.displayName = 'SubjectSelector';
