import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import {
  extractSubmittedResultId,
  type SubmitPayload,
} from '@/features/exam/utils/examSubmission';
import { admissionExamService, mapAttemptQuestion } from '../services/admissionExamService';

/**
 * Admission exam sessions reuse the backend's authoritative attempt lifecycle.
 * The browser never receives the answer key and never computes a trusted score.
 */
export const useAdmissionExamSession = (examId: string | undefined) => {
  const attemptQuery = useQuery({
    queryKey: ['admission', 'attempt', examId],
    queryFn: () => admissionExamService.startAttempt(examId ?? ''),
    enabled: Boolean(examId),
    retry: 0,
    // Starting/resuming an attempt is a one-shot POST. The backend resume is
    // idempotent, but re-issuing the start on every mount or focus is wasteful
    // and can consume quota bookkeeping, so it is fetched once per exam and then
    // treated as fresh until explicitly refetched.
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const attempt = attemptQuery.data ?? null;

  const questionsQuery = useQuery({
    queryKey: ['admission', 'attempt-questions', attempt?.id],
    queryFn: () =>
      admissionExamService.getAttemptQuestions(attempt?.id ?? ''),
    enabled: Boolean(attempt?.id),
    retry: 1,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const questions = useMemo(
    () => (questionsQuery.data?.questions ?? []).map(mapAttemptQuestion),
    [questionsQuery.data]
  );

  const saveDraftMutation = useMutation({
    mutationFn: ({
      answers,
      currentIndex,
    }: {
      answers: Record<string, string>;
      currentIndex: number;
    }) => {
      if (!attempt?.id) return Promise.resolve();
      return admissionExamService.saveDraftAnswers(
        attempt.id,
        answers,
        currentIndex
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const response = await apiClient.post('/exams/user/submit', payload);
      const resultId = extractSubmittedResultId(response.data);
      const result = response.data?.data ?? response.data;
      return { resultId, result };
    },
  });

  return {
    attempt,
    questions,
    questionsResponse: questionsQuery.data ?? null,
    isLoading:
      attemptQuery.isPending ||
      (Boolean(attempt?.id) && questionsQuery.isLoading),
    error: attemptQuery.error ?? questionsQuery.error,
    refetch: async () => {
      await attemptQuery.refetch();
      if (attempt?.id) await questionsQuery.refetch();
    },
    saveDraft: saveDraftMutation.mutate,
    isSavingDraft: saveDraftMutation.isPending,
    submit: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
  };
};
