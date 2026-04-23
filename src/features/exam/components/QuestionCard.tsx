import React, { memo } from 'react';
import { Question } from '../types/exam';
import MathDisplay from '@/shared/components/content/MathDisplay';
import { CheckCircle2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string | null;
  onOptionSelect: (optionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = memo(({
  question,
  selectedOptionId,
  onOptionSelect,
}) => {
  
  let questionText = question.text_bn || question.text || "";
  if (typeof question.body === 'object' && question.body !== null) {
    questionText = question.body.text_bn || question.body.text || questionText;
  } else if (typeof question.body === 'string' && question.body.trim() !== '') {
    questionText = question.body;
  }

  const options = question.options || [];

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl shadow-sm border border-card-border bg-card-bg transition-shadow hover:shadow-md duration-300">
      <div className="p-5 md:p-6 lg:p-8">
        <div className="flex items-start gap-4 mb-6 md:mb-8 pr-2">
          <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm font-mono shadow-sm bg-badge-bg text-badge-text border border-border-color">
            Q
          </span>
          <div className="text-[17px] md:text-[18px] font-medium font-['Hind_Siliguri'] leading-relaxed w-full pt-1 text-text-primary">
             <MathDisplay content={questionText} />
          </div>
        </div>

        <div className="space-y-3 md:pl-12 ml-0 md:ml-1">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onOptionSelect(option.id)}
                className={`relative w-full text-left p-4 md:px-5 md:py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between hover:bg-surface-elevated active:scale-[0.99] ${isSelected ? 'bg-surface-elevated border-border-color ring-1 ring-focus-ring' : 'bg-transparent border-border-color'}`}
              >
                <div className="flex items-center gap-3 md:gap-4 w-full">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-primary border-transparent' : 'bg-transparent border-border-color'}`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className={`text-[15px] md:text-[16px] font-['Hind_Siliguri'] leading-snug ${isSelected ? 'text-text-primary font-semibold' : 'text-text-secondary font-normal'}`}>
                    <MathDisplay content={option.text_bn || option.text} />
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 size={20} className="animate-in zoom-in flex-shrink-0 ml-3 shadow-sm rounded-full text-text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';
export default QuestionCard;
