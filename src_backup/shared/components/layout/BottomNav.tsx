import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Play, PieChart, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/exam/arena')) return null;

  const renderNavItem = (Icon: React.ElementType, label: string, isActive: boolean) => (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'shadow-sm scale-105 font-bold' : 'font-medium opacity-70 hover:opacity-100'}`}
      style={{ 
        backgroundColor: isActive ? 'color-mix(in srgb, var(--dyn-primary, #3b82f6) 15%, transparent)' : 'transparent',
        color: isActive ? 'var(--dyn-primary, #3b82f6)' : 'var(--dyn-text, #64748b)'
      }}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-['Hind_Siliguri']">{label}</span>
    </div>
  );

  const navLinkContainerClass = "w-full h-full flex items-center justify-center";

  return (
    <nav 
      className="md:hidden h-20 border-t pb-2 fixed bottom-0 w-full z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-500"
      style={{ 
        backgroundColor: 'var(--dyn-bg, #ffffff)', // Changed to Primary Background
        borderColor: 'color-mix(in srgb, var(--dyn-text, #e2e8f0) 10%, transparent)'
      }}
    >
      <div className="grid grid-cols-5 h-full relative px-2 items-center">
        
        <NavLink to="/dashboard/home" className={navLinkContainerClass}>
          {({ isActive }) => renderNavItem(Home, 'হোম', isActive)}
        </NavLink>

        <NavLink to="/progress" className={navLinkContainerClass}>
          {({ isActive }) => renderNavItem(PieChart, 'অগ্রগতি', isActive)}
        </NavLink>

        {/* Floating Exam Button */}
        <div className="relative flex items-center justify-center -mt-8">
          <NavLink
            to="/exam/selection"
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white transition-transform active:scale-95 border-[6px]"
            style={{ 
              backgroundColor: 'var(--dyn-primary, #3b82f6)',
              borderColor: 'var(--dyn-bg, #ffffff)' // Changed to match nav background
            }}
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </NavLink>
        </div>

        <NavLink to="/history" className={navLinkContainerClass}>
          {({ isActive }) => renderNavItem(Trophy, 'হিস্টোরি', isActive)}
        </NavLink>

        <NavLink to="/profile" className={navLinkContainerClass}>
          {({ isActive }) => renderNavItem(User, 'প্রোফাইল', isActive)}
        </NavLink>

      </div>
    </nav>
  );
};

export default BottomNav;
