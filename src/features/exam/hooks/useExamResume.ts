import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExamProgressState } from '@/shared/types/app';
import { supabase } from '@/shared/lib/supabase';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { StorageUtils, AnyStorageKey } from '@/shared/utils/storage';

interface SaveProgressPayload {
  examId: string;
  state: ExamProgressState;
  userId?: string;
}

interface ClearProgressPayload {
  examId: string;
  userId?: string;
}

export const useExamResume = () => {
  const queryClient = useQueryClient();

  // Used mutateAsync to return Promises to the caller
  const { mutateAsync: syncProgressAsync } = useMutation({
    mutationFn: async ({ examId, state, userId }: SaveProgressPayload) => {
      if (!userId || state.status === 'finished') return;

      const payload = {
        exam_id: examId,
        user_id: userId,
        current_question_index: state.currentQuestionIndex,
        answers_draft: state.answers_draft,
        time_remaining: state.timeRemaining,
        last_updated_at: new Date().toISOString(),
      };

      // Using upsert to avoid race conditions and reduce API calls
      const { error } = await supabase
        .from('exam_progress')
        .upsert(payload, { onConflict: 'user_id,exam_id' });

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Failed to sync progress to Supabase:", error);
    }
  });

  const { mutateAsync: clearProgressAsync } = useMutation({
    mutationFn: async ({ examId, userId }: ClearProgressPayload) => {
      if (!userId) return;

      const { error } = await supabase
        .from('exam_progress')
        .delete()
        .eq('user_id', userId)
        .eq('exam_id', examId);

      if (error) throw error;
    },
    onSuccess: (_, { examId, userId }) => {
       if (userId) {
         queryClient.invalidateQueries({ queryKey: ['exam-progress', userId, examId] });
       }
    },
    onError: (error) => {
      console.error("Failed to clear exam progress from Supabase:", error);
    }
  });

  // Made async and returning the Promise from mutateAsync
  const saveProgress = useCallback(async (examId: string, state: ExamProgressState, userId?: string) => {
    // 1. Local Storage save via StorageUtils
    try {
      const key = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${examId}` as AnyStorageKey;
      StorageUtils.set(key, state);
    } catch (error) {
      console.error("Failed to save exam progress locally:", error);
    }

    // 2. Supabase sync via mutation promise
    return syncProgressAsync({ examId, state, userId });
  }, [syncProgressAsync]);

  const loadProgress = useCallback(async (examId: string, userId?: string): Promise<ExamProgressState | null> => {
    const key = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${examId}` as AnyStorageKey;

    // 1. Fetch from DB (cross-device sync)
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('exam_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('exam_id', examId)
          .single();

        if (data && !error) {
          const state: ExamProgressState = {
            exam_id: examId,
            currentQuestionIndex: data.current_question_index || 0,
            answers_draft: (data.answers_draft as Record<string, number>) || {},
            timeRemaining: data.time_remaining || 0,
            status: 'idle',
            isComplete: false
          };
          
          // Keep local storage updated
          StorageUtils.set(key, state);
          return state;
        }
      } catch (error) {
         console.warn("No DB progress found or error, falling back to local storage.", error);
      }
    }

    // 2. Fallback to local storage
    try {
      return StorageUtils.get<ExamProgressState>(key) || null;
    } catch (error) {
      console.error("Failed to load exam progress locally:", error);
      return null;
    }
  }, []);

  // Made async and returning the Promise from mutateAsync
  const clearProgress = useCallback(async (examId: string, userId?: string) => {
    try {
      const key = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${examId}` as AnyStorageKey;
      StorageUtils.remove(key);
    } catch (error) {
      console.error("Failed to clear exam progress locally:", error);
    }

    return clearProgressAsync({ examId, userId });
  }, [clearProgressAsync]);

  return { saveProgress, loadProgress, clearProgress };
};
