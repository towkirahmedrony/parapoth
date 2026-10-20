import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import { localizeDigits } from '@/shared/i18n/messages';
import QuestionCard from '@/features/exam/components/QuestionCard';
import ExamTimer from '@/features/exam/components/ExamTimer';
import ExamHeader from '@/features/exam/components/ExamHeader';
import ConfirmModal from '@/shared/components/feedback/ConfirmModal';
import {
  buildSubmissionStorageKey,
  buildSubmitPayload,
  clearSubmissionId,
  getOrCreateSubmissionId,
  resolveSubmitErrorMessage,
} from '@/features/exam/utils/examSubmission';
import { useAdmissionExamPaper } from '../hooks/useAdmissionCatalog';
import { useAdmissionExamSession } from '../hooks/useAdmissionExamSession';
import { AdmissionExamSkeleton } from '../components/AdmissionSkeleton';
import { AdmissionQuestionNavigator } from '../components/AdmissionQuestionNavigator';
import { AdmissionState } from '../components/AdmissionState';

const AdmissionExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const paperQuery = useAdmissionExamPaper(examId);
  const session = useAdmissionExamSession(examId);
  const { attempt, questions, submit, saveDraft, isSubmitting } = session;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initializedAttemptId, setInitializedAttemptId] = useState<string | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const submittedRef = useRef(false);
  const timeLeftRef = useRef(0);
  const endTimeRef = useRef<number | null>(null);
  const initialSecondsRef = useRef(0);
  const lastSavedRef = useRef('');

  const submissionStorageKey = useMemo(
    () => buildSubmissionStorageKey(`admission-${examId ?? 'unknown'}`),
    [examId]
  );
  const [submissionId] = useState(() =>
    getOrCreateSubmissionId(submissionStorageKey)
  );

  const paper = paperQuery.data ?? null;

  // Restore server-held draft answers when the attempt is (re)loaded.
  useEffect(() => {
    if (!attempt || initializedAttemptId === attempt.id) return;

    setAnswers(attempt.answers_draft ?? {});
    const maxIndex = Math.max(0, (attempt.question_ids?.length ?? 1) - 1);
    setCurrentIndex(
      Math.min(Math.max(0, attempt.current_question_index), maxIndex)
    );
    setInitializedAttemptId(attempt.id);
  }, [attempt, initializedAttemptId]);

  useEffect(() => {
    if (attempt) {
      const declaredTotal = paper?.duration_min
        ? paper.duration_min * 60
        : attempt.seconds_remaining ?? 0;
      initialSecondsRef.current = Math.max(
        declaredTotal,
        attempt.seconds_remaining ?? 0
      );
    }
  }, [attempt, paper?.duration_min]);

  // The timer is driven by the server-issued remaining seconds/deadline, so a
  // refresh cannot extend an admission attempt.
  useEffect(() => {
    if (!attempt) return;

    const parsedDeadline = attempt.deadline_at
      ? Date.parse(attempt.deadline_at)
      : NaN;
    const fallbackSeconds = Number.isFinite(parsedDeadline)
      ? Math.max(0, Math.ceil((parsedDeadline - Date.now()) / 1000))
      : attempt.seconds_remaining ?? 0;

    const seconds =
      typeof attempt.seconds_remaining === 'number'
        ? attempt.seconds_remaining
        : fallbackSeconds;

    endTimeRef.current = Date.now() + Math.max(0, seconds) * 1000;
    setTimeLeft(Math.max(0, seconds));
    timeLeftRef.current = Math.max(0, seconds);

    const interval = window.setInterval(() => {
      const end = endTimeRef.current ?? Date.now();
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setTimeLeft(remaining);
      timeLeftRef.current = remaining;

      if (remaining <= 0) window.clearInterval(interval);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [attempt]);

  useEffect(() => {
    if (questions.length === 0) return;
    setCurrentIndex((previous) => Math.min(previous, questions.length - 1));
  }, [questions.length]);

  // Persist answers as a server-side draft so a refresh resumes the attempt.
  useEffect(() => {
    if (!attempt || initializedAttemptId !== attempt.id) return;
    if (questions.length === 0) return;

    const snapshot = JSON.stringify({ answers, currentIndex });
    if (snapshot === lastSavedRef.current) return;

    const timeout = window.setTimeout(() => {
      lastSavedRef.current = snapshot;
      saveDraft({ answers, currentIndex });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [
    answers,
    currentIndex,
    attempt,
    initializedAttemptId,
    questions.length,
    saveDraft,
  ]);

  const processSubmission = useCallback(() => {
    if (submittedRef.current || !attempt || questions.length === 0) return;

    submittedRef.current = true;
    const timeTaken = Math.max(
      0,
      initialSecondsRef.current - timeLeftRef.current
    );

    const payload = buildSubmitPayload({
      examId,
      attemptId: attempt.id,
      sessionId: submissionId,
      answers,
      questionIds: questions.map((question) => question.id),
      timeTaken,
    });

    submit(payload, {
      onSuccess: ({ resultId, result }) => {
        clearSubmissionId(submissionStorageKey);
        navigate(`/exam/analysis/${resultId}`, {
          state: result,
          replace: true,
        });
      },
      onError: (error) => {
        submittedRef.current = false;
        toast.error(
          resolveSubmitErrorMessage(error, {
            generic: t('exam.submitFailed'),
            network: t('exam.submitNetworkFailed'),
          })
        );
      },
    });
  }, [
    answers,
    attempt,
    examId,
    navigate,
    questions,
    submissionId,
    submissionStorageKey,
    submit,
    t,
  ]);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      attempt &&
      questions.length > 0 &&
      initializedAttemptId === attempt.id &&
      !submittedRef.current
    ) {
      setIsConfirmOpen(false);
      processSubmission();
    }
  }, [
    attempt,
    initializedAttemptId,
    processSubmission,
    questions.length,
    timeLeft,
  ]);

  const handleSelectOption = useCallback(
    (questionId: string, optionId: string) => {
      if (submittedRef.current) return;
      setAnswers((previous) => ({
        ...previous,
        [questionId]: String(optionId),
      }));
    },
    []
  );

  if (!examId) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl bg-app px-4 py-10">
        <AdmissionState
          variant="not-found"
          title={t('admission.notFoundTitle')}
          message={t('admission.examNotFound')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
        />
      </div>
    );
  }

  if (paperQuery.isLoading || session.isLoading) {
    return <AdmissionExamSkeleton />;
  }

  if (session.error) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl bg-app px-4 py-10">
        <AdmissionState
          variant="error"
          title={t('admission.examUnavailableTitle')}
          message={t('admission.examUnavailableMessage')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
          secondaryLabel={t('admission.back')}
          onSecondary={() => navigate(-1)}
        />
      </div>
    );
  }

  if (paperQuery.isError) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl bg-app px-4 py-10">
        <AdmissionState
          variant="error"
          title={t('admission.errorTitle')}
          message={t('admission.errorMessage')}
          actionLabel={t('admission.retry')}
          onAction={() => paperQuery.refetch()}
        />
      </div>
    );
  }

  if (!paper || paper.is_published === false) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl bg-app px-4 py-10">
        <AdmissionState
          variant="not-found"
          title={t('admission.notFoundTitle')}
          message={t('admission.examNotFound')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
        />
      </div>
    );
  }

  if (!attempt || questions.length === 0) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl bg-app px-4 py-10">
        <AdmissionState
          variant="empty"
          title={t('admission.noQuestions')}
          message={t('admission.noQuestionsHint')}
          actionLabel={t('admission.backToAdmission')}
          onAction={() => navigate('/admission')}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] ?? questions[0];
  const answeredCount = questions.filter((question) =>
    Boolean(answers[question.id])
  ).length;
  const total = questions.length;
  const currentNumber = localizeDigits(currentIndex + 1, language);
  const totalNumber = localizeDigits(total, language);
  const answeredNumber = localizeDigits(answeredCount, language);
  const secondsLeft = timeLeft ?? attempt.seconds_remaining ?? 0;

  const goPrevious = () =>
    setCurrentIndex((previous) => Math.max(0, previous - 1));
  const goNext = () =>
    setCurrentIndex((previous) => Math.min(total - 1, previous + 1));

  return (
    <div className="min-h-screen bg-app pb-32 text-text-primary lg:pb-8">
      <ExamHeader
        title={paper.title || t('admission.examHeader')}
        onBack={() => navigate(-1)}
        rightContent={<ExamTimer seconds={secondsLeft} layout="compact" />}
      />

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-xs font-semibold text-text-secondary sm:text-sm">
          <span className="font-['Hind_Siliguri']">
            {t('admission.questionOf', {
              current: currentNumber,
              total: totalNumber,
            })}
          </span>
          <span className="font-['Hind_Siliguri']">
            {t('admission.answered')}: {answeredNumber} / {totalNumber}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <QuestionCard
              question={currentQuestion}
              selectedOptionId={answers[currentQuestion.id]}
              onOptionSelect={(optionId) =>
                handleSelectOption(currentQuestion.id, optionId)
              }
              imageAlt={t('admission.questionImageAlt')}
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrevious}
                disabled={currentIndex === 0}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-color bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('admission.previous')}
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex >= total - 1}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-color bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                {t('admission.next')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 lg:hidden">
              <AdmissionQuestionNavigator
                questionIds={questions.map((question) => question.id)}
                currentIndex={currentIndex}
                answers={answers}
                onSelect={setCurrentIndex}
              />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <ExamTimer
                seconds={secondsLeft}
                layout="card"
                label={t('admission.timeLeft')}
              />

              <AdmissionQuestionNavigator
                questionIds={questions.map((question) => question.id)}
                currentIndex={currentIndex}
                answers={answers}
                onSelect={setCurrentIndex}
              />

              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                {isSubmitting ? t('admission.submitting') : t('admission.submit')}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-color bg-surface-elevated p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <button
            type="button"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            aria-label={t('admission.previous')}
            className="flex items-center justify-center rounded-xl border border-border-color bg-surface py-3 text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isSubmitting}
            className="col-span-1 rounded-xl bg-primary px-2 py-3 text-xs font-bold text-primary-foreground disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring sm:text-sm"
          >
            {isSubmitting ? t('admission.submitting') : t('admission.submit')}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex >= total - 1}
            aria-label={t('admission.next')}
            className="flex items-center justify-center rounded-xl border border-border-color bg-surface py-3 text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t('admission.submitTitle')}
        message={t('admission.submitMessage', { answered: answeredNumber })}
        confirmText={t('admission.submitConfirm')}
        cancelText={t('admission.submitCancel')}
        loadingText={t('admission.submitting')}
        isLoading={isSubmitting}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          processSubmission();
        }}
      />
    </div>
  );
};

export default AdmissionExamPage;
