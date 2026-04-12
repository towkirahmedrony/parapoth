import React, { memo } from 'react';
import { Edit3 } from 'lucide-react';
import { UserProfileData } from '../types/profile';
import { PROFILE_DEFAULTS } from '../utils/profileConstants';

interface ProfileHeaderProps {
  user: UserProfileData;
  onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = memo(({ user, onEdit }) => {
  return (
    <div 
      className="pt-8 pb-6 px-4 rounded-b-3xl shadow-sm flex flex-col items-center relative z-10 transition-all duration-300"
      style={{ backgroundColor: 'var(--dyn-card)' }}
    >
      <div className="relative">
        <img 
          src={user?.avatar_url || PROFILE_DEFAULTS.AVATAR_URL} 
          alt={user?.full_name || PROFILE_DEFAULTS.NAME} 
          className="w-24 h-24 rounded-full object-cover shadow-md"
          style={{ border: '4px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        />
        {user?.subscription_status === 'active' && (
          <span 
            className="absolute bottom-0 right-0 text-[10px] font-bold px-2 py-0.5 rounded-full border-2"
            style={{ 
              backgroundColor: 'var(--dyn-primary)', 
              color: 'var(--dyn-card)',
              borderColor: 'var(--dyn-card)'
            }}
          >
            PRO
          </span>
        )}
      </div>
      
      <div className="text-center mt-3">
        <h1 
          className="text-xl font-bold flex items-center justify-center gap-1"
          style={{ color: 'var(--dyn-text)' }}
        >
          {user?.full_name || PROFILE_DEFAULTS.NAME}
          {user?.is_phone_verified && (
            <span className="text-xs" style={{ color: 'var(--dyn-primary)' }} title="Verified Phone">✅</span>
          )}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          {user?.institution || "Add your institution"}
        </p>
      </div>

      <button 
        onClick={onEdit}
        className="mt-5 flex items-center gap-2 px-6 py-2 text-sm rounded-full font-semibold shadow-lg transition-all active:scale-95 hover:[background-color:color-mix(in_srgb,var(--dyn-primary)_80%,#000)]"
        style={{ 
          backgroundColor: 'var(--dyn-primary)', 
          color: 'var(--dyn-card)' 
        }}
      >
        <Edit3 size={16} />
        Edit Profile
      </button>
    </div>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
