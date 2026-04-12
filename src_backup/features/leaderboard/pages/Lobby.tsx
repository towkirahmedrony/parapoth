import React, { useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { GroupLeaderboard } from '../components/GroupLeaderboard';
import { useSquadLeaderboard } from '../hooks/useLeaderboard';

const Lobby: React.FC = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const { data: squadData, isLoading } = useSquadLeaderboard();

  // Data is already normalized by the hook, safely access my_group directly
  const myGroup = squadData?.my_group;

  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  return (
    <div 
      className="flex flex-col min-h-screen relative pb-20"
      style={{ backgroundColor: 'var(--dyn-bg)' }}
    >
      {/* Header Section */}
      <div 
        className="p-4 shadow-sm flex justify-between items-center border-b sticky top-0 z-10"
        style={{ backgroundColor: 'var(--dyn-card)', borderColor: borderColor }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{myGroup?.icon || '🛡️'}</span>
          <div>
            <h1 className="font-bold text-lg" style={{ color: 'var(--dyn-primary)' }}>
              {myGroup?.name || 'No Squad'}
            </h1>
            <p className="text-xs font-medium" style={{ color: mutedTextColor }}>
              {myGroup ? `Lvl ${myGroup.group_level}` : 'Join a squad to compete'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 20%, transparent)' }}
          >
            <Flame className="w-4 h-4" style={{ color: 'var(--dyn-accent)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--dyn-accent)' }}>12</span>
          </div>
          <button 
            onClick={() => setIsLeaderboardOpen(true)}
            className="p-2 rounded-full hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
          >
            <Trophy className="w-6 h-6" style={{ color: 'var(--dyn-primary)' }} />
          </button>
        </div>
      </div>

      {/* ... (বাকি ট্রায়াঙ্গেল এবং অ্যাকশন বাটন কোড আগের মতোই থাকবে) ... */}
      <div className="p-4 flex-1 flex items-center justify-center">
         <p style={{ color: mutedTextColor }}>Triangle Visualizer active with dynamic theme...</p>
      </div>

      {/* Leaderboard Overlay */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-[100] w-full h-[100dvh]" style={{ backgroundColor: 'var(--dyn-bg)' }}>
          <GroupLeaderboard 
            data={squadData || null}
            isLoading={isLoading}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Lobby;
