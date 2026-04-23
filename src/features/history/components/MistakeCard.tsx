import React, { memo } from 'react';
import { Trash2, XCircle, CheckCircle } from 'lucide-react';
import { MistakeItem } from '../types/history';

interface Props {
  item: MistakeItem;
  onDelete: (id: string) => void;
}

const safeParse = (data: any) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
};

export const MistakeCard: React.FC<Props> = memo(({ item, onDelete }) => {
  const rawQuestions = item.questions;
  const qData = Array.isArray(rawQuestions) ? rawQuestions[0] : rawQuestions;

  const bodyData = safeParse(qData?.body);
  let bodyHtml = "প্রশ্ন লোড হয়নি বা মুছে ফেলা হয়েছে";
  if (bodyData) {
    if (typeof bodyData === 'string') bodyHtml = bodyData;
    else if (bodyData.bn) bodyHtml = bodyData.bn;
    else if (bodyData.en) bodyHtml = bodyData.en;
    else if (bodyData.text) bodyHtml = bodyData.text;
  }

  const optionsData = safeParse(qData?.options);
  const optionsArray = Array.isArray(optionsData) ? optionsData : [];

  let userAns = "উত্তর পাওয়া যায়নি";
  const selectedData = safeParse(item.selected_option);
  
  if (typeof selectedData === 'object' && selectedData !== null) {
      userAns = selectedData.bn || selectedData.text || selectedData.en || "অজানা উত্তর";
  } else if (optionsArray.length > 0 && selectedData !== null) {
      const matchedOpt = optionsArray.find((opt: any) => 
          String(opt?.id) === String(selectedData) || 
          opt?.text === selectedData || 
          opt?.bn === selectedData
      );
      if (matchedOpt) {
          userAns = matchedOpt.bn || matchedOpt.text || matchedOpt.en || String(selectedData);
      } else {
          const idx = parseInt(String(selectedData), 10);
          if (!isNaN(idx) && optionsArray[idx]) {
              const opt = optionsArray[idx];
              userAns = opt.bn || opt.text || opt.en || String(selectedData);
          } else {
              userAns = String(selectedData) === '[object Object]' ? 'ডেটাবেজে ভুল সেভ হয়েছে' : String(selectedData);
          }
      }
  } else {
      userAns = String(item.selected_option) === '[object Object]' ? 'ডেটাবেজে ভুল সেভ হয়েছে' : String(item.selected_option);
  }

  let correctAns = "সঠিক উত্তর সেট করা নেই";
  if (optionsArray.length > 0) {
      const correctOpt = optionsArray.find((opt: any) => 
          opt?.isCorrect === true || 
          opt?.is_correct === true || 
          opt?.correct === true || 
          String(opt?.isCorrect) === 'true'
      );
      if (correctOpt) {
          correctAns = correctOpt.bn || correctOpt.text || correctOpt.en || "অজানা";
      }
  }

  return (
    <div className="bg-card-bg border border-card-border p-5 rounded-xl shadow-sm relative group transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className="bg-badge-bg text-badge-text px-2 py-1 rounded text-xs font-bold">
          ভুল উত্তর
        </span>
        <button 
          onClick={() => onDelete(item.id)}
          className="bg-surface border border-border-color text-accent hover:bg-surface-elevated p-2 rounded-full transition-colors flex items-center justify-center active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div 
        className="text-text-primary mb-4 font-medium prose prose-sm dark:prose-invert max-w-none" 
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-surface border border-border-color p-3 rounded-lg">
          <span className="text-accent flex items-center mb-1 font-semibold">
            <XCircle className="w-3 h-3 mr-1 shrink-0"/> আপনার উত্তর
          </span>
          <p className="text-text-secondary">
            {userAns}
          </p>
        </div>
        <div className="bg-surface border border-border-color p-3 rounded-lg">
          <span className="text-text-primary flex items-center mb-1 font-semibold">
            <CheckCircle className="w-3 h-3 mr-1 shrink-0"/> সঠিক উত্তর
          </span>
          <p className="text-text-secondary">
            {correctAns}
          </p>
        </div>
      </div>
    </div>
  );
});

MistakeCard.displayName = 'MistakeCard';
