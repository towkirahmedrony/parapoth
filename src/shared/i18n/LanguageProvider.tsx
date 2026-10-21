import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { StorageUtils } from '@/shared/utils/storage';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  APP_MESSAGES,
  DEFAULT_APP_LANGUAGE,
  isAppLanguage,
  type AppLanguage,
  type AppMessageKey,
} from './messages';

type MessageValues = Record<string, string | number>;

export interface LanguageContextValue {
  /** Currently stored language preference (single authoritative state). */
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  /**
   * Application-wide translator. Falls back to Bengali, then to the raw key,
   * so a missing translation can never crash a screen.
   */
  t: (key: AppMessageKey, values?: MessageValues) => string;
  /** True while the visitor is on a homepage route (drives SEO metadata). */
  isHomepage: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const HOMEPAGE_PATHS = new Set(['/', '/dashboard', '/dashboard/home']);

export const isHomepagePath = (pathname: string): boolean => {
  if (!pathname) return false;
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return HOMEPAGE_PATHS.has(normalized);
};

const formatMessage = (template: string, values?: MessageValues): string => {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  );
};

const normalizeLanguage = (value: unknown): AppLanguage => {
  if (typeof value !== 'string') return DEFAULT_APP_LANGUAGE;
  const normalized = value.trim().toLowerCase();
  return isAppLanguage(normalized) ? normalized : DEFAULT_APP_LANGUAGE;
};

/**
 * Reads the stored preference without clearing or rewriting unrelated keys.
 * Handles JSON values (`"en"`), plain strings (`en`) and unreadable storage.
 * This is the same STORAGE_KEYS.LANGUAGE mechanism the homepage switcher
 * used before, so previously saved preferences keep working.
 */
const readStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return DEFAULT_APP_LANGUAGE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (!raw) return DEFAULT_APP_LANGUAGE;

    try {
      return normalizeLanguage(JSON.parse(raw));
    } catch {
      return normalizeLanguage(raw);
    }
  } catch {
    return DEFAULT_APP_LANGUAGE;
  }
};

const upsertMetaTag = (
  attribute: 'name' | 'property',
  key: string,
  content: string
): void => {
  if (typeof document === 'undefined') return;

  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const applyHomepageMetadata = (language: AppLanguage): void => {
  const messages = APP_MESSAGES[language];

  document.title = messages['meta.title'];

  upsertMetaTag('name', 'description', messages['meta.description']);
  upsertMetaTag('name', 'keywords', messages['meta.keywords']);
  upsertMetaTag('property', 'og:title', messages['meta.title']);
  upsertMetaTag('property', 'og:description', messages['meta.description']);
  upsertMetaTag('property', 'og:locale', messages['meta.ogLocale']);
  upsertMetaTag('name', 'twitter:title', messages['meta.title']);
  upsertMetaTag('name', 'twitter:description', messages['meta.description']);
};

/**
 * Application-level language provider. One state instance lives at the app
 * root and is shared by the Homepage, Settings, Progress and History pages
 * (plus the navigation chrome), so switching once updates every screen
 * immediately and survives refresh via localStorage.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const [language, setLanguageState] =
    useState<AppLanguage>(readStoredLanguage);

  const isHomepage = isHomepagePath(location.pathname);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    if (!isAppLanguage(nextLanguage)) return;

    setLanguageState(nextLanguage);
    StorageUtils.set(STORAGE_KEYS.LANGUAGE, nextLanguage);
    if (user?.id) {
      void supabase
        .from('profiles')
        .update({ language_preference: nextLanguage })
        .eq('id', user.id);
    }
  }, [user?.id]);

  // A signed-in profile is authoritative; localStorage remains the offline/logged-out mirror.
  useEffect(() => {
    if (!user?.language_preference || !isAppLanguage(user.language_preference)) return;
    if (user.language_preference !== language) {
      setLanguageState(user.language_preference);
      StorageUtils.set(STORAGE_KEYS.LANGUAGE, user.language_preference);
    }
  }, [language, user?.language_preference]);

  // Keep tabs in sync when the preference changes elsewhere.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== STORAGE_KEYS.LANGUAGE) return;
      setLanguageState(readStoredLanguage());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = useCallback(
    (key: AppMessageKey, values?: MessageValues): string => {
      const template =
        APP_MESSAGES[language][key] ??
        APP_MESSAGES[DEFAULT_APP_LANGUAGE][key] ??
        key;

      return formatMessage(template, values);
    },
    [language]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // The document language always reflects the active preference.
    document.documentElement.lang = language;

    if (isHomepage) {
      applyHomepageMetadata(language);
    }
  }, [isHomepage, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, isHomepage }),
    [language, setLanguage, t, isHomepage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
