import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Info } from 'lucide-react';
import { ReferralHero } from '../components/ReferralHero';
import { RedeemCode } from '../components/RedeemCode';
import { ReferralHistory } from '../components/ReferralHistory';
import { HowItWorks } from '../components/HowItWorks';
import { ReferralStatsOverview } from '../components/ReferralStatsOverview';
import { referralService } from '../services/referralService';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';

// ডাটাবেজ থেকে ডায়নামিক কয়েন রুলস লোড করা
const fetchXPRules = async () => {
  const { data, error } = await supabase
    .from('app_configs')
    .select('value')
    .eq('key', 'xp_rules')
    .single();
    
  if (error) return { signup_bonus: 50, referral_bonus_referrer: 200, referral_bonus_referee: 100 }; // Fallback
  return data.value as { signup_bonus: number, referral_bonus_referrer: number, referral_bonus_referee: number };
};

const ReferralPage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referralStats', user?.id],
    queryFn: () => referralService.getStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['referralHistory', user?.id],
    queryFn: () => referralService.getHistory(user!.id),
    enabled: !!user?.id,
  });

  const { data: xpRules } = useQuery({
    queryKey: ['xpRules'],
    queryFn: fetchXPRules,
  });

  const referrerBonus = xpRules?.referral_bonus_referrer || 200;
  const refereeBonus = xpRules?.referral_bonus_referee || 100;

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-6 space-y-5 pb-24 bg-[var(--dyn-bg)] text-[var(--dyn-text)] min-h-screen">
      
      {/* Page Header */}
      <header className="max-w-2xl mb-2">
        <h1 className="text-2xl font-bold tracking-tight mb-1">রেফার ও আয় করুন</h1>
        <p className="text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)] text-sm">
          বন্ধুদের আমন্ত্রণ জানান, তাদের অ্যাকাউন্টে বোনাস দিন এবং নিজেও জিতে নিন প্রিমিয়াম লার্নিং কয়েন।
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-5">
          <ReferralHero 
            code={stats?.referralCode || ''} 
            isLoading={isLoadingStats}
            refereeBonus={refereeBonus}
          />
          
          <ReferralStatsOverview 
            totalEarned={stats?.totalEarned || 0} 
            totalReferrals={stats?.totalReferrals || 0}
            isLoading={isLoadingStats}
          />

          <HowItWorks 
            referrerBonus={referrerBonus} 
            refereeBonus={refereeBonus} 
          />
          
          <ReferralHistory history={history} isLoading={isLoadingHistory} />
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-5">
          <RedeemCode />
          
          {/* Minimal Rules Section */}
          <div className="p-4 rounded-xl bg-[var(--dyn-card)] border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-[var(--dyn-text)]">সাধারণ নিয়মাবলী</h4>
            </div>
            <ul className="space-y-2 text-xs text-[color-mix(in_srgb,var(--dyn-text)_70%,transparent)]">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>রিওয়ার্ড পেতে বন্ধুদের অবশ্যই অ্যাকাউন্ট ভেরিফাই করতে হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>প্রতিদিন সর্বোচ্চ ১০ জনকে রেফার করা যাবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>ফেক অ্যাকাউন্ট খুললে আপনাকে প্ল্যাটফর্ম থেকে ব্যান করা হতে পারে।</span>
              </li>
            </ul>
          </div>

          {/* Minimal Support Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[color-mix(in_srgb,var(--dyn-text)_3%,transparent)] text-xs text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)]">
            <Info className="w-4 h-4 shrink-0" />
            <p>রেফারেল কয়েন যুক্ত না হলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReferralPage;
