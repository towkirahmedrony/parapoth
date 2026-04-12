import React from 'react';
import { UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import { ReferralHistoryItem } from '../types/referral';

interface HistoryProps {
  history: ReferralHistoryItem[];
  isLoading: boolean;
}

export const ReferralHistory: React.FC<HistoryProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return <div className="h-40 rounded-xl animate-pulse bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--dyn-text)_20%,transparent)] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)] flex items-center justify-center mb-3 text-[color-mix(in_srgb,var(--dyn-text)_40%,transparent)]">
          <UserPlus size={24} />
        </div>
        <h4 className="text-sm font-semibold text-[var(--dyn-text)] mb-1">এখনও কোনো রেফারেল নেই</h4>
        <p className="text-xs text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)] max-w-xs">
          আপনার স্কোয়াড বড় করতে এখনই বন্ধুদের সাথে কোড শেয়ার করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--dyn-card)] border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] overflow-hidden shadow-sm">
      <div className="p-3 px-4 border-b border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] flex items-center justify-between bg-[color-mix(in_srgb,var(--dyn-text)_2%,transparent)]">
        <h3 className="text-sm font-semibold text-[var(--dyn-text)] flex items-center gap-2">
          আপনার ইনভাইটেড স্কোয়াড 
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[color-mix(in_srgb,var(--dyn-primary)_15%,transparent)] text-[var(--dyn-primary)]">
            {history.length}
          </span>
        </h3>
      </div>
      
      {/* Scrollable Container */}
      <div className="divide-y divide-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)] max-h-[260px] overflow-y-auto hide-scrollbar">
        {history.map((item) => {
          const initial = item.user.full_name?.charAt(0)?.toUpperCase() || '?';
          const joinedDate = item.user.joined_at 
            ? new Date(item.user.joined_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) 
            : 'অজানা তারিখ';
          const isActive = item.user.status === 'active';

          return (
            <div key={item.user.id} className="p-3 flex items-center justify-between hover:bg-[color-mix(in_srgb,var(--dyn-text)_2%,transparent)] transition-colors">
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 text-xs rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)] text-[color-mix(in_srgb,var(--dyn-text)_70%,transparent)] border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]">
                  {item.user.avatar_url ? (
                    <img src={item.user.avatar_url} alt={item.user.full_name} className="w-full h-full object-cover"/>
                  ) : (
                    initial
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--dyn-text)] leading-none">
                    {item.user.full_name || 'অজ্ঞাত নাম'}
                  </p>
                  <p className="text-[10px] text-[color-mix(in_srgb,var(--dyn-text)_50%,transparent)] mt-1">
                    {joinedDate}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`flex items-center gap-1 text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  +{item.bonus_amount} <span className="text-[10px] font-normal">কয়েন</span>
                </span>
                {isActive ? (
                  <span className="flex items-center gap-1 text-[9px] text-green-600/80 font-medium px-1 rounded bg-green-600/10">
                    <CheckCircle2 size={8} /> সম্পন্ন
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-yellow-600 font-medium px-1 rounded bg-yellow-500/10">
                    <Clock size={8} /> অপেক্ষমান
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
