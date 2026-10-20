import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from '../types/history';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { LOCALE_BY_LANGUAGE, localizeDigits } from '@/shared/i18n/messages';

interface Props {
  item: HistoryItem;
}

export const HistoryCard: React.FC<Props> = memo(({ item }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const dateStr = item.submitted_at || item.created_at || item.taken_at || '';
  const parsedDate = dateStr ? new Date(dateStr) : null;
  const hasValidDate = !!parsedDate && !Number.isNaN(parsedDate.getTime());

  const title =
    item.exam_title?.trim() || item.details_json?.exam_title?.trim() || t('history.cardFallbackTitle');
  const subjectName =
    (language === 'bn' ? item.subject_name_bn : item.subject_name_en)?.trim() ||
    (language === 'bn' ? item.subject_name_en : item.subject_name_bn)?.trim();

  const hasTotal = Number(item.total_marks) > 0;
  const percentage = hasTotal
    ? Math.round((Number(item.score) / Number(item.total_marks)) * 100)
    : null;

  return (
    <div className="bg-card-bg border border-card-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
      <div className="flex-1 overflow-hidden pr-4">
        <h3 className="text-text-primary text-lg font-bold mb-1 truncate">
          {title}
        </h3>
        {subjectName && (
          <p className="text-text-secondary text-sm mb-1 truncate">
            {subjectName}
          </p>
        )}
        <div className="text-text-secondary flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
          {hasValidDate && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1 shrink-0" aria-hidden="true" />
              {parsedDate!.toLocaleDateString(LOCALE_BY_LANGUAGE[language])}
            </span>
          )}
          {percentage !== null && (
            <span className="rounded-full bg-badge-bg px-2 py-0.5 text-xs font-semibold text-badge-text">
              {t('history.cardPercent', {
                percent: localizeDigits(percentage, language),
              })}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-primary text-2xl font-bold">
          {localizeDigits(item.score, language)}
          <span className="text-text-secondary text-sm ml-1">
            /{localizeDigits(item.total_marks, language)}
          </span>
        </div>
        <button 
          onClick={() => navigate(`/exam/analysis/${item.id}`, { state: item })}
          className="text-primary text-xs hover:underline mt-1 transition-colors hover:opacity-80 active:scale-95" 
          aria-label={t('history.cardDetails')}
        >
          {t('history.cardDetails')}
        </button>
      </div>
    </div>
  );
});

HistoryCard.displayName = 'HistoryCard';
