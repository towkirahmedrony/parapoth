import React, { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCurriculumTree } from '../hooks/useContentData';
import { getIconByName } from '@/shared/utils/iconMapper';
import { Skeleton } from '@/shared/components/ui/Skeleton';

interface SubjectListProps {
  onSelect: (id: string) => void;
}

// Updated interface to correctly type API responses and resolve TS2345
export interface CurriculumSubject {
  id: string;
  name_bn?: string;
  title?: string;
  icon_url?: string | null;
}

const SubjectList: React.FC<SubjectListProps> = memo(({ onSelect }) => {
  const { data: subjects, isLoading } = useCurriculumTree();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
         <Skeleton className="h-[82px] w-full rounded-xl bg-gray-200/50" />
         <Skeleton className="h-[82px] w-full rounded-xl bg-gray-200/50" />
      </div>
    );
  }

  // Early return for empty states
  if (!subjects || subjects.length === 0) {
    return null;
  }

  return (
    <div className="p-4 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4">
      {subjects.map((subject: CurriculumSubject) => {
        // Safe null handling for icon mapping
        const IconComponent = getIconByName(subject.icon_url ?? 'default');
        
        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className="flex items-center gap-4 p-4 rounded-xl border active:scale-[0.99] transition-all group text-left shadow-sm hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--dyn-card)', 
              borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)' 
            }}
          >
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
                color: 'var(--dyn-primary)' 
              }}
            >
              <IconComponent size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium font-['Hind_Siliguri'] text-lg" style={{ color: 'var(--dyn-text)' }}>
                {subject.name_bn || subject.title || 'Untitled Subject'}
              </h3>
            </div>
            <ChevronRight 
              className="transition-colors" 
              size={20} 
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} 
            />
          </button>
        );
      })}
    </div>
  );
});

SubjectList.displayName = 'SubjectList';
export default SubjectList;
