import React from 'react';
import { Users, Plus } from 'lucide-react';

interface NoSquadCTAProps {
  onJoin?: () => void;
  onCreate?: () => void;
}

export const NoSquadCTA: React.FC<NoSquadCTAProps> = ({ onJoin, onCreate }) => {
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const subtleBg = 'color-mix(in srgb, var(--dyn-text) 5%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  return (
    <div 
      className="border rounded-xl p-6 m-4 text-center mt-6 shadow-sm"
      style={{ backgroundColor: 'var(--dyn-card)', borderColor: borderColor }}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: subtleBg }}
      >
        <Users className="w-6 h-6" style={{ color: mutedTextColor }} />
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--dyn-text)' }}>
        You're not in a squad yet
      </h3>
      <p className="text-sm mb-6" style={{ color: mutedTextColor }}>
        Join or create a squad to compete, earn XP, and climb the leaderboard together.
      </p>
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={onJoin}
          className="font-bold py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
        >
          <Users className="w-4 h-4" />
          Join a Squad
        </button>
        <button 
          onClick={onCreate}
          className="font-semibold py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 border transition-colors hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
          style={{ 
            backgroundColor: subtleBg, 
            color: 'var(--dyn-text)',
            borderColor: borderColor
          }}
        >
          <Plus className="w-4 h-4" />
          Create a Squad
        </button>
      </div>
    </div>
  );
};
