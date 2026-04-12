import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, FileEdit, PieChart, User as UserIcon, LogOut, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';

export const Sidebar: React.FC = memo(() => {
  const { user, signOut } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Safely extract string to prevent "Objects are not valid as a React child" error
  const extractName = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.full_name) return String(val.full_name);
    return null;
  };

  const fullNameStr = extractName(profileData) || extractName(user?.user_metadata) || extractName(user?.user_metadata?.full_name) || 'শিক্ষার্থী';
  const initialStr = fullNameStr ? fullNameStr.charAt(0).toUpperCase() : 'S';

  const navItems = [
    { label: 'হোম', path: '/dashboard/home', icon: Home },
    { label: 'মডেল টেস্ট', path: '/exam/selection', icon: FileEdit },
    { label: 'অগ্রগতি', path: '/progress', icon: PieChart },
    { label: 'লিডারবোর্ড', path: '/dashboard/leaderboard', icon: Trophy },
    { label: 'হিস্টোরি', path: '/history', icon: History },
    { label: 'প্রোফাইল', path: '/profile', icon: UserIcon },
  ];

  return (
    <aside 
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r transition-colors duration-500"
      style={{ 
        backgroundColor: 'var(--dyn-bg, #ffffff)', 
        borderColor: 'color-mix(in srgb, var(--dyn-text, #e2e8f0) 10%, transparent)',
        color: 'var(--dyn-text, #0f172a)'
      }}
    >
      <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <span className="text-2xl font-bold font-['Hind_Siliguri']" style={{ color: 'var(--dyn-primary, #3b82f6)' }}>
          প্যারাপথ
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 font-['Hind_Siliguri'] ${
                isActive ? 'shadow-sm font-bold' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' : 'transparent',
              color: isActive ? 'var(--dyn-primary)' : 'var(--dyn-text)'
            })}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white uppercase shadow-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--dyn-primary, #3b82f6)' }}
          >
            {initialStr}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>
              {fullNameStr}
            </p>
            <p className="text-xs truncate opacity-70" style={{ color: 'var(--dyn-text)' }}>
              {user?.email || 'student@parapoth.com'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-colors border border-transparent hover:opacity-80"
          style={{ color: 'var(--dyn-text)', backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-['Hind_Siliguri']">লগ আউট</span>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
