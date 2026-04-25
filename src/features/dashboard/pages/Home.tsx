import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, SunMedium, Target } from 'lucide-react';
import FeatureGrid, { ThemeConfig } from '../components/FeatureGrid';
import DynamicBanner from '../components/DynamicBanner';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '@/shared/lib/supabase';
import { useHomeGrids } from '../hooks/useHomeGrids';

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
    active_theme: typeof input.active_theme === 'string' ? input.active_theme : undefined,
    greeting_bg_url: typeof input.greeting_bg_url === 'string' ? input.greeting_bg_url : undefined,
  };
};

const normalizeName = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const clampGoal = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

const getGreetingLabel = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'শুভ রাত';
  if (hour < 12) return 'শুভ সকাল';
  if (hour < 17) return 'শুভ দুপুর';
  if (hour < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত';
};

const Home: React.FC = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { features, loading: featuresLoading } = useHomeGrids();

  const metadataName = normalizeName(user?.user_metadata?.full_name) || normalizeName(user?.user_metadata?.name);

  const { data: dbProfileName, isLoading } = useQuery({
    queryKey: ['profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
      if (error) throw error;
      return normalizeName(data?.full_name) || normalizeName(data?.username);
    },
    enabled: !!user?.id,
  });

  const { data: themeData } = useQuery({
    queryKey: ['app_configs', 'theme_config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_configs').select('value, ui_theme_settings').eq('key', 'theme_config').maybeSingle<ThemeConfigRow>();
      if (error) throw error;
      return data?.value ?? data?.ui_theme_settings ?? null;
    },
  });

  const { data: activeBanners, isLoading: bannersLoading } = useQuery({
    queryKey: ['home_banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('home_banners').select('*').eq('is_active', true).order('sequence', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const resolvedProfileName = dbProfileName ?? metadataName ?? null;
  const isNameLoading = !resolvedProfileName && isLoading;

  const themeConfig = sanitizeThemeConfig(themeData);
  const greetingLabel = getGreetingLabel();

  const dailyGoal: DailyGoalStats = { completed: 3, total: 5 };
  const safeTotal = Math.max(dailyGoal.total, 1);
  const progressWidth = `${(clampGoal(dailyGoal.completed, 0, safeTotal) / safeTotal) * 100}%`;

  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3">
        {/* GREETING CARD */}
        <section className="relative overflow-hidden rounded-[20px] border border-card-border bg-card-bg px-4 py-3">
          <div className="relative z-10 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              {isNameLoading ? (
                <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary" />
              ) : (
                <>
                  <h1 className="truncate font-['Hind_Siliguri'] text-lg font-bold text-text-primary">{resolvedProfileName ?? 'শিক্ষার্থী'}</h1>
                  <p className="mt-0.5 truncate font-['Hind_Siliguri'] text-xs text-text-secondary">আজকের শেখা শুরু হোক</p>
                </>
              )}
            </div>
            <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-badge-bg px-2.5 py-1.5 text-badge-text">
              <SunMedium className="h-3.5 w-3.5" />
              <span className="font-['Hind_Siliguri'] text-[11px] font-semibold">{greetingLabel}</span>
            </div>
          </div>
        </section>

        {/* DYNAMIC BANNER COMPONENT */}
        <DynamicBanner banners={activeBanners ?? null} isLoading={bannersLoading} />

        {/* DAILY GOAL */}
        <section className="mt-3">
          <button onClick={() => navigate('/progress')} className="w-full rounded-[20px] border border-card-border bg-card-bg px-3 py-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-badge-bg text-badge-text">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-['Hind_Siliguri'] text-base font-bold text-text-primary">আজকের লক্ষ্য</p>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </div>
                <div className="mt-2.5 h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: progressWidth }} />
                </div>
              </div>
            </div>
          </button>
        </section>

        <section className="mt-3">
          <FeatureGrid features={features} loading={featuresLoading} themeConfig={themeConfig} />
        </section>
      </div>
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
