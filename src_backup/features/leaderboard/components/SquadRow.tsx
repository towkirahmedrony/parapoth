import React from 'react';
import { Squad } from '../types/groupLeaderboard';

interface SquadRowProps {
  squad: Squad;
  isPinned?: boolean;
}

export const SquadRow: React.FC<SquadRowProps> = ({ squad, isPinned = false }) => {
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const subtleBg = 'color-mix(in srgb, var(--dyn-text) 5%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  const getMedal = (rank: number): React.ReactNode => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="font-bold text-sm w-6 text-center" style={{ color: mutedTextColor }}>{rank}</span>;
  };

  return (
    <div 
      className="flex items-center p-4 border-b last:border-0"
      style={{ 
        backgroundColor: isPinned ? 'var(--dyn-bg)' : 'var(--dyn-card)',
        borderColor: borderColor,
        borderLeft: isPinned ? '4px solid var(--dyn-primary)' : 'none'
      }}
    >
      <div className="w-8 flex justify-center items-center mr-3 text-xl">
        {getMedal(squad.rank)}
      </div>
      
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4"
        style={{ backgroundColor: subtleBg }}
      >
        {squad.icon || '🛡️'}
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold" style={{ color: isPinned ? 'var(--dyn-primary)' : 'var(--dyn-text)' }}>
          {squad.name}
        </h3>
        <p className="text-xs" style={{ color: mutedTextColor }}>Level {squad.group_level ?? 1}</p>
      </div>
      
      <div className="text-right">
        <div className="font-bold" style={{ color: 'var(--dyn-text)' }}>
          {(squad.total_xp ?? 0).toLocaleString()}
        </div>
        <div className="text-xs" style={{ color: mutedTextColor }}>XP</div>
      </div>
    </div>
  );
};
