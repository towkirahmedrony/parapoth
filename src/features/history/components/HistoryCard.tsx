import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from '../types/history';

const toBanglaDigit = (s: number | string): string => 
  String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

interface Props {
  item: HistoryItem;
}

export const HistoryCard: React.FC<Props> = memo(({ item }) => {
  const navigate = useNavigate();
  const dateStr = item.submitted_at || item.created_at || item.taken_at || new Date().toISOString();

  return (
    <div className="bg-card-bg border border-card-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
      <div className="flex-1 overflow-hidden pr-4">
        <h3 className="text-text-primary text-lg font-bold mb-1 truncate">
          {item.details_json?.exam_title || "মডেল টেস্ট"}
        </h3>
        <div className="text-text-secondary flex items-center text-sm space-x-3">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1 shrink-0"/> 
            {new Date(dateStr).toLocaleDateString('bn-BD')}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-primary text-2xl font-bold">
          {toBanglaDigit(item.score)}
          <span className="text-text-secondary text-sm ml-1">
            /{toBanglaDigit(item.total_marks)}
          </span>
        </div>
        <button 
          onClick={() => navigate(`/exam/analysis/${item.id}`, { state: item })}
          className="text-primary text-xs hover:underline mt-1 transition-colors hover:opacity-80 active:scale-95" 
          aria-label="বিস্তারিত দেখুন"
        >
          বিস্তারিত দেখুন
        </button>
      </div>
    </div>
  );
});

HistoryCard.displayName = 'HistoryCard';
