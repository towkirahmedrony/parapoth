import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProfileHeader from '../components/ProfileHeader';
import { InfoCard, InfoRow } from '../components/InfoCard';
import MenuSection from '../components/MenuSection';
import { UserProfileData } from '../types/profile';
import { supabase } from '../../../shared/lib/supabase';
import { ProfileSkeleton } from '../components/public/ProfileSkeleton';
import { BackButton } from '../../../shared/components/ui/BackButton';

// --- Services & Constants ---
import { QUERY_KEYS } from '../../../shared/constants/storageKeys';
import { getCurrentUserProfile } from '../services/profileService';

const APP_VERSION = 'ParaPoth v5.0.0 (Supreme)';
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

interface ExtendedUserProfile extends UserProfileData {
  username?: string | null;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  // Fetches user profile using React Query and Centralized Services
  const { data: user, isLoading } = useQuery<ExtendedUserProfile | null>({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: async () => {
      // 1. Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth Error:", authError.message);
        return null;
      }
      if (!authUser) return null;

      try {
        // 2. Fetch profile from centralized service
        const profileData = await getCurrentUserProfile(authUser.id);

        // Safe typing for JSON/JSONB address field
        const addressData = profileData.address as Record<string, string> | null;

        // 3. Map to UI data structure
        return {
          id: profileData.id,
          username: profileData.username || null,
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          avatar_url: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileData.full_name || 'User')}`,
          institution: profileData.institution || '',
          class_level: profileData.class_level || '',
          group: profileData.group || '',
          education_board: profileData.education_board || '',
          batch_year: profileData.batch_year || '',
          study_goal: profileData.study_goal || '',
          bio: profileData.bio || '',
          phone_number: profileData.phone_number || '',
          is_phone_verified: profileData.is_phone_verified || false,
          guardian_phone: profileData.guardian_phone || '',
          gender: profileData.gender || '',
          address: addressData || { full_address: '' }, 
          subscription_status: profileData.subscription_status || 'inactive', 
          role: 'student' 
        };
      } catch (error: any) {
        console.error("Profile Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: STALE_TIME_MS,
  });

  const handleEditClick = () => {
    if (user) {
      // Navigate to the Edit Profile page and pass the structured user data
      navigate('/edit-profile', { state: { user } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 relative" style={{ backgroundColor: 'var(--dyn-bg)' }}>
        <div className="absolute top-4 left-4 z-50">
          <BackButton />
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: 'var(--dyn-bg)' }}>
        <div className="absolute top-4 left-4 z-50">
          <BackButton />
        </div>
        <p className="font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          দয়া করে লগ ইন করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative" style={{ backgroundColor: 'var(--dyn-bg)' }}>
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      <ProfileHeader 
        user={user} 
        onEdit={handleEditClick} 
      />

      <div className="px-4 mt-6 space-y-4 max-w-2xl mx-auto">
        <InfoCard title="Academic Information" icon={<span className="text-lg">🎓</span>}>
            <InfoRow label="Class & Group" value={`${user.class_level || 'N/A'} | ${user.group || 'N/A'}`} />
            <InfoRow label="Target" value={user.study_goal || 'N/A'} />
            <InfoRow label="Board" value={user.education_board || 'N/A'} />
        </InfoCard>

        <InfoCard title="Contact Details" icon={<span className="text-lg">📞</span>}>
            <InfoRow label="Username" value={user.username ? `@${user.username}` : 'Not set'} />
            <InfoRow label="Phone" value={user.phone_number || 'N/A'} isVerified={user.is_phone_verified} />
            <InfoRow label="Email" value={user.email || 'N/A'} />
            {user.guardian_phone && <InfoRow label="Guardian" value={user.guardian_phone} />}
        </InfoCard>

        <div className="mt-8">
            <h3 
              className="text-xs font-bold uppercase tracking-wider mb-3 ml-1"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
            >
              Settings & Support
            </h3>
            <MenuSection />
        </div>

        <div className="text-center py-6">
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>
              {APP_VERSION}
            </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
