import React, { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SunMedium } from 'lucide-react';
import FeatureGrid, { ThemeConfig } from '../components/FeatureGrid';
import DynamicBanner from '../components/DynamicBanner';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';
import { useHomeGrids } from '../hooks/useHomeGrids';
import { useLiveExamActive } from '../hooks/useLiveExamActive';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import type { AppMessageKey } from '@/shared/i18n/messages';

interface ThemeConfigRow {
  value?: unknown;
  ui_theme_settings?: unknown;
}

interface HomeBannerRow {
  id: string;
  title: string | null;
  image_url: string | null;
  action_link: string | null;
  target_rules: unknown;
  description?: string | null;
  button_text?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

const LIVE_EXAM_LINK_PREFIX = '/exam/live';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const sanitizeThemeConfig = (input: unknown): ThemeConfig | undefined => {
  if (!isRecord(input)) return undefined;

  return {
    active_theme:
      typeof input.active_theme === 'string' ? input.active_theme : undefined,
    greeting_bg_url:
      typeof input.greeting_bg_url === 'string'
        ? input.greeting_bg_url
        : undefined,
  };
};

const normalizeName = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const getGreetingKey = (hour: number): AppMessageKey => {
  if (hour < 5) return 'home.greetingLateNight';
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 17) return 'home.greetingAfternoon';
  if (hour < 20) return 'home.greetingEvening';

  return 'home.greetingLateNight';
};

const isLiveExamBanner = (banner: HomeBannerRow) => {
  return (banner.action_link ?? '').startsWith(LIVE_EXAM_LINK_PREFIX);
};

const isWithinSchedule = (banner: HomeBannerRow, now: number) => {
  const start = banner.start_date ? Date.parse(banner.start_date) : NaN;
  const end = banner.end_date ? Date.parse(banner.end_date) : NaN;

  if (!Number.isNaN(start) && now < start) return false;
  if (!Number.isNaN(end) && now > end) return false;

  return true;
};

const Home: React.FC = memo(() => {
  const { user, loading: authLoading, profileLoading } = useAuth();
  const { features, loading: featuresLoading } = useHomeGrids();
  const { isLive: isLiveExamActive } = useLiveExamActive();
  const { language, t } = useLanguage();

  const textFontClass =
    language === 'bn' ? "font-['Hind_Siliguri']" : 'font-sans';

  const metadataName =
    normalizeName(user?.user_metadata?.full_name) ||
    normalizeName(user?.user_metadata?.name);

  const { data: themeData } = useQuery({
    queryKey: ['app_configs', 'theme_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_configs')
        .select('value, ui_theme_settings')
        .eq('key', 'theme_config')
        .maybeSingle<ThemeConfigRow>();

      if (error) throw error;

      return data?.value ?? data?.ui_theme_settings ?? null;
    },
  });

  const { data: activeBanners } = useQuery({
    queryKey: ['home_banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_banners')
        .select('*')
        .eq('is_active', true)
        .order('sequence', { ascending: true });

      if (error) throw error;

      return data;
    },
  });

  // লাইভ এক্সাম ব্যানার শুধু এক্সাম চলাকালীন দেখাবে; বাকি ব্যানার আগের মতোই।
  const visibleBanners = useMemo(() => {
    const now = Date.now();

    return ((activeBanners ?? []) as HomeBannerRow[]).filter((banner) => {
      if (!isWithinSchedule(banner, now)) return false;
      if (isLiveExamBanner(banner)) return isLiveExamActive;
      return true;
    });
  }, [activeBanners, isLiveExamActive]);

  const resolvedProfileName =
    normalizeName(user?.full_name) ||
    normalizeName(user?.username) ||
    metadataName;
  const isNameLoading = authLoading || profileLoading;

  const themeConfig = sanitizeThemeConfig(themeData);
  const greetingKey = getGreetingKey(new Date().getHours());

  return (
    <div className="min-h-screen bg-app pb-24">
      <main className="mx-auto w-full max-w-6xl px-3 pt-3">
        <section className="relative overflow-hidden rounded-[20px] border border-card-border bg-card-bg px-4 py-3">
          <div className="relative z-10 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              {isNameLoading ? (
                <div
                  role="status"
                  aria-label={t('home.loadingProfile')}
                  className="h-6 w-32 animate-pulse rounded-lg bg-secondary"
                />
              ) : (
                <>
                  <h1
                    className={`truncate text-lg font-bold text-text-primary ${textFontClass}`}
                  >
                    {resolvedProfileName ?? t('home.studentFallback')}
                  </h1>
                  <p
                    className={`mt-0.5 truncate text-xs text-text-secondary ${textFontClass}`}
                  >
                    {t('home.startLearning')}
                  </p>
                </>
              )}
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-badge-bg px-2.5 py-1.5 text-badge-text">
              <SunMedium className="h-3.5 w-3.5" />
              <span
                className={`text-[11px] font-semibold ${textFontClass}`}
              >
                {t(greetingKey)}
              </span>
            </div>
          </div>
        </section>

        <DynamicBanner
          key={visibleBanners.length}
          banners={visibleBanners.length > 0 ? visibleBanners : null}
          isLoading={false}
        />

        <section className="mt-3">
          <FeatureGrid
            features={features}
            loading={featuresLoading}
            themeConfig={themeConfig}
            loadingLabel={t('home.featuresLoading')}
          />
        </section>
      </main>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
