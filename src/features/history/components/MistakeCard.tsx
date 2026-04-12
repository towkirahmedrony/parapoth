import React, { memo } from 'react';
import { Trash2, XCircle, CheckCircle } from 'lucide-react';
import { MistakeItem, QuestionOption, LocalizedText } from '../types/history';

interface Props {
  item: MistakeItem;
  onDelete: (id: string) => void;
}

// Extracted pure helper functions outside the component
const getOptionText = (options: QuestionOption[] | null | undefined, selectedVal: string | null): string => {
  if (!selectedVal || !Array.isArray(options) || options.length === 0) return "N/A";
  
  const idx = parseInt(selectedVal, 10);
  if (!isNaN(idx) && options[idx]) {
    const opt = options[idx];
    return opt?.text || opt?.bn || String(opt) || "N/A";
  }
  
  const foundOpt = options.find((o) => 
    String(o?.id) === selectedVal || o?.text === selectedVal || o?.bn === selectedVal
  );
  
  if (foundOpt) return foundOpt.text || foundOpt.bn || "N/A";

  return selectedVal; 
};

const getCorrectOptionText = (options: QuestionOption[] | null | undefined): string => {
  if (Array.isArray(options)) {
    const correctOpt = options.find(
      (opt) => opt?.isCorrect === true || opt?.is_correct === true || opt?.correct === true || opt?.answer === true
    );
    if (correctOpt) {
      return correctOpt.text || correctOpt.bn || "N/A";
    }
  }
  return "N/A (ডাটাবেজে মার্ক করা নেই)";
};

const renderBody = (body: LocalizedText): string => {
  if (!body) return "প্রশ্ন লোড হয়নি";
  if (typeof body === 'string') return body;
  return body.bn || body.text || "প্রশ্ন লোড হয়নি";
};

export const MistakeCard: React.FC<Props> = memo(({ item, onDelete }) => {
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
          aria-label="Delete mistake"
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
        dangerouslySetInnerHTML={{ __html: renderBody(item.questions?.body) }}
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
            {getOptionText(item.questions?.options, item.selected_option)}
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
            {getCorrectOptionText(item.questions?.options)}
          </p>
        </div>
      </div>
    </div>
  );
});

MistakeCard.displayName = 'MistakeCard';
