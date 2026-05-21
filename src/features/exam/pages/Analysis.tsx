import React, { useEffect, useState, useCallback, memo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AnalysisQuestionCard from '../components/AnalysisQuestionCard';
import ReportModal, {
  QuestionMetaData,
  ReportPayload as ModalReportPayload,
} from '@/shared/components/feedback/ReportModal';
import { apiClient } from '@/shared/lib/apiClient';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { ExamResultPayload, Question } from '../types/exam';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  ArrowLeft,
  Home,
  HelpCircle,
} from 'lucide-react';

type ResultDetailItem = {
  question_id: string;
  selected_option?: string | number | null;
  selected_option_id?: string | number | null;
  is_correct?: boolean | null;
  marks_awarded?: number;
  status?: 'correct' | 'wrong' | 'skipped' | 'question_not_found' | string;
};

const ActionButtons = memo(({ onHome, onBack }: { onHome: () => void; onBack: () => void }) => (
  <>
    <button
      type="button"
      onClick={onHome}
      className="flex-1 font-bold py-3.5 md:py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring bg-secondary text-text-primary border border-border-color"
    >
      <Home size={18} />
      হোমপেজ
    </button>

    <button
      type="button"
      onClick={onBack}
      className="flex-1 font-bold py-3.5 md:py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring bg-primary text-primary-foreground"
    >
      <ArrowLeft size={18} />
      পিছনে যান
    </button>
  </>
));
ActionButtons.displayName = 'ActionButtons';

const getSafeDetailsJson = (result: any) => {
  const raw = result?.details_json;

  if (!raw) return {};

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (typeof raw === 'object') return raw;

  return {};
};

const getStatusText = (item: ResultDetailItem) => {
  if (item.status === 'skipped' || item.is_correct === null) return 'স্কিপ';
  if (item.is_correct === true || item.status === 'correct') return 'সঠিক';
  if (item.is_correct === false || item.status === 'wrong') return 'ভুল';
  return 'অজানা';
};

const getStatusIcon = (item: ResultDetailItem) => {
  if (item.status === 'skipped' || item.is_correct === null) {
    return <MinusCircle size={22} className="text-text-secondary" />;
  }

  if (item.is_correct === true || item.status === 'correct') {
    return <CheckCircle2 size={22} className="text-text-primary" />;
  }

  if (item.is_correct === false || item.status === 'wrong') {
    return <XCircle size={22} className="text-text-primary" />;
  }

  return <HelpCircle size={22} className="text-text-secondary" />;
};

const getStatusCardClass = (item: ResultDetailItem) => {
  if (item.status === 'skipped' || item.is_correct === null) {
    return 'border-border-color bg-surface';
  }

  if (item.is_correct === true || item.status === 'correct') {
    return 'border-border-color bg-surface';
  }

  if (item.is_correct === false || item.status === 'wrong') {
    return 'border-border-color bg-surface';
  }

  return 'border-border-color bg-surface';
};

const Analysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [result, setResult] = useState<ExamResultPayload | null>(
    (location.state as ExamResultPayload) || null
  );
  const [isLoading, setIsLoading] = useState(!location.state);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportQuestionData, setReportQuestionData] = useState<QuestionMetaData | null>(null);

  useEffect(() => {
    if (!result) {
      if (id) {
        apiClient
          .get('/history/exams')
          .then((res) => {
            const historyList = res?.data?.data;

            if (Array.isArray(historyList)) {
              const found = historyList.find(
                (item: ExamResultPayload) => item && (item.id === id || item.exam_id === id)
              );

              if (found) {
                setResult(found);
                return;
              }
            }

            toast.error('ফলাফল পাওয়া যায়নি!');
            navigate('/dashboard/home', { replace: true });
          })
          .catch(() => {
            toast.error('ফলাফল লোড করতে সমস্যা হয়েছে!');
            navigate('/dashboard/home', { replace: true });
          })
          .finally(() => setIsLoading(false));
      } else {
        navigate('/dashboard/home', { replace: true });
      }
    } else {
      setIsLoading(false);
    }
  }, [result, id, navigate]);

  const reportMutation = useMutation({
    mutationFn: async (payload: ModalReportPayload) => {
      const response = await apiClient.post('/reports', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!');
    },
    onError: () => {
      toast.error('সার্ভার এরর! রিপোর্ট জমা দেওয়া যায়নি।');
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiClient.post('/exams/bookmark', { questionId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'বুকমার্ক আপডেট হয়েছে!');
    },
    onError: () => {
      toast.error('সার্ভার এরর! বুকমার্ক আপডেট করা যায়নি।');
    },
  });

  const handleReport = useCallback((questionId: string) => {
    setReportQuestionData({ questionId });
    setIsReportModalOpen(true);
  }, []);

  const handleBookmark = useCallback(
    (questionId: string) => {
      bookmarkMutation.mutate(questionId);
    },
    [bookmarkMutation]
  );

  const handleCloseModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportQuestionData(null);
  }, []);

  const handleSubmitReport = useCallback(
    async (data: ModalReportPayload) => {
      await reportMutation.mutateAsync(data);
    },
    [reportMutation]
  );

  const handleHomeNav = useCallback(() => navigate('/dashboard/home'), [navigate]);
  const handleBackNav = useCallback(() => navigate(-1), [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-28 flex flex-col items-center bg-app">
        <div className="w-full pt-6 pb-8 px-4 border-b border-card-border bg-card-bg">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <Skeleton className="w-14 h-14 rounded-full mb-4 opacity-50" />
            <Skeleton className="w-48 h-8 rounded-lg mb-6 opacity-50" />

            <div className="grid grid-cols-3 gap-3 md:gap-5 w-full mb-6">
              <Skeleton className="h-28 rounded-xl opacity-40" />
              <Skeleton className="h-28 rounded-xl opacity-40" />
              <Skeleton className="h-28 rounded-xl opacity-40" />
            </div>

            <Skeleton className="w-32 h-12 rounded-xl opacity-50" />
          </div>
        </div>

        <div className="w-full max-w-3xl px-4 mt-8 space-y-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-card-border p-4 sm:p-5 bg-card-bg"
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-border-color">
                <Skeleton className="w-12 h-6 rounded-md opacity-40" />
                <Skeleton className="w-24 h-6 rounded-md opacity-40" />
              </div>

              <Skeleton className="w-3/4 h-5 rounded-md mb-6 opacity-50" />

              <div className="space-y-3">
                <Skeleton className="w-full h-12 rounded-xl opacity-40" />
                <Skeleton className="w-full h-12 rounded-xl opacity-40" />
                <Skeleton className="w-full h-12 rounded-xl opacity-40" />
                <Skeleton className="w-full h-12 rounded-xl opacity-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  const detailsJson = getSafeDetailsJson(result);

  const examQuestions: Question[] = Array.isArray(detailsJson.questions)
    ? detailsJson.questions
    : [];

  const resultDetails: ResultDetailItem[] = Array.isArray(detailsJson.details)
    ? detailsJson.details
    : [];

  const userAnswers: Record<string, string> =
    detailsJson.userAnswers && typeof detailsJson.userAnswers === 'object' && !Array.isArray(detailsJson.userAnswers)
      ? detailsJson.userAnswers
      : detailsJson.answers && typeof detailsJson.answers === 'object' && !Array.isArray(detailsJson.answers)
        ? detailsJson.answers
        : {};

  const bookmarkedIds: string[] = Array.isArray(detailsJson.bookmarked_ids)
    ? detailsJson.bookmarked_ids
    : [];

  return (
    <div className="min-h-screen animate-in fade-in flex flex-col items-center bg-app text-text-primary">
      <div className="w-full pt-6 pb-8 px-4 border-b shadow-sm relative overflow-hidden bg-card-bg border-card-border">
        <div className="absolute top-0 left-0 w-full h-1 opacity-50 bg-primary" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 shadow-inner bg-accent text-text-primary">
            <Trophy size={28} strokeWidth={2} />
          </div>

          <h2 className="text-xl md:text-2xl font-bold mb-6 font-['Hind_Siliguri'] text-text-primary">
            পরীক্ষার ফলাফল
          </h2>

          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6">
            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl border border-border-color bg-surface transition-transform hover:scale-[1.02]">
              <CheckCircle2 className="text-text-primary mb-1.5" size={24} />
              <span className="text-xs md:text-sm font-semibold text-text-secondary opacity-90">
                সঠিক
              </span>
              <span className="text-xl md:text-2xl font-bold text-text-primary">
                {result.correct_count ?? 0}
              </span>
            </div>

            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl border border-border-color bg-surface transition-transform hover:scale-[1.02]">
              <XCircle className="text-text-primary mb-1.5" size={24} />
              <span className="text-xs md:text-sm font-semibold text-text-secondary opacity-90">
                ভুল
              </span>
              <span className="text-xl md:text-2xl font-bold text-text-primary">
                {result.wrong_count ?? 0}
              </span>
            </div>

            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl border border-border-color bg-surface transition-transform hover:scale-[1.02]">
              <MinusCircle className="text-text-primary mb-1.5" size={24} />
              <span className="text-xs md:text-sm font-semibold text-text-secondary opacity-90">
                স্কিপ
              </span>
              <span className="text-xl md:text-2xl font-bold text-text-primary">
                {result.skipped_count ?? 0}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border shadow-sm font-mono text-lg md:text-xl bg-surface border-border-color">
            <span className="font-semibold opacity-70 text-sm md:text-base font-['Hind_Siliguri'] text-text-secondary">
              প্রাপ্ত স্কোর:
            </span>
            <span className="font-bold text-text-primary">
              {result.score ?? 0} / {result.total_marks ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl px-4 mt-8 space-y-5">
        {examQuestions.length > 0 ? (
          examQuestions.map((q: Question, idx: number) => (
            <AnalysisQuestionCard
              key={q.id}
              index={idx}
              question={q}
              userAnswerId={userAnswers[q.id]}
              initialBookmarked={bookmarkedIds.includes(q.id)}
              onReport={handleReport}
              onBookmark={handleBookmark}
            />
          ))
        ) : resultDetails.length > 0 ? (
          <>
            <div className="rounded-2xl border border-border-color bg-card-bg p-4">
              <h3 className="font-bold text-lg mb-1">উত্তরের সংক্ষিপ্ত বিস্তারিত</h3>
              <p className="text-sm text-text-secondary opacity-80">
                এই পরীক্ষার প্রশ্নের পূর্ণ লেখা সার্ভারে পাঠানো হয়নি, তাই এখানে উত্তর-স্ট্যাটাস দেখানো হচ্ছে।
              </p>
            </div>

            {resultDetails.map((item, idx) => {
              const selectedOption =
                item.selected_option ?? item.selected_option_id ?? null;

              return (
                <div
                  key={`${item.question_id}-${idx}`}
                  className={`rounded-2xl border p-4 sm:p-5 ${getStatusCardClass(item)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        প্রশ্ন {idx + 1}
                      </p>
                      <p className="text-sm font-mono break-all text-text-primary opacity-80">
                        {item.question_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-color bg-card-bg text-sm font-bold">
                      {getStatusIcon(item)}
                      <span>{getStatusText(item)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border-color bg-card-bg p-3">
                      <p className="text-xs text-text-secondary mb-1">আপনার উত্তর</p>
                      <p className="font-bold">
                        {selectedOption === null || selectedOption === undefined || selectedOption === ''
                          ? 'উত্তর দেওয়া হয়নি'
                          : `অপশন ${selectedOption}`}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border-color bg-card-bg p-3">
                      <p className="text-xs text-text-secondary mb-1">মার্কস</p>
                      <p className="font-bold">{item.marks_awarded ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleReport(item.question_id)}
                      className="px-4 py-2 rounded-xl border border-border-color bg-card-bg text-sm font-semibold active:scale-95 transition-all"
                    >
                      রিপোর্ট
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBookmark(item.question_id)}
                      className="px-4 py-2 rounded-xl border border-border-color bg-card-bg text-sm font-semibold active:scale-95 transition-all"
                    >
                      বুকমার্ক
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed flex flex-col items-center border-border-color">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center bg-surface-elevated">
              <MinusCircle size={32} className="opacity-40" />
            </div>

            <h3 className="text-lg font-bold opacity-80 mb-1">বিস্তারিত তথ্য নেই</h3>
            <p className="text-sm opacity-60">
              এই পরীক্ষার প্রশ্নের বিস্তারিত তথ্য সার্ভারে সংরক্ষিত নেই।
            </p>
          </div>
        )}
      </div>

      <div className="hidden md:flex w-full max-w-3xl px-4 mt-12 mb-16 gap-4 justify-center">
        <ActionButtons onHome={handleHomeNav} onBack={handleBackNav} />
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 z-40 backdrop-blur-xl border-t flex justify-center bg-surface border-border-color">
        <div className="w-full max-w-3xl flex gap-3">
          <ActionButtons onHome={handleHomeNav} onBack={handleBackNav} />
        </div>
      </div>

      <div className="h-24 md:hidden w-full" />

      {isReportModalOpen && reportQuestionData && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseModal}
          type="question_issue"
          questionData={reportQuestionData}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
};

export default Analysis;
