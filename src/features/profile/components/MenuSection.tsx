import React, { memo, useCallback } from 'react';
import { 
  Gift, Settings as SettingsIcon, LogOut, ChevronRight, HelpCircle, Lock, Moon, Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth'; 
import { useTheme } from '@/shared/hooks/useTheme';

const MenuSection: React.FC = memo(() => {
  const { signOut } = useAuth(); 
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch (error) {
      console.error("Logout failed in MenuSection:", error);
    }
  }, [signOut]);

  const isDarkMode = theme === 'dark';

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-sm mb-6 transition-all duration-300 bg-dyn-card"
      style={{ 
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      {/* Referral */}
      <MenuItem 
        icon={<Gift size={18}/>} 
        label="রেফার ও আর্ন" 
        onClick={() => navigate('/referral')} 
      />
      
      <div className="h-px mx-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }} />

      {/* Help & Support */}
      <MenuItem 
        icon={<HelpCircle size={18}/>} 
        label="হেল্প ও সাপোর্ট" 
        onClick={() => navigate('/contact')} 
      />

      <div className="h-px mx-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }} />

      {/* Change Password */}
      <MenuItem 
        icon={<Lock size={18}/>} 
        label="পাসওয়ার্ড পরিবর্তন" 
        onClick={() => navigate('/change-password')} 
      />

      <div className="h-px mx-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }} />

      {/* Theme Toggle Switch */}
      <MenuItem 
        icon={isDarkMode ? <Moon size={18} /> : <Sun size={18} />} 
        label="ডার্ক মোড" 
        onClick={toggleTheme} 
        rightElement={
          <div 
            className="w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out"
            style={isDarkMode 
              ? { backgroundColor: 'var(--dyn-primary)' } 
              : { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 30%, transparent)' }
            }
          >
            <div 
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`} 
            />
          </div>
        }
      />

      <div className="h-px mx-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }} />
      
      {/* Settings */}
      <MenuItem 
        icon={<SettingsIcon size={18} />} 
        label="সেটিংস" 
        onClick={() => navigate('/settings')} 
      />

      <div className="h-px mx-4" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }} />
      
      {/* Logout */}
      <button 
        onClick={handleLogout} 
        className="w-full flex items-center justify-between p-4 transition-colors group"
        style={{ 
           ':hover': { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' } 
        } as any}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
              color: '#ef4444' 
            }}
          >
            <LogOut size={18} />
          </div>
          <span className="font-medium font-['Hind_Siliguri']" style={{ color: '#ef4444' }}>লগ আউট</span>
        </div>
      </button>
    </div>
  );
});

MenuSection.displayName = 'MenuSection';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  rightElement?: React.ReactNode; // ডানপাশে কাস্টম ইলিমেন্ট (যেমন: সুইচ) বসানোর জন্য
}

const MenuItem: React.FC<MenuItemProps> = memo(({ icon, label, onClick, rightElement }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center justify-between p-4 transition-colors group"
    style={{ 
       ':hover': { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' } 
    } as any}
  >
    <div className="flex items-center gap-3">
      <div 
        className="p-2 rounded-lg transition-colors"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
          color: 'var(--dyn-primary)'
        }}
      >
        {icon}
      </div>
      <span 
        className="font-medium font-['Hind_Siliguri']"
        style={{ color: 'var(--dyn-text)' }}
      >
        {label}
      </span>
    </div>
    
    {/* যদি rightElement থাকে তবে সেটি দেখাবে, না থাকলে ডিফল্ট ChevronRight দেখাবে */}
    {rightElement ? (
      rightElement
    ) : (
      <ChevronRight 
        size={18} 
        className="transition-colors" 
        style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
      />
    )}
  </button>
));

MenuItem.displayName = 'MenuItem';

export default MenuSection;
