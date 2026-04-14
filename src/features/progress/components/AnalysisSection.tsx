import React from 'react';
import { AlertCircle, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { WeaknessData, AIAnalysisData } from '../types/progress';

interface AnalysisSectionProps {
  weaknesses: WeaknessData[];
  focusTopic: string;
  aiAnalysis?: AIAnalysisData;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({ weaknesses, focusTopic, aiAnalysis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* AI Suggestions Box (নতুন ডিজাইন) */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-primary) 30%, transparent)' 
        }}
      >
        <div className="relative z-10 flex-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--dyn-primary)' }}>
            <Sparkles size={18} /> AI মেন্টর সাজেশন
          </h3>
          
          {aiAnalysis?.personalized_suggestions && aiAnalysis.personalized_suggestions.length > 0 ? (
            <ul className="space-y-3 mb-4">
              {aiAnalysis.personalized_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2" style={{ color: 'color-mix(in srgb, var(--dyn-text) 85%, transparent)' }}>
                  <span className="text-lg leading-none" style={{ color: 'var(--dyn-primary)' }}>•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
              আপনার সাম্প্রতিক এনালাইসিস অনুযায়ী, আজকে <span className="font-bold" style={{ color: 'var(--dyn-primary)' }}>"{focusTopic}"</span> রিভিশন দিলে আপনার স্কোর দ্রুত বাড়বে।
            </p>
          )}

          {/* Strong Points Highlight */}
          {aiAnalysis?.strong_points && aiAnalysis.strong_points.length > 0 && (
            <div className="mb-5 p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, #22c55e 10%, transparent)' }}>
              <h4 className="text-xs font-bold text-green-500 mb-1 flex items-center gap-1"><TrendingUp size={14}/> আপনার শক্তিশালী দিক</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--dyn-text)' }}>{aiAnalysis.strong_points[0]}</p>
            </div>
          )}

          <div className="mt-auto">
            <button 
              className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:[background-color:color-mix(in_srgb,var(--dyn-primary)_80%,#000)]"
              style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-card)' }}
            >
              {aiAnalysis?.focus_action || "সাজেশন অনুযায়ী পরীক্ষা দিন"} <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div 
          className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}
        ></div>
      </div>

      {/* Weaknesses Box (আগের ডিজাইনটি রাখা হলো) */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
          <AlertCircle size={18} />
          দুর্বলতা বিশ্লেষণ (Attention Needed)
        </h3>
        
        {!weaknesses || weaknesses.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
            পর্যাপ্ত ডেটা পাওয়া যায়নি। আরও পরীক্ষা দিন।
          </p>
        ) : (
          <div className="space-y-3">
            {weaknesses.map((item, idx) => (
              <div 
                key={`${item.topic}-${idx}`} 
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:[border-color:color-mix(in_srgb,var(--dyn-text)_25%,transparent)]"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--dyn-text) 2%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm" style={{ color: 'var(--dyn-text)' }}>{item.topic}</h4>
                    <p className="text-[10px]" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>{item.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-500 font-bold text-sm">{item.errorRate} ভুল</p>
                  <button 
                    className="text-[10px] underline transition-colors hover:[color:var(--dyn-primary)]"
                    style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
                  >
                    রিভাইস দিন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
