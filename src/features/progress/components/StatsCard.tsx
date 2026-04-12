import React from 'react';
import { Trophy, Target, Clock, LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

interface StatsCardProps {
  stats?: StatItem[];
}

const DEFAULT_STATS: StatItem[] = [
  { label: 'Exams Taken', value: '0', icon: Target },
  { label: 'Avg Score', value: '0%', icon: Trophy },
  { label: 'Time Spent', value: '0h', icon: Clock },
];

const StatsCard: React.FC<StatsCardProps> = ({ stats = DEFAULT_STATS }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center"
          style={{ 
            backgroundColor: 'var(--dyn-card)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <div 
            className="p-2 rounded-full mb-2"
            style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}
          >
            <stat.icon size={18} style={{ color: 'var(--dyn-primary)' }} />
          </div>
          <h4 className="text-lg font-bold" style={{ color: 'var(--dyn-text)' }}>{stat.value}</h4>
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
