import React, { memo, useCallback, useState } from 'react';
import { Gift, Settings as SettingsIcon, LogOut, ChevronRight, Lock, Moon, Sun, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth'; 
import { useTheme } from '@/shared/hooks/useTheme';

const MenuSection: React.FC = memo(() => {
  const { signOut } = useAuth(); 
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [isLegalOpen, setIsLegalOpen] = useState(() => {
    return localStorage.getItem('isLegalMenuOpen') === 'true';
  });

  const handleLegalToggle = useCallback(() => {
    setIsLegalOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isLegalMenuOpen', String(newState));
      return newState;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (signOut) await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [signOut]);

  const isDarkMode = theme === 'dark';

  return (
    <div 
      className="rounded-3xl overflow-hidden shadow-sm transition-all duration-300 bg-dyn-card pb-2"
      style={{ border: '1px solid color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
    >
      <div className="px-5 py-4 mb-2" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 2%, transparent)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>
          অ্যাকাউন্ট সেটিংস
        </h3>
      </div>

      <MenuItem icon={<Gift size={18}/>} label="রেফার ও আর্ন" onClick={() => navigate('/referral')} />
      <MenuItem icon={<Lock size={18}/>} label="পাসওয়ার্ড পরিবর্তন" onClick={() => navigate('/change-password')} />
      
      <MenuItem 
        icon={isDarkMode ? <Moon size={18} /> : <Sun size={18} />} 
        label="ডার্ক মোড" 
        onClick={toggleTheme} 
        rightElement={
          <div 
            className="w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out"
            style={isDarkMode ? { backgroundColor: 'var(--dyn-primary)' } : { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 30%, transparent)' }}
          >
            <div 
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} 
            />
          </div>
        }
      />
      
      <MenuItem icon={<SettingsIcon size={18} />} label="সেটিংস" onClick={() => navigate('/settings')} />

      {/* Expandable Legal Section */}
      <div>
        <button 
          onClick={handleLegalToggle}
          className="w-full flex items-center justify-between px-5 py-3.5 transition-colors group hover:[background-color:color-mix(in_srgb,var(--dyn-text)_2%,transparent)]"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl transition-colors" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)', color: 'var(--dyn-primary)' }}>
              <Shield size={18} />
            </div>
            <span className="font-medium font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>হেল্প ও লিগাল</span>
          </div>
          <ChevronRight size={18} className={`transition-transform duration-300 ${isLegalOpen ? 'rotate-90' : ''}`} style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} />
        </button>

        <div className="transition-all duration-300 ease-in-out overflow-hidden" style={{ maxHeight: isLegalOpen ? '600px' : '0px', opacity: isLegalOpen ? 1 : 0 }}>
          <div className="py-2 ml-[3.25rem] border-l-2 mr-5" style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
            <SubMenuItem label="হেল্প ও সাপোর্ট" onClick={() => navigate('/contact')} />
            <SubMenuItem label="সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)" onClick={() => navigate('/faq')} />
            <SubMenuItem label="আমাদের সম্পর্কে" onClick={() => navigate('/about')} />
            <SubMenuItem label="প্রাইভেসি পলিসি" onClick={() => navigate('/privacy-policy')} />
            <SubMenuItem label="টার্মস অ্যান্ড কন্ডিশনস" onClick={() => navigate('/terms-conditions')} />
            <SubMenuItem label="ডেটা ডিলিশন" onClick={() => navigate('/data-deletion')} danger={true} />
          </div>
        </div>
      </div>
      
      <div className="h-px mx-5 my-2" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }} />
      
      <button 
        onClick={handleLogout} 
        className="w-full flex items-center justify-between px-5 py-3.5 transition-colors group hover:[background-color:color-mix(in_srgb,#ef4444_5%,transparent)]"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl transition-colors" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#ef4444' }}>
            <LogOut size={18} />
          </div>
          <span className="font-medium font-['Hind_Siliguri']" style={{ color: '#ef4444' }}>লগ আউট</span>
        </div>
      </button>
    </div>
  );
});

MenuSection.displayName = 'MenuSection';

interface MenuItemProps { icon: React.ReactNode; label: string; onClick?: () => void; rightElement?: React.ReactNode; }

const MenuItem: React.FC<MenuItemProps> = memo(({ icon, label, onClick, rightElement }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-3.5 transition-colors group hover:[background-color:color-mix(in_srgb,var(--dyn-text)_2%,transparent)]">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-xl transition-colors" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)', color: 'var(--dyn-primary)' }}>
        {icon}
      </div>
      <span className="font-medium font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>{label}</span>
    </div>
    {rightElement ? rightElement : <ChevronRight size={18} style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} />}
  </button>
));

MenuItem.displayName = 'MenuItem';

const SubMenuItem: React.FC<{ label: string; onClick?: () => void; danger?: boolean; }> = memo(({ label, onClick, danger }) => (
  <button onClick={onClick} className="w-full flex items-center justify-start py-2 pl-4 transition-colors hover:pl-5 duration-200">
    <span className="font-medium font-['Hind_Siliguri'] text-[13px]" style={{ color: danger ? '#ef4444' : 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
      {label}
    </span>
  </button>
));

SubMenuItem.displayName = 'SubMenuItem';

export default MenuSection;
