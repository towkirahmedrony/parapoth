import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';

export interface GridItem {
  id: string;
  title: string;
  icon_name: string;
  link: string | null;
  bg_color: string | null;
  color: string | null;
  serial_order?: number | null;
}

interface HomeGridsResponse {
  data: GridItem[];
}

export const useHomeGrids = () => {
  // Server state management via TanStack Query.
  // Ad-hoc local storage sync (useEffect + useLocalStorage) has been completely removed 
  // to prevent infinite render loops. React Query handles memory caching natively.
  const { data: features = [], isLoading, isFetching, error } = useQuery({
    queryKey: [QUERY_KEYS.HOME_GRIDS], // Fixed: Strictly array based queryKey
    queryFn: async () => {
      const { data } = await apiClient.get<HomeGridsResponse>('/system/home-grids');
      if (!data?.data) {
        throw new Error('Failed to load home grids');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60,   // 60 mins
  });

  const loading = isLoading && features.length === 0;

  return { 
    features, 
    loading, 
    isRefetching: isFetching,
    error 
  };
};
