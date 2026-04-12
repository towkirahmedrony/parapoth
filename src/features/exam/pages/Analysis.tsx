import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AnalysisQuestionCard from '../components/AnalysisQuestionCard';
import ReportModal, { QuestionMetaData, ReportPayload as ModalReportPayload } from '@/shared/components/feedback/ReportModal';
import apiClient from '@/shared/lib/apiClient';
import { ExamResultPayload, Question } from '../types/exam';
import toast from 'react-hot-toast';

const Analysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state as ExamResultPayload | null;

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportQuestionData, setReportQuestionData] = useState<QuestionMetaData | null>(null);

  useEffect(() => {
    if (!result) {
      navigate('/dashboard/home', { replace: true });
    }
  }, [result, navigate]);

  const reportMutation = useMutation({
    mutationFn: async (payload: ModalReportPayload) => {
      // 👈 এখানে URL পরিবর্তন করে '/reports' করা হয়েছে
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

  const handleReport = useCallback((questionId: string) => {
    // Exam ID যদি রেজাল্টের মধ্যে থাকে, তাহলে অপশনাল হিসেবে পাস করতে পারেন
    setReportQuestionData({ questionId: questionId });
    setIsReportModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportQuestionData(null);
  }, []);

  // Promise রিটার্ন করা হচ্ছে যাতে ReportModal-এর await ঠিকমতো কাজ করে
  const handleSubmitReport = useCallback(async (data: ModalReportPayload) => {
    await reportMutation.mutateAsync(data);
  }, [reportMutation]);

  if (!result) return null;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
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
        {result.details_json?.questions?.map((q, idx) => (
          <AnalysisQuestionCard 
            key={q.id} 
            index={idx} 
            // এখানে টাইপ কাস্ট করে দেওয়া হলো যাতে TS2740 এরর না আসে
            question={q as unknown as Question}
            userAnswerId={result.details_json?.userAnswers?.[q.id]}
            onReport={handleReport} 
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 z-50 flex gap-4" style={{ backgroundColor: 'var(--dyn-card)', borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
         <button 
           type="button"
           onClick={() => navigate('/dashboard/home')} 
           className="flex-1 font-bold py-3 rounded-xl transition-colors"
           style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)', color: 'var(--dyn-text)' }}
         >
           হোমপেজ
         </button>
         <button 
           type="button"
           onClick={() => navigate(-1)} 
           className="flex-1 font-bold py-3 rounded-xl transition-colors"
           style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
         >
           আবার পরীক্ষা দিন
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
