import React, { memo } from 'react';
import { Trash2, XCircle, CheckCircle } from 'lucide-react';
import { MistakeItem } from '../types/history';

interface Props {
  item: MistakeItem;
  onDelete: (id: string) => void;
}

// সেফলি JSON পার্স করার ফাংশন
const safeParse = (data: any) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
};

export const MistakeCard: React.FC<Props> = memo(({ item, onDelete }) => {
  // ১. প্রশ্ন এক্সট্রাক্ট করা
  const rawQuestions = item.questions;
  const qData = Array.isArray(rawQuestions) ? rawQuestions[0] : rawQuestions;

  // ২. বডি বা প্রশ্ন পার্স করা
  const bodyData = safeParse(qData?.body);
  let bodyHtml = "প্রশ্ন লোড হয়নি বা মুছে ফেলা হয়েছে";
  if (bodyData) {
    if (typeof bodyData === 'string') bodyHtml = bodyData;
    else if (bodyData.bn) bodyHtml = bodyData.bn;
    else if (bodyData.en) bodyHtml = bodyData.en;
    else if (bodyData.text) bodyHtml = bodyData.text;
  }

  // ৩. অপশন পার্স করা
  const optionsData = safeParse(qData?.options);
  const optionsArray = Array.isArray(optionsData) ? optionsData : [];

  // ৪. ইউজারের দেওয়া উত্তর পার্স করা
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

  // ৫. সঠিক উত্তর বের করা
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
    <div 
      className="p-5 rounded-xl shadow-sm relative group transition-all"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span 
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)',
            color: 'var(--dyn-accent)'
          }}
        >
          ভুল উত্তর
        </span>
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-full transition-colors flex items-center justify-center hover:bg-opacity-80 active:scale-95"
          style={{ 
            color: 'var(--dyn-accent)',
            backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)'
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div 
        className="mb-4 font-medium prose prose-sm dark:prose-invert max-w-none" 
        style={{ color: 'var(--dyn-text)' }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div 
          className="p-3 rounded-lg"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-accent) 20%, transparent)'
          }}
        >
          <span className="flex items-center mb-1 font-semibold" style={{ color: 'var(--dyn-accent)' }}>
            <XCircle className="w-3 h-3 mr-1 shrink-0"/> আপনার উত্তর
          </span>
          <p style={{ color: 'color-mix(in srgb, var(--dyn-accent) 80%, var(--dyn-text))' }}>
            {userAns}
          </p>
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-primary) 20%, transparent)'
          }}
        >
          <span className="flex items-center mb-1 font-semibold" style={{ color: 'var(--dyn-primary)' }}>
            <CheckCircle className="w-3 h-3 mr-1 shrink-0"/> সঠিক উত্তর
          </span>
          <p style={{ color: 'color-mix(in srgb, var(--dyn-primary) 80%, var(--dyn-text))' }}>
            {correctAns}
          </p>
        </div>
      </div>
    </div>
  );
});

MistakeCard.displayName = 'MistakeCard';
