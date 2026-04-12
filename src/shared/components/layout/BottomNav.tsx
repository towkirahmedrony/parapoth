import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Play, PieChart, User, LucideIcon } from 'lucide-react';

// Extracted static class to prevent reallocation on every render
const NAV_LINK_CONTAINER_CLASS = "w-full h-full flex items-center justify-center";

// Strongly typed props for the extracted NavItem component
interface NavItemProps {
  Icon: LucideIcon | React.ElementType;
  label: string;
  isActive: boolean;
}

// Extracted to an isolated component to avoid recreating the render function per cycle
const NavItem: React.FC<NavItemProps> = ({ Icon, label, isActive }) => (
  <div
    className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 ${
      isActive ? 'shadow-sm scale-105 font-bold' : 'font-medium opacity-70 hover:opacity-100'
    }`}
    style={{ 
      backgroundColor: isActive 
        ? 'color-mix(in srgb, var(--dyn-primary, #3b82f6) 15%, transparent)' 
        : 'transparent',
      color: isActive 
        ? 'var(--dyn-primary, #3b82f6)' 
        : 'var(--dyn-text, #64748b)'
    }}
  >
    <Icon className="w-6 h-6" aria-hidden="true" />
    <span className="text-[10px] font-['Hind_Siliguri']">{label}</span>
  </div>
);

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  // Conditionally hide the navigation bar in the exam arena
  if (location.pathname.startsWith('/exam/arena')) {
    return null;
  }

  return (
    <nav 
      className="md:hidden h-20 border-t pb-2 fixed bottom-0 w-full z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-500"
      style={{ 
        backgroundColor: 'var(--dyn-bg, #ffffff)', 
        borderColor: 'color-mix(in srgb, var(--dyn-text, #e2e8f0) 10%, transparent)'
      }}
      aria-label="Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-full relative px-2 items-center">
        
        <NavLink to="/dashboard/home" className={NAV_LINK_CONTAINER_CLASS}>
          {({ isActive }) => <NavItem Icon={Home} label="হোম" isActive={isActive} />}
        </NavLink>

        <NavLink to="/progress" className={NAV_LINK_CONTAINER_CLASS}>
          {({ isActive }) => <NavItem Icon={PieChart} label="অগ্রগতি" isActive={isActive} />}
        </NavLink>

        {/* Floating Exam Button */}
        <div className="relative flex items-center justify-center -mt-8">
          <NavLink
            to="/exam/selection"
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white transition-transform active:scale-95 border-[6px]"
            style={{ 
              backgroundColor: 'var(--dyn-primary, #3b82f6)',
              borderColor: 'var(--dyn-bg, #ffffff)'
            }}
            aria-label="Start Exam"
          >
            <Play className="w-7 h-7 fill-current ml-1" aria-hidden="true" />
          </NavLink>
        </div>

        <NavLink to="/history" className={NAV_LINK_CONTAINER_CLASS}>
          {({ isActive }) => <NavItem Icon={Trophy} label="হিস্টোরি" isActive={isActive} />}
        </NavLink>

        <NavLink to="/profile" className={NAV_LINK_CONTAINER_CLASS}>
          {({ isActive }) => <NavItem Icon={User} label="প্রোফাইল" isActive={isActive} />}
        </NavLink>

      </div>
    </nav>
  );
};

export default BottomNav;
