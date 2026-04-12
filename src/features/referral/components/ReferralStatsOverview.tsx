import React from 'react';
import { Users, Coins } from 'lucide-react';

interface StatsProps {
  totalEarned: number;
  totalReferrals: number;
  isLoading?: boolean;
}

export const ReferralStatsOverview: React.FC<StatsProps> = ({ totalEarned, totalReferrals, isLoading }) => {
  if (isLoading) {
    return <div className="h-16 rounded-xl animate-pulse bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-xl bg-[var(--dyn-card)] border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-[color-mix(in_srgb,#3b82f6_15%,transparent)] text-[#3b82f6]">
          <Users size={20} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)] uppercase tracking-wide">মোট ইনভাইট</p>
          <p className="text-lg font-bold text-[var(--dyn-text)] leading-none mt-0.5">{totalReferrals}</p>
        </div>
      </div>
      
      <div className="p-3 rounded-xl bg-[var(--dyn-card)] border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-[color-mix(in_srgb,#eab308_15%,transparent)] text-[#eab308]">
          <Coins size={20} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)] uppercase tracking-wide">আয়কৃত কয়েন</p>
          <p className="text-lg font-bold text-[var(--dyn-text)] leading-none mt-0.5">{totalEarned}</p>
        </div>
      </div>
    </div>
  );
};
