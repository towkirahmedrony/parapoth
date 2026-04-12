import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { LeaderboardUser } from '../types/leaderboard';

interface Props {
  user: LeaderboardUser; 
  index: number;
  isFooter?: boolean;
}

export const UserRow: React.FC<Props> = ({ user, index, isFooter = false }) => {
  const navigate = useNavigate();
  
  if (!user) return null;
  const isTop3 = user.rank <= 3 && !isFooter;

  const handleProfileClick = () => {
    if (user.is_current_user) {
      navigate('/profile');
    } else {
      const target = user.username || user.id;
      navigate(`/profile/view/${target}`);
    }
  };

  const displayName = user.full_name || 'Unknown User';
  
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';
  
  const userRowBg = isFooter 
    ? 'transparent' 
    : user.is_current_user 
      ? 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)' 
      : 'var(--dyn-card)';

  const userRowShadow = user.is_current_user && !isFooter 
    ? `0 0 0 1px color-mix(in srgb, var(--dyn-primary) 30%, transparent)` 
    : 'none';

  const rankColors: Record<number, string> = {
    1: '#EAB308', // Gold
    2: '#94A3B8', // Silver
    3: '#C2410C', // Bronze
  };

  const getRankColor = (rank: number) => rankColors[rank] || undefined;

  return (
    <motion.div 
      onClick={handleProfileClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isFooter ? 0 : index * 0.03 }}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors border hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
      style={{ 
        backgroundColor: userRowBg,
        borderColor: borderColor,
        boxShadow: userRowShadow
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative">
            <div 
              className="w-9 h-9 rounded-full p-[1.5px] flex items-center justify-center"
              style={{ 
                backgroundColor: isTop3 ? getRankColor(user.rank) : 'color-mix(in srgb, var(--dyn-text) 15%, transparent)' 
              }}
            >
                <img 
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
                    alt={`${displayName} avatar`}
                    className="w-full h-full rounded-full object-cover" 
                    style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
                />
            </div>
            {isTop3 && (
                <div 
                  className="absolute -top-1 -right-1 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border"
                  style={{ 
                    backgroundColor: 'var(--dyn-card)', 
                    color: 'var(--dyn-text)',
                    borderColor: borderColor
                  }}
                >
                    {user.rank}
                </div>
            )}
        </div>

        <div className="flex flex-col min-w-0">
            <span 
              className="text-xs font-semibold truncate" 
              style={{ color: user.is_current_user ? 'var(--dyn-primary)' : 'var(--dyn-text)' }}
            >
                {displayName}
            </span>
            <span className="text-[9px] truncate max-w-[100px]" style={{ color: mutedTextColor }}>
                {user.institution || 'Student'}
            </span>
        </div>
      </div>

      <div className="flex flex-col items-end min-w-[50px]">
        {!isTop3 && (
            <span className="text-lg font-bold font-['Inter'] leading-none mb-0.5" style={{ color: mutedTextColor }}>
                {user.rank}
            </span>
        )}
        {isTop3 && (
            <Crown 
              className="w-4 h-4 mb-0.5" 
              style={{ color: getRankColor(user.rank) }} 
            />
        )}
        <span className="text-[9px] font-medium" style={{ color: mutedTextColor }}>{user.total_score || 0} XP</span>
      </div>
    </motion.div>
  );
};
