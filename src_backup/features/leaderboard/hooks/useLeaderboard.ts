import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { LeaderboardUser } from '../types/leaderboard';
import { GroupLeaderboardResponse } from '../types/groupLeaderboard';

// Best Practice: Centralized Query Keys factory
export const LEADERBOARD_QUERY_KEYS = {
  all: ['leaderboard'] as const,
  league: (minXp: number, maxXp: number) => [...LEADERBOARD_QUERY_KEYS.all, 'league', minXp, maxXp] as const,
  squads: () => [...LEADERBOARD_QUERY_KEYS.all, 'squads'] as const,
};

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const useLeaderboard = (minXp: number, maxXp: number) => {
  return useQuery<LeaderboardUser[]>({
    queryKey: LEADERBOARD_QUERY_KEYS.league(minXp, maxXp),
    queryFn: async () => {
      // Added strict typing to apiClient.get
      const response = await apiClient.get<ApiResponse<LeaderboardUser[]>>('/leaderboard/league', {
        params: { min_xp: minXp, max_xp: maxXp }
      });
      return response.data.data;
    },
    // Prevent excessive refetching of leaderboard data
    staleTime: 1000 * 60, // Data remains fresh for 1 minute
    refetchOnWindowFocus: false, // Don't refetch just because user switched tabs
  });
};

export const useSquadLeaderboard = () => {
  return useQuery<GroupLeaderboardResponse>({
    queryKey: LEADERBOARD_QUERY_KEYS.squads(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GroupLeaderboardResponse>>('/leaderboard/squads');
      const data = response.data.data;

      // Data Normalization: Smooth out backend casing inconsistencies right at the source
      if (data.myGroup && !data.my_group) {
        data.my_group = data.myGroup;
      }

      return data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
};
