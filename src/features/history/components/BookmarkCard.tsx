import React, { memo } from 'react';
import { Trash2, Bookmark } from 'lucide-react';
import { BookmarkItem } from '../types/history';

interface Props {
  item: BookmarkItem;
  onDelete: (id: string) => void;
}

const getQuestionData = (questionsData: any) => {
  if (!questionsData) return null;
  return Array.isArray(questionsData) ? questionsData[0] : questionsData;
};

export const BookmarkCard: React.FC<Props> = memo(({ item, onDelete }) => {
  const qData = getQuestionData(item.questions);

  const renderBody = (body: any): string => {
    if (!body) return "প্রশ্ন লোড হয়নি";
    if (typeof body === 'string') return body;
    return body?.bn || body?.text || body?.en || body?.content || "প্রশ্ন লোড হয়নি";
  };

  return (
    <div 
      className="p-5 rounded-xl shadow-sm flex justify-between gap-4 transition-all"
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex-1 overflow-hidden">
        <div 
          className="mb-2 prose prose-sm dark:prose-invert max-w-none" 
          style={{ color: 'var(--dyn-text)' }}
          dangerouslySetInnerHTML={{ __html: renderBody(qData?.body) }}
        />
        {item.note && (
          <div 
            className="text-sm flex items-center p-2 rounded w-fit mt-2"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
              color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)',
              border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
            }}
          >
            <Bookmark className="w-3 h-3 mr-2 shrink-0" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }} /> 
            <span className="truncate max-w-[200px] sm:max-w-xs">{item.note}</span>
          </div>
        )}
      </div>
      <button 
        onClick={() => onDelete(item.id)}
        aria-label="Delete bookmark"
        className="h-10 w-10 shrink-0 rounded-full transition-colors flex items-center justify-center hover:bg-opacity-80 active:scale-95"
        style={{ 
          color: 'var(--dyn-accent)',
          backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)'
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});

BookmarkCard.displayName = 'BookmarkCard';
