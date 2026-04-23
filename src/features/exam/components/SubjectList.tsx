import React, { memo } from 'react';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { useCurriculumTree } from '../hooks/useContentData';
import { getIconByName } from '@/shared/utils/iconMapper';
import { Skeleton } from '@/shared/components/ui/Skeleton';

interface SubjectListProps {
  onSelect: (id: string) => void;
}

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
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
         <Skeleton className="h-[88px] w-full rounded-2xl bg-surface-elevated" />
         <Skeleton className="h-[88px] w-full rounded-2xl bg-surface-elevated" />
         <Skeleton className="h-[88px] w-full rounded-2xl bg-surface-elevated hidden md:block" />
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-color m-4 max-w-3xl mx-auto">
        <LayoutGrid size={48} className="mb-4 text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">কোনো বিষয় পাওয়া যায়নি</h3>
        <p className="text-sm mt-1 text-text-secondary">অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {subjects.map((subject: CurriculumSubject) => {
          const IconComponent = getIconByName(subject.icon_url ?? 'default');
          
          return (
            <button
              key={subject.id}
              onClick={() => onSelect(subject.id)}
              className="flex items-center gap-4 p-4 md:p-5 rounded-2xl border border-card-border bg-card-bg transition-all group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              <div className="h-14 w-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner bg-badge-bg text-badge-text">
                <IconComponent size={26} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold font-['Hind_Siliguri'] text-[17px] md:text-[19px] leading-tight text-text-primary">
                  {subject.name_bn || subject.title || 'Untitled Subject'}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-surface-elevated">
                <ChevronRight size={20} className="text-text-secondary group-hover:text-text-primary transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

SubjectList.displayName = 'SubjectList';
export default SubjectList;
