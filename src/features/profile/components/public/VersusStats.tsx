import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, BookOpen, LucideIcon } from 'lucide-react';

export interface PlayerStats {
  total_xp: number;         
  accuracy: number;         
  current_streak: number;   
  total_exams: number;      
}

interface VersusStatsProps {
  stats: {
    my_stats: PlayerStats;
    their_stats: PlayerStats;
  };
  opponentName?: string;
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
    <div 
      className="grid grid-cols-3 items-center py-3 border-b last:border-0"
      style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
    >
      <div 
        className="text-center font-bold text-sm font-['Inter']"
        style={{ color: iWin ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
      >
        {myValue}{unit}
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <Icon className="w-4 h-4 mb-1" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} />
        <span className="text-[10px] font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{label}</span>
      </div>

      <div 
        className="text-center font-bold text-sm font-['Inter']"
        style={{ color: (!iWin && !tie) ? 'var(--dyn-accent)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
      >
        {theirValue}{unit}
      </div>
    </div>
  );
};

const VersusStats: React.FC<VersusStatsProps> = ({ stats, opponentName }) => {
  const { my_stats, their_stats } = stats;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 -mt-6 relative z-10 rounded-2xl p-5 border shadow-xl"
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex justify-between items-center mb-4 px-4">
        <span 
          className="text-xs font-bold font-['Inter']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          YOU
        </span>
        <span 
          className="text-xs font-bold px-3 py-1 rounded-full border"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)', 
            color: 'var(--dyn-primary)',
            borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)'
          }}
        >
          VS
        </span>
        {/* 🟢 THEM এর পরিবর্তে আসল নাম */}
        <span 
          className="text-xs font-bold font-['Inter'] uppercase truncate max-w-[80px] text-right"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          {opponentName || 'THEM'}
        </span>
      </div>

      <div className="space-y-1">
        <StatRow icon={Trophy} label="XP" myValue={my_stats?.total_xp || 0} theirValue={their_stats?.total_xp || 0} />
        <StatRow icon={Target} label="সঠিকতা" myValue={my_stats?.accuracy || 0} theirValue={their_stats?.accuracy || 0} unit="%" />
        <StatRow icon={Flame} label="স্ট্রিক" myValue={my_stats?.current_streak || 0} theirValue={their_stats?.current_streak || 0} />
        <StatRow icon={BookOpen} label="পরীক্ষা" myValue={my_stats?.total_exams || 0} theirValue={their_stats?.total_exams || 0} />
      </div>
    </motion.div>
  );
};

export default memo(VersusStats);
