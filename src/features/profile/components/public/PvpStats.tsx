import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Crown, Target, LucideIcon } from 'lucide-react';

interface Stats {
  pvp_matches_played?: number | null;
  pvp_matches_won?: number | null;
  pvp_win_streak?: number | null;
}

interface PvpStatsProps {
  myStats?: Stats | null;
  theirStats: Stats;
  opponentName: string;
  isOwnProfile?: boolean;
}

interface StatRowProps {
  icon: LucideIcon;
  label: string;
  myValue: number;
  theirValue: number;
  unit?: string;
}

const StatRow: React.FC<StatRowProps> = ({ icon: Icon, label, myValue, theirValue, unit = '' }) => {
  const iWin = myValue > theirValue;
  const tie = myValue === theirValue;

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-border-color last:border-0">
      <div className={`text-center font-bold text-sm font-['Inter'] ${iWin ? 'text-primary' : 'text-text-secondary'}`}>
        {myValue}{unit}
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-surface">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider font-['Hind_Siliguri'] text-text-secondary">
          {label}
        </span>
      </div>
      <div className={`text-center font-bold text-sm font-['Inter'] ${!iWin && !tie ? 'text-accent' : 'text-text-secondary'}`}>
        {theirValue}{unit}
      </div>
    </div>
  );
};

const PvpStats: React.FC<PvpStatsProps> = ({ myStats, theirStats, opponentName, isOwnProfile }) => {
  const theirWinRate = theirStats.pvp_matches_played ? Math.round(((theirStats.pvp_matches_won || 0) / theirStats.pvp_matches_played) * 100) : 0;
  
  // 🟢 যদি নিজের প্রোফাইল হয়, তবে সাধারণ গ্রিড দেখাবে
  if (isOwnProfile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="m-4 p-5 rounded-2xl shadow-lg border bg-card-bg border-card-border"
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold font-['Hind_Siliguri'] text-text-primary">গেমিং স্ট্যাটস 🎮</h3>
          <p className="text-xs font-['Hind_Siliguri'] text-text-secondary">আপনার পিভিপি (PvP) লড়াইয়ের পরিসংখ্যান</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl flex items-center gap-3 border bg-surface border-border-color">
            <div className="p-2 rounded-full bg-surface-elevated">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none text-text-primary">{theirWinRate}%</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri'] text-text-secondary">জয়ের হার</div>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-3 border bg-surface border-border-color">
            <div className="p-2 rounded-full bg-surface-elevated">
              <Swords className="w-5 h-5 text-text-secondary" />
            </div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none text-text-primary">{theirStats.pvp_matches_played || 0}</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri'] text-text-secondary">মোট ব্যাটল</div>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-3 border col-span-2 bg-surface border-border-color">
            <div className="p-2 rounded-full bg-surface-elevated">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none text-text-primary">{theirStats.pvp_win_streak || 0}</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri'] text-text-secondary">টানা জয় (PvP)</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // 🟢 অন্যের প্রোফাইল হলে আপনার সাথে তুলনা করে দেখাবে
  const myWinRate = myStats?.pvp_matches_played ? Math.round(((myStats.pvp_matches_won || 0) / myStats.pvp_matches_played) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-4 mb-4 rounded-2xl shadow-xl border p-5 relative z-20 bg-card-bg border-card-border"
    >
      <div className="flex justify-between items-center mb-4 px-4">
        <span className="text-xs font-bold font-['Inter'] text-text-secondary">YOU</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full border bg-badge-bg text-badge-text border-border-color">VS</span>
        <span className="text-xs font-bold font-['Inter'] uppercase truncate max-w-[80px] text-right text-text-secondary">{opponentName}</span>
      </div>

      <div className="space-y-1">
        <StatRow icon={Swords} label="মোট ব্যাটল" myValue={myStats?.pvp_matches_played || 0} theirValue={theirStats.pvp_matches_played || 0} />
        <StatRow icon={Target} label="জয়ের হার" myValue={myWinRate} theirValue={theirWinRate} unit="%" />
        <StatRow icon={Crown} label="টানা জয়" myValue={myStats?.pvp_win_streak || 0} theirValue={theirStats.pvp_win_streak || 0} />
        <StatRow icon={Trophy} label="মোট জয়" myValue={myStats?.pvp_matches_won || 0} theirValue={theirStats.pvp_matches_won || 0} />
      </div>
    </motion.div>
  );
};

export default PvpStats;
