import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LiveQuestionCard from '../components/LiveQuestionCard';
import ExamTimer from '../components/ExamTimer';
import ExamHeader from '../components/ExamHeader';

import ReportModal, { ReportPayload as ModalReportPayload } from '@/shared/components/feedback/ReportModal';
import ConfirmModal from '@/shared/components/feedback/ConfirmModal';
import { apiClient } from '@/shared/lib/apiClient';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import toast from 'react-hot-toast';
import { ExamConfig, ExamQuestion } from '../types/exam';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  buildSubmissionStorageKey,
  buildSubmitPayload,
  clearSubmissionId,
  extractSubmittedResultId,
  getOrCreateSubmissionId,
  resolveSubmitErrorMessage,
} from '../utils/examSubmission';

const defaultConfig: ExamConfig = {
  questionCount: 10,
  duration: 20,
  negativeMarking: true,
};

const SUBMIT_ENDPOINT = '/exams/user/submit';

type ArenaQuestionResponse = {
  success?: boolean;
  data?: ExamQuestion[];
};

type SubmitExamResponse = {
  success?: boolean;
  data?: any;
};

type ExtendedExamConfig = ExamConfig & {
  examId?: string;
  exam_id?: string;
  sessionId?: string;
  session_id?: string;
};

const fetchArenaQuestions = async (
  limit: number,
  subjectSlug?: string
): Promise<ExamQuestion[]> => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  if (subjectSlug) {
    params.set('subjectSlug', subjectSlug);
  }

  const res = await apiClient.get<ArenaQuestionResponse>(`/exams/user/arena?${params.toString()}`);

  return res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
};

