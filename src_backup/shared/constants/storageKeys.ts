export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  ONBOARDING_SEEN: 'onboarding_seen',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DEVICE_ID: 'device_id', // Added for push notifications tracking
  EXAM_PROGRESS_PREFIX: 'parapoth_exam_progress_', // Added for dynamic exam progress caching
  DAILY_QUOTE: 'daily_greeting_quote', // Added for GreetingCard caching
  USER_FULL_NAME: 'user_full_name', // Added for FOUC prevention
  DYN_THEME_CONFIG: 'dyn_theme_config', // Added for FOUC prevention
  HOME_GRIDS_DATA: 'home_grids_data', // Added for caching dashboard features
  REACT_QUERY_CACHE: 'PARAPOTH_QUERY_CACHE', // Added for TanStack offline persister
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Constant for avoiding string duplication
export const LOCAL_STORAGE_SYNC_EVENT = 'local-storage-sync';

// --- QUERY KEYS ---
// Centralized React Query keys for consistent caching and invalidation across the app
export const QUERY_KEYS = {
  USER_PROFILE: ['userProfile', 'me'] as const,
  PUBLIC_PROFILE: (targetId: string) => ['publicProfile', targetId] as const,
  DAILY_QUOTE: ['dailyQuote'] as const, // Added for TanStack query standardization
  STREAK_STATS: ['streak', 'stats'] as const, // Added for useStreak
  STREAK_HEATMAP: ['streak', 'heatmap'] as const, // Added for useStreak
  HOME_GRIDS: ['homeGrids'] as const, // Added for caching dashboard features
} as const;

// --- API ENDPOINTS ---
// Centralized Supabase Edge Functions / API routes to avoid magic strings
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'secure-login',
  },
} as const;
