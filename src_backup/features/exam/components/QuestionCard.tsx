import React, { memo } from 'react';
import { Question } from '../types/exam';
import MathDisplay from '../../../shared/components/content/MathDisplay';

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
  // Directly access properties since 'Question' interface now fully supports them
  const questionText = question.text || (typeof question.body === 'object' ? question.body?.text : question.body) || 'No question text provided';
  const options = question.options || [];

  return (
    <div 
      className="w-full max-w-2xl mx-auto rounded-xl shadow-md overflow-hidden transition-all"
      style={{ backgroundColor: 'var(--dyn-card)' }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <span 
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)', 
              color: 'var(--dyn-primary)' 
            }}
          >
            Q
          </span>
          <div className="text-lg font-medium leading-relaxed w-full" style={{ color: 'var(--dyn-text)' }}>
             <MathDisplay content={questionText} />
          </div>
        </div>

        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onOptionSelect(option.id)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 group hover:opacity-80"
                style={{
                  backgroundColor: isSelected ? 'var(--dyn-primary)' : 'transparent',
                  borderColor: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
                  color: isSelected ? 'var(--dyn-card)' : 'var(--dyn-text)'
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--dyn-card)' : 'transparent',
                    borderColor: isSelected ? 'var(--dyn-card)' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)'
                  }}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--dyn-primary)' }} />
                  )}
                </div>
                <span 
                  className="font-medium" 
                  style={{ color: isSelected ? 'var(--dyn-card)' : 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
                >
                  <MathDisplay content={option.text} />
                </span>
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
