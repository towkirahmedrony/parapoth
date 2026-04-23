import React from 'react';
import { Trophy, Shield } from 'lucide-react';

interface LobbyHeaderProps {
  groupName?: string;
  groupLevel?: number;
  onTrophyClick: () => void;
}

export const LobbyHeader: React.FC<LobbyHeaderProps> = ({ 
  groupName, 
  groupLevel, 
  onTrophyClick 
}) => {
  return (
    <div className="bg-card-bg border-b border-border-color p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-surface border border-border-color w-10 h-10 rounded-full flex items-center justify-center">
          <Shield className="text-text-secondary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-text-primary font-bold text-lg leading-tight">
            {groupName || 'প্যারাপথ লবি'}
          </h2>
          {groupLevel && (
            <p className="text-text-secondary text-sm">লেভেল {groupLevel} স্কোয়াড</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={onTrophyClick}
        className="hover:bg-surface-elevated p-2 rounded-full transition-colors"
        aria-label="লিডারবোর্ড খুলুন"
      >
        <Trophy className="text-primary w-6 h-6" />
      </button>
    </div>
  );
};
