import React, { memo } from 'react';
import { CheckCircle2, Flag } from 'lucide-react';
import { Question, ExamQuestion } from '../types/exam';
import MathDisplay from '../../../shared/components/content/MathDisplay';

interface LiveQuestionCardProps {
  question: Question | ExamQuestion;
  index: number;
  selectedOptionId?: string;
  onSelectOption: (questionId: string, optionId: string) => void;
  onReport: (questionId: string) => void;
}

const LiveQuestionCard: React.FC<LiveQuestionCardProps> = memo(({
  question,
  index,
  selectedOptionId,
  onSelectOption,
  onReport,
}) => {
  const isLocked = !!selectedOptionId;
  
  // Safely retrieving text values considering the union type of question.body
  let questionText = question.text_bn || question.text || "";
  if (typeof question.body === 'object' && question.body !== null) {
    questionText = question.body.text_bn || question.body.text || questionText;
  } else if (typeof question.body === 'string' && question.body.trim() !== '') {
    questionText = question.body;
  }
  
  const qImageUrl = question.media_library?.file_url || question.image_url;
  const compImageUrl = question.comprehension?.media_library?.file_url || question.comprehension?.image_url;

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm animate-in fade-in duration-500 relative"
         style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
      
      {/* 1. Stem (Comprehension) */}
      {question.comprehension && (
        <div className="border-b p-4 relative"
             style={{ 
               backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)', 
               borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
             }}>
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: 'var(--dyn-primary)' }} />
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: 'var(--dyn-primary)' }}>
            উদ্দীপক
          </h4>
          
          {compImageUrl && (
            <img 
              src={compImageUrl} 
              alt="Stimulus" 
              className="w-full max-h-60 object-contain rounded-lg mb-3 border"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
              }}
            />
          )}
          
          <div 
            className="text-sm leading-relaxed font-['Hind_Siliguri']"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
          >
            <MathDisplay content={question.comprehension.body} />
          </div>
        </div>
      )}

      <div className="p-5 pt-8 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport(question.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-lg border transition-all z-10 shadow-sm flex items-center gap-1.5 hover:opacity-80"
          title="রিপোর্ট করুন"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
            color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)'
          }}
        >
          <Flag size={14} strokeWidth={2.5} />
          <span className="text-[10px] font-medium opacity-70">রিপোর্ট</span>
        </button>

        {/* 2. Question Area */}
        <div className="flex gap-3 mb-5 pr-2">
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold font-mono"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--dyn-text) 8%, transparent)', 
                  color: 'var(--dyn-text)' 
                }}>
            {index + 1}
          </span>
          <div className="space-y-3 w-full">
            <div 
              className="text-[17px] font-medium font-['Hind_Siliguri'] leading-normal pr-12"
              style={{ color: 'var(--dyn-text)' }}
            >
              <MathDisplay content={questionText} />
            </div>
            
            {qImageUrl && (
              <div className="relative group mt-2">
                <img 
                  src={qImageUrl} 
                  alt="Question" 
                  className="w-full max-h-64 object-contain rounded-lg border"
                  style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Options Area */}
        <div className="grid grid-cols-1 gap-3 pl-0 md:pl-11">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => !isLocked && onSelectOption(question.id, option.id)}
                disabled={isLocked}
                className={`relative w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ${!isLocked && 'hover:opacity-80 active:scale-[0.99]'} ${isLocked && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)' : 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
                  borderColor: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 15%, transparent)'
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                       style={{
                         backgroundColor: isSelected ? 'var(--dyn-primary)' : 'transparent',
                         borderColor: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)'
                       }}>
                    {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--dyn-card)' }} />}
                  </div>
                  <span className={`text-sm font-['Hind_Siliguri'] leading-snug`}
                        style={{ color: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 80%, transparent)', fontWeight: isSelected ? 500 : 400 }}>
                    <MathDisplay content={option.text_bn || option.text} />
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 size={18} className="animate-in zoom-in flex-shrink-0 ml-2" style={{ color: 'var(--dyn-primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

LiveQuestionCard.displayName = 'LiveQuestionCard';

export default LiveQuestionCard;
