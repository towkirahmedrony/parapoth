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
    <div className="grid grid-cols-3 items-center py-3 border-b last:border-0" style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
      <div className="text-center font-bold text-sm font-['Inter']" style={{ color: iWin ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>
        {myValue}{unit}
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--dyn-primary)' }} />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          {label}
        </span>
      </div>
      <div className="text-center font-bold text-sm font-['Inter']" style={{ color: !iWin && !tie ? 'var(--dyn-accent)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>
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
        className="m-4 p-5 rounded-2xl shadow-lg border"
        style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>গেমিং স্ট্যাটস 🎮</h3>
          <p className="text-xs font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>আপনার পিভিপি (PvP) লড়াইয়ের পরিসংখ্যান</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}><Target className="w-5 h-5" style={{ color: 'var(--dyn-primary)' }} /></div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>{theirWinRate}%</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>জয়ের হার</div>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}><Swords className="w-5 h-5" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }} /></div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>{theirStats.pvp_matches_played || 0}</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>মোট ব্যাটল</div>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-3 border col-span-2" style={{ backgroundColor: 'color-mix(in srgb, #EAB308 5%, transparent)', borderColor: 'color-mix(in srgb, #EAB308 20%, transparent)' }}>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, #EAB308 15%, transparent)' }}><Crown className="w-5 h-5" style={{ color: '#EAB308' }} /></div>
            <div>
              <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>{theirStats.pvp_win_streak || 0}</div>
              <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>টানা জয় (PvP)</div>
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
      className="mx-4 mb-4 rounded-2xl shadow-xl border p-5 relative z-20"
      style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
    >
      <div className="flex justify-between items-center mb-4 px-4">
        <span className="text-xs font-bold font-['Inter']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>YOU</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)', color: 'var(--dyn-primary)', borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' }}>VS</span>
        <span className="text-xs font-bold font-['Inter'] uppercase truncate max-w-[80px] text-right" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>{opponentName}</span>
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
