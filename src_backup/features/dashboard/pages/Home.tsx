import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import GreetingCard from '../components/GreetingCard';
import FeatureGrid from '../components/FeatureGrid';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../shared/lib/supabase';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Replace raw localStorage with useLocalStorage
  const [cachedUserName, setCachedUserName] = useLocalStorage<string>(
    STORAGE_KEYS.USER_FULL_NAME,
    user?.user_metadata?.full_name || 'শিক্ষার্থী'
  );

  const [cachedTheme, setCachedTheme] = useLocalStorage<any>(
    STORAGE_KEYS.DYN_THEME_CONFIG,
    null
  );

  // Fetch User Profile using React Query
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
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Fetch Theme Config using React Query
  const { data: themeData } = useQuery({
    queryKey: ['app_configs', 'theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_configs')
        .select('key, ui_theme_settings, value');

      if (error) throw error;
      if (data && data.length > 0) {
        const themeRow = data.find((row) =>
          row.key.includes('theme') || row.ui_theme_settings !== null
        ) || data[0];
        return themeRow?.ui_theme_settings || themeRow?.value || null;
      }
      return null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  // Sync server state to local storage for FOUC prevention on next reload
  useEffect(() => {
    if (profileData?.full_name && profileData.full_name !== cachedUserName) {
      setCachedUserName(profileData.full_name);
    }
  }, [profileData?.full_name, cachedUserName, setCachedUserName]);

  useEffect(() => {
    if (themeData && JSON.stringify(themeData) !== JSON.stringify(cachedTheme)) {
      setCachedTheme(themeData);
    }
  }, [themeData, cachedTheme, setCachedTheme]);

  const displayUserName = profileData?.full_name || cachedUserName;
  const activeTheme = themeData || cachedTheme;

  return (
    <div className="min-h-screen pb-24 px-1 transition-colors duration-500">
      <GreetingCard userName={displayUserName} />
      <FeatureGrid themeConfig={activeTheme} />
    </div>
  );
};

export default Home;
