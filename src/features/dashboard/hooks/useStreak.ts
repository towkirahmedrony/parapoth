import { useQuery } from '@tanstack/react-query';
import { fetchStreakData, StreakDataResponse } from '../services/streakService';
import { useAuth } from '../../auth/hooks/useAuth';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';

export interface UseStreakReturn extends StreakDataResponse {
  loading: boolean;
  error: Error | string | null;
}

export const useStreak = (): UseStreakReturn => {
  const { user } = useAuth();

  // Unified Query fetching from the dedicated Service
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...QUERY_KEYS.STREAK_STATS, user?.id],
    queryFn: () => fetchStreakData(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? null,
    freezesLeft: data?.freezesLeft ?? 2,
    activities: data?.activities ?? [],
    loading: isLoading,
    error: error ? "ডেটা লোড করতে সমস্যা হচ্ছে। ইন্টারনেট কানেকশন চেক করুন।" : null,
  };
};
