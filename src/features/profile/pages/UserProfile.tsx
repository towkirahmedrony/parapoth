import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { MainLayout } from '../../../shared/components/layout/MainLayout';
import ProfileHeader from '../components/ProfileHeader';
import MenuSection from '../components/MenuSection';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Edit2, LogOut, Settings, Trash2 } from 'lucide-react';

interface Language {
  bn: string;
  en: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: Language;
  href: string;
  count?: number;
}

const USER_MENU_ITEMS: (MenuItemProps & { danger?: boolean })[] = [
  {
    icon: <Edit2 size={20} />,
    label: { bn: 'প্রোফাইল সম্পাদনা', en: 'Edit Profile' },
    href: '/profile/edit',
  },
  {
    icon: <Settings size={20} />,
    label: { bn: 'সেটিংস', en: 'Settings' },
    href: '/profile/settings',
  },
  {
    icon: <Trash2 size={20} />,
    label: { bn: 'ডেটা ডিলেশন', en: 'Data Deletion' },
    href: '/data-deletion',
  },
  {
    icon: <LogOut size={20} className="text-red-500" />,
    label: { bn: 'লগ আউট', en: 'Log Out' },
    href: '/logout',
    danger: true,
  },
];

const UserProfile: React.FC = () => {
  const { user, signOut, language } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      await signOut();
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItemProps & { danger?: boolean }) => {
    if (item.danger) {
      e.preventDefault();
      setShowLogoutModal(true);
    }
  };

  const menuSections = [
    {
      title: { bn: 'প্রোফাইল', en: 'Profile' },
      items: USER_MENU_ITEMS.slice(0, 3),
    },
    {
      title: { bn: 'সেশন', en: 'Session' },
      items: USER_MENU_ITEMS.slice(3),
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <ProfileHeader user={user} language={language} />

        {/* Menu Sections and Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {menuSections.map((section, idx) => (
              <MenuSection
                key={idx}
                title={section.title}
                items={section.items}
                language={language}
                onItemClick={handleLogoutClick}
              />
            ))}
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card title={{ bn: 'একাউন্ট তথ্য', en: 'Account Information' }} language={language}>
              <div className="space-y-4 text-[var(--dyn-text)] text-sm">
                <p>
                  <strong>UID:</strong> {user?.id}
                </p>
                <p>
                  <strong>Provider:</strong> {user?.app_metadata?.provider || 'Email/Password'}
                </p>
                <p className="break-all">
                  <strong>Metadata:</strong> {JSON.stringify(user?.user_metadata || {})}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* কাস্টম সেফ মডাল */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="p-6 rounded-2xl shadow-xl w-full max-w-sm"
            style={{ 
              backgroundColor: 'var(--dyn-card)',
              border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--dyn-text)' }}>
              {language === 'bn' ? 'লগ আউট কনফার্মেশন' : 'Logout Confirmation'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
              {language === 'bn' 
                ? 'আপনি কি নিশ্চিত যে আপনি লগ আউট করতে চান?' 
                : 'Are you sure you want to log out?'}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLogoutModal(false)}
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogoutConfirm}
              >
                {language === 'bn' ? 'লগ আউট' : 'Log Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserProfile;