const Arena: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const passedConfig = location.state?.config as ExtendedExamConfig | undefined;
  const config = useMemo<ExtendedExamConfig>(() => {
    return passedConfig || defaultConfig;
  }, [passedConfig]);

  const examId = config.examId || config.exam_id || undefined;
  const sessionId = config.sessionId || config.session_id || undefined;

  const initialDurationSeconds = config.duration * 60;

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const hasSubmittedRef = useRef(false);
  const targetEndTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef(initialDurationSeconds);

  // One idempotency key per examination session. It survives a reload during a
  // slow submission, so a retry is recognised by the backend as the same
  // submission instead of producing a second result.
  const submissionStorageKey = useMemo(
    () =>
      buildSubmissionStorageKey(
        `${subjectSlug || 'all'}-${config.questionCount}-${config.duration}`
      ),
    [subjectSlug, config.questionCount, config.duration]
  );
  const [submissionId] = useState(() => getOrCreateSubmissionId(submissionStorageKey));

  const {
    data: questions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'arenaQuestions',
      config.questionCount,
      config.duration,
      subjectSlug || 'all',
      examId || 'no-exam-id',
      sessionId || 'no-session-id',
    ],
    queryFn: () => fetchArenaQuestions(config.questionCount, subjectSlug),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isLoading || questions.length === 0) return;

    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + initialDurationSeconds * 1000;
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      const end = targetEndTimeRef.current || now;
      const remaining = Math.max(0, Math.ceil((end - now) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading, questions.length, initialDurationSeconds]);

  const submitExamMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildSubmitPayload>) => {
      const res = await apiClient.post<SubmitExamResponse>(SUBMIT_ENDPOINT, payload);

      // Validate the response before leaving the exam page. Without a persisted
      // result id there is nothing to navigate to, and a retry is safe because
      // the request carries the same submission id.
      const resultId = extractSubmittedResultId(res.data);
      const result = res.data?.data ?? res.data;

      return { resultId, result };
    },
    onSuccess: ({ resultId, result }) => {
      clearSubmissionId(submissionStorageKey);
      queryClient.invalidateQueries({ queryKey: ['history'] });

      // Navigate only after the backend confirmed persistence.
      navigate(`/exam/analysis/${resultId}`, {
        state: result,
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(
        resolveSubmitErrorMessage(error, {
          generic: t('exam.submitFailed'),
          network: t('exam.submitNetworkFailed'),
        })
      );

      // Keep the student on the page with their answers intact so the
      // submission can be retried.
      hasSubmittedRef.current = false;
    },
  });

  const { mutate: submitExam } = submitExamMutation;

  const processSubmission = useCallback(() => {
    if (hasSubmittedRef.current || questions.length === 0) return;

    hasSubmittedRef.current = true;

    const timeTaken = initialDurationSeconds - Math.max(0, timeLeftRef.current);
    const questionIds = questions.map((q) => q.id);

    const payloadForBackend = buildSubmitPayload({
      examId,
      // `session_id` is the backend's idempotency key, so it must identify this
      // submission attempt rather than describe the exam.
      sessionId: submissionId,
      answers: userAnswers,
      questionIds,
      timeTaken,
    });

    submitExam(payloadForBackend);
  }, [questions, userAnswers, initialDurationSeconds, examId, submissionId, submitExam]);

  useEffect(() => {
    if (timeLeft <= 0 && questions.length > 0 && !hasSubmittedRef.current) {
      setIsConfirmModalOpen(false);
      processSubmission();
    }
  }, [timeLeft, questions.length, processSubmission]);

  const handleOptionSelect = useCallback((questionId: string, optionId: string) => {
    if (hasSubmittedRef.current) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: String(optionId),
    }));
  }, []);

  const handleReportClick = useCallback((questionId: string) => {
    setReportingQuestionId(questionId);
    setIsReportModalOpen(true);
  }, []);

  const reportMutation = useMutation({
    mutationFn: async (reportData: ModalReportPayload) => {
      await apiClient.post('/reports', reportData);
    },
    onSuccess: () => {
      toast.success(t('exam.reportSubmitted'));
    },
    onError: () => {
      toast.error(t('exam.reportSubmitError'));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app px-4 py-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl bg-surface" />
        <Skeleton className="h-96 w-full rounded-2xl bg-surface" />
        <Skeleton className="h-96 w-full rounded-2xl bg-surface" />
      </div>
    );
  }

  if (isError || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-app">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-surface border border-border-color">
          <AlertCircle size={40} className="text-text-primary" />
        </div>

        <h2 className="text-2xl font-bold mb-3 text-text-primary">{t('exam.noQuestionsTitle')}</h2>

        <p className="mb-8 opacity-70 text-text-secondary">
          {t('exam.noQuestionsBody')}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95 bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isSubmitting = submitExamMutation.isPending || hasSubmittedRef.current;

  return (
    <div className="min-h-screen pb-32 lg:pb-10 bg-app text-text-primary">
      <ExamHeader
        title={t('exam.modelTestLive')}
        onBack={() => navigate(-1)}
        rightContent={
          <div className="flex items-center gap-4">
            <div className="font-bold text-lg hidden sm:block text-primary">
              {answeredCount}{' '}
              <span className="opacity-60 text-sm font-normal text-text-secondary">
                / {questions.length}
              </span>
            </div>
            <ExamTimer seconds={timeLeft} layout="compact" />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {questions.map((q, idx) => (
              <LiveQuestionCard
                key={q.id}
                question={q}
                index={idx}
                selectedOptionId={userAnswers[q.id]}
                onSelectOption={handleOptionSelect}
                onReport={handleReportClick}
              />
            ))}
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <ExamTimer seconds={timeLeft} layout="card" />

              <div className="p-6 rounded-2xl border shadow-sm bg-card-bg border-card-border">
                <h3 className="font-bold text-lg mb-4 font-['Hind_Siliguri'] text-text-primary">
              {t('exam.progress')}
                </h3>

                <div className="flex justify-between text-sm mb-2 opacity-80 text-text-primary">
              <span>{t('exam.answered')}</span>
                  <span className="font-bold">
                    {answeredCount} / {questions.length}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden bg-surface border border-border-color">
                  <div
                    className="h-full transition-all duration-500 rounded-full bg-primary"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 font-bold py-4 rounded-xl disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95 text-lg hover:opacity-90 bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <CheckCircle size={22} />
                {isSubmitting ? t('exam.submittingAnswerSheet') : t('exam.submitAnswerSheet')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 z-40 backdrop-blur-xl border-t bg-surface-elevated border-border-color">
        <div className="flex items-center gap-4 mb-3 sm:hidden">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface border border-border-color">
            <div
              className="h-full transition-all duration-500 bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <span className="text-xs font-bold whitespace-nowrap text-text-primary">
            {answeredCount} / {questions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={isSubmitting}
          className="w-full font-bold py-3.5 rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-sm text-base hover:opacity-90 bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {isSubmitting ? t('exam.submittingAnswerSheet') : t('exam.submitAnswerSheet')}
        </button>
      </div>

      {isReportModalOpen && reportingQuestionId && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          type="question_issue"
          questionData={{ questionId: reportingQuestionId }}
          onSubmit={async (data) => {
            await reportMutation.mutateAsync(data);
            setIsReportModalOpen(false);
          }}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
        title={t('exam.submitConfirmTitle')}
          message={t('exam.submitConfirmMessage', { count: answeredCount })}
          onConfirm={() => {
            setIsConfirmModalOpen(false);
            processSubmission();
          }}
          onCancel={() => setIsConfirmModalOpen(false)}
          isLoading={submitExamMutation.isPending}
        />
      )}
    </div>
  );
};

export default memo(Arena);
