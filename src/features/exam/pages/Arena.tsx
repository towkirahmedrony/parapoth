import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import LiveQuestionCard from '../components/LiveQuestionCard';

import ReportModal, { ReportPayload as ModalReportPayload } from '@/shared/components/feedback/ReportModal';
import ConfirmModal from '@/shared/components/feedback/ConfirmModal';
import { apiClient } from '@/shared/lib/apiClient';
import toast from 'react-hot-toast'; 
import { ExamConfig, ExamQuestion } from '../types/exam';

const MARKS_PER_QUESTION = 1;
const NEGATIVE_MARK_PENALTY = 0.25;

const defaultConfig: ExamConfig = { questionCount: 10, duration: 20, negativeMarking: true };

const fetchArenaQuestions = async (limit: number, subjectSlug?: string): Promise<ExamQuestion[]> => {
  const url = subjectSlug 
    ? `/exams/user/arena?limit=${limit}&subjectSlug=${subjectSlug}`
    : `/exams/user/arena?limit=${limit}`;
  const res = await apiClient.get(url);
  return res.data?.success ? res.data.data : [];
};

const Arena: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  
  const passedConfig = location.state?.config as ExamConfig | undefined;
  const config = passedConfig || defaultConfig;
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const hasSubmittedRef = useRef(false);
  const targetEndTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef(config.duration * 60);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['arenaQuestions', config.questionCount, subjectSlug],
    queryFn: () => fetchArenaQuestions(config.questionCount, subjectSlug),
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isLoading || questions.length === 0) return;
    
    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + (config.duration * 60 * 1000);
    }
    
    const timer = setInterval(() => {
      const now = Date.now();
      const end = targetEndTimeRef.current || now;
      const remaining = Math.max(0, Math.ceil((end - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, questions.length, config.duration]);

  const submitExamMutation = useMutation({
    mutationFn: async (resultPayload: Record<string, unknown>) => {
      const res = await apiClient.post(`/exams/user/history`, resultPayload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      navigate('/exam/analysis', { state: variables, replace: true });
    },
    onError: (error) => {
      console.error("Error submitting exam:", error);
      toast.error("পরীক্ষা সাবমিট করতে সমস্যা হয়েছে!");
      hasSubmittedRef.current = false; 
    }
  });

  const reportMutation = useMutation({
    mutationFn: async (reportData: ModalReportPayload) => {
      await apiClient.post(`/reports`, reportData); 
    },
    onSuccess: () => {
      toast.success("রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!");
    },
    onError: (error) => {
      console.error("Report submission failed:", error);
      toast.error("রিপোর্ট সাবমিট করতে সমস্যা হয়েছে!");
    }
  });

  const { mutate: submitExam } = submitExamMutation;

  const processSubmission = useCallback(() => {
    if (hasSubmittedRef.current || questions.length === 0) return;
    hasSubmittedRef.current = true;

    let correct = 0, wrong = 0, skipped = 0;
    
    // 🌟 আপডেট: Loop এর ভেতরেই stats ক্যালকুলেশন এবং detailedResults অ্যারে তৈরি করা হচ্ছে
    const detailedResults = questions.map(q => {
      const userAnswerId = userAnswers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect = !!(correctOption && userAnswerId === correctOption.id);

      let marksAwarded = 0;

      if (!userAnswerId) {
        skipped++;
        marksAwarded = 0;
      } else if (isCorrect) {
        correct++;
        marksAwarded = MARKS_PER_QUESTION;
      } else {
        wrong++;
        marksAwarded = config.negativeMarking ? -NEGATIVE_MARK_PENALTY : 0;
      }

      return {
        question_id: q.id,
        selected_option: userAnswerId || null,
        is_correct: isCorrect,
        marks_awarded: marksAwarded
      };
    });

    const score = (correct * MARKS_PER_QUESTION) - (config.negativeMarking ? wrong * NEGATIVE_MARK_PENALTY : 0);
    const timeTaken = (config.duration * 60) - Math.max(0, timeLeftRef.current);

    const resultPayload = {
      correct_count: correct,
      wrong_count: wrong,
      skipped_count: skipped,
      time_taken: timeTaken,
      score: score,
      total_marks: questions.length * MARKS_PER_QUESTION,
      // 🌟 আপডেট: details_json এর ভেতরে detailedResults পাঠানো হচ্ছে
      details_json: { questions, userAnswers, detailedResults } 
    };

    submitExam(resultPayload);
  }, [questions, userAnswers, config, submitExam]);

  useEffect(() => {
    if (timeLeft <= 0 && questions.length > 0 && !hasSubmittedRef.current) {
      setIsConfirmModalOpen(false); 
      processSubmission();
    }
  }, [timeLeft, questions.length, processSubmission]);

  const handleOptionSelect = useCallback((questionId: string, optionId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }, []);

  const handleReportClick = useCallback((questionId: string) => {
    setReportingQuestionId(questionId);
    setIsReportModalOpen(true);
  }, []);

  const handleCloseReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportingQuestionId(null);
  }, []);

  const handleReportSubmit = useCallback(async (reportData: ModalReportPayload) => {
    await reportMutation.mutateAsync(reportData);
  }, [reportMutation]);

  const handleManualSubmitClick = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    setIsConfirmModalOpen(false);
    processSubmission();
  }, [processSubmission]);

  const handleCancelSubmit = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
        <div className="animate-pulse font-bold text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
      <div className="sticky top-0 z-30 px-4 py-3 shadow-sm flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 95%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <div className="font-bold" style={{ color: 'var(--dyn-primary)' }}>{Object.keys(userAnswers).length} / {questions.length}</div>
        <div className="font-mono font-bold" style={{ color: 'var(--dyn-primary)' }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto p-4 space-y-6">
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

      <div className="fixed bottom-0 left-0 w-full p-4 z-30" style={{ backgroundColor: 'var(--dyn-card)', borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <button 
          type="button"
          onClick={handleManualSubmitClick} 
          disabled={submitExamMutation.isPending || hasSubmittedRef.current}
          className="w-full font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity" 
          style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
        >
          {submitExamMutation.isPending || hasSubmittedRef.current ? 'জমা দেওয়া হচ্ছে...' : 'উত্তরপত্র জমা দিন'}
        </button>
      </div>

      {isReportModalOpen && reportingQuestionId && (
        <ReportModal 
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          type="question_issue"
          questionData={{ questionId: reportingQuestionId }}
          onSubmit={handleReportSubmit}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal 
          isOpen={isConfirmModalOpen}
          title="পরীক্ষা জমাদান"
          message={`আপনি ${Object.keys(userAnswers).length} টি প্রশ্নের উত্তর দিয়েছেন। জমা দিতে চান?`}
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
          isLoading={submitExamMutation.isPending}
        />
      )}
    </div>
  );
};

export default memo(Arena);
