import React, { useState, useMemo, useCallback, memo } from 'react';
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, AlertCircle, Flag, Bookmark } from 'lucide-react';
import { Question } from '../types/exam';
import { formatBoardRef } from '../../leaderboard/utils/xpCalculator';
import MathDisplay from '@/shared/components/content/MathDisplay';

export interface AnalysisQuestionCardProps {
  question: Question;
  index: number;
  userAnswerId?: string;
  onReport?: (questionId: string) => void;
  onBookmark?: (questionId: string) => void;
}

const FALLBACK_EXPLANATION = "এই প্রশ্নের জন্য কোনো ব্যাখ্যা উপলব্ধ নেই।";

const AnalysisQuestionCard: React.FC<AnalysisQuestionCardProps> = memo(({
  question,
  index,
  userAnswerId,
  onReport,
  onBookmark
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  
  // Memoized to prevent unnecessary recalculation on every render
  const correctOption = useMemo(() => question.options?.find(opt => opt.isCorrect), [question.options]);
  const correctOptionId = correctOption?.id;

  const isSkipped = !userAnswerId;
  const isCorrect = !!userAnswerId && userAnswerId === correctOptionId;

  // Memoize status configuration to prevent unnecessary object recreation
  const statusConfig = useMemo(() => {
    if (isSkipped) return { 
      style: {
        color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
        backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
      },
      icon: <MinusCircle size={16} />, 
      label: 'স্কিপড' 
    };
    if (isCorrect) return { 
      style: {
        color: '#10b981',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      icon: <CheckCircle2 size={16} />, 
      label: 'সঠিক' 
    };
    return { 
      style: {
        color: '#ef4444',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      icon: <XCircle size={16} />, 
      label: 'ভুল' 
    };
  }, [isSkipped, isCorrect]);
  
  // Safe extraction of board reference
  const rawExamRef = question.exam_references 
    ? JSON.stringify(question.exam_references) 
    : question.board_ref;
    
  const boardTag = formatBoardRef(rawExamRef || '');

  // Safely extracting question text considering text_bn and body union types
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
    setIsBookmarked(prev => !prev);
    if (onBookmark) onBookmark(question.id);
  }, [onBookmark, question.id]);

  return (
    <div 
      className="rounded-xl overflow-hidden transition-all"
      style={{
        backgroundColor: statusConfig.style.backgroundColor,
        border: `1px solid ${statusConfig.style.borderColor}`
      }}
    >
      <div 
        className="flex justify-between items-center p-3 border-b"
        style={{ 
          backgroundColor: 'var(--dyn-card)',
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-bold px-2 py-0.5 rounded shadow-sm"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
              color: 'var(--dyn-text)' 
            }}
          >
            Q{index + 1}
          </span>
          {boardTag && (
             <span 
                className="text-[10px] px-1.5 py-0.5 rounded border font-mono tracking-tight"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)',
                  color: 'var(--dyn-primary)',
                  borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)'
                }}
             >
               {boardTag}
             </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1 border-r pr-3 mr-1"
            style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)' }}
          >
            <button 
              onClick={handleBookmark} 
              className={`p-1.5 rounded-full transition-all active:scale-95 ${isBookmarked ? '' : 'hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] hover:text-[var(--dyn-primary)]'}`}
              style={{
                color: isBookmarked ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)',
                backgroundColor: isBookmarked ? 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' : 'transparent'
              }}
              title="সেভ করুন"
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2} />
            </button>
            <button 
              onClick={() => onReport?.(question.id)} 
              className="p-1.5 rounded-full transition-all active:scale-95 hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]" 
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
              title="রিপোর্ট করুন"
            >
              <Flag size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusConfig.style.color }}>
            {statusConfig.label} {statusConfig.icon}
          </div>
        </div>
      </div>

      <div className="p-4" style={{ backgroundColor: 'var(--dyn-bg)' }}>
        <div 
          className="font-['Hind_Siliguri'] text-[15px] mb-4 leading-relaxed"
          style={{ color: 'var(--dyn-text)' }}
        >
          <MathDisplay content={questionText} />
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Question" 
              className="mt-3 rounded-lg max-h-48 border" 
              style={{ 
                borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' 
              }} 
            />
          )}
        </div>

        <div className="space-y-2">
          {question.options?.map((opt) => {
            const isSelected = userAnswerId === opt.id;
            const isAns = opt.isCorrect;
            
            let optStyle = {
              borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
              backgroundColor: 'var(--dyn-card)',
              color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)',
              textDecoration: 'none'
            };
            
            if (isAns) {
              optStyle = {
                borderColor: 'rgba(16, 185, 129, 0.5)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#047857',
                textDecoration: 'none'
              };
            } else if (isSelected && !isAns) {
              optStyle = {
                borderColor: 'rgba(239, 68, 68, 0.5)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#b91c1c',
                textDecoration: 'line-through'
              };
            }

            return (
              <div 
                key={opt.id} 
                className="p-3 rounded-lg border text-sm flex justify-between items-start gap-2"
                style={{ 
                  backgroundColor: optStyle.backgroundColor,
                  borderColor: optStyle.borderColor,
                  color: optStyle.color
                }}
              >
                <div className="font-['Hind_Siliguri'] flex-1" style={{ textDecoration: optStyle.textDecoration }}>
                  <MathDisplay content={opt.text_bn || opt.text} />
                </div>
                {isAns && <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />}
                {isSelected && !isAns && <XCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />}
              </div>
            );
          })}
        </div>

        <div 
          className="mt-4 pt-3 border-t"
          style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        >
          <button 
            onClick={() => setShowExplanation(prev => !prev)} 
            className="flex items-center gap-1.5 text-xs font-bold transition-colors w-full hover:opacity-80"
            style={{ color: 'var(--dyn-primary)' }}
          >
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showExplanation ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা ও সমাধান দেখুন'}
          </button>

          {showExplanation && (
            <div 
              className="mt-3 p-3 rounded-lg border animate-in fade-in slide-in-from-top-1"
              style={{
                backgroundColor: 'var(--dyn-card)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                 <AlertCircle size={14} style={{ color: 'var(--dyn-primary)' }} />
                 <span 
                    className="text-xs uppercase font-bold tracking-wider"
                    style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
                 >
                    ব্যাখ্যা
                 </span>
              </div>
              <div 
                className="text-sm font-['Hind_Siliguri'] leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
              >
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
