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
import {
  DEFAULT_HOME_LANGUAGE,
  HOME_MESSAGES,
  isHomeLanguage,
  type HomeLanguage,
  type HomeMessageKey,
} from './homeMessages';

type MessageValues = Record<string, string | number>;

export interface HomeLanguageContextValue {
  /** Currently stored language preference. */
  language: HomeLanguage;
  setLanguage: (language: HomeLanguage) => void;
  /**
   * Homepage-scoped translator. Off the homepage it always returns Bengali so
   * pages that have not been migrated yet keep their current copy.
   */
  t: (key: HomeMessageKey, values?: MessageValues) => string;
  /** True while the visitor is on the homepage. */
  isHomepage: boolean;
}

const HomeLanguageContext = createContext<HomeLanguageContextValue | null>(null);

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

const normalizeLanguage = (value: unknown): HomeLanguage => {
  if (typeof value !== 'string') return DEFAULT_HOME_LANGUAGE;
  const normalized = value.trim().toLowerCase();
  return isHomeLanguage(normalized) ? normalized : DEFAULT_HOME_LANGUAGE;
};

/**
 * Reads the stored preference without clearing or rewriting unrelated keys.
 * Handles JSON values (`"en"`), plain strings (`en`) and unreadable storage.
 */
const readStoredLanguage = (): HomeLanguage => {
  if (typeof window === 'undefined') return DEFAULT_HOME_LANGUAGE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (!raw) return DEFAULT_HOME_LANGUAGE;

    try {
      return normalizeLanguage(JSON.parse(raw));
    } catch {
      return normalizeLanguage(raw);
    }
  } catch {
    return DEFAULT_HOME_LANGUAGE;
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

const applyHomepageMetadata = (language: HomeLanguage): void => {
  const messages = HOME_MESSAGES[language];

  document.title = messages['meta.title'];

  upsertMetaTag('name', 'description', messages['meta.description']);
  upsertMetaTag('name', 'keywords', messages['meta.keywords']);
  upsertMetaTag('property', 'og:title', messages['meta.title']);
  upsertMetaTag('property', 'og:description', messages['meta.description']);
  upsertMetaTag('property', 'og:locale', messages['meta.ogLocale']);
  upsertMetaTag('name', 'twitter:title', messages['meta.title']);
  upsertMetaTag('name', 'twitter:description', messages['meta.description']);
};

export function HomeLanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [language, setLanguageState] =
    useState<HomeLanguage>(readStoredLanguage);

  const isHomepage = isHomepagePath(location.pathname);

  const setLanguage = useCallback((nextLanguage: HomeLanguage) => {
    if (!isHomeLanguage(nextLanguage)) return;

    setLanguageState(nextLanguage);
    StorageUtils.set(STORAGE_KEYS.LANGUAGE, nextLanguage);
  }, []);

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
    (key: HomeMessageKey, values?: MessageValues): string => {
      const activeLanguage = isHomepage ? language : DEFAULT_HOME_LANGUAGE;
      const template =
        HOME_MESSAGES[activeLanguage][key] ??
        HOME_MESSAGES[DEFAULT_HOME_LANGUAGE][key] ??
        key;

      return formatMessage(template, values);
    },
    [isHomepage, language]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (!isHomepage) {
      // Other routes are Bengali-only in this phase; keep the document honest.
      root.lang = DEFAULT_HOME_LANGUAGE;
      return;
    }

    root.lang = language;
    applyHomepageMetadata(language);

    return () => {
      root.lang = DEFAULT_HOME_LANGUAGE;
    };
  }, [isHomepage, language]);

  const value = useMemo<HomeLanguageContextValue>(
    () => ({ language, setLanguage, t, isHomepage }),
    [language, setLanguage, t, isHomepage]
  );

  return (
    <HomeLanguageContext.Provider value={value}>
      {children}
    </HomeLanguageContext.Provider>
  );
}

export const useHomeLanguage = (): HomeLanguageContextValue => {
  const context = useContext(HomeLanguageContext);

  if (!context) {
    throw new Error(
      'useHomeLanguage must be used within a HomeLanguageProvider'
    );
  }

  return context;
};
