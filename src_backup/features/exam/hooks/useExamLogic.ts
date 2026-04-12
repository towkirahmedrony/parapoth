import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionStructure, ExamProgressState } from '../../../shared/types/app';
import { useExamResume } from './useExamResume';

export const useExamLogic = (examId: string, questions: QuestionStructure[], userId?: string) => {
  const navigate = useNavigate();
  const { saveProgress, loadProgress, clearProgress } = useExamResume();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [status, setStatus] = useState<ExamProgressState['status']>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  // স্টেট পরিবর্তনগুলো ট্র্যাক করার জন্য Ref (Stale closure রোধ করতে)
  const progressRef = useRef({ currentQuestionIndex, answers, timeRemaining, status });
  useEffect(() => {
    progressRef.current = { currentQuestionIndex, answers, timeRemaining, status };
  }, [currentQuestionIndex, answers, timeRemaining, status]);

  // মাউন্টের সময় প্রোগ্রেস লোড করা
  useEffect(() => {
    let isMounted = true;
    
    const initProgress = async () => {
      try {
        const parsed = await loadProgress(examId, userId);
        if (!isMounted) return;
        
        if (parsed && (parsed.status as string) !== 'finished') {
          setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
          setAnswers(parsed.answers_draft ?? {});
          setTimeRemaining(parsed.timeRemaining ?? 0);
          setStatus((parsed.status as ExamProgressState['status']) || 'idle');
        }
      } catch (error) {
        console.error('Failed to load exam progress:', error);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    };
    initProgress();
    
    return () => { isMounted = false; };
  }, [examId, userId, loadProgress]);

  // উত্তর পরিবর্তন হলে প্রোগ্রেস সেভ করা (Debounce সহ)
  useEffect(() => {
    if (isLoaded && (status as string) !== 'finished') {
      const timeout = setTimeout(() => {
        saveProgress(examId, {
          exam_id: examId,
          currentQuestionIndex,
          answers_draft: answers,
          timeRemaining,
          status,
          isComplete: (status as string) === 'finished'
        }, userId).catch(err => console.error('Auto-save failed', err));
      }, 1000); 
      return () => clearTimeout(timeout);
    }
  }, [currentQuestionIndex, answers, status, isLoaded, examId, userId, saveProgress]);

  // প্রতি ১০ সেকেন্ড পর পর সার্ভারে সময় সেভ করা
  useEffect(() => {
    if (status !== 'running' || !isLoaded) return;
    const syncTimer = setInterval(() => {
       const state = progressRef.current;
       saveProgress(examId, {
         exam_id: examId,
         currentQuestionIndex: state.currentQuestionIndex,
         answers_draft: state.answers,
         timeRemaining: state.timeRemaining,
         status: state.status,
         isComplete: (state.status as string) === 'finished'
       }, userId).catch(err => console.error('Timer sync failed', err));
    }, 10000);
    return () => clearInterval(syncTimer);
  }, [status, isLoaded, examId, userId, saveProgress]);

  const startExam = useCallback(() => setStatus('running'), []);
  
  const handleAnswer = useCallback((qId: string | undefined, oIdx: number) => {
    if (!qId) return;
    setAnswers(prev => ({ ...prev, [qId]: oIdx }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => {
      if (prev < questions.length - 1) return prev + 1;
      return prev;
    });
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => {
      if (prev > 0) return prev - 1;
      return prev;
    });
  }, []);

  const finishExam = useCallback(async () => {
    setStatus('finished' as ExamProgressState['status']);
    try {
      await clearProgress(examId, userId); 
    } catch (err) {
      console.error('Failed to clear progress on finish', err);
    }
    navigate(`/exam/result/${examId}`);
  }, [examId, userId, clearProgress, navigate]);

  // টাইমার লজিক
  useEffect(() => {
    if (status !== 'running' || !isLoaded) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, isLoaded, finishExam]);

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
