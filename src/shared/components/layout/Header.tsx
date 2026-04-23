import React from 'react';
import { Bell, Flame, Star } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isDashboardHome =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/home';

  const { data: profileData } = useQuery({
    queryKey: ['profile', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        const baseUrl = import.meta.env.VITE_API_URL || 'https://parapoth-backend.onrender.com/api/v1';
        
        const response = await fetch(`${baseUrl}/growth/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const json = await response.json();
          return json.data;
        }
      } catch (error) {
        console.error('API Error, falling back to Supabase:', error);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, total_xp')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isDashboardHome,
    staleTime: 0,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('notification_reads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id && isDashboardHome,
    staleTime: 60 * 1000,
  });

  if (!isDashboardHome) {
    return null;
  }

  const currentStreak = profileData?.current_streak ?? user?.user_metadata?.current_streak ?? 0;
  const xp = profileData?.total_xp ?? user?.user_metadata?.total_xp ?? 0;

  return (
    <header 
      className="sticky top-0 z-20 h-16 px-4 flex items-center justify-between border-b border-border-color bg-surface text-text-primary transition-colors duration-500"
    >
      <Link to="/dashboard" className="flex items-center">
        <img 
          src="/icons/header.webp" 
          alt="Parapath Logo" 
          className="h-10 w-auto object-contain drop-shadow-sm" 
        />
      </Link>

      <div className="flex items-center gap-3">
        
        {/* XP Section */}
        <div 
          onClick={() => navigate('/dashboard/leaderboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 bg-surface-elevated border border-border-color"
        >
          <Star size={18} className="text-blue-500 fill-blue-500" />
          <span className="text-sm font-bold font-sans text-text-primary">{xp}</span>
        </div>

        {/* Streak Section */}
        <div 
          onClick={() => navigate('/dashboard/streak')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 bg-surface-elevated border border-border-color"
        >
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="text-sm font-bold font-sans text-text-primary">{currentStreak}</span>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full transition-all hover:scale-110 bg-surface-elevated text-text-primary"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span 
              className="absolute top-0 right-0 flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-surface bg-badge-bg text-badge-text" 
              style={{ 
                minWidth: '18px',
                height: '18px',
                padding: '0 4px'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
