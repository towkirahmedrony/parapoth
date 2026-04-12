import React from 'react';
import { GroupLeaderboardResponse, Squad } from '../types/groupLeaderboard';
import { SquadRow } from './SquadRow';
import { NoSquadCTA } from './NoSquadCTA';
import { Trophy, X } from 'lucide-react';

interface GroupLeaderboardProps {
  data: GroupLeaderboardResponse | null;
  isLoading: boolean;
  onClose: () => void;
}

export const GroupLeaderboard: React.FC<GroupLeaderboardProps> = ({ 
  data, 
  isLoading, 
  onClose 
}) => {
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const subtleBg = 'color-mix(in srgb, var(--dyn-text) 5%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  if (isLoading || !data) {
    return (
      <div 
        className="flex flex-col h-full p-8 items-center justify-center"
        style={{ backgroundColor: 'var(--dyn-bg)' }}
      >
        <div 
          className="animate-pulse w-12 h-12 rounded-full mb-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)' }}
        ></div>
        <div style={{ color: mutedTextColor }}>লিডারবোর্ড লোড হচ্ছে...</div>
      </div>
    );
  }

  const { has_group, my_group, top_groups = [] } = data;

  return (
    <div 
      className="flex flex-col h-full overflow-hidden relative"
      style={{ backgroundColor: 'var(--dyn-bg)' }}
    >
      {/* Header */}
      <div 
        className="border-b px-4 py-4 sticky top-0 z-20 flex items-center justify-between"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          borderColor: borderColor 
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: 'var(--dyn-primary)' }} />
          <div>
            <h1 className="font-bold text-lg leading-none" style={{ color: 'var(--dyn-text)' }}>
              সাপ্তাহিক লিডারবোর্ড
            </h1>
            <span className="text-xs mt-1 block" style={{ color: mutedTextColor }}>
              প্যারাপথের অন্যান্য স্কোয়াডের সাথে পাল্লা দিন
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
        >
          <X className="w-5 h-5" style={{ color: mutedTextColor }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Case 1: User has a group */}
        {has_group && my_group && (
          <div 
            className="mb-2 border-b shadow-sm sticky top-0 z-10"
            style={{ 
              backgroundColor: 'var(--dyn-card)',
              borderColor: borderColor 
            }}
          >
            <div 
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: subtleBg, color: mutedTextColor }}
            >
              ⭐ আপনার স্কোয়াড ⭐
            </div>
            <SquadRow squad={my_group} isPinned={true} />
          </div>
        )}

        {/* Top Squads List */}
        <div style={{ backgroundColor: 'var(--dyn-card)' }}>
          <div 
            className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-y"
            style={{ 
              backgroundColor: subtleBg, 
              color: mutedTextColor,
              borderColor: borderColor 
            }}
          >
            👑 শীর্ষ স্কোয়াডগুলো 👑
          </div>
          <div>
            {top_groups.map((squad: Squad) => (
              <SquadRow key={squad.id} squad={squad} />
            ))}
          </div>
        </div>

        {/* Case 2: User does not have a group */}
        {!has_group && <NoSquadCTA />}
      </div>
    </div>
  );
};
