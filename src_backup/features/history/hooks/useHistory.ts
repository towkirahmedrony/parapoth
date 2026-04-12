import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/lib/apiClient';
import { TabType, HistoryItem, MistakeItem, BookmarkItem } from '../types/history';

export const useHistory = (activeTab: TabType) => {
  const queryClient = useQueryClient();

  // 1. History Query
  const { data: historyData = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['history', 'exams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/history/exams');
      return data.data as HistoryItem[];
    },
    enabled: activeTab === 'history',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Mistakes Query
  const { data: mistakeData = [], isLoading: isMistakeLoading } = useQuery({
    queryKey: ['history', 'mistakes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/history/mistakes');
      return data.data as MistakeItem[];
    },
    enabled: activeTab === 'mistakes',
    staleTime: 5 * 60 * 1000,
  });

  // 3. Bookmarks Query
  const { data: bookmarkData = [], isLoading: isBookmarkLoading } = useQuery({
    queryKey: ['history', 'bookmarks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/history/bookmarks');
      return data.data as BookmarkItem[];
    },
    enabled: activeTab === 'bookmarks',
    staleTime: 5 * 60 * 1000,
  });

  // Mutations for Optimistic Updates / Cache Invalidation
  const deleteMistakeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/history/mistakes/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<MistakeItem[]>(['history', 'mistakes'], (old) => 
        old ? old.filter((item) => item.id !== id) : []
      );
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/history/bookmarks/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<BookmarkItem[]>(['history', 'bookmarks'], (old) => 
        old ? old.filter((item) => item.id !== id) : []
      );
    },
  });

  // Combined Loading State
  const isLoading = 
    (activeTab === 'history' && isHistoryLoading) ||
    (activeTab === 'mistakes' && isMistakeLoading) ||
    (activeTab === 'bookmarks' && isBookmarkLoading);

  // Wrappers to match the existing API signature expected by History.tsx
  const deleteMistake = useCallback(async (id: string) => {
    try {
      await deleteMistakeMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error deleting mistake:', error);
      return false;
    }
  }, [deleteMistakeMutation]);

  const deleteBookmark = useCallback(async (id: string) => {
    try {
      await deleteBookmarkMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }, [deleteBookmarkMutation]);

  return {
    isLoading,
    historyData,
    mistakeData,
    bookmarkData,
    deleteMistake,
    deleteBookmark,
  };
};

export default useHistory;
