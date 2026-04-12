import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionStructure, ExamProgressState } from '@/shared/types/app';
import { useExamResume } from './useExamResume';
import { supabase } from '@/shared/lib/supabase';
import { LeaderboardEntry } from '../types/exam';

// Extended type to resolve the TypeScript overlap error for 'finished' status
export type ExtendedExamStatus = ExamProgressState['status'] | 'finished';

// ============================================================================
// EXAM TAKING LOGIC
// ============================================================================
export const useExamLogic = (examId: string, questions: QuestionStructure[], initialTimeSeconds: number, userId?: string) => {
  const navigate = useNavigate();
  const { saveProgress, loadProgress, clearProgress } = useExamResume();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeSeconds);
  const [status, setStatus] = useState<ExtendedExamStatus>('idle');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Use refs to track actual end time for drift-free countdown and current state
  const targetEndTimeRef = useRef<number | null>(null);
  const progressRef = useRef({ currentQuestionIndex, answers, timeRemaining, status });
  
  useEffect(() => {
    progressRef.current = { currentQuestionIndex, answers, timeRemaining, status };
  }, [currentQuestionIndex, answers, timeRemaining, status]);

  // Initialization
  useEffect(() => {
    let isMounted = true;
    
    const initProgress = async () => {
      try {
        const parsed = await loadProgress(examId, userId);
        if (!isMounted) return;
        
        if (parsed && parsed.status !== 'finished') {
          setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
          setAnswers((parsed.answers_draft as Record<string, number>) || {});
          
          // Fallback to initial time if loaded time is missing or invalid
          const loadedTime = parsed.timeRemaining != null && parsed.timeRemaining > 0 
            ? parsed.timeRemaining 
            : initialTimeSeconds;
          
          setTimeRemaining(loadedTime);
          setStatus((parsed.status as ExtendedExamStatus) || 'idle');
        } else {
           // Fresh exam
           setTimeRemaining(initialTimeSeconds);
        }
      } catch (error: unknown) {
        console.error('Failed to load exam progress:', error);
        if (isMounted) setTimeRemaining(initialTimeSeconds); // safe fallback
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    };
    
    initProgress();
    
    return () => { isMounted = false; };
  }, [examId, userId, loadProgress, initialTimeSeconds]);

  // Debounced Auto-save
  useEffect(() => {
    if (!isLoaded || status === 'finished') return;

    const timeout = setTimeout(() => {
      try {
        Promise.resolve(
          saveProgress(examId, {
            exam_id: examId,
            currentQuestionIndex,
            answers_draft: answers,
            timeRemaining,
            status: status as ExamProgressState['status'], 
            isComplete: false
          }, userId)
        ).catch((err: unknown) => console.error('Auto-save failed', err));
      } catch (err: unknown) {
        console.error('Auto-save sync error', err);
      }
    }, 1000); 
    
    return () => clearTimeout(timeout);
  }, [currentQuestionIndex, answers, status, isLoaded, examId, userId, saveProgress]);

  // Periodic Timer Sync
  useEffect(() => {
    if (status !== 'running' || !isLoaded) return;
    
    const syncTimer = setInterval(() => {
       const state = progressRef.current;
       try {
         Promise.resolve(
           saveProgress(examId, {
             exam_id: examId,
             currentQuestionIndex: state.currentQuestionIndex,
             answers_draft: state.answers,
             timeRemaining: state.timeRemaining,
             status: state.status as ExamProgressState['status'],
             isComplete: state.status === 'finished'
           }, userId)
         ).catch((err: unknown) => console.error('Timer sync failed', err));
       } catch (err: unknown) {
         console.error('Timer sync error', err);
       }
    }, 10000);
    
    return () => clearInterval(syncTimer);
  }, [status, isLoaded, examId, userId, saveProgress]);

  const startExam = useCallback(() => {
    // Set the absolute end time when the exam is explicitly started
    targetEndTimeRef.current = Date.now() + (progressRef.current.timeRemaining * 1000);
    setStatus('running');
  }, []);
  
  const handleAnswer = useCallback((qId: string | undefined, oIdx: number) => {
    if (!qId) return;
    setAnswers(prev => ({ ...prev, [qId]: oIdx }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => (prev < questions.length - 1 ? prev + 1 : prev));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const finishExam = useCallback(async () => {
    setStatus('finished');
    targetEndTimeRef.current = null;
    
    try {
      await Promise.resolve(clearProgress(examId, userId)); 
    } catch (err: unknown) {
      console.error('Failed to clear progress on finish', err);
    }
    // Used replace: true to prevent navigating back to finished exam
    navigate(`/exam/result/${examId}`, { replace: true });
  }, [examId, userId, clearProgress, navigate]);

  // Drift-Free Timer Countdown Logic
  useEffect(() => {
    if (status !== 'running' || !isLoaded) return;
    
    // Ensure target time exists (e.g. if resumed from "paused" state)
    if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + (timeRemaining * 1000);
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const end = targetEndTimeRef.current || now;
      const remainingSeconds = Math.max(0, Math.ceil((end - now) / 1000));
      
      setTimeRemaining(remainingSeconds);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [status, isLoaded]); // timeRemaining removed from dependencies to avoid constant re-renders of the interval

  // Trigger completion safely outside of state updater
  useEffect(() => {
    if (status === 'running' && isLoaded && timeRemaining <= 0) {
      finishExam();
    }
  }, [timeRemaining, status, isLoaded, finishExam]);

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    handleAnswer,
    timeRemaining,
    status,
    startExam,
    isLoaded,
    nextQuestion,
    prevQuestion,
    finishExam,
    currentQuestion: questions[currentQuestionIndex]
  };
};

// ============================================================================
// MODERATION LOGIC
// ============================================================================

export const useModerateLeaderboard = (examId: string) => {
  return useQuery({
    queryKey: ['leaderboard', 'moderation', examId],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase
        .from('exam_history')
        .select(`
          id,
          user_id,
          score,
          total_marks,
          time_taken,
          device_type,
          profiles (
            full_name,
            username
          )
        `)
        .eq('exam_id', examId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        // Supabase sometimes returns array for one-to-many profiles link without explicit constraints
        user_name: Array.isArray(entry.profiles) 
          ? (entry.profiles[0]?.full_name || entry.profiles[0]?.username || 'Unknown User')
          : (entry.profiles?.full_name || entry.profiles?.username || 'Unknown User'),
        score: entry.score || 0,
        total_marks: entry.total_marks || 0,
        time_taken: entry.time_taken || 0,
        device_type: entry.device_type || 'Unknown'
      }));
    },
    enabled: !!examId,
  });
};

export const usePunishUser = (examId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'zero_marks' | 'ban_device' }) => {
      if (action === 'zero_marks') {
        const { error } = await supabase
          .from('exam_history')
          .update({ score: 0 })
          .eq('user_id', userId)
          .eq('exam_id', examId);
        
        if (error) throw new Error(`Failed to set zero marks: ${error.message}`);
      } else if (action === 'ban_device') {
        // Run profile and device suspension concurrently for better performance
        const [profileRes, deviceRes] = await Promise.all([
          supabase.from('profiles').update({ account_status: 'suspended' }).eq('id', userId),
          supabase.from('user_devices').update({ is_trusted: false }).eq('user_id', userId)
        ]);
        
        if (profileRes.error) throw new Error(`Failed to ban user: ${profileRes.error.message}`);
        if (deviceRes.error) throw new Error(`Failed to ban device: ${deviceRes.error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'moderation', examId] });
    },
  });
};
