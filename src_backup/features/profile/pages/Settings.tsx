import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Smartphone, Palette, Globe, Database, 
  Bell, Info, HelpCircle, UserPlus, Shield, 
  FileText, LogOut, Trash2, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { BackButton } from '../../../shared/components/ui/BackButton';
import { useAuth } from '../../auth/hooks/useAuth';

// --- Constants ---
const APP_VERSION = 'ParaPoth v5.0.0 (Supreme)';

// --- Types ---
interface SettingItemProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
  danger?: boolean;
  rightText?: string;
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

// Reusable component for setting items
const SettingItem: React.FC<SettingItemProps> = ({ 
  icon: Icon, 
  title, 
  onClick, 
  danger = false,
  rightText = "" 
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 transition-colors hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
    style={{ 
      backgroundColor: 'var(--dyn-card)',
      borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
    }}
  >
    <div className="flex items-center gap-3">
      <Icon 
        className="w-5 h-5" 
        style={{ color: danger ? '#ef4444' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} 
      />
      <span 
        className="font-medium"
        style={{ color: danger ? '#ef4444' : 'var(--dyn-text)' }}
      >
        {title}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {rightText && (
        <span 
          className="text-sm"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
        >
          {rightText}
        </span>
      )}
      <ChevronRight 
        className="w-4 h-4" 
        style={{ color: danger ? '#ef4444' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} 
      />
    </div>
  </button>
);

// Reusable component for setting sections
const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h3 
      className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
    >
      {title}
    </h3>
    <div 
      className="rounded-xl shadow-sm overflow-hidden"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      {children}
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  // AuthProvider থেকে সঠিকভাবে signOut এক্সট্র্যাক্ট করা হলো (কোনো any বা টাইপ কাস্টিং ছাড়াই)
  const { signOut } = useAuth(); 

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
      
      // Navigate to login and replace history to prevent back navigation
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion logic/modal here
    console.log("Account deletion requested...");
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--dyn-bg)' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-10 shadow-sm px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--dyn-card)' }}
      >
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: 'var(--dyn-text)' }}>সেটিংস</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        
        {/* Account & Security */}
        <SettingSection title="অ্যাকাউন্ট ও নিরাপত্তা">
          <SettingItem 
            icon={Lock} 
            title="পাসওয়ার্ড পরিবর্তন" 
            onClick={() => navigate('/change-password')} 
          />
          <SettingItem 
            icon={Smartphone} 
            title="আমার ডিভাইসসমূহ" 
            onClick={() => navigate('/devices')} 
          />
        </SettingSection>

        {/* App Preferences */}
        <SettingSection title="অ্যাপ প্রেফারেন্স">
          <SettingItem 
            icon={Palette} 
            title="থিম" 
            rightText="সিস্টেম ডিফল্ট"
            onClick={() => {}} 
          />
          <SettingItem 
            icon={Globe} 
            title="অ্যাপের ভাষা" 
            rightText="বাংলা"
            onClick={() => {}} 
          />
          <SettingItem 
            icon={Database} 
            title="অফলাইন স্টোরেজ" 
            onClick={() => {}} 
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="নোটিফিকেশন">
          <SettingItem 
            icon={Bell} 
            title="নোটিফিকেশন সেটিংস" 
            onClick={() => navigate('/notifications')} 
          />
        </SettingSection>

        {/* Support & Community */}
        <SettingSection title="সাপোর্ট ও কমিউনিটি">
          <SettingItem 
            icon={UserPlus} 
            title="রেফার ও আর্ন" 
            onClick={() => navigate('/referral')} 
          />
          <SettingItem 
            icon={HelpCircle} 
            title="সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)" 
            onClick={() => navigate('/faq')} 
          />
          <SettingItem 
            icon={Info} 
            title="আমাদের সম্পর্কে" 
            onClick={() => navigate('/about')} 
          />
          <SettingItem 
            icon={FileText} 
            title="হেল্প ও সাপোর্ট" 
            onClick={() => navigate('/contact')} 
          />
        </SettingSection>

        {/* Legal */}
        <SettingSection title="আইনি বিষয়">
          <SettingItem 
            icon={Shield} 
            title="প্রাইভেসি পলিসি" 
            onClick={() => navigate('/privacy-policy')} 
          />
          <SettingItem 
            icon={FileText} 
            title="টার্মস অ্যান্ড কন্ডিশনস" 
            onClick={() => navigate('/terms-conditions')} 
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="ডেঞ্জার জোন">
          <SettingItem 
            icon={LogOut} 
            title="লগ আউট" 
            danger={true}
            onClick={handleLogout} 
          />
          <SettingItem 
            icon={Trash2} 
            title="অ্যাকাউন্ট ডিলিট করুন" 
            danger={true}
            onClick={handleDeleteAccount} 
          />
        </SettingSection>

        <div className="text-center mt-8 mb-4">
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{APP_VERSION}</p>
          <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>Made with ❤️ in Bangladesh</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
