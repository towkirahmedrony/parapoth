import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, SunMedium, Target } from 'lucide-react';
import FeatureGrid, { ThemeConfig } from '../components/FeatureGrid';
import DynamicBanner from '../components/DynamicBanner';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';
import { useHomeGrids } from '../hooks/useHomeGrids';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import type { AppMessageKey } from '@/shared/i18n/messages';

interface ThemeConfigRow {
  value?: unknown;
  ui_theme_settings?: unknown;
}

interface DailyGoalStats {
  completed: number;
  total: number;
}

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

const clampGoal = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

const getGreetingKey = (hour: number): AppMessageKey => {
  if (hour < 5) return 'home.greetingLateNight';
  if (hour < 12) return 'home.greetingMorning';
  if (hour < 17) return 'home.greetingAfternoon';
  if (hour < 20) return 'home.greetingEvening';

  return 'home.greetingLateNight';
};

const Home: React.FC = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { features, loading: featuresLoading } = useHomeGrids();
  const { language, t } = useLanguage();

  const textFontClass =
    language === 'bn' ? "font-['Hind_Siliguri']" : 'font-sans';

  const metadataName =
    normalizeName(user?.user_metadata?.full_name) ||
    normalizeName(user?.user_metadata?.name);

  const { data: dbProfileName, isLoading } = useQuery({
    queryKey: ['profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      return normalizeName(data?.full_name) || normalizeName(data?.username);
    },
    enabled: !!user?.id,
  });

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

  const { data: activeBanners, isLoading: bannersLoading } = useQuery({
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

  const resolvedProfileName = dbProfileName ?? metadataName ?? null;
  const isNameLoading = !resolvedProfileName && isLoading;

  const themeConfig = sanitizeThemeConfig(themeData);
  const greetingKey = getGreetingKey(new Date().getHours());

  const dailyGoal: DailyGoalStats = { completed: 3, total: 5 };
  const safeTotal = Math.max(dailyGoal.total, 1);
  const progressWidth = `${
    (clampGoal(dailyGoal.completed, 0, safeTotal) / safeTotal) * 100
  }%`;

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

        <section className="mt-3 rounded-[20px] border border-card-border bg-card-bg px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-text-secondary ${textFontClass}`}
            >
              {t('home.eyebrow')}
            </p>
          </div>

          <h2
            className={`mt-1 text-lg font-bold leading-snug text-text-primary sm:text-xl ${textFontClass}`}
          >
            {t('home.heroTitle')}
          </h2>

          <p
            className={`mt-2 text-sm leading-6 text-text-secondary ${textFontClass}`}
          >
            {t('home.heroBody')}
          </p>
        </section>

        <DynamicBanner
          banners={activeBanners ?? null}
          isLoading={bannersLoading}
        />

        <section className="mt-3">
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="w-full rounded-[20px] border border-card-border bg-card-bg px-3 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-badge-bg text-badge-text">
                <Target className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-base font-bold text-text-primary ${textFontClass}`}
                  >
                    {t('home.dailyGoal')}
                  </p>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </div>

                <div
                  role="progressbar"
                  aria-label={t('home.dailyGoalProgress')}
                  aria-valuemin={0}
                  aria-valuemax={dailyGoal.total}
                  aria-valuenow={dailyGoal.completed}
                  className="mt-2.5 h-2 rounded-full bg-secondary"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            </div>
          </button>
        </section>

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
