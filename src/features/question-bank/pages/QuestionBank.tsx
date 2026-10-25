import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { localizeDigits, type AppLanguage } from '@/shared/i18n/messages';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Filter,
  Lock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Loader } from '@/shared/components/feedback/Loader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { QuestionFilter } from '../components/QuestionFilter';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { describeQuestionBankError } from '../services/questionBankErrors';
import {
  getChapterName,
  getOptionText,
  getQuestionText,
  getSubjectName,
  getTopicName,
  localizedText,
} from '../services/questionBankMapper';
import { LEGACY_ROW_CAP } from '../services/questionBankService';
import type { QuestionBankQuestion } from '../types/questionBank';

function InfoBadge(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border-color bg-badge-bg px-2 py-0.5 text-[11px] font-medium text-badge-text">
      {props.children}
    </span>
  );
}

function getAccuracy(question: QuestionBankQuestion): number {
  if (!question.totalAttempts) return 0;
  return Math.round((question.correctAttempts / question.totalAttempts) * 100);
}

const formatAddedDate = (value: string | null, language: AppLanguage): string => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  try {
    return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 10);
  }
};

function QuestionCard(props: {
  question: QuestionBankQuestion;
  language: AppLanguage;
  onBookmarkToggle: (questionId: string, isBookmarked: boolean) => Promise<void>;
  isBookmarkUpdating: boolean;
}) {
  const { question, language, onBookmarkToggle, isBookmarkUpdating } = props;
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const questionText = getQuestionText(question, language);
  const accuracy = getAccuracy(question);
  const addedOn = formatAddedDate(question.createdAt, language);

  const difficultyKey =
    question.difficultyLevel === 'easy'
      ? 'questionBank.difficultyEasy'
      : question.difficultyLevel === 'medium'
        ? 'questionBank.difficultyMedium'
        : question.difficultyLevel === 'hard'
          ? 'questionBank.difficultyHard'
          : null;

  const subjectName = getSubjectName(question, language);
  const chapterName = getChapterName(question, language);
  const topicName = getTopicName(question, language);

  return (
    <Card className="rounded-3xl border border-card-border bg-card-bg p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <InfoBadge>{question.type}</InfoBadge>
              {difficultyKey && <InfoBadge>{t(difficultyKey)}</InfoBadge>}
              {question.isPremium && <InfoBadge>{t('questionBank.badgePremium')}</InfoBadge>}
              {question.isWrongAnswered && <InfoBadge>{t('questionBank.badgeWrong')}</InfoBadge>}
            </div>

            <div className="text-[11px] text-text-secondary">
              {subjectName || t('questionBank.unknownSubject')}
              {chapterName ? ` • ${chapterName}` : ''}
              {topicName ? ` • ${topicName}` : ''}
            </div>
          </div>

          <Button
            variant="ghost"
            className="h-8 rounded-xl px-2.5 text-xs font-medium"
            disabled={isBookmarkUpdating}
            aria-pressed={question.isBookmarked}
            onClick={() => onBookmarkToggle(question.id, question.isBookmarked)}
          >
            {question.isBookmarked ? (
              <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
            )}
            {question.isBookmarked ? t('questionBank.savedState') : t('questionBank.save')}
          </Button>
        </div>

        <div>
          {question.isLocked ? (
            // The server returns premium rows redacted; render an explicit
            // locked state instead of an apparently empty question.
            <div className="rounded-2xl border border-dashed border-border-color bg-surface p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Lock className="h-4 w-4 text-accent" aria-hidden="true" />
                {t('questionBank.lockedPreview')}
              </p>
              <p className="mt-1 text-[11px] font-medium text-text-secondary">
                {t('questionBank.lockedHint')}
              </p>
              <Button
                className="mt-3 h-9 rounded-xl px-3 text-xs font-bold"
                onClick={() => navigate('/premium')}
              >
                {t('questionBank.viewPremium')}
              </Button>
            </div>
          ) : (
            <>
              <h3 className="line-clamp-3 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-text-primary">
                {questionText || t('questionBank.noPreview')}
              </h3>

              {question.body.image_url && (
                <img
                  src={question.body.image_url}
                  alt=""
                  loading="lazy"
                  className="mt-2 max-h-48 w-auto rounded-xl border border-border-color"
                />
              )}

              {question.options.length > 0 && !isExpanded && (
                <p className="mt-1.5 text-xs font-medium text-text-secondary">
                  {t('questionBank.optionsCount', { count: question.options.length })}
                </p>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  {question.options.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                        {t('questionBank.optionsTitle')}
                      </p>
                      <ol className="space-y-1.5">
                        {question.options.map((option, index) => (
                          <li
                            key={String(option.id ?? index)}
                            className="rounded-xl border border-border-color bg-surface px-3 py-2 text-[13px] text-text-primary"
                          >
                            <span className="mr-1.5 font-semibold text-text-secondary">
                              {localizeDigits(index + 1, language)}.
                            </span>
                            {getOptionText(option, language) || '—'}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="rounded-xl border border-border-color bg-surface px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                        {t('questionBank.explanation')}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-text-primary">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* No answer key is fetched for the question bank, by design. */}
                  <p className="text-[11px] text-text-secondary">
                    {t('questionBank.noAnswerKey')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">{t('questionBank.totalAttemptsLabel')}</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">
              {localizeDigits(question.totalAttempts, language)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">{t('questionBank.correctAnswersLabel')}</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">
              {localizeDigits(question.correctAttempts, language)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">{t('questionBank.accuracyLabel')}</p>
            <p className="mt-0.5 text-[13px] font-bold text-text-primary">
              {localizeDigits(accuracy, language)}%
            </p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="text-[10px] text-text-secondary">{t('questionBank.addedOnLabel')}</p>
            <p className="mt-0.5 truncate text-[13px] font-bold text-text-primary">
              {addedOn || t('questionBank.unknownValue')}
            </p>
          </div>
        </div>

        {!question.isLocked && (
          <div className="mt-1">
            <Button
              variant="ghost"
              className="h-10 rounded-xl px-4 text-xs font-bold"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? (
                <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isExpanded ? t('questionBank.hideDetails') : t('questionBank.showDetails')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function QuestionBank() {
  const { t, language } = useLanguage();
  const {
    filters,
    updateFilter,
    resetFilters,
    subjects,
    chapters,
    topics,
    boards,
    colleges,
    admissions,
    questions,
    total,
    capped,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasMore,
    loadMore,
    error,
    refetch,
    toggleBookmark,
    isBookmarkUpdating,
  } = useQuestionBank();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    return [
      filters.search,
      filters.subjectId,
      filters.chapterId,
      filters.topicId,
      filters.institutionType,
      filters.institutionEiin,
      filters.year,
      filters.bookmarkedOnly ? 'bookmarked' : '',
      filters.mistakesOnly ? 'mistakes' : '',
      filters.premiumOnly ? 'premium' : '',
    ].filter(Boolean).length;
  }, [filters]);

  const isSubjectSelectionMode = !(
    filters.subjectId ||
    filters.search ||
    filters.bookmarkedOnly ||
    filters.mistakesOnly ||
    filters.premiumOnly
  );

  const institutionName = useMemo(() => {
    if (!filters.institutionEiin) return '';
    const match = [...boards, ...colleges, ...admissions].find(
      (inst) => (inst.eiin || inst.id) === filters.institutionEiin
    );
    if (!match) return t('questionBank.unknownValue');
    return localizedText(match.name_bn, match.name_en, language);
  }, [admissions, boards, colleges, filters.institutionEiin, language, t]);

  const errorKey = error ? describeQuestionBankError(error) : null;

  return (
    <div className="min-h-full bg-app px-4 py-4 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {isSubjectSelectionMode ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-2">
              <h2 className="text-lg font-bold text-text-primary">
                {t('questionBank.selectSubject')}
              </h2>
              <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-text-secondary">
                {t('questionBank.subjectCount', {
                  count: localizeDigits(subjects.length, language),
                })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  onClick={() => updateFilter('subjectId', subject.id)}
                  className="group cursor-pointer rounded-[20px] border border-card-border bg-card-bg p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="line-clamp-1 text-[13px] font-bold text-text-primary">
                    {localizedText(subject.name_bn, subject.name_en, language)}
                  </h3>
                  {language === 'bn' && subject.name_en && (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-text-secondary opacity-70">
                      {subject.name_en}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-2">
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="h-8 rounded-full px-2 text-xs font-bold text-text-secondary hover:text-text-primary"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t('questionBank.back')}
              </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-4">
                {!isFilterOpen && (
                  <div className="xl:hidden">
                    <Button
                      onClick={() => setIsFilterOpen(true)}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl font-bold"
                    >
                      <Filter className="h-4 w-4" />
                      {t('questionBank.openFilters')}
                    </Button>
                  </div>
                )}

                <div className={`${isFilterOpen ? 'block' : 'hidden'} space-y-4 xl:block`}>
                  <QuestionFilter
                    filters={filters}
                    chapters={chapters}
                    topics={topics}
                    boards={boards}
                    colleges={colleges}
                    admissions={admissions}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                  />

                  <div className="xl:hidden">
                    <Button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl font-bold"
                    >
                      <Filter className="h-4 w-4" />
                      {t('questionBank.closeFilters')}
                    </Button>
                  </div>
                </div>
              </aside>

              <main className="space-y-4">
                <Card className="rounded-[20px] border border-card-border bg-card-bg p-3 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-text-primary">
                        {t('questionBank.results')}
                      </h2>
                      <p className="text-[11px] font-medium text-text-secondary">
                        {t('questionBank.showingCount', {
                          shown: localizeDigits(questions.length, language),
                          total: localizeDigits(total, language),
                        })}
                        {activeFilterCount > 0
                          ? ` • ${t('questionBank.filters', {
                              count: localizeDigits(activeFilterCount, language),
                            })}`
                          : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {isFetching && !isFetchingNextPage && (
                        <span className="text-[11px] font-medium text-text-secondary">
                          {t('questionBank.loadingMore')}
                        </span>
                      )}
                      {filters.institutionType && (
                        <InfoBadge>
                          {t('questionBank.sourceLabel', {
                            source:
                              filters.institutionType === 'board'
                                ? t('questionBank.board')
                                : filters.institutionType === 'college'
                                  ? t('questionBank.college')
                                  : t('questionBank.admission'),
                          })}
                        </InfoBadge>
                      )}

                      {filters.institutionEiin && (
                        <InfoBadge>
                          {t('questionBank.name')} {institutionName}
                        </InfoBadge>
                      )}

                      {filters.year && (
                        <InfoBadge>
                          {t('questionBank.year')}: {localizeDigits(filters.year, language)}
                        </InfoBadge>
                      )}
                      {filters.bookmarkedOnly && (
                        <InfoBadge>{t('questionBank.savedFilter')}</InfoBadge>
                      )}
                      {filters.mistakesOnly && (
                        <InfoBadge>{t('questionBank.mistakesFilter')}</InfoBadge>
                      )}
                      {filters.premiumOnly && (
                        <InfoBadge>{t('questionBank.premium')}</InfoBadge>
                      )}
                    </div>
                  </div>
                </Card>

                {isLoading ? (
                  <div className="flex min-h-[250px] items-center justify-center rounded-[20px] border border-card-border bg-card-bg">
                    <Loader />
                  </div>
                ) : errorKey ? (
                  <Card className="rounded-[20px] border border-border-color bg-card-bg p-6">
                    <div className="space-y-3 text-center">
                      <h3 className="text-sm font-bold text-text-primary">
                        {t('questionBank.error')}
                      </h3>
                      <p className="text-[11px] font-medium text-text-secondary">
                        {t(errorKey)}
                      </p>
                      <Button
                        variant="ghost"
                        className="mx-auto h-9 rounded-xl px-3 text-xs font-bold"
                        onClick={() => void refetch()}
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        {t('questionBank.tryAgain')}
                      </Button>
                    </div>
                  </Card>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-3 h-10 w-10 text-text-secondary opacity-30" />
                    <EmptyState title={t('questionBank.empty')} />
                    <p className="mt-1 text-[11px] font-medium text-text-secondary">
                      {t('questionBank.tryAgain')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        language={language}
                        onBookmarkToggle={(questionId, isBookmarked) =>
                          toggleBookmark({ questionId, isBookmarked })
                        }
                        isBookmarkUpdating={isBookmarkUpdating}
                      />
                    ))}

                    {capped && (
                      <p className="rounded-2xl border border-dashed border-border-color bg-surface px-3 py-2 text-[11px] font-medium text-text-secondary">
                        {t('questionBank.limitedNotice', {
                          count: localizeDigits(LEGACY_ROW_CAP, language),
                        })}
                      </p>
                    )}

                    {hasMore && (
                      <div className="flex justify-center pt-2">
                        <Button
                          className="h-10 rounded-xl px-5 text-xs font-bold"
                          disabled={isFetchingNextPage}
                          onClick={loadMore}
                        >
                          {isFetchingNextPage
                            ? t('questionBank.loadingMore')
                            : t('questionBank.loadMore')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </main>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
