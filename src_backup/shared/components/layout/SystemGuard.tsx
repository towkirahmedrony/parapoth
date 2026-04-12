import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Wrench, X } from 'lucide-react';
import apiClient from '@/shared/lib/apiClient';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

interface SystemGuardProps {
  children: React.ReactNode;
}

export const SystemGuard: React.FC<SystemGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenance, setMaintenance] = useState({ active: false, message: '' });
  const [forceUpdate, setForceUpdate] = useState(false);
  const [dynTheme, setDynTheme] = useState<any>(null);
  const [globalNotice, setGlobalNotice] = useState<any>(null);

  useEffect(() => {
    // LocalStorage থেকে ক্যাশড থিম রিড করা ফাস্ট লোডিংয়ের জন্য
    const cachedTheme = localStorage.getItem('dyn_theme');
    if (cachedTheme) {
      try {
        setDynTheme(JSON.parse(cachedTheme));
      } catch (e) {}
    }

    const checkSystemStatus = async () => {
      try {
        const { data } = await apiClient.get('/system/configs');
        
        // 1. Maintenance & Force Update Check
        const globalConfig = data.data?.find((c: any) => c.key === 'global_settings');
        if (globalConfig) {
          if (globalConfig.maintenance_mode) {
            setMaintenance({ 
              active: true, 
              message: globalConfig.maintenance_message 
            });
          }
          if (globalConfig.is_force_update_required) {
            const minVer = globalConfig.min_app_version || '0.0.0';
            if (minVer.localeCompare(APP_VERSION, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
              setForceUpdate(true);
            }
          }
        }

        // 2. Global Notice Banner Logic
        const noticeConfig = data.data?.find((c: any) => c.key === 'global_notice');
        if (noticeConfig && noticeConfig.value?.is_active) {
          const currentNotice = noticeConfig.value;
          // ইউনিক আইডি তৈরি করা হচ্ছে টাইটেল ও মেসেজ দিয়ে
          const noticeId = `${currentNotice.title}-${currentNotice.message}`;
          const dismissedId = localStorage.getItem('dismissed_global_notice');
          
          // যদি এই নির্দিষ্ট ব্যানারটি আগে ডিসমিস করা না থাকে, তবেই শো করবে
          if (dismissedId !== noticeId) {
            setGlobalNotice(currentNotice);
          } else {
            setGlobalNotice(null);
          }
        } else {
          setGlobalNotice(null);
        }

        // 3. Theme Update
        const themeConfig = data.data?.find((c: any) => c.key.includes('theme') || c.ui_theme_settings);
        const parsedTheme = themeConfig?.ui_theme_settings || themeConfig?.value;
        if (parsedTheme?.colors) {
          setDynTheme(parsedTheme.colors);
          localStorage.setItem('dyn_theme', JSON.stringify(parsedTheme.colors));
          const root = document.documentElement;
          root.style.setProperty('--dyn-bg', parsedTheme.colors.primaryBackground);
          root.style.setProperty('--dyn-card', parsedTheme.colors.cardColor || parsedTheme.colors.primaryBackground);
          root.style.setProperty('--dyn-text', parsedTheme.colors.textColor);
          root.style.setProperty('--dyn-primary', parsedTheme.colors.buttonColor);
          root.style.setProperty('--dyn-accent', parsedTheme.colors.accentColor);
        }
      } catch (error) {
        console.error('Failed to fetch system configs', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    window.location.reload();
  };

  const handleDismissBanner = () => {
    if (globalNotice) {
      const noticeId = `${globalNotice.title}-${globalNotice.message}`;
      localStorage.setItem('dismissed_global_notice', noticeId);
    }
    setGlobalNotice(null);
  };

  const bgStyle = dynTheme?.primaryBackground || '#f8fafc';
  const textStyle = dynTheme?.textColor || '#0f172a';
  const primaryStyle = dynTheme?.buttonColor || '#3b82f6';

  if (isLoading) {
    // স্পিনার সরিয়ে সরাসরি পেজ/চাইল্ড রেন্ডার করা হচ্ছে, 
    // যাতে পেজের ভেতরের নিজস্ব স্কেলেটন কাজ করতে পারে।
    return <>{children}</>;
  }

  if (maintenance.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center fixed inset-0 z-[9999] transition-colors duration-500" style={{ backgroundColor: bgStyle, color: textStyle }}>
        <Wrench className="w-16 h-16 text-yellow-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">সিস্টেম আপডেট চলছে</h1>
        <p className="text-lg max-w-md opacity-80">
          {maintenance.message || "পড়াপথ-এর সার্ভারে কিছু গুরুত্বপূর্ণ কাজ চলছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"}
        </p>
      </div>
    );
  }

  if (forceUpdate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center fixed inset-0 z-[9999] transition-colors duration-500" style={{ backgroundColor: bgStyle, color: textStyle }}>
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">নতুন আপডেট এভেইলেবল!</h1>
        <p className="text-lg max-w-md mb-8 opacity-80">
          নিরবচ্ছিন্ন সেবার জন্য পড়াপথ অ্যাপের একটি গুরুত্বপূর্ণ আপডেট রিলিজ করা হয়েছে। ব্যবহার চালিয়ে যেতে অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
        </p>
        <button 
          onClick={handleUpdate}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: primaryStyle }}
        >
          <RefreshCw className="w-5 h-5" />
          আপডেট করুন (Refresh)
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Global Notice Banner Render */}
      {globalNotice && (
        <div className="bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-between z-50 relative shadow-md">
          <div className="flex-1 text-sm">
            <strong className="mr-2">{globalNotice.title}:</strong>
            <span>{globalNotice.message}</span>
            {globalNotice.action_link && (
              <a href={globalNotice.action_link} className="underline font-semibold ml-2 hover:text-white/80 transition-colors">
                বিস্তারিত দেখুন
              </a>
            )}
          </div>
          <button onClick={handleDismissBanner} className="p-1 hover:bg-black/10 rounded-full transition-colors ml-2">
             <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {children}
    </>
  );
};
