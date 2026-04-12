import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReferralHero } from '../components/ReferralHero';
import { RedeemCode } from '../components/RedeemCode';
import { ReferralHistory } from '../components/ReferralHistory';
import { referralService } from '../services/referralService';
import { useAuth } from '../../auth/hooks/useAuth';

const ReferralPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch Referral Stats using React Query
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referralStats', user?.id],
    queryFn: () => referralService.getStats(user!.id),
    enabled: !!user?.id,
  });

  // Fetch Referral History using React Query
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['referralHistory', user?.id],
    queryFn: () => referralService.getHistory(user!.id),
    enabled: !!user?.id,
  });

  // Combine loading states to maintain original UI behavior gracefully
  const loading = isLoadingStats || isLoadingHistory;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          Build your learning community and earn rewards.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Hero & Input) */}
        <div className="md:col-span-2 space-y-6">
            {loading ? (
                <div 
                  className="h-48 rounded-xl animate-pulse" 
                  style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                ></div>
            ) : (
                <ReferralHero 
                    code={stats?.referralCode || '...'} 
                    totalEarned={stats?.totalEarned || 0} 
                />
            )}
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div 
                  className="p-3 rounded-lg border" 
                  style={{ 
                    backgroundColor: 'var(--dyn-card)', 
                    borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                    color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
                  }}
                >
                    <div className="text-xl mb-1">📢</div>
                    Share Code
                </div>
                <div 
                  className="p-3 rounded-lg border" 
                  style={{ 
                    backgroundColor: 'var(--dyn-card)', 
                    borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                    color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
                  }}
                >
                    <div className="text-xl mb-1">👤</div>
                    Friend Joins
                </div>
                <div 
                  className="p-3 rounded-lg border" 
                  style={{ 
                    backgroundColor: 'var(--dyn-card)', 
                    borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                    color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
                  }}
                >
                    <div className="text-xl mb-1">💰</div>
                    Earn Coins
                </div>
            </div>

            <ReferralHistory history={history} isLoading={loading} />
        </div>

        {/* Right Column (Redeem & Info) */}
        <div className="space-y-6">
            <RedeemCode />
            
            <div 
              className="p-4 rounded-xl text-sm" 
              style={{ 
                backgroundColor: 'color-mix(in srgb, #3b82f6 15%, transparent)',
                color: 'color-mix(in srgb, var(--dyn-text) 90%, transparent)' 
              }}
            >
                <h4 className="font-semibold mb-2" style={{ color: '#3b82f6' }}>Rules</h4>
                <ul className="list-disc pl-4 space-y-1 opacity-80 text-xs">
                    <li>Friends must verify phone/email.</li>
                    <li>Max 10 referrals per day.</li>
                    <li>Coins can be used for Premium Exams.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
