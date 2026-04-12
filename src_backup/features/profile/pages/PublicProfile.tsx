import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProfileHero from '../components/public/ProfileHero';
import VersusStats from '../components/public/VersusStats';
import ActivityChart from '../components/public/ActivityChart';
import BadgeShowcase from '../components/public/BadgeShowcase';
import { ChevronLeft } from 'lucide-react';
import { ProfileSkeleton } from '../components/public/ProfileSkeleton';
import { ChallengeSetupModal } from '../../exam/components/ChallengeSetupModal';
import { getPublicProfileData, PublicProfileResponse } from '../services/profileService';
import { useAuth } from '../../auth/hooks/useAuth';

// Lottie Import
import Lottie from 'lottie-react';
import userNotFoundAnimation from '../../../assets/animations/user-not-found.json';

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user for x-user-id header
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Replace custom usePublicProfile with robust React Query implementation
  const { 
    data: profileData, 
    isLoading: loading, 
    error: queryError 
  } = useQuery<PublicProfileResponse, Error>({
    queryKey: ['publicProfile', id, user?.id],
    queryFn: () => getPublicProfileData(id as string, user?.id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });

  const error = queryError?.message;

  // useCallback for performance optimization
  const handleChallenge = useCallback(() => {
    setIsChallengeModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsChallengeModalOpen(false);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Error or Not Found State
  if (error || !profileData || !profileData.profile) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500"
        style={{ backgroundColor: 'var(--dyn-bg)' }}
      >
        {/* Lottie Animation */}
        <div className="w-64 h-64 mb-4">
          <Lottie animationData={userNotFoundAnimation} loop={true} />
        </div>
        
        {/* Error Message */}
        <p 
          className="font-['Hind_Siliguri'] text-lg font-medium mb-6"
          style={{ color: 'var(--dyn-text)' }}
        >
          {error || 'দুঃখিত, এই ইউজারকে খুঁজে পাওয়া যায়নি।'}
        </p>
        
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full font-['Hind_Siliguri'] transition-all shadow-md active:scale-95 hover:[background-color:color-mix(in_srgb,var(--dyn-primary)_80%,#000)]"
          style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-card)' }}
        >
          <ChevronLeft className="w-5 h-5" />
          ফিরে যান
        </button>
      </div>
    );
  }

  // Data Extraction (Safely typed now)
  const { profile, versusStats, activityData } = profileData;

  return (
    <div 
      className="min-h-screen pb-10 animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--dyn-bg)' }}
    >
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 z-20 p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-card) 70%, transparent)', 
          color: 'var(--dyn-text)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <ProfileHero profile={profile} onChallenge={handleChallenge} />

      {/* Conditional rendering for robust UI */}
      {versusStats && <VersusStats stats={versusStats} />}

      {activityData && (
        <ActivityChart 
          data={activityData} 
          opponentName={profile.full_name?.split(' ')[0] || 'Opponent'} 
        />
      )}

      {profile.badges && <BadgeShowcase badges={profile.badges} />}

      <ChallengeSetupModal
        isOpen={isChallengeModalOpen}
        onClose={handleCloseModal}
        opponentId={profile.id}
        opponentName={profile.full_name || 'Opponent'}
      />
    </div>
  );
};

export default PublicProfile;
