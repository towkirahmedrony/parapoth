import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AnalysisQuestionCard from '../components/AnalysisQuestionCard';
import ReportModal, { QuestionMetaData, ReportPayload as ModalReportPayload } from '@/shared/components/feedback/ReportModal';
import apiClient from '@/shared/lib/apiClient';
import { ExamResultPayload, Question } from '../types/exam';
import toast from 'react-hot-toast';

const Analysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [result, setResult] = useState<ExamResultPayload | null>((location.state as ExamResultPayload) || null);
  const [isLoading, setIsLoading] = useState(!location.state);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportQuestionData, setReportQuestionData] = useState<QuestionMetaData | null>(null);

  useEffect(() => {
    if (!result) {
      if (id) {
        apiClient.get('/history/exams')
          .then(res => {
            const historyList = res.data.data;
            const found = historyList.find((item: any) => item.id === id);
            if (found) {
              setResult(found);
            } else {
              toast.error("ফলাফল পাওয়া যায়নি!");
              navigate('/dashboard/home', { replace: true });
            }
          })
          .catch(() => {
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
      toast.success("রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!");
    },
    onError: (error) => {
      console.error("Error submitting report:", error);
      toast.error("সার্ভার এরর! রিপোর্ট জমা দেওয়া যায়নি।");
    }
  });

  // 🌟 নতুন Mutation: বুকমার্ক টগল করার জন্য
  const bookmarkMutation = useMutation({
    mutationFn: async (questionId: string) => {
      // যদি আপনার API এর Base URL ভিন্ন হয়, তাহলে /exams/bookmark পরিবর্তন করে সঠিক রাউটটি দিন
      const response = await apiClient.post('/exams/bookmark', { questionId }); 
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "বুকমার্ক আপডেট হয়েছে!");
    },
    onError: (error) => {
      console.error("Error bookmarking:", error);
      toast.error("সার্ভার এরর! বুকমার্ক আপডেট করা যায়নি।");
    }
  });

  const handleReport = useCallback((questionId: string) => {
    setReportQuestionData({ questionId: questionId });
    setIsReportModalOpen(true);
  }, []);

  // 🌟 নতুন Handler: বুকমার্ক বাটনে ক্লিক করলে API কল করবে
  const handleBookmark = useCallback((questionId: string) => {
    bookmarkMutation.mutate(questionId);
  }, [bookmarkMutation]);

  const handleCloseModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportQuestionData(null);
  }, []);

  const handleSubmitReport = useCallback(async (data: ModalReportPayload) => {
    await reportMutation.mutateAsync(data);
  }, [reportMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
         ফলাফল লোড হচ্ছে...
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen pb-28 animate-in fade-in" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
      <div className="p-6 text-center shadow-sm" style={{ backgroundColor: 'var(--dyn-card)', borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--dyn-primary)' }}>ফলাফল বিশ্লেষণ</h2>
        <div className="flex justify-center gap-6 text-lg">
           <div className="font-bold" style={{ color: 'var(--dyn-primary)' }}>সঠিক: {result.correct_count ?? 0}</div>
           <div className="font-bold" style={{ color: 'var(--dyn-accent)' }}>ভুল: {result.wrong_count ?? 0}</div>
           <div className="font-bold" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>স্কিপ: {result.skipped_count ?? 0}</div>
        </div>
        <div className="mt-4 font-mono font-bold text-xl">স্কোর: {result.score ?? 0} / {result.total_marks ?? 0}</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-4">
        {result.details_json?.questions?.length ? (
          result.details_json.questions.map((q: any, idx: number) => (
            <AnalysisQuestionCard 
              key={q.id} 
              index={idx} 
              question={q as unknown as Question}
              userAnswerId={result.details_json?.userAnswers?.[q.id]}
              onReport={handleReport} 
              onBookmark={handleBookmark} // 🌟 প্রপস হিসেবে পাস করা হলো
            />
          ))
        ) : (
          <div className="text-center py-10 opacity-70">
            প্রশ্নের বিস্তারিত তথ্য সংরক্ষিত নেই।
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 z-50 flex gap-4" style={{ backgroundColor: 'var(--dyn-card)', borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
         <button 
           type="button"
           onClick={() => navigate('/dashboard/home')} 
           className="flex-1 font-bold py-3 rounded-xl transition-colors active:scale-95"
           style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)', color: 'var(--dyn-text)' }}
         >
           হোমপেজ
         </button>
         <button 
           type="button"
           onClick={() => navigate(-1)} 
           className="flex-1 font-bold py-3 rounded-xl transition-colors active:scale-95"
           style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
         >
           পিছনে যান
         </button>
      </div>

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
