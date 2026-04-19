import React, { memo } from 'react';
import { Edit3, Coins, ShieldCheck } from 'lucide-react';
import { UserProfileData } from '../types/profile';
import { PROFILE_DEFAULTS } from '../utils/profileConstants';

interface ProfileHeaderProps {
  user: UserProfileData | any; 
  onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = memo(({ user, onEdit }) => {
  const userCoins = user?.coin_balance || 0;
  
  // Data fallbacks
  const fullName = user?.full_name || user?.user_metadata?.full_name || PROFILE_DEFAULTS.NAME;
  const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url || PROFILE_DEFAULTS.AVATAR_URL;
  const bio = user?.bio || "আপনার সম্পর্কে কিছু লিখুন...";

  return (
    <div 
      className="relative pt-10 pb-8 px-6 rounded-3xl shadow-sm flex flex-col items-center overflow-hidden transition-all duration-300"
      style={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
    >
      {/* Background Subtle Gradient */}
      <div 
        className="absolute top-0 left-0 w-full h-24 opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--dyn-primary), transparent)' }}
      />

      {/* Coin Badge - Moved to Top Right corner */}
      <div 
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm font-['Hind_Siliguri']"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
          color: 'var(--dyn-text)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Coins size={14} style={{ color: '#F59E0B' }} />
        <span>{userCoins}</span>
      </div>

      <div className="relative z-10 mt-2">
        <div className="relative p-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' }}>
          <img 
            src={avatarUrl} 
            alt={fullName} 
            className="w-24 h-24 rounded-full object-cover shadow-md border-4"
            style={{ borderColor: 'var(--dyn-card)' }}
          />
          {user?.subscription_status === 'active' && (
            <span 
              className="absolute bottom-1 right-0 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 shadow-sm"
              style={{ 
                backgroundColor: 'var(--dyn-primary)', 
                color: 'white',
                borderColor: 'var(--dyn-card)'
              }}
            >
              PRO
            </span>
          )}
        </div>
      </div>
      
      <div className="text-center mt-4 relative z-10">
        <h1 
          className="text-2xl font-bold flex items-center justify-center gap-2 font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-text)' }}
        >
          {fullName}
          {user?.is_phone_verified && (
            <span title="ভেরিফাইড" className="inline-flex">
              <ShieldCheck size={18} className="text-green-500" />
            </span>
          )}
        </h1>
        <p className="text-sm mt-1 font-['Hind_Siliguri'] font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          {bio}
        </p>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4 mt-6 relative z-10 w-full justify-center">
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-8 py-2.5 text-sm rounded-2xl font-bold shadow-md transition-all active:scale-95 hover:opacity-90 font-['Hind_Siliguri']"
          style={{ 
            backgroundColor: 'var(--dyn-primary)', 
            color: 'white' 
          }}
        >
          <Edit3 size={16} />
          এডিট প্রোফাইল
        </button>
      </div>
    </div>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
