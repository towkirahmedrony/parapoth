import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getQuestionBankFilters,
  getQuestionBankQuestions,
  toggleBookmark,
} from '../services/questionBankService';
import {
  DEFAULT_QUESTION_BANK_FILTERS,
  type QuestionBankFilterState,
} from '../types/questionBank';

export function useQuestionBank() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QuestionBankFilterState>(DEFAULT_QUESTION_BANK_FILTERS);

  const filtersQuery = useQuery({
    queryKey: ['question-bank', 'filters'],
    queryFn: getQuestionBankFilters,
    staleTime: 1000 * 60 * 10,
  });

  const questionsQuery = useQuery({
    queryKey: ['question-bank', 'questions', filters],
    queryFn: () => getQuestionBankQuestions(filters),
    staleTime: 1000 * 60 * 2,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ questionId, isBookmarked }: { questionId: string; isBookmarked: boolean }) =>
      toggleBookmark(questionId, isBookmarked),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['question-bank', 'questions'] });
    },
  });

  const derived = useMemo(() => {
    const subjects = filtersQuery.data?.subjects ?? [];
    const chapters = filtersQuery.data?.chapters ?? [];
    const topics = filtersQuery.data?.topics ?? [];

    const filteredChapters = filters.subjectId
      ? chapters.filter((item) => item.subject_id === filters.subjectId)
      : chapters;

    const filteredTopics = filters.chapterId
      ? topics.filter((item) => item.chapter_id === filters.chapterId)
      : topics;

    return {
      subjects,
      chapters: filteredChapters,
      topics: filteredTopics,
      questions: questionsQuery.data?.questions ?? [],
      stats: questionsQuery.data?.stats ?? {
        total: 0,
        bookmarked: 0,
        mistakes: 0,
        mcq: 0,
        board: 0,
        premium: 0,
      },
    };
  }, [filters, filtersQuery.data, questionsQuery.data]);

  const updateFilter = <K extends keyof QuestionBankFilterState>(
    key: K,
    value: QuestionBankFilterState[K]
  ) => {
    setFilters((prev) => {
      if (key === 'subjectId') {
        return {
          ...prev,
          subjectId: String(value),
          chapterId: '',
          topicId: '',
        };
      }

      if (key === 'chapterId') {
        return {
          ...prev,
          chapterId: String(value),
          topicId: '',
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_QUESTION_BANK_FILTERS);
  };

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    subjects: derived.subjects,
    chapters: derived.chapters,
    topics: derived.topics,
    questions: derived.questions,
    stats: derived.stats,
    isLoading: filtersQuery.isLoading || questionsQuery.isLoading,
    isFetching: questionsQuery.isFetching,
    error: filtersQuery.error || questionsQuery.error,
    refetch: questionsQuery.refetch,
    toggleBookmark: toggleBookmarkMutation.mutateAsync,
    isBookmarkUpdating: toggleBookmarkMutation.isPending,
  };
}
