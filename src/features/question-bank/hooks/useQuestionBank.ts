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

  const shouldFetchQuestions = Boolean(
    filters.subjectId || 
    filters.search || 
    filters.bookmarkedOnly || 
    filters.mistakesOnly || 
    filters.premiumOnly
  );

  const questionsQuery = useQuery({
    queryKey: ['question-bank', 'questions', filters],
    queryFn: () => getQuestionBankQuestions(filters),
    staleTime: 1000 * 60 * 2,
    enabled: shouldFetchQuestions,
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
    const boards = filtersQuery.data?.boards ?? [];
    const colleges = filtersQuery.data?.colleges ?? [];
    const admissions = filtersQuery.data?.admissions ?? [];

    const filteredChapters = filters.subjectId
      ? chapters.filter((item) => item.subject_id === filters.subjectId)
      : chapters;

    const validChapterIds = new Set(filteredChapters.map(c => c.id));
    const filteredTopics = topics.filter(topic => {
      if (filters.chapterId) {
        return topic.chapter_id === filters.chapterId;
      }
      if (filters.subjectId) {
        return topic.chapter_id && validChapterIds.has(topic.chapter_id);
      }
      return true;
    });

    return {
      subjects,
      chapters: filteredChapters,
      topics: filteredTopics,
      boards,
      colleges,
      admissions,
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
      
      if (key === 'institutionType') {
        return {
          ...prev,
          institutionType: String(value),
          institutionEiin: '', // Reset the selected EIIN when type changes
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
    boards: derived.boards,
    colleges: derived.colleges,
    admissions: derived.admissions,
    questions: derived.questions,
    stats: derived.stats,
    isLoading: filtersQuery.isLoading || (shouldFetchQuestions && questionsQuery.isLoading),
    isFetching: questionsQuery.isFetching,
    error: filtersQuery.error || questionsQuery.error,
    refetch: questionsQuery.refetch,
    toggleBookmark: toggleBookmarkMutation.mutateAsync,
    isBookmarkUpdating: toggleBookmarkMutation.isPending,
  };
}
