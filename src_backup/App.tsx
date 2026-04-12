import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Hooks & Services
import { useAuth } from './features/auth/hooks/useAuth';
import { requestNotificationPermission, listenForForegroundMessages } from './features/notifications/services/notificationService';

// Layout & Guards
import { SystemGuard } from './shared/components/layout/SystemGuard';

// Routes
import AppRoutes from './app/routes/AppRoutes';

const App: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id; // Extracting primitive value for stable dependency

  useEffect(() => {
    // Listen for in-app notifications while app is open
    const unsubscribe = listenForForegroundMessages();

    // Request permission if user is logged in
    if (userId) {
      requestNotificationPermission();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]); 

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            backgroundColor: 'var(--dyn-card)',
            color: 'var(--dyn-text)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
          },
        }}
      />
      <SystemGuard>
        <AppRoutes />
      </SystemGuard>
    </>
  );
};

export default App;
