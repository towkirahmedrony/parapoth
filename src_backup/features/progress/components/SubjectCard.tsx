import React, { memo } from 'react';

interface SubjectCardProps {
  subject: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = memo(({ 
  subject, 
  score = 0, 
  correct = 0, 
  wrong = 0, 
  skipped = 0 
}) => {
  return (
    <div 
      className="rounded-xl p-5 transition-colors group shadow-sm hover:[background-color:color-mix(in_srgb,var(--dyn-text)_3%,transparent)]"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 
          className="text-lg font-bold transition-colors"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 85%, transparent)' }}
        >
          {subject}
        </h4>
        <span 
          className="text-lg font-bold" 
          style={{ color: score > 0 ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
        >
          {score}%
        </span>
      </div>
      
      {/* Custom Progress Bar */}
      <div 
        className="h-2 w-full rounded-full mb-4 overflow-hidden"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <div 
          className="h-full transition-all duration-500 ease-out" 
          style={{ 
            width: `${score > 0 ? score : 5}%`, 
            opacity: score > 0 ? 1 : 0.3,
            backgroundColor: 'var(--dyn-primary)'
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span><span className="font-bold" style={{ color: 'var(--dyn-text)' }}>{correct}</span> সঠিক</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span><span className="font-bold" style={{ color: 'var(--dyn-text)' }}>{wrong}</span> ভুল</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span><span className="font-bold" style={{ color: 'var(--dyn-text)' }}>{skipped}</span> স্কিপড</span>
        </div>
      </div>
    </div>
  );
});

SubjectCard.displayName = 'SubjectCard';
