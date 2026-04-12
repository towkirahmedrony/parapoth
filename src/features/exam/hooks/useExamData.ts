import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/shared/lib/apiClient';
import { Question, ExamResultData, ProgressEntry } from '../types/exam';

// ১. কাস্টম এক্সাম বা প্রশ্ন জেনারেট করা
export const useGenerateExam = (topicIds: string[], questionCount: number) => {
  return useQuery({
    queryKey: ['generate-exam', topicIds, questionCount],
    queryFn: async (): Promise<Question[]> => {
      const response = await apiClient.post('/api/v1/exams/user/generate', {
        topics: topicIds,
        limit: questionCount
      });
      return response.data.data;
    },
    enabled: false, 
  });
};

// ২. এক্সাম সাবমিট করে রেজাল্ট সেভ করা
export const useSubmitExamResult = () => {
  return useMutation({
    mutationFn: async (resultData: ExamResultData) => {
      const response = await apiClient.post('/api/v1/exams/user/submit', resultData);
      return response.data.data;
    },
    onError: () => {
      toast.error('Failed to submit exam results. Please try again.');
    }
  });
};

// ৩. লাইভ এক্সাম প্রোগ্রেস মনিটর (LiveExamMonitor এর জন্য)
export const useLiveProgress = (examId: string) => {
  return useQuery({
    queryKey: ['live-progress', examId],
    queryFn: async (): Promise<ProgressEntry[]> => {
      const response = await apiClient.get(`/api/v1/exams/${examId}/live-progress`);
      return response.data.data;
    },
    refetchInterval: 5000, // প্রতি ৫ সেকেন্ডে অটোমেটিক রিফ্রেশ হবে
    enabled: !!examId,
  });
};

// ৪. ডিসকানেক্টেড ইউজার সেশন রিকভার করা
export const useRecoverUserSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progressId: string) => {
      const response = await apiClient.post(`/api/v1/exams/progress/${progressId}/recover`);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Session recovered successfully!');
      queryClient.invalidateQueries({ queryKey: ['live-progress'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to recover session.';
      toast.error(message);
    }
  });
};

// ৫. এক্সামের কনফিগারেশন/বিস্তারিত তথ্য ফেচ করা
export const useGetExamDetails = (examId: string | null) => {
  return useQuery({
    queryKey: ['exam-details', examId],
    queryFn: async () => {
      if (!examId) return null;
      const response = await apiClient.get(`/api/v1/exams/${examId}`);
      return response.data.data;
    },
    // শুধুমাত্র তখনই ফেচ করবে যখন examId থাকবে
    enabled: !!examId,
    // ক্যাশিং টাইম সেট করে দেওয়া হলো যাতে বারবার কল না হয়
    staleTime: 5 * 60 * 1000, 
  });
};
