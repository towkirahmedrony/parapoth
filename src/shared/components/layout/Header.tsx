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

  // React Query for profile data (streak & xp)
  const { data: profileData } = useQuery({
    queryKey: ['profile', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // ১. ইউজারের অথেনটিকেশন টোকেন বের করা
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // ২. ব্যাকএন্ডের URL সেট করা (আপনার VITE_API_URL না থাকলে সরাসরি Render লিংক কাজ করবে)
        const baseUrl = import.meta.env.VITE_API_URL || 'https://parapoth-backend.onrender.com/api/v1';
        
        // ৩. ব্যাকএন্ডে API কল করা (এটি কল হলেই আপনার ব্যাকএন্ডের স্ট্রিক জিরো করার লজিক রান হবে)
        // নোট: আপনার ব্যাকএন্ড রাউটটি যদি ভিন্ন হয়, তবে '/growth/streak/stats' অংশটি সে অনুযায়ী পরিবর্তন করে নেবেন
        const response = await fetch(`${baseUrl}/growth/streak/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const json = await response.json();
          return json.data; // ব্যাকএন্ড থেকে আসা আপডেটেড ও সঠিক ডেটা
        }
      } catch (error) {
        console.error('API Error, falling back to Supabase:', error);
      }

      // ৪. যদি কোনো কারণে ব্যাকএন্ড রেসপন্স না দেয়, তবে সরাসরি ডাটাবেস থেকে আনবে (Fallback)
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, total_xp')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isDashboardHome,
    staleTime: 0, // ক্যাশ ক্লিয়ার করে সবসময় ফ্রেশ ডেটা আনবে
  });

  // React Query for unread notifications count
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
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  if (!isDashboardHome) {
    return null;
  }

  const currentStreak = profileData?.current_streak ?? user?.user_metadata?.current_streak ?? 0;
  const xp = profileData?.total_xp ?? user?.user_metadata?.total_xp ?? 0;

  return (
    <header 
      className="sticky top-0 z-20 h-16 px-4 flex items-center justify-between border-b transition-colors duration-500"
      style={{ 
        backgroundColor: 'var(--dyn-bg, #ffffff)',
        borderColor: 'color-mix(in srgb, var(--dyn-text, #e2e8f0) 10%, transparent)',
        color: 'var(--dyn-text, #0f172a)'
      }}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        >
          <Star size={18} className="text-blue-500 fill-blue-500" />
          <span className="text-sm font-bold font-sans" style={{ color: 'var(--dyn-text)' }}>{xp}</span>
        </div>

        {/* Streak Section */}
        <div 
          onClick={() => navigate('/dashboard/streak')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        >
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="text-sm font-bold font-sans" style={{ color: 'var(--dyn-text)' }}>{currentStreak}</span>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full transition-all hover:scale-110"
          style={{ color: 'var(--dyn-text)', backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span 
              className="absolute top-0 right-0 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2" 
              style={{ 
                borderColor: 'var(--dyn-bg)',
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
