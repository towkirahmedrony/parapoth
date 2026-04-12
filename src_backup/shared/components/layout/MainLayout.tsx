import React, { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { requestNotificationPermission } from '../../../features/notifications/services/notificationService';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { supabase } from '../../lib/supabase';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    const initNotifications = async () => {
      if (user?.id) { 
        await requestNotificationPermission();
      }
    };
    initNotifications();
  }, [user?.id]);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase.from('app_configs').select('key, ui_theme_settings, value');
        if (data) {
          const themeRow = data.find(row => row.key.includes('theme') || row.ui_theme_settings !== null) || data[0];
          const parsedTheme = (themeRow?.ui_theme_settings || themeRow?.value) as any;
          
          if (parsedTheme?.colors) {
            const root = document.documentElement;
            root.style.setProperty('--dyn-bg', parsedTheme.colors.primaryBackground || '#f8fafc');
            root.style.setProperty('--dyn-card', parsedTheme.colors.cardColor || parsedTheme.colors.primaryBackground || '#ffffff');
            root.style.setProperty('--dyn-text', parsedTheme.colors.textColor || '#0f172a');
            root.style.setProperty('--dyn-primary', parsedTheme.colors.buttonColor || '#3b82f6');
            root.style.setProperty('--dyn-accent', parsedTheme.colors.accentColor || '#10b981');
            
            localStorage.setItem('dyn_theme', JSON.stringify(parsedTheme.colors));
          }
        }
      } catch (err) {
        console.error("Theme fetch error:", err);
      }
    };
    fetchTheme();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-500" style={{ backgroundColor: 'var(--dyn-bg, #f8fafc)', color: 'var(--dyn-text, #0f172a)' }}>
      {/* 1. Sidebar (Desktop Only) */}
      <Sidebar />

      <div className="flex-1 flex flex-col w-full relative">
        {/* 2. Header */}
        <Header />

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-100px)] relative">
            {/* Suspense এর fallback সম্পূর্ণ ফাঁকা রাখা হলো যাতে পেজের নিজস্ব স্কেলেটন কাজ করতে পারে */}
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* 4. Bottom Nav (Mobile Only) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: 'var(--dyn-card, #ffffff)' }}>
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
