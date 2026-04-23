import React from 'react';
import { Squad } from '../types/groupLeaderboard';

interface SquadRowProps {
  squad: Squad;
  isPinned?: boolean;
}

export const SquadRow: React.FC<SquadRowProps> = ({ squad, isPinned = false }) => {
  const getMedal = (rank: number): React.ReactNode => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="font-bold text-sm w-6 text-center text-text-secondary">{rank}</span>;
  };

  return (
    <div 
      className={`flex items-center p-4 border-b last:border-0 border-border-color ${
        isPinned ? 'bg-app border-l-4 border-l-primary' : 'bg-card-bg border-l-0'
      }`}
    >
      <div className="w-8 flex justify-center items-center mr-3 text-xl">
        {getMedal(squad.rank)}
      </div>
      
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4 bg-secondary">
        {squad.icon || '🛡️'}
      </div>
      
      <div className="flex-1">
        <h3 className={`font-bold ${isPinned ? 'text-primary' : 'text-text-primary'}`}>
          {squad.name}
        </h3>
        <p className="text-xs text-text-secondary">লেভেল {squad.group_level ?? 1}</p>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-text-primary">
          {(squad.total_xp ?? 0).toLocaleString()}
        </div>
        <div className="text-xs text-text-secondary">XP</div>
      </div>
    </div>
  );
};
