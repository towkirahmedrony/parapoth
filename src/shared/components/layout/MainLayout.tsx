import React, { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { requestNotificationPermission } from '@/features/notifications/services/notificationService';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id) { 
      requestNotificationPermission().catch(() => undefined);
    }
  }, [user?.id]);

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-500 bg-app text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full relative">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-100px)] relative">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-nav-bg">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
