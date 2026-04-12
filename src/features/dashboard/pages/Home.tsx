import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import GreetingCard from '../components/GreetingCard';
import FeatureGrid, { ThemeConfig } from '../components/FeatureGrid';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';

const Home: React.FC = memo(() => {
  const { user } = useAuth();

  const { data: profileName } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data?.full_name || null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    // Use initialData for immediate fast-load from Supabase Auth session
    initialData: user?.user_metadata?.full_name,
  });

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

  const displayUserName = profileName || 'শিক্ষার্থী';

  return (
    <div className="min-h-screen pb-24 px-1 transition-colors duration-500">
      <GreetingCard userName={displayUserName} />
      <FeatureGrid themeConfig={(themeData as ThemeConfig) || undefined} />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
