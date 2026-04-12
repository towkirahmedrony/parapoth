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
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const subtleBg = 'color-mix(in srgb, var(--dyn-text) 5%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  return (
    <div 
      className="border-b p-4 flex items-center justify-between sticky top-0 z-10"
      style={{ backgroundColor: 'var(--dyn-card)', borderColor: borderColor }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: subtleBg }}
        >
          <Shield className="w-6 h-6" style={{ color: mutedTextColor }} />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight" style={{ color: 'var(--dyn-text)' }}>
            {groupName || 'প্যারাপথ লবি'}
          </h2>
          {groupLevel && (
            <p className="text-sm" style={{ color: mutedTextColor }}>লেভেল {groupLevel} স্কোয়াড</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={onTrophyClick}
        className="p-2 rounded-full transition-colors hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
        aria-label="লিডারবোর্ড খুলুন"
      >
        <Trophy className="w-6 h-6" style={{ color: 'var(--dyn-primary)' }} />
      </button>
    </div>
  );
};
