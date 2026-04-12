import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Globe, Database, 
  Bell, Info, HelpCircle, Shield, 
  FileText, Trash2, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { BackButton } from '@/shared/components/ui/BackButton';

const APP_VERSION = 'ParaPoth v5.0.0 (Supreme)';

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

const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, title, onClick, danger = false, rightText = "" }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 transition-colors hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
    style={{ 
      backgroundColor: 'var(--dyn-card)',
      borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
    }}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" style={{ color: danger ? '#ef4444' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} />
      <span className="font-medium" style={{ color: danger ? '#ef4444' : 'var(--dyn-text)' }}>{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {rightText && <span className="text-sm" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{rightText}</span>}
      <ChevronRight className="w-4 h-4" style={{ color: danger ? '#ef4444' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} />
    </div>
  </button>
);

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>{title}</h3>
    <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>{children}</div>
  </div>
);

export const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    console.log("Account deletion requested...");
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--dyn-bg)' }}>
      <header className="sticky top-0 z-10 shadow-sm px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'var(--dyn-card)' }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: 'var(--dyn-text)' }}>সেটিংস</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <SettingSection title="অ্যাপ প্রেফারেন্স">
          <SettingItem icon={Globe} title="অ্যাপের ভাষা" rightText="বাংলা" onClick={() => {}} />
          <SettingItem icon={Database} title="অফলাইন স্টোরেজ" onClick={() => {}} />
          <SettingItem icon={Smartphone} title="আমার ডিভাইসসমূহ" onClick={() => navigate('/devices')} />
        </SettingSection>

        <SettingSection title="নোটিফিকেশন">
          <SettingItem icon={Bell} title="নোটিফিকেশন সেটিংস" onClick={() => navigate('/notifications')} />
        </SettingSection>

        <SettingSection title="সম্পর্কে">
          <SettingItem icon={HelpCircle} title="সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)" onClick={() => navigate('/faq')} />
          <SettingItem icon={Info} title="আমাদের সম্পর্কে" onClick={() => navigate('/about')} />
        </SettingSection>

        <SettingSection title="আইনি বিষয়">
          <SettingItem icon={Shield} title="প্রাইভেসি পলিসি" onClick={() => navigate('/privacy-policy')} />
          <SettingItem icon={FileText} title="টার্মস অ্যান্ড কন্ডিশনস" onClick={() => navigate('/terms-conditions')} />
        </SettingSection>

        <SettingSection title="ডেঞ্জার জোন">
          <SettingItem icon={Trash2} title="অ্যাকাউন্ট ডিলিট করুন" danger={true} onClick={handleDeleteAccount} />
        </SettingSection>

        <div className="text-center mt-8 mb-4">
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
