import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  EyeOff,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import {
  localizeDigits,
  type AppLanguage,
  type AppMessageKey,
} from '@/shared/i18n/messages';
import MathDisplay from '@/shared/components/content/MathDisplay';
import QuestionText from '@/shared/components/content/QuestionText';
import { Button } from '@/shared/components/ui/Button';
import {
  getChapterName,
  getExamBadge,
  getExplanationText,
  getOptionText,
  getQuestionText,
  getSubjectName,
  getTopicName,
} from '../services/questionBankMapper';
import type { QuestionBankQuestion } from '../types/questionBank';
import {
  AI_EXPLANATION_THINK_MS,
  getAiExplanationAction,
} from '../utils/aiExplanation';

interface QuestionCardProps {
  question: QuestionBankQuestion;
  language: AppLanguage;
  correctOptionIds: string[] | null;
  isAnswerVisible: boolean;
  isAnswerKeyLoading?: boolean;
  isBookmarkUpdating: boolean;
  onToggleAnswer: (questionId: string) => void;
  onBookmarkToggle: (questionId: string, isBookmarked: boolean) => Promise<void>;
}

const difficultyClasses: Record<string, string> = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  medium:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  hard: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

const difficultyKeys: Record<string, AppMessageKey> = {
  easy: 'questionBank.difficultyEasy',
  medium: 'questionBank.difficultyMedium',
  hard: 'questionBank.difficultyHard',
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  language,
  correctOptionIds,
  isAnswerVisible,
  isAnswerKeyLoading = false,
  isBookmarkUpdating,
  onToggleAnswer,
  onBookmarkToggle,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasAiRevealed, setHasAiRevealed] = useState(false);
  const onToggleAnswerRef = useRef(onToggleAnswer);

  useEffect(() => {
    onToggleAnswerRef.current = onToggleAnswer;
  }, [onToggleAnswer]);

  useEffect(() => {
    if (!isAnswerVisible) setHasAiRevealed(false);
  }, [isAnswerVisible]);

  useEffect(() => {
    if (!isThinking) return;

    if (isAnswerVisible) {
      setIsThinking(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsThinking(false);
      setHasAiRevealed(true);
      onToggleAnswerRef.current(question.id);
    }, AI_EXPLANATION_THINK_MS);

    return () => window.clearTimeout(timer);
  }, [isAnswerVisible, isThinking, question.id]);

  const questionText = getQuestionText(question, language);
  const explanation = getExplanationText(question, language);
  const subjectName = getSubjectName(question, language);
  const chapterName = getChapterName(question, language);
  const topicName = getTopicName(question, language);
  const examBadge = getExamBadge(question, language);

  const correctIds = useMemo(
    () => new Set((correctOptionIds ?? []).map(String)),
    [correctOptionIds]
  );
  const hasAnswerKey = correctIds.size > 0;
  const hasExplanation = Boolean(explanation);
  const explanationId = `question-answer-${question.id}`;
  const showAnswerPanel =
    isAnswerVisible &&
    (hasExplanation || (!hasAnswerKey && !isAnswerKeyLoading));

  const breadcrumb = [
    subjectName || t('questionBank.unknownSubject'),
    chapterName,
    topicName,
  ]
    .filter(Boolean)
    .join(' • ');

  const difficultyClass = question.difficultyLevel
    ? difficultyClasses[question.difficultyLevel]
    : null;
  const difficultyKey = question.difficultyLevel
    ? difficultyKeys[question.difficultyLevel]
    : null;

  const handleBookmarkToggle = async () => {
    if (isSavingBookmark || isBookmarkUpdating) return;

    setIsSavingBookmark(true);
    try {
      await onBookmarkToggle(question.id, question.isBookmarked);
    } catch {
      toast.error(t('questionBank.bookmarkFailed'));
    } finally {
      setIsSavingBookmark(false);
    }
  };

  const handleAnswerAction = () => {
    const action = getAiExplanationAction({ isThinking, isAnswerVisible });

    if (action === 'ignore') return;
    if (action === 'hide') {
      onToggleAnswer(question.id);
      return;
    }

    setIsThinking(true);
  };

  return (
    <article className="rounded-2xl border border-card-border bg-card-bg p-3.5 text-text-primary shadow-sm transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {examBadge && (
              <span className="inline-flex max-w-full items-center rounded-md border border-border-color bg-secondary/70 px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-text-secondary">
                <span className="truncate">
                  {examBadge.label}
                  {examBadge.year
                    ? ` • ${localizeDigits(examBadge.year, language)}`
                    : ''}
                </span>
              </span>
            )}

            {difficultyClass && difficultyKey && (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-4 ${difficultyClass}`}
              >
                {t(difficultyKey)}
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-text-secondary">
            {breadcrumb}
          </p>
        </div>

        <button
          type="button"
          className={`-mr-1 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
            question.isBookmarked
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-transparent text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
          disabled={isBookmarkUpdating || isSavingBookmark}
          aria-label={
            question.isBookmarked
              ? t('questionBank.removeBookmark')
              : t('questionBank.addBookmark')
          }
          aria-pressed={question.isBookmarked}
          onClick={() => void handleBookmarkToggle()}
        >
          {question.isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {question.isLocked ? (
        <div className="mt-3 rounded-xl border border-dashed border-border-color bg-surface p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Lock className="h-4 w-4 text-accent" aria-hidden="true" />
            {t('questionBank.lockedPreview')}
          </p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-text-secondary">
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
          <div className="mt-2.5 min-w-0 text-[15px] font-semibold leading-relaxed text-text-primary [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
            {questionText ? (
              <QuestionText text={questionText} />
            ) : (
              <p>{t('questionBank.noPreview')}</p>
            )}
          </div>

          {question.body.image_url && (
            <img
              src={question.body.image_url}
              alt={t('questionBank.questionImageAlt')}
              loading="lazy"
              className="mt-2 max-h-56 w-auto max-w-full rounded-lg border border-border-color"
            />
          )}

          {question.options.length > 0 && (
            <ol className="mt-3 grid gap-2 lg:grid-cols-2">
              {question.options.map((option, index) => {
                const isCorrect =
                  isAnswerVisible && correctIds.has(String(option.id));
                const optionText = getOptionText(option, language);

                return (
                  <li
                    key={String(option.id ?? index)}
                    className={`flex min-h-9 min-w-0 items-start gap-2 rounded-xl border px-2.5 py-2 transition-colors duration-200 motion-reduce:transition-none ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-100'
                        : 'border-border-color bg-surface/60 text-text-primary'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary text-text-secondary'
                      }`}
                      aria-hidden="true"
                    >
                      {localizeDigits(index + 1, language)}
                    </span>

                    <div className="min-w-0 flex-1">
                      {optionText ? (
                        <MathDisplay content={optionText} />
                      ) : (
                        <span className="text-sm text-text-secondary">—</span>
                      )}
                      {option.image_url && (
                        <img
                          src={option.image_url}
                          alt=""
                          loading="lazy"
                          className="mt-1 max-h-32 w-auto max-w-full rounded-md border border-border-color"
                        />
                      )}
                    </div>

                    {isCorrect && (
                      <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                          {t('questionBank.correctAnswer')}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {showAnswerPanel && (
            <div
              id={explanationId}
              className={`mt-3 space-y-2 ${
                hasAiRevealed
                  ? 'animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none'
                  : ''
              }`}
            >
              {!hasAnswerKey && !isAnswerKeyLoading && (
                <p className="text-[11px] font-medium text-text-secondary">
                  {t('questionBank.answerUnavailable')}
                </p>
              )}

              {hasExplanation && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {t('questionBank.explanation')}
                  </p>
                  <div className="mt-1 text-text-primary">
                    <MathDisplay
                      content={explanation}
                      className="whitespace-pre-line"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 border-t border-border-color pt-2.5">
            <button
              type="button"
              className={`group inline-flex min-h-9 max-w-full items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-wait motion-reduce:transition-none ${
                isAnswerVisible
                  ? 'border-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10'
                  : isThinking
                    ? 'border-accent/30 bg-accent/10 text-accent dark:text-indigo-300'
                    : 'border-accent/25 bg-gradient-to-r from-primary/10 to-accent/10 text-accent hover:border-accent/40 hover:from-primary/15 hover:to-accent/15 dark:text-indigo-300'
              }`}
              disabled={isThinking}
              aria-expanded={isAnswerVisible}
              aria-controls={showAnswerPanel ? explanationId : undefined}
              aria-busy={isThinking}
              onClick={handleAnswerAction}
            >
              {isThinking ? (
                <>
                  <Sparkles
                    className="h-4 w-4 shrink-0 animate-pulse motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {t('questionBank.aiExplanationThinking')}
                  </span>
                  <span
                    className="ml-0.5 inline-flex shrink-0 items-center gap-0.5"
                    aria-hidden="true"
                  >
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none"
                        style={{ animationDelay: `${index * 120}ms` }}
                      />
                    ))}
                  </span>
                </>
              ) : isAnswerVisible ? (
                <>
                  <EyeOff className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {t('questionBank.hideAnswerExplanation')}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-12 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {t('questionBank.showAnswerExplanation')}
                  </span>
                </>
              )}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {isThinking ? t('questionBank.aiExplanationThinking') : ''}
            </span>
          </div>
        </>
      )}
    </article>
  );
};

export default QuestionCard;
