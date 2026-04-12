import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { STORAGE_KEYS, QUERY_KEYS } from '../../../shared/constants/storageKeys';

export interface GridItem {
  id: string;
  title: string;
  icon_name: string;
  link: string | null;
  bg_color: string | null;
  color: string | null;
}

export const useHomeGrids = () => {
  // Persistence for offline/fast-load experience
  const [cachedFeatures, setCachedFeatures] = useLocalStorage<GridItem[]>(
    STORAGE_KEYS.HOME_GRIDS_DATA,
    []
  );

  // Sync ref to track current cache and avoid loop
  const lastSyncedRef = useRef<string>(JSON.stringify(cachedFeatures));

  // Server state management via TanStack Query
  const { data: fetchedFeatures, isLoading, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.HOME_GRIDS,
    queryFn: async () => {
      const response = await apiClient.get('/system/home-grids');
      if (!response.data?.data) {
        throw new Error('Failed to load home grids');
      }
      return response.data.data as GridItem[];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60,   // 60 mins
  });

  // Safe Synchronization Logic
  useEffect(() => {
    if (fetchedFeatures) {
      const freshDataString = JSON.stringify(fetchedFeatures);
      
      // Update only if data is actually different from what we last saved
      if (freshDataString !== lastSyncedRef.current) {
        setCachedFeatures(fetchedFeatures);
        lastSyncedRef.current = freshDataString;
      }
    }
  }, [fetchedFeatures, setCachedFeatures]);

  // Priority: Server Data > Local Cache > Empty Array
  const features = fetchedFeatures || cachedFeatures || [];
  
  // loading state logic: only show skeleton if there is absolutely no data
  const loading = isLoading && features.length === 0;

  return { 
    features, 
    loading, 
    isRefetching: isFetching,
    error 
  };
};
