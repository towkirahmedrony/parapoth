import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { ArrowRight } from 'lucide-react';
import { TabType } from '../types/history';

import searchAnim from '../../../assets/animations/empty-search.json';

interface Props {
  type: TabType;
}

// Moved config outside to prevent unnecessary recreations on every render
const EMPTY_STATE_CONFIG: Record<TabType, { title: string; desc: string; btnText: string; link: string }> = {
  history: {
    title: "এখনো কোনো পরীক্ষা দেননি?",
    desc: "আপনার মেধা যাচাই করতে এখনই একটি পরীক্ষা শুরু করুন।",
    btnText: "মডেল টেস্ট দিন",
    link: "/exam/selection"
  },
  mistakes: {
    title: "অসাধারণ! কোনো ভুল নেই",
    desc: "আপনি সব প্রশ্নের সঠিক উত্তর দিয়েছেন অথবা এখনো ভুল করেননি।",
    btnText: "অনুশীলন চালিয়ে যান",
    link: "/exam/selection"
  },
  bookmarks: {
    title: "বুকমার্ক তালিকা খালি",
    desc: "গুরুত্বপূর্ণ বা কঠিন প্রশ্নগুলো পরে পড়ার জন্য বুকমার্ক করে রাখুন।",
    btnText: "প্রশ্ন খুঁজুন",
    link: "/bank"
  }
};

export const EmptyState: React.FC<Props> = memo(({ type }) => {
  const navigate = useNavigate();
  const current = EMPTY_STATE_CONFIG[type];

  // Fallback in case an invalid type is passed
  if (!current) return null;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in zoom-in duration-500">
      
      {/* Lottie Animation Wrapper */}
      <div className="w-48 h-48 md:w-60 md:h-60 mb-2 pointer-events-none">
        <Lottie 
          animationData={searchAnim} 
          loop={true} 
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-bold mb-2 font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>
        {current.title}
      </h3>
      <p className="max-w-xs mx-auto mb-8 font-['Hind_Siliguri'] text-sm" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
        {current.desc}
      </p>

      {/* Action Button */}
      <button 
        onClick={() => navigate(current.link)}
        className="group flex items-center space-x-2 px-6 py-3 rounded-full shadow-sm transition-all duration-300 hover:shadow-md active:scale-95"
        style={{ 
          backgroundColor: 'var(--dyn-card)',
          border: '1px solid color-mix(in srgb, var(--dyn-primary) 50%, transparent)'
        }}
      >
        <span className="text-sm font-semibold font-['Hind_Siliguri'] transition-colors" style={{ color: 'var(--dyn-primary)' }}>
          {current.btnText}
        </span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--dyn-primary)' }} />
      </button>

    </div>
  );
});

EmptyState.displayName = 'EmptyState';
