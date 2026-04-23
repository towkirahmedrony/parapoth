import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, AlertCircle, Flag, Bookmark } from 'lucide-react';
import { Question } from '../types/exam';
import { formatBoardRef } from '../../leaderboard/utils/xpCalculator';
import MathDisplay from '@/shared/components/content/MathDisplay';

export interface AnalysisQuestionCardProps {
  question: Question;
  index: number;
  userAnswerId?: string;
  initialBookmarked?: boolean;
  onReport?: (questionId: string) => void;
  onBookmark?: (questionId: string, isNowBookmarked: boolean) => void;
}

const FALLBACK_EXPLANATION = "এই প্রশ্নের জন্য কোনো ব্যাখ্যা উপলব্ধ নেই।";

const AnalysisQuestionCard: React.FC<AnalysisQuestionCardProps> = memo(({
  question,
  index,
  userAnswerId,
  initialBookmarked = false,
  onReport,
  onBookmark
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarked);

  // Sync with parent if initial prop changes
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);
  
  const correctOption = useMemo(() => question.options?.find(opt => opt.isCorrect), [question.options]);
  const correctOptionId = correctOption?.id;

  const isSkipped = !userAnswerId;
  const isCorrect = !!userAnswerId && userAnswerId === correctOptionId;

  // Using standard Tailwind semantic classes where applicable, preserving red/emerald for explicit pass/fail states
  const statusConfig = useMemo(() => {
    if (isSkipped) return { 
      textClass: 'text-text-secondary',
      bgClass: 'bg-surface-elevated',
      borderClass: 'border-border-color',
      icon: <MinusCircle size={16} />, 
      label: 'স্কিপড' 
    };
    if (isCorrect) return { 
      textClass: 'text-emerald-600',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30',
      icon: <CheckCircle2 size={16} />, 
      label: 'সঠিক' 
    };
    return { 
      textClass: 'text-red-600',
      bgClass: 'bg-red-500/10',
      borderClass: 'border-red-500/30',
      icon: <XCircle size={16} />, 
      label: 'ভুল' 
    };
  }, [isSkipped, isCorrect]);
  
  const rawExamRef = question.exam_references ? JSON.stringify(question.exam_references) : question.board_ref;
  const boardTag = formatBoardRef(rawExamRef || '');

  const questionText = useMemo(() => {
    let text = question.text_bn || question.text || "";
    if (typeof question.body === 'object' && question.body !== null) {
      text = question.body.text_bn || question.body.text || text;
    } else if (typeof question.body === 'string' && question.body.trim() !== '') {
      text = question.body;
    }
    return text;
  }, [question.text_bn, question.text, question.body]);

  const imageUrl = question.image_url || question.media_library?.file_url;

  const handleBookmark = useCallback(() => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    if (onBookmark) onBookmark(question.id, newState);
  }, [onBookmark, question.id, isBookmarked]);

  return (
    <div className={`rounded-xl overflow-hidden transition-all shadow-sm md:shadow-md border bg-card-bg ${statusConfig.borderClass}`}>
      <div className="flex justify-between items-center p-3 sm:p-4 border-b border-border-color opacity-90">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md shadow-sm bg-badge-bg text-badge-text">
            Q{index + 1}
          </span>
          {boardTag && (
             <span className="text-[10px] px-2 py-1 rounded-md border border-border-color bg-badge-bg text-badge-text font-mono tracking-tight">
               {boardTag}
             </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border-r border-border-color pr-3 mr-1">
            <button 
              onClick={handleBookmark} 
              className={`p-1.5 rounded-full transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-focus-ring ${
                isBookmarked 
                  ? 'bg-accent text-text-primary' 
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
              title="সেভ করুন"
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2} />
            </button>
            <button 
              onClick={() => onReport?.(question.id)} 
              className="p-1.5 rounded-full transition-all active:scale-95 text-text-secondary hover:bg-surface-elevated hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring" 
              title="রিপোর্ট করুন"
            >
              <Flag size={16} strokeWidth={2} />
            </button>
          </div>
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-2 py-1 rounded-md ${statusConfig.textClass} ${statusConfig.bgClass}`}>
            {statusConfig.label} {statusConfig.icon}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-surface">
        <div className="font-['Hind_Siliguri'] text-[15px] sm:text-base mb-5 leading-relaxed text-text-primary">
          <MathDisplay content={questionText} />
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Question" 
              className="mt-4 rounded-xl max-h-56 object-contain border border-border-color bg-surface-elevated mx-auto" 
            />
          )}
        </div>

        <div className="space-y-2.5">
          {question.options?.map((opt) => {
            const isSelected = userAnswerId === opt.id;
            const isAns = opt.isCorrect;
            
            let containerClasses = "border-border-color bg-surface-elevated";
            let textClasses = "text-text-primary";
            
            if (isAns) {
              containerClasses = "border-emerald-500/50 bg-emerald-500/10";
              textClasses = "text-emerald-700";
            } else if (isSelected && !isAns) {
              containerClasses = "border-red-500/50 bg-red-500/10";
              textClasses = "text-red-700 line-through opacity-80";
            }

            return (
              <div 
                key={opt.id} 
                className={`p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base flex justify-between items-start gap-3 transition-colors ${containerClasses}`}
              >
                <div className={`font-['Hind_Siliguri'] flex-1 ${textClasses}`}>
                  <MathDisplay content={opt.text_bn || opt.text} />
                </div>
                {isAns && <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500" />}
                {isSelected && !isAns && <XCircle size={18} className="shrink-0 mt-0.5 text-red-500" />}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-border-color">
          <button 
            onClick={() => setShowExplanation(prev => !prev)} 
            className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold transition-all w-full py-2 rounded-lg text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
          >
            {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showExplanation ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা ও সমাধান দেখুন'}
          </button>

          {showExplanation && (
            <div className="mt-3 p-4 sm:p-5 rounded-xl border border-border-color bg-surface-elevated animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <AlertCircle size={16} className="text-text-primary" />
                 <span className="text-xs sm:text-sm uppercase font-bold tracking-wider opacity-80 text-text-primary">
                    ব্যাখ্যা
                 </span>
              </div>
              <div className="text-sm sm:text-base font-['Hind_Siliguri'] leading-relaxed opacity-90 text-text-secondary">
                <MathDisplay content={question.explanation || FALLBACK_EXPLANATION} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AnalysisQuestionCard.displayName = 'AnalysisQuestionCard';

export default AnalysisQuestionCard;
