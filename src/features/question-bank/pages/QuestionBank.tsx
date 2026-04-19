import React, { useMemo } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  FileQuestion,
  Flame,
  Layers3,
  Search,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Loader } from '@/shared/components/feedback/Loader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { QuestionFilter } from '../components/QuestionFilter';
import { useQuestionBank } from '../hooks/useQuestionBank';
import type { QuestionBankQuestion } from '../types/questionBank';

function StatCard(props: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{props.label}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{props.value}</h3>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {props.icon}
        </div>
      </div>
    </Card>
  );
}

function InfoBadge(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      {props.children}
    </span>
  );
}

function getQuestionPreview(question: QuestionBankQuestion): string {
  return question.body.text_bn || question.body.text_en || 'Question preview unavailable';
}

function getAccuracy(question: QuestionBankQuestion): number {
  if (!question.totalAttempts) {
    return 0;
  }

  return Math.round((question.correctAttempts / question.totalAttempts) * 100);
}

function QuestionCard(props: {
  question: QuestionBankQuestion;
  onBookmarkToggle: (questionId: string, isBookmarked: boolean) => Promise<void>;
  isBookmarkUpdating: boolean;
}) {
  const { question, onBookmarkToggle, isBookmarkUpdating } = props;
  const preview = getQuestionPreview(question);
  const accuracy = getAccuracy(question);

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <InfoBadge>{question.type}</InfoBadge>
              {question.difficultyLevel && <InfoBadge>{question.difficultyLevel}</InfoBadge>}
              {question.sourceType && <InfoBadge>{question.sourceType.replace(/_/g, ' ')}</InfoBadge>}
              {question.isPremium && <InfoBadge>Premium</InfoBadge>}
              {question.isWrongAnswered && <InfoBadge>Wrong before</InfoBadge>}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {question.subjectNameBn || 'Unknown Subject'}
              {question.chapterNameBn ? ` • ${question.chapterNameBn}` : ''}
              {question.topicNameBn ? ` • ${question.topicNameBn}` : ''}
            </div>
          </div>

          <Button
            variant="ghost"
            className="h-10 rounded-2xl px-3"
            disabled={isBookmarkUpdating}
            onClick={() => onBookmarkToggle(question.id, question.isBookmarked)}
          >
            {question.isBookmarked ? (
              <BookmarkCheck className="mr-2 h-4 w-4" />
            ) : (
              <Bookmark className="mr-2 h-4 w-4" />
            )}
            {question.isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>

        <div>
          <h3 className="line-clamp-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
            {preview}
          </h3>

          {question.options.length > 0 && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {question.options.length} options available
            </p>
          )}
        </div>

        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Attempts</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{question.totalAttempts}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Correct</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{question.correctAttempts}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{accuracy}%</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Question ID</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{question.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-2xl">
            Practice now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="rounded-2xl">
            View details
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function QuestionBank() {
  const {
    filters,
    updateFilter,
    resetFilters,
    subjects,
    chapters,
    topics,
    questions,
    stats,
    isLoading,
    isFetching,
    error,
    toggleBookmark,
    isBookmarkUpdating,
  } = useQuestionBank();

  const activeFilterCount = useMemo(() => {
    return [
      filters.search,
      filters.subjectId,
      filters.chapterId,
      filters.topicId,
      filters.questionType,
      filters.difficultyLevel,
      filters.sourceType,
      filters.bookmarkedOnly ? 'bookmarked' : '',
      filters.mistakesOnly ? 'mistakes' : '',
      filters.premiumOnly ? 'premium' : '',
    ].filter(Boolean).length;
  }, [filters]);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-4 text-slate-900 dark:bg-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Question Discovery
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Question Bank
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                বিষয়, অধ্যায়, টপিক, difficulty, source আর saved mistakes অনুযায়ী
                দ্রুত প্রশ্ন খুঁজে practice শুরু করো।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Button className="rounded-2xl">Start Practice</Button>
              <Button variant="ghost" className="rounded-2xl">Saved Questions</Button>
              <Button variant="ghost" className="rounded-2xl">Mistakes</Button>
              <Button variant="ghost" className="rounded-2xl">Recent</Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <StatCard label="Total Questions" value={stats.total} icon={<FileQuestion className="h-5 w-5" />} />
          <StatCard label="MCQ" value={stats.mcq} icon={<Layers3 className="h-5 w-5" />} />
          <StatCard label="Board" value={stats.board} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard label="Saved" value={stats.bookmarked} icon={<Bookmark className="h-5 w-5" />} />
          <StatCard label="Mistakes" value={stats.mistakes} icon={<AlertCircle className="h-5 w-5" />} />
          <StatCard label="Premium" value={stats.premium} icon={<Flame className="h-5 w-5" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <QuestionFilter
              filters={filters}
              subjects={subjects}
              chapters={chapters}
              topics={topics}
              onFilterChange={updateFilter}
              onReset={resetFilters}
            />
          </aside>

          <main className="space-y-4">
            <Card className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Results
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.total} questions found
                    {activeFilterCount > 0 ? ` • ${activeFilterCount} active filters` : ''}
                    {isFetching ? ' • refreshing...' : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.bookmarkedOnly && <InfoBadge>Saved only</InfoBadge>}
                  {filters.mistakesOnly && <InfoBadge>Mistakes only</InfoBadge>}
                  {filters.premiumOnly && <InfoBadge>Premium only</InfoBadge>}
                  {filters.questionType && <InfoBadge>{filters.questionType}</InfoBadge>}
                  {filters.difficultyLevel && <InfoBadge>{filters.difficultyLevel}</InfoBadge>}
                  {filters.sourceType && <InfoBadge>{filters.sourceType.replace(/_/g, ' ')}</InfoBadge>}
                </div>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <Loader />
              </div>
            ) : error ? (
              <Card className="rounded-3xl border border-rose-200 bg-white p-8 dark:border-rose-900 dark:bg-slate-950">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                    Failed to load question bank
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(error as Error)?.message || 'Something went wrong while loading questions.'}
                  </p>
                </div>
              </Card>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Search className="h-10 w-10 text-slate-400 mb-4" />
                <EmptyState
                  title="No questions found"
                />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Search বা filter change করে আবার চেষ্টা করো।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onBookmarkToggle={(questionId, isBookmarked) => 
                      toggleBookmark({ questionId, isBookmarked })
                    }
                    isBookmarkUpdating={isBookmarkUpdating}
                  />
                ))}
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}
