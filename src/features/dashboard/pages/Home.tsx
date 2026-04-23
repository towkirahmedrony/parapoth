import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import GreetingCard from '../components/GreetingCard';
import FeatureGrid, { ThemeConfig } from '../components/FeatureGrid';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';
import { useHomeGrids } from '../hooks/useHomeGrids';

interface ThemeConfigRow {
  value?: unknown;
  ui_theme_settings?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const sanitizeThemeConfig = (input: unknown): ThemeConfig | undefined => {
  if (!isRecord(input)) return undefined;

  const colors = isRecord(input.colors) ? input.colors : undefined;

  return {
    active_theme: typeof input.active_theme === 'string' ? input.active_theme : undefined,
    colors: colors
      ? {
          primaryBackground:
            typeof colors.primaryBackground === 'string' ? colors.primaryBackground : undefined,
          cardColor: typeof colors.cardColor === 'string' ? colors.cardColor : undefined,
          accentColor: typeof colors.accentColor === 'string' ? colors.accentColor : undefined,
          buttonColor: typeof colors.buttonColor === 'string' ? colors.buttonColor : undefined,
          textColor: typeof colors.textColor === 'string' ? colors.textColor : undefined,
        }
      : undefined,
  };
};

const getBannerState = (input: unknown) => {
  if (!isRecord(input)) {
    return {
      showBanner: false,
      bannerText: '',
    };
  }

  return {
    showBanner: input.show_special_banner === true,
    bannerText: typeof input.special_banner_text === 'string' ? input.special_banner_text.trim() : '',
  };
};

const Home: React.FC = memo(() => {
  const { user } = useAuth();
  const { features, loading: featuresLoading } = useHomeGrids();

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
      return typeof data?.full_name === 'string' ? data.full_name : null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    initialData:
      typeof user?.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : null,
  });

  const { data: themeData } = useQuery({
    queryKey: ['app_configs', 'theme_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_configs')
        .select('key, ui_theme_settings, value')
        .eq('key', 'theme_config')
        .single<ThemeConfigRow>();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.value ?? data?.ui_theme_settings ?? null;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const displayUserName = profileName || 'শিক্ষার্থী';
  const themeConfig = sanitizeThemeConfig(themeData);
  const { showBanner, bannerText } = getBannerState(themeData);

  return (
    <div className="min-h-screen pb-24 px-1 transition-colors duration-500">
      {showBanner && bannerText && (
        <div className="mx-4 mt-4 mb-2">
          <div className="relative overflow-hidden rounded-2xl border border-border-color bg-surface-elevated px-4 py-3 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0 z-10">
              <Sparkles className="w-4 h-4 text-text-primary" />
            </div>

            <p className="text-[13px] md:text-sm font-semibold text-text-primary font-[Hind_Siliguri,sans-serif] z-10">
              {bannerText}
            </p>
          </div>
        </div>
      )}

      <GreetingCard userName={displayUserName} />

      <FeatureGrid
        features={features}
        loading={featuresLoading}
        themeConfig={themeConfig}
      />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
