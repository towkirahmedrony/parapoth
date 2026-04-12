import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords } from 'lucide-react';
import { PROFILE_DEFAULTS } from '../../utils/profileConstants';

// DB 'profiles' টেবিলের সাথে সামঞ্জস্যপূর্ণ টাইপ
export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  batch_year: string | null;
  bio: string | null;
  total_xp: number | null;
  pvp_rating: number | null;
}

interface ProfileHeroProps {
  profile: PublicProfile;
  onChallenge: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ profile, onChallenge }) => {
  return (
    <div 
      className="relative pb-8 pt-6 px-4 overflow-hidden rounded-b-[2rem] border-b"
      style={{ 
        backgroundColor: 'var(--dyn-bg)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      {/* Background Glows */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}
      ></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Avatar with Rating Ring */}
        <div className="relative mb-4 group">
          <div 
            className="w-28 h-28 rounded-full p-[3px]"
            style={{ backgroundImage: 'linear-gradient(to top right, var(--dyn-primary), var(--dyn-accent))' }}
          >
            <img 
              src={profile.avatar_url || PROFILE_DEFAULTS.AVATAR_URL} 
              alt={profile.full_name || PROFILE_DEFAULTS.NAME} 
              className="w-full h-full rounded-full object-cover border-4"
              style={{ 
                borderColor: 'var(--dyn-bg)', 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
              }}
            />
          </div>
          {/* Rating Badge (DB: pvp_rating) */}
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 border text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg whitespace-nowrap"
            style={{ 
              backgroundColor: 'var(--dyn-card)',
              borderColor: 'color-mix(in srgb, var(--dyn-accent) 20%, transparent)',
              color: 'var(--dyn-accent)'
            }}
          >
            <Shield className="w-3 h-3 mr-1" style={{ fill: 'var(--dyn-accent)' }} />
            <span className="font-['Hind_Siliguri']">Rating: {profile.pvp_rating || PROFILE_DEFAULTS.RATING}</span>
          </div>
        </div>

        {/* Database aligned fields */}
        <h1 
          className="text-2xl font-bold mb-1 font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-text)' }}
        >
          {profile.full_name || PROFILE_DEFAULTS.NAME}
        </h1>
        <p 
          className="text-sm mb-5 font-['Hind_Siliguri']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          {profile.batch_year || PROFILE_DEFAULTS.BATCH} • {profile.bio || PROFILE_DEFAULTS.BIO}
        </p>

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onChallenge}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full font-bold shadow-lg transition-all font-['Hind_Siliguri']"
          style={{ 
            backgroundColor: 'var(--dyn-primary)', 
            color: '#ffffff', // Stable text for primary action buttons 
            boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--dyn-primary) 30%, transparent)'
          }}
        >
          <Swords className="w-5 h-5" />
          চ্যালেঞ্জ দিন
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfileHero;
