import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import ProfileHeader from '../components/ProfileHeader';
import MenuSection from '../components/MenuSection';
import { InfoCard, InfoRow } from '../components/InfoCard';
import { User, GraduationCap } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Profile Header */}
      <ProfileHeader 
        user={user} 
        onEdit={() => navigate('/profile/edit')} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-1">
          <MenuSection />
        </div>
        
        {/* Right Side: Account & Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* পার্সোনাল ডিটেইলস কার্ড */}
          <InfoCard title="পার্সোনাল ডিটেইলস" icon={<User size={18} />}>
            <InfoRow 
              label="নাম" 
              value={user?.full_name || user?.user_metadata?.full_name} 
            />
            <InfoRow 
              label="ইমেইল" 
              value={user?.email || user?.user_metadata?.email} 
              isVerified={user?.is_email_verified || user?.user_metadata?.email_verified} 
            />
            <InfoRow 
              label="ঠিকানা" 
              value={user?.address ? String(user.address) : undefined} 
            />
          </InfoCard>

          {/* একাডেমিক তথ্য কার্ড */}
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
              label="ব্যাচ" 
              value={user?.batch_year} 
            />
            <InfoRow 
              label="বোর্ড" 
              value={user?.education_board} 
            />
          </InfoCard>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
