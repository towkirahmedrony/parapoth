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
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--dyn-primary)' }} />
        </div>
        <span 
          className="text-[10px] uppercase font-bold tracking-wider font-['Hind_Siliguri']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          {label}
        </span>
      </div>

      <div 
        className="text-center font-bold text-sm font-['Inter']"
        style={{ color: !iWin && !tie ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
      >
        {theirValue}{unit}
      </div>
    </div>
  );
};

const VersusStats: React.FC<VersusStatsProps> = ({ stats }) => {
  const { my_stats, their_stats } = stats;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-4 -mt-6 rounded-2xl shadow-xl border p-5 relative z-20"
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
        <span 
          className="text-xs font-bold font-['Inter']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          THEM
        </span>
      </div>

      <div className="space-y-1">
        <StatRow icon={Trophy} label="XP" myValue={my_stats.total_xp} theirValue={their_stats.total_xp} />
        <StatRow icon={Target} label="সঠিকতা" myValue={my_stats.accuracy} theirValue={their_stats.accuracy} unit="%" />
        <StatRow icon={Flame} label="স্ট্রিক" myValue={my_stats.current_streak} theirValue={their_stats.current_streak} unit="d" />
        <StatRow icon={BookOpen} label="এক্সাম" myValue={my_stats.total_exams} theirValue={their_stats.total_exams} />
      </div>
    </motion.div>
  );
};

export default memo(VersusStats);
