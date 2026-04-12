import React, { useEffect, useState } from 'react';
import { Bell, Flame, Star } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0); // আনরিড নোটিফিকেশনের জন্য স্টেট

  const isDashboardHome =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/home';

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      // প্রোফাইল ডাটা ফেচ
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, total_xp')
        .eq('id', user.id)
        .single();

      if (profileData && !profileError) {
        setCurrentStreak(profileData.current_streak || 0);
        setXp(profileData.total_xp || 0);
      } else {
        setCurrentStreak(user?.user_metadata?.current_streak || 0);
        setXp(user?.user_metadata?.total_xp || 0);
      }

      // আনরিড নোটিফিকেশন কাউন্ট ফেচ
      const { count, error: notificationError } = await supabase
        .from('notification_reads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!notificationError && count !== null) {
        setUnreadCount(count);
      }
    };

    if (isDashboardHome) {
      fetchData();
    }
  }, [user?.id, isDashboardHome]);

  if (!isDashboardHome) {
    return null;
  }

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
        
        <div 
          onClick={() => navigate('/dashboard/streak')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
          title="আপনার স্ট্রিক দেখতে ক্লিক করুন"
        >
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="text-sm font-bold font-sans" style={{ color: 'var(--dyn-text)' }}>{currentStreak}</span>
        </div>

        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
          title="আপনার মোট XP"
        >
          <Star size={18} className="text-blue-500 fill-blue-500" />
          <span className="text-sm font-bold font-sans" style={{ color: 'var(--dyn-text)' }}>{xp}</span>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full transition-all hover:scale-110"
          style={{ color: 'var(--dyn-text)', backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
        >
          <Bell size={22} />
          {/* আনরিড কাউন্ট 0 এর বেশি হলে তবেই ব্যাজ দেখাবে */}
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
