import React, { memo, useEffect } from 'react';
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

const SEO_TITLE = 'ParaPoth - SSC HSC MCQ, Model Test & Exam Preparation';
const SEO_DESCRIPTION =
  'ParaPoth হলো SSC, HSC ও board exam প্রস্তুতির জন্য MCQ practice, CQ practice, model test, question bank, suggestion, leaderboard ও progress tracking platform.';

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const setPropertyMetaTag = (property: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

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

  useEffect(() => {
    document.title = SEO_TITLE;

    setMetaTag('description', SEO_DESCRIPTION);
    setMetaTag(
      'keywords',
      'ParaPoth, exam preparation Bangladesh, SSC MCQ practice, HSC MCQ practice, board exam model test, question bank, CQ practice, online exam, suggestion'
    );

    setPropertyMetaTag('og:title', SEO_TITLE);
    setPropertyMetaTag('og:description', SEO_DESCRIPTION);
    setPropertyMetaTag('og:type', 'website');
    setPropertyMetaTag('og:url', 'https://parapothexam.web.app/');
    setPropertyMetaTag('og:image', 'https://parapothexam.web.app/icons/header.webp');

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', SEO_TITLE);
    setMetaTag('twitter:description', SEO_DESCRIPTION);
  }, []);

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
  const greetingLabel = getGreetingLabel();

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
                <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary" />
              ) : (
                <>
                  <h1 className="truncate font-['Hind_Siliguri'] text-lg font-bold text-text-primary">
                    {resolvedProfileName ?? 'শিক্ষার্থী'}
                  </h1>
                  <p className="mt-0.5 truncate font-['Hind_Siliguri'] text-xs text-text-secondary">
                    আজকের শেখা শুরু হোক
                  </p>
                </>
              )}
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-badge-bg px-2.5 py-1.5 text-badge-text">
              <SunMedium className="h-3.5 w-3.5" />
              <span className="font-['Hind_Siliguri'] text-[11px] font-semibold">
                {greetingLabel}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-[20px] border border-card-border bg-card-bg px-4 py-4">
          <p className="font-['Hind_Siliguri'] text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Online Exam Preparation
          </p>

          <h2 className="mt-1 font-['Hind_Siliguri'] text-xl font-bold leading-snug text-text-primary">
            SSC, HSC ও board exam প্রস্তুতি করুন MCQ, CQ, model test ও question bank দিয়ে
          </h2>

          <p className="mt-2 font-['Hind_Siliguri'] text-sm leading-6 text-text-secondary">
            ParaPoth শিক্ষার্থীদের জন্য একটি smart exam preparation platform—এখানে
            chapter-wise MCQ practice, model test, previous question practice,
            suggestion, leaderboard এবং progress tracking এক জায়গায় পাওয়া যায়।
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
                  <p className="font-['Hind_Siliguri'] text-base font-bold text-text-primary">
                    আজকের লক্ষ্য
                  </p>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </div>

                <div className="mt-2.5 h-2 rounded-full bg-secondary">
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
          />
        </section>
      </main>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
