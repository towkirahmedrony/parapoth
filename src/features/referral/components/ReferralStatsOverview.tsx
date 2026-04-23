import React from 'react';
import { Users, Coins } from 'lucide-react';

interface StatsProps {
  totalEarned: number;
  totalReferrals: number;
  isLoading?: boolean;
}

export const ReferralStatsOverview: React.FC<StatsProps> = ({ totalEarned, totalReferrals, isLoading }) => {
  if (isLoading) {
    return <div className="h-16 rounded-xl animate-pulse bg-secondary" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-xl bg-card-bg border border-card-border flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-secondary text-primary">
          <Users size={20} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">মোট ইনভাইট</p>
          <p className="text-lg font-bold text-text-primary leading-none mt-0.5">{totalReferrals}</p>
        </div>
      </div>
      
      <div className="p-3 rounded-xl bg-card-bg border border-card-border flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-secondary text-accent">
          <Coins size={20} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">আয়কৃত কয়েন</p>
          <p className="text-lg font-bold text-text-primary leading-none mt-0.5">{totalEarned}</p>
        </div>
      </div>
    </div>
  );
};
