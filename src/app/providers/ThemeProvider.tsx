import {
  createContext,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import apiClient from '@/shared/lib/apiClient';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { StorageUtils } from '@/shared/utils/storage';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

export type Theme = 'dark' | 'light' | 'system';

type ThemeColors = {
  primaryBackground?: string;
  cardBackground?: string;
  cardColor?: string;
  textColor?: string;
  buttonColor?: string;
  accentColor?: string;
};

type RequiredThemeColors = {
  primaryBackground: string;
  cardBackground: string;
  textColor: string;
  buttonColor: string;
  accentColor: string;
};

type GlobalThemeConfig = {
  colors?: {
    dark?: ThemeColors;
    light?: ThemeColors;
    default?: ThemeColors;
  } | ThemeColors | null;
  active_theme?: string | null;
  bgType?: string | null;
  bgMediaUrl?: string | null;
  show_special_banner?: boolean | null;
  special_banner_text?: string | null;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  globalConfig: GlobalThemeConfig | null;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => undefined,
  toggleTheme: () => undefined,
  globalConfig: null,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);

type ThemeProviderProps = {
  children: ReactNode;
};

const THEME_PRESET_CLASS_PREFIX = 'theme-';

function removeThemePresetClasses(root: HTMLElement) {
  const presetClasses = Array.from(root.classList).filter((className) =>
    className.startsWith(THEME_PRESET_CLASS_PREFIX)
  );

  if (presetClasses.length > 0) {
    root.classList.remove(...presetClasses);
  }
}

function getResolvedMode(theme: Theme): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

function getFallbackDynamicColors(mode: 'light' | 'dark'): RequiredThemeColors {
  return mode === 'dark'
    ? {
        primaryBackground: '#0F1115',
        cardBackground: '#1E293B',
        textColor: '#F8FAFC',
        buttonColor: '#3B82F6',
        accentColor: '#6366F1',
      }
    : {
        primaryBackground: '#F8FAFC',
        cardBackground: '#FFFFFF',
        textColor: '#0F172A',
        buttonColor: '#2563EB',
        accentColor: '#4F46E5',
      };
}

function normalizeThemeColors(
  colors: ThemeColors | null | undefined,
  fallback: RequiredThemeColors
): RequiredThemeColors {
  return {
    primaryBackground: colors?.primaryBackground?.trim() || fallback.primaryBackground,
    cardBackground:
      colors?.cardBackground?.trim() || colors?.cardColor?.trim() || fallback.cardBackground,
    textColor: colors?.textColor?.trim() || fallback.textColor,
    buttonColor: colors?.buttonColor?.trim() || fallback.buttonColor,
    accentColor: colors?.accentColor?.trim() || fallback.accentColor,
  };
}

function extractColorsForMode(configColors: GlobalThemeConfig['colors'], mode: 'light' | 'dark'): ThemeColors | null | undefined {
    if (!configColors) return null;

    if ('dark' in configColors || 'light' in configColors || 'default' in configColors) {
        const structuredColors = configColors as { dark?: ThemeColors; light?: ThemeColors; default?: ThemeColors };
        
        if (mode === 'dark' && structuredColors.dark) return structuredColors.dark;
        if (mode === 'light' && structuredColors.light) return structuredColors.light;
        if (structuredColors.default) return structuredColors.default;
        
        return null;
    }

    // FIX: If the API sends a flat structure (usually light colors) but the user is in dark mode,
    // we ignore the API colors so the app falls back to the default dark theme!
    if (mode === 'dark') {
        return null; 
    }

    return configColors as ThemeColors;
}


function applyResolvedThemeToDom(
  theme: Theme,
  config?: GlobalThemeConfig | null
) {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;
  const body = window.document.body;
  const reactRoot = window.document.getElementById('root');
  
  const colors = config?.colors;
  const bgType = config?.bgType;
  const bgMediaUrl = config?.bgMediaUrl;

  const resolvedMode = getResolvedMode(theme);

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedMode);
  root.style.colorScheme = resolvedMode;

  const fallbackColors = getFallbackDynamicColors(resolvedMode);
  let activeColors: RequiredThemeColors;

  const modeSpecificColors = extractColorsForMode(colors, resolvedMode);

  if (modeSpecificColors) {
     activeColors = normalizeThemeColors(modeSpecificColors, fallbackColors);
  } else {
     activeColors = fallbackColors;
  }

  root.style.setProperty('--dyn-bg', activeColors.primaryBackground);
  root.style.setProperty('--dyn-card', activeColors.cardBackground);
  root.style.setProperty('--dyn-text', activeColors.textColor);
  root.style.setProperty('--dyn-primary', activeColors.buttonColor);
  root.style.setProperty('--dyn-accent', activeColors.accentColor);

  let bgImage = 'none';
  if (bgType === 'image' && bgMediaUrl) {
    bgImage = `url("${bgMediaUrl}")`;
  }

  root.style.backgroundColor = activeColors.primaryBackground;
  
  if (body) {
    body.style.backgroundColor = activeColors.primaryBackground;
    body.style.backgroundImage = bgImage;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundAttachment = 'fixed';
    body.style.color = activeColors.textColor;
  }
  
  if (reactRoot) {
    reactRoot.style.backgroundColor = 'transparent';
    reactRoot.style.color = activeColors.textColor;
  }

  if (config) {
    StorageUtils.set(STORAGE_KEYS.DYN_THEME_CONFIG, config);
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const location = useLocation();
  const [theme, setThemeState] = useLocalStorage<Theme>(STORAGE_KEYS.THEME, 'system');

  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const { data: globalConfig = null } = useQuery<GlobalThemeConfig | null>({
    queryKey: ['theme-config'],
    queryFn: async () => {
      const response = await apiClient.get('/system/theme-config');
      const rawData = response.data?.data;
      
      const parsedData = rawData?.value ? rawData.value : rawData;
      return (parsedData as GlobalThemeConfig | null) ?? null;
    },
    staleTime: 1000 * 15, 
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const syncThemeToDom = useCallback(
    (nextTheme: Theme) => {
      const cachedConfig = StorageUtils.get(STORAGE_KEYS.DYN_THEME_CONFIG) as GlobalThemeConfig | null;
      const configSource = globalConfig ?? cachedConfig;
      applyResolvedThemeToDom(nextTheme, configSource);
    },
    [globalConfig]
  );

  useEffect(() => {
    const fetchUserTheme = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', session.user.id)
        .single();

      if (data?.settings && typeof data.settings === 'object') {
        const dbTheme = (data.settings as Record<string, unknown>).theme;
        if (dbTheme && ['light', 'dark', 'system'].includes(dbTheme as string)) {
          setThemeState(dbTheme as Theme);
        }
      }
    };
    void fetchUserTheme();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) void fetchUserTheme();
    });
    return () => subscription.unsubscribe();
  }, [setThemeState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    removeThemePresetClasses(window.document.documentElement);
    const activeThemePreset = globalConfig?.active_theme;
    if (activeThemePreset && activeThemePreset !== 'default') {
      window.document.documentElement.classList.add(`${THEME_PRESET_CLASS_PREFIX}${activeThemePreset}`);
    }
  }, [globalConfig?.active_theme]);

  useLayoutEffect(() => {
    syncThemeToDom(theme);
  }, [theme, location.pathname, location.key, syncThemeToDom]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    syncThemeToDom(theme);

    const localRafId = window.requestAnimationFrame(() => syncThemeToDom(theme));
    const localTimeoutId = window.setTimeout(() => syncThemeToDom(theme), 80);

    return () => {
      window.cancelAnimationFrame(localRafId);
      window.clearTimeout(localTimeoutId);
    };
  }, [location.key, theme, syncThemeToDom]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

      syncThemeToDom(theme);
      rafRef.current = window.requestAnimationFrame(() => syncThemeToDom(theme));
      timeoutRef.current = window.setTimeout(() => syncThemeToDom(theme), 80);
    };

    window.addEventListener('pageshow', handleSync);
    window.addEventListener('popstate', handleSync);

    return () => {
      window.removeEventListener('pageshow', handleSync);
      window.removeEventListener('popstate', handleSync);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [theme, syncThemeToDom]);

  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => syncThemeToDom('system');
    
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme, syncThemeToDom]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      syncThemeToDom(newTheme);
      void (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          const { data: profile } = await supabase.from('profiles').select('settings').eq('id', session.user.id).single();
          const currentSettings = profile?.settings && typeof profile.settings === 'object' ? (profile.settings as Record<string, unknown>) : {};
          await supabase.from('profiles').update({ settings: { ...currentSettings, theme: newTheme } }).eq('id', session.user.id);
        } catch {}
      })();
    },
    [setThemeState, syncThemeToDom]
  );

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [setTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme, globalConfig }), [theme, setTheme, toggleTheme, globalConfig]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
