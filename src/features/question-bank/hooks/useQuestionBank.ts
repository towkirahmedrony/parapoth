import { useEffect, useMemo, useState } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchQuestionPage,
  getQuestionBankFilters,
  toggleBookmark,
} from '../services/questionBankService';
import {
  dedupeQuestions,
  buildStats,
} from '../services/questionBankMapper';
import {
  DEFAULT_QUESTION_BANK_FILTERS,
  type QuestionBankFilterState,
} from '../types/questionBank';

/** Delay before a typed search term is sent to the database. */
export const SEARCH_DEBOUNCE_MS = 350;

const emptyStats = {
  total: 0,
  bookmarked: 0,
  mistakes: 0,
  mcq: 0,
  board: 0,
  premium: 0,
} as const;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useQuestionBank() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QuestionBankFilterState>(DEFAULT_QUESTION_BANK_FILTERS);

  const filtersQuery = useQuery({
    queryKey: ['question-bank', 'filters'],
    queryFn: getQuestionBankFilters,
    staleTime: 1000 * 60 * 10,
  });

  /**
   * Only the search term is debounced. Dropdown/toggle filters should feel
   * instant, but every keystroke used to trigger a full RPC round-trip.
   */
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const effectiveFilters = useMemo<QuestionBankFilterState>(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const shouldFetchQuestions = Boolean(
    effectiveFilters.subjectId ||
      effectiveFilters.search ||
      effectiveFilters.bookmarkedOnly ||
      effectiveFilters.mistakesOnly ||
      effectiveFilters.premiumOnly
  );

  const questionsQuery = useInfiniteQuery({
    queryKey: ['question-bank', 'questions', effectiveFilters],
    queryFn: ({ pageParam }) => fetchQuestionPage(effectiveFilters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    // Keeps the previous page on screen while a new filter loads instead of
    // flashing the full-page loader on every change.
    placeholderData: keepPreviousData,
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

    const validChapterIds = new Set(filteredChapters.map((c) => c.id));
    const filteredTopics = topics.filter((topic) => {
      if (filters.chapterId) {
        return topic.chapter_id === filters.chapterId;
      }
      if (filters.subjectId) {
        return topic.chapter_id && validChapterIds.has(topic.chapter_id);
      }
      return true;
    });

    const pages = questionsQuery.data?.pages ?? [];
    const questions = dedupeQuestions(pages.flatMap((page) => page.questions));

    return {
      subjects,
      chapters: filteredChapters,
      topics: filteredTopics,
      boards,
      colleges,
      admissions,
      questions,
      // Loaded-row stats; the header reports the authoritative total separately.
      stats: questions.length > 0 ? buildStats(questions) : emptyStats,
      total: pages[0]?.total ?? 0,
      mode: pages[0]?.mode ?? null,
      capped: pages[0]?.capped ?? false,
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
          institutionEiin: '',
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

  const loadMore = () => {
    if (!questionsQuery.hasNextPage || questionsQuery.isFetchingNextPage) return;
    void questionsQuery.fetchNextPage();
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
    total: derived.total,
    mode: derived.mode,
    capped: derived.capped,
    isLoading: filtersQuery.isLoading || (shouldFetchQuestions && questionsQuery.isLoading),
    isFetching: questionsQuery.isFetching,
    isFetchingNextPage: questionsQuery.isFetchingNextPage,
    hasMore: Boolean(questionsQuery.hasNextPage),
    loadMore,
    error: filtersQuery.error || questionsQuery.error,
    refetch: questionsQuery.refetch,
    toggleBookmark: toggleBookmarkMutation.mutateAsync,
    isBookmarkUpdating: toggleBookmarkMutation.isPending,
  };
}
