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
      <div className="backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col bg-card-bg border border-border-color">
        <div className="relative z-10 flex-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
            <Sparkles size={18} className="text-accent" /> AI মেন্টর সাজেশন
          </h3>
          
          {aiAnalysis?.personalized_suggestions && aiAnalysis.personalized_suggestions.length > 0 ? (
            <ul className="space-y-3 mb-4">
              {aiAnalysis.personalized_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 text-text-secondary">
                  <span className="text-lg leading-none text-accent">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm mb-6 text-text-secondary">
              আপনার সাম্প্রতিক এনালাইসিস অনুযায়ী, আজকে <span className="font-bold text-accent">"{focusTopic}"</span> রিভিশন দিলে আপনার স্কোর দ্রুত বাড়বে।
            </p>
          )}

          {/* Strong Points Highlight */}
          {aiAnalysis?.strong_points && aiAnalysis.strong_points.length > 0 && (
            <div className="mb-5 p-3 rounded-lg bg-surface-elevated border border-border-color">
              <h4 className="text-xs font-bold mb-1 flex items-center gap-1 text-text-primary">
                <TrendingUp size={14} className="text-accent" /> আপনার শক্তিশালী দিক
              </h4>
              <p className="text-xs leading-relaxed text-text-secondary">{aiAnalysis.strong_points[0]}</p>
            </div>
          )}

          <div className="mt-auto">
            <button className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 bg-primary text-primary-foreground opacity-90 hover:opacity-100">
              {aiAnalysis?.focus_action || "সাজেশন অনুযায়ী পরীক্ষা দিন"} <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none bg-primary opacity-10"></div>
      </div>

      {/* Weaknesses Box (আগের ডিজাইনটি রাখা হলো) */}
      <div className="backdrop-blur-sm rounded-2xl p-6 shadow-sm bg-card-bg border border-border-color">
         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
          <AlertCircle size={18} className="text-accent" />
          দুর্বলতা বিশ্লেষণ (Attention Needed)
        </h3>
        
        {!weaknesses || weaknesses.length === 0 ? (
          <p className="text-sm italic text-text-secondary">
            পর্যাপ্ত ডেটা পাওয়া যায়নি। আরও পরীক্ষা দিন।
          </p>
        ) : (
          <div className="space-y-3">
            {weaknesses.map((item, idx) => (
              <div 
                key={`${item.topic}-${idx}`} 
                className="flex items-center justify-between p-3 rounded-lg transition-colors bg-surface border border-border-color hover:bg-surface-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-badge-bg text-badge-text">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-text-primary">{item.topic}</h4>
                    <p className="text-[10px] text-text-secondary">{item.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-text-primary">{item.errorRate} ভুল</p>
                  <button className="text-[10px] underline transition-colors text-text-secondary hover:text-accent">
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
