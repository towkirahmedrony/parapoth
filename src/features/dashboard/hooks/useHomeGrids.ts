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
  const { data: features = [], isLoading, isFetching, error } = useQuery({
    queryKey: [QUERY_KEYS.HOME_GRIDS],
    queryFn: async () => {
      const { data } = await apiClient.get<HomeGridsResponse>('/system/home-grids');
      if (!data?.data) {
        throw new Error('Failed to load home grids');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 2, // ২ মিনিট ক্যাশ ধরে রাখবে
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: true, // ইউজার অ্যাপে ঢুকলেই আপডেট চেক করবে
    refetchInterval: 1000 * 15, // ম্যাজিক! প্রতি ১৫ সেকেন্ড পরপর ব্যাকগ্রাউন্ডে সাইলেন্টলি নতুন ডেটা চেক করবে
  });

  const loading = isLoading && features.length === 0;

  return { 
    features, 
    loading, 
    isRefetching: isFetching,
    error 
  };
};
