import React, { useMemo } from 'react';
import { AlertTriangle, RefreshCw, Wrench, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

interface GlobalNotice {
  is_active: boolean;
  title: string;
  message: string;
  action_link?: string;
}

interface SystemConfig {
  key: string;
  value?: any;
  ui_theme_settings?: any;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  is_force_update_required?: boolean;
  min_app_version?: string;
}

interface SystemGuardProps {
  children: React.ReactNode;
}

export const SystemGuard: React.FC<SystemGuardProps> = ({ children }) => {
  const [dismissedNoticeId, setDismissedNoticeId] = useLocalStorage<string | null>(STORAGE_KEYS.DISMISSED_NOTICE, null);

  const { data: configs, isLoading } = useQuery<SystemConfig[]>({
    queryKey: ['system-configs'],
    queryFn: async () => {
      const response = await apiClient.get('/system/configs');
      return response.data?.data || [];
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const { maintenance, forceUpdate, globalNotice } = useMemo(() => {
    let maintenance = { active: false, message: '' };
    let forceUpdate = false;
    let globalNotice: GlobalNotice | null = null;

    if (configs) {
      const globalConfig = configs.find((c) => c.key === 'global_settings');
      if (globalConfig) {
        if (globalConfig.maintenance_mode) {
          maintenance = { active: true, message: globalConfig.maintenance_message || '' };
        }
        if (globalConfig.is_force_update_required) {
          const minVer = globalConfig.min_app_version || '0.0.0';
          if (minVer.localeCompare(APP_VERSION, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
            forceUpdate = true;
          }
        }
      }

      const noticeConfig = configs.find((c) => c.key === 'global_notice');
      if (noticeConfig?.value?.is_active) {
        globalNotice = noticeConfig.value;
      }
    }

    return { maintenance, forceUpdate, globalNotice };
  }, [configs]);

  const handleUpdate = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    window.location.reload();
  };

  const currentNoticeId = globalNotice ? `${globalNotice.title}-${globalNotice.message}` : null;
  const showNotice = globalNotice && currentNoticeId !== dismissedNoticeId;

  if (isLoading && !configs) return <>{children}</>;

  if (maintenance.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center fixed inset-0 z-[9999] bg-dyn-bg text-dyn-text">
        <Wrench className="w-16 h-16 text-yellow-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">সিস্টেম আপডেট চলছে</h1>
        <p className="text-lg opacity-80">{maintenance.message || "প্যারাপথ-এর সার্ভারে কিছু গুরুত্বপূর্ণ কাজ চলছে।"}</p>
      </div>
    );
  }

  if (forceUpdate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center fixed inset-0 z-[9999] bg-dyn-bg text-dyn-text">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">নতুন আপডেট এভেইলেবল!</h1>
        <button onClick={handleUpdate} className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-dyn-primary" style={{ color: 'var(--dyn-bg)' }}>
          <RefreshCw className="w-5 h-5" /> আপডেট করুন
        </button>
      </div>
    );
  }

  return (
    <>
      {showNotice && (
        <div className="px-4 py-2.5 flex items-center justify-between z-50 relative shadow-md bg-dyn-primary" style={{ color: 'var(--dyn-bg)' }}>
          <div className="flex-1 text-sm">
            <strong>{globalNotice.title}:</strong> {globalNotice.message}
            {globalNotice.action_link && <a href={globalNotice.action_link} className="underline ml-2">বিস্তারিত</a>}
          </div>
          <button onClick={() => currentNoticeId && setDismissedNoticeId(currentNoticeId)} className="p-1"><X className="w-4 h-4" /></button>
        </div>
      )}
      {children}
    </>
  );
};

export default SystemGuard;
