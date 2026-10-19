import React, { memo } from 'react';
import { Trash2, Bookmark } from 'lucide-react';
import { BookmarkItem } from '../types/history';
import { useLanguage } from '@/shared/i18n/LanguageProvider';

interface Props {
  item: BookmarkItem;
  onDelete: (id: string) => void;
}

const getQuestionData = (questionsData: any) => {
  if (!questionsData) return null;
  return Array.isArray(questionsData) ? questionsData[0] : questionsData;
};

export const BookmarkCard: React.FC<Props> = memo(({ item, onDelete }) => {
  const { t } = useLanguage();
  const qData = getQuestionData(item.questions);

  const renderBody = (body: any): string => {
    if (!body) return t('history.questionNotLoaded');
    if (typeof body === 'string') return body;
    return body?.bn || body?.text || body?.en || body?.content || t('history.questionNotLoaded');
  };

  return (
    <div className="bg-card-bg border border-card-border p-5 rounded-xl shadow-sm flex justify-between gap-4 transition-all hover:shadow-md">
      <div className="flex-1 overflow-hidden">
        <div 
          className="text-text-primary mb-2 prose prose-sm dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: renderBody(qData?.body) }}
        />
        {item.note && (
          <div className="bg-surface border border-border-color text-text-secondary text-sm flex items-center p-2 rounded w-fit mt-2">
            <Bookmark className="w-3 h-3 mr-2 shrink-0 text-text-secondary" aria-hidden="true" /> 
            <span className="truncate max-w-[200px] sm:max-w-xs">{item.note}</span>
          </div>
        )}
      </div>
      <button 
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label={t('history.deleteBookmarkAria')}
        title={t('history.deleteBookmarkAria')}
        className="text-accent bg-surface border border-border-color hover:bg-surface-elevated h-10 w-10 shrink-0 rounded-full transition-colors flex items-center justify-center active:scale-95"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
});

BookmarkCard.displayName = 'BookmarkCard';
