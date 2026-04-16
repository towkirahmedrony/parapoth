import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Swords, Trophy, Crown } from 'lucide-react';

interface PvpStatsProps {
  stats: {
    current_streak?: number | null;
    pvp_matches_played?: number | null;
    pvp_matches_won?: number | null;
    pvp_win_streak?: number | null;
  };
}

const PvpStats: React.FC<PvpStatsProps> = ({ stats }) => {
  const winRate = stats.pvp_matches_played 
    ? Math.round(((stats.pvp_matches_won || 0) / stats.pvp_matches_played) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="m-4 p-5 rounded-2xl shadow-lg border"
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>
          গেমিং স্ট্যাটস 🎮
        </h3>
        <p className="text-xs font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          অধ্যবসায় এবং পিভিপি (PvP) লড়াইয়ের পরিসংখ্যান
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Streak Card */}
        <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)' }}>
          <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)' }}>
            <Flame className="w-5 h-5" style={{ color: 'var(--dyn-accent)' }} />
          </div>
          <div>
            <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>
              {stats.current_streak || 0} <span className="text-xs font-normal">দিন</span>
            </div>
            <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>বর্তমান স্ট্রিক</div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}>
          <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}>
            <Trophy className="w-5 h-5" style={{ color: 'var(--dyn-primary)' }} />
          </div>
          <div>
            <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>
              {winRate}%
            </div>
            <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>জয়ের হার</div>
          </div>
        </div>

        {/* Total Matches */}
        <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
          <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
            <Swords className="w-5 h-5" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }} />
          </div>
          <div>
            <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>
              {stats.pvp_matches_played || 0}
            </div>
            <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>মোট ব্যাটল</div>
          </div>
        </div>

        {/* Win Streak */}
        <div className="p-3 rounded-xl flex items-center gap-3 border" style={{ backgroundColor: 'color-mix(in srgb, #EAB308 5%, transparent)', borderColor: 'color-mix(in srgb, #EAB308 20%, transparent)' }}>
          <div className="p-2 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, #EAB308 15%, transparent)' }}>
            <Crown className="w-5 h-5" style={{ color: '#EAB308' }} />
          </div>
          <div>
            <div className="text-xl font-bold font-['Inter'] leading-none" style={{ color: 'var(--dyn-text)' }}>
              {stats.pvp_win_streak || 0}
            </div>
            <div className="text-[10px] font-bold font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>টানা জয় (PvP)</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PvpStats;
