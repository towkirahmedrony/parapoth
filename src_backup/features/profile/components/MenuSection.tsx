import React, { memo, useCallback } from 'react';
import { 
  Gift, Settings as SettingsIcon, LogOut, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth'; 

const MenuSection: React.FC = memo(() => {
  const { signOut } = useAuth(); 
  const navigate = useNavigate();

  // Async handler for safe logout operations
  const handleLogout = useCallback(async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch (error) {
      console.error("Logout failed in MenuSection:", error);
    }
  }, [signOut]);

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-sm mb-6 transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      {/* Referral */}
      <MenuItem 
        icon={<Gift size={18}/>} 
        label="রেফার ও আর্ন" 
        onClick={() => navigate('/referral')} 
      />
      
      <div 
        className="h-px my-1 mx-4" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
      
      {/* Settings */}
      <MenuItem 
        icon={<SettingsIcon size={18} />} 
        label="সেটিংস" 
        onClick={() => navigate('/settings')} 
      />

      <div 
        className="h-px my-1 mx-4" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
      
      {/* Logout */}
      <button 
        onClick={handleLogout} 
        className="w-full flex items-center justify-between p-4 transition-colors group hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-colors group-hover:[background-color:color-mix(in_srgb,var(--dyn-text)_15%,transparent)]"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
              color: '#ef4444' // Keeping red specifically for logout context
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

// Reusable MenuItem Component - Memoized
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = memo(({ icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center justify-between p-4 transition-colors group hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
  >
    <div className="flex items-center gap-3">
      <div 
        className="p-2 rounded-lg transition-colors group-hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
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
    <ChevronRight 
      size={18} 
      className="transition-colors group-hover:[color:var(--dyn-primary)]" 
      style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
    />
  </button>
));

MenuItem.displayName = 'MenuItem';

export default MenuSection;
