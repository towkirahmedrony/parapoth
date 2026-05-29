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

        const baseUrl =
          import.meta.env.VITE_API_URL ||
          'https://parapoth-backend.onrender.com/api/v1';

        const response = await fetch(`${baseUrl}/growth/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const currentStreak =
    profileData?.current_streak ?? user?.user_metadata?.current_streak ?? 0;

  const xp = profileData?.total_xp ?? user?.user_metadata?.total_xp ?? 0;

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border-color bg-surface px-4 text-text-primary transition-colors duration-500">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
        <Link
          to="/dashboard"
          aria-label="ParaPoth dashboard - SSC HSC MCQ model test and online exam preparation"
          title="ParaPoth - Online Exam Preparation Platform"
          className="flex items-center"
        >
          <img
            src="/icons/header.webp"
            alt="ParaPoth online exam preparation logo"
            className="h-10 w-auto object-contain drop-shadow-sm"
          />
        </Link>

        <nav
          aria-label="Student progress and notification shortcuts"
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard/leaderboard')}
            aria-label={`Leaderboard and exam practice XP: ${xp}`}
            title="Leaderboard and XP"
            className="flex items-center gap-1.5 rounded-full border border-border-color bg-surface-elevated px-3 py-1.5 transition-all hover:scale-105"
          >
            <Star size={18} className="fill-blue-500 text-blue-500" />
            <span className="font-sans text-sm font-bold text-text-primary">
              {xp}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/streak')}
            aria-label={`Daily study streak: ${currentStreak} days`}
            title="Daily study streak"
            className="flex items-center gap-1.5 rounded-full border border-border-color bg-surface-elevated px-3 py-1.5 transition-all hover:scale-105"
          >
            <Flame size={18} className="fill-orange-500 text-orange-500" />
            <span className="font-sans text-sm font-bold text-text-primary">
              {currentStreak}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread exam preparation notifications`
                : 'No unread notifications'
            }
            title="Notifications"
            className="relative rounded-full bg-surface-elevated p-2 text-text-primary transition-all hover:scale-110"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span
                className="absolute right-0 top-0 flex items-center justify-center rounded-full border-2 border-surface bg-badge-bg text-[10px] font-bold text-badge-text"
                style={{
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
