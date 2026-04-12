import { createContext, useEffect, useState } from 'react';
import { supabase } from '../../shared/lib/supabase';
import apiClient from '../../shared/lib/apiClient';

export type Theme = 'dark' | 'light' | 'system';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  globalConfig: any;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  globalConfig: null,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'parapoth-ui-theme' }: any) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [globalConfig, setGlobalConfig] = useState<any>(null);

  // Apply Global Theme Settings from Backend
  useEffect(() => {
    const fetchGlobalTheme = async () => {
      try {
        const response = await apiClient.get('/system/theme-config');
        const config = response.data?.data;
        if (config) {
          setGlobalConfig(config);
          const root = window.document.documentElement;
          
          // Inject dynamic CSS variables directly into HTML root
          if(config.colors) {
            if(config.colors.primaryBackground) {
              root.style.setProperty('--dyn-bg', config.colors.primaryBackground);
              root.style.backgroundColor = config.colors.primaryBackground;
              document.body.style.backgroundColor = config.colors.primaryBackground;
            }
            if(config.colors.cardBackground || config.colors.primaryBackground) root.style.setProperty('--dyn-card', config.colors.cardBackground || config.colors.primaryBackground);
            if(config.colors.textColor) root.style.setProperty('--dyn-text', config.colors.textColor);
            if(config.colors.buttonColor) root.style.setProperty('--dyn-primary', config.colors.buttonColor);
            if(config.colors.accentColor) root.style.setProperty('--dyn-accent', config.colors.accentColor);
          }
          
          // Apply active theme preset if forced by admin
          if(config.active_theme && config.active_theme !== 'default') {
            root.classList.add(`theme-${config.active_theme}`);
          }
        }
      } catch (error) {
        console.error('Failed to load global theme:', error);
      }
    };
    fetchGlobalTheme();
  }, []);

  // Handle User Light/Dark Mode Preference
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme.matches ? 'dark' : 'light');
      };
      applySystemTheme();
      systemTheme.addEventListener('change', applySystemTheme);
      return () => systemTheme.removeEventListener('change', applySystemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    globalConfig,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
      // Background Sync
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.from('profiles').select('settings').eq('id', session.user.id).single()
            .then(({ data }) => {
              const currentSettings = (data?.settings as any) || {};
              supabase.from('profiles').update({ settings: { ...currentSettings, theme: newTheme } }).eq('id', session.user.id);
            });
        }
      });
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
