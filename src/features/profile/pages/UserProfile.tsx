import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile } from '../services/profileService';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';
import ProfileHeader from '../components/ProfileHeader';
import MenuSection from '../components/MenuSection';
import { InfoCard, InfoRow } from '../components/InfoCard';
import { User, GraduationCap } from 'lucide-react';

const getGenderText = (g?: string) => {
  if (g === 'Male') return 'ছাত্র';
  if (g === 'Female') return 'ছাত্রী';
  return g;
};

const UserProfile: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // ডাটাবেজ থেকে সবসময় ফ্রেশ প্রোফাইল ডাটা ফেচ করা
  const { data: profileData } = useQuery({
    queryKey: Array.isArray(QUERY_KEYS.USER_PROFILE) ? QUERY_KEYS.USER_PROFILE : [QUERY_KEYS.USER_PROFILE],
    queryFn: getCurrentUserProfile,
  });

  // যদি ফ্রেশ ডাটা থাকে তবে সেটা ব্যবহার হবে, অন্যথায় authUser-এর ডাটা
  const user: any = profileData || authUser;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300 pb-24">
      
      {/* Profile Header */}
      <ProfileHeader 
        user={user} 
        onEdit={() => navigate('/edit-profile')} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (Desktop) / Top (Mobile): Account & Personal Details */}
        <div className="lg:col-span-2 space-y-6 order-1">
          
          <InfoCard title="পার্সোনাল ডিটেইলস" icon={<User size={18} />}>
            <InfoRow 
              label="নাম" 
              value={user?.full_name || user?.user_metadata?.full_name} 
            />
            <InfoRow 
              label="ইউজারনেম" 
              value={user?.username ? `@${user.username}` : undefined} 
            />
            <InfoRow 
              label="ইমেইল" 
              value={user?.email || user?.user_metadata?.email} 
              isVerified={user?.is_email_verified || user?.user_metadata?.email_verified} 
            />
            <InfoRow 
              label="লিঙ্গ" 
              value={getGenderText(user?.gender)} 
            />
            <InfoRow 
              label="জন্ম তারিখ" 
              value={user?.date_of_birth} 
            />
            <InfoRow 
              label="অভিভাবকের নম্বর" 
              value={user?.guardian_phone} 
            />
            <InfoRow 
              label="ঠিকানা" 
              value={user?.address ? String(user?.address?.full_address || user?.address) : undefined} 
            />
          </InfoCard>

          <InfoCard title="একাডেমিক তথ্য" icon={<GraduationCap size={18} />}>
            <InfoRow 
              label="প্রতিষ্ঠান" 
              value={user?.institution} 
            />
            <InfoRow 
              label="ক্লাস/লেভেল" 
              value={user?.class_level} 
            />
            <InfoRow 
              label="বিভাগ/গ্রুপ" 
              value={user?.group ? (user.group === 'Science' ? 'বিজ্ঞান' : user.group === 'Business' ? 'ব্যবসায় শিক্ষা' : user.group === 'Humanities' ? 'মানবিক' : user.group) : undefined} 
            />
            <InfoRow 
              label="ব্যাচ" 
              value={user?.batch_year} 
            />
            <InfoRow 
              label="বোর্ড" 
              value={user?.education_board ? (user.education_board === 'Dhaka' ? 'ঢাকা' : user.education_board) : undefined} 
            />
            <InfoRow 
              label="শিক্ষার লক্ষ্য" 
              value={user?.study_goal} 
            />
          </InfoCard>

        </div>

        {/* Right Side (Desktop) / Bottom (Mobile): Navigation Menu */}
        <div className="lg:col-span-1 order-2 lg:order-2">
          <MenuSection />
        </div>
        
      </div>
    </div>
  );
};

export default UserProfile;
