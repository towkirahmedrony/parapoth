import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/shared/lib/apiClient';
import Loader from '@/shared/components/feedback/Loader';
import { ChallengeData, ChallengeSubmitPayload } from '../types/content';

const SECONDS_PER_QUESTION = 15;

interface ChallengerState {
  score: number;
  time_taken: number;
}

export const ChallengePlay: React.FC = () => {
  const navigate = useNavigate();
  const { challengeId } = useParams<{ challengeId: string }>(); 
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null); 
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION); 
  const [isFinished, setIsFinished] = useState(false);

  const [challengerData, setChallengerData] = useState<ChallengerState>({ score: 0, time_taken: 0 });

  // 1. Fetch Challenge Data using React Query
  const { data: challenge, isLoading, isError } = useQuery<ChallengeData>({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) throw new Error('Challenge ID is missing');
      const res = await apiClient.get(`/community/user/challenges/${challengeId}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to fetch challenge');
      }
      return res.data.data;
    },
    enabled: !!challengeId,
    staleTime: Infinity, // Ensure it doesn't refetch while playing
    refetchOnWindowFocus: false,
  });

  const questions = useMemo(() => challenge?.questions || [], [challenge?.questions]);
  const opponentData = useMemo(() => challenge?.opponent || { name: 'প্রতিপক্ষ', score: 0, time_taken: 0 }, [challenge?.opponent]);

  // 2. Submit Challenge Mutation
  const submitChallengeMutation = useMutation({
    mutationFn: async (payload: ChallengeSubmitPayload) => {
      if (!challengeId) throw new Error('Challenge ID is missing');
      const res = await apiClient.post(`/community/user/challenges/${challengeId}/submit`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("রেজাল্ট সফলভাবে সেভ হয়েছে!");
      navigate('/dashboard/home', { replace: true });
    },
    onError: (error) => {
      console.error("Failed to save challenge result", error);
      toast.error("রেজাল্ট সেভ করতে সমস্যা হয়েছে!");
    }
  });

  // 3. Handle Question Progress
  const handleNext = useCallback(() => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const isCorrect = currentQ.options.find((opt) => opt.id === selectedOption)?.isCorrect;
    
    setChallengerData(prev => ({
      score: prev.score + (isCorrect ? 1 : 0),
      time_taken: prev.time_taken + (SECONDS_PER_QUESTION - timeLeft)
    }));

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(SECONDS_PER_QUESTION); 
    } else {
      setIsFinished(true);
    }
  }, [currentQIndex, questions, selectedOption, timeLeft]);

  // 4. Auto-Next on Timeout
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      handleNext();
    }
  }, [timeLeft, isFinished, handleNext]);

  // 5. Timer Effect (Stable Interval)
  useEffect(() => {
    if (isLoading || isError || isFinished || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, isError, isFinished, questions.length]);

  // Submit Handler
  const handleSubmitResult = useCallback(() => {
    submitChallengeMutation.mutate({
      challenger_score: challengerData.score,
      challenger_time_taken: challengerData.time_taken,
      status: 'completed'
    });
  }, [challengerData, submitChallengeMutation]);

  // Render Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-text-primary">
        <Loader />
      </div>
    );
  }

  // Render Error State
  if (isError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center bg-app text-text-primary">
        <div className="p-6 rounded-xl max-w-sm w-full bg-card-bg border border-card-border shadow-sm">
          <p className="font-bold text-lg mb-4 text-accent">চ্যালেঞ্জ লোড করা সম্ভব হয়নি।</p>
          <button 
            type="button"
            onClick={() => navigate('/dashboard/home')} 
            className="px-6 py-2 rounded-lg font-bold transition-opacity w-full bg-secondary text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Render Finished State
  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-app text-text-primary">
        <div className="p-8 rounded-2xl text-center shadow-lg w-full max-w-sm bg-card-bg border border-card-border">
          <h2 className="text-2xl font-bold mb-4">চ্যালেঞ্জ সমাপ্ত! 🏆</h2>
          <div className="flex justify-between my-6 px-4">
            <div>
              <p className="text-sm font-bold text-text-secondary">আপনার স্কোর</p>
              <p className="text-4xl font-black mt-2 text-primary">{challengerData.score}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-secondary">{opponentData.name}</p>
              <p className="text-4xl font-black mt-2 text-accent">{opponentData.score}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleSubmitResult} 
            disabled={submitChallengeMutation.isPending}
            className="px-6 py-4 rounded-xl font-bold w-full disabled:opacity-50 transition-all mt-4 bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" 
          >
            {submitChallengeMutation.isPending ? 'সেভ হচ্ছে...' : 'রেজাল্ট সেভ করুন'}
          </button>
        </div>
      </div>
    );
  }

  // Render Active Question State
  const currentQuestion = questions[currentQIndex];

  return (
    <div className="min-h-screen flex flex-col relative pb-32 bg-app text-text-primary">
      {/* Header */}
      <div className="sticky top-0 z-30 shadow-sm transition-colors duration-300 bg-surface border-b border-border-color">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-primary">আপনি: {challengerData.score}</div>
          <div className={`flex items-center gap-1 font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-accent animate-pulse' : 'text-primary'}`}>
            <Clock size={20} />
            <span>{String(timeLeft).padStart(2, '0')}s</span>
          </div>
          <div className="font-bold text-accent">{opponentData.name}: {opponentData.score}</div>
        </div>
      </div>
      
      {/* Question Content */}
      <div className="flex-1 p-4 w-full max-w-3xl mx-auto mt-4">
        <h2 className="text-xl font-bold mb-8 leading-relaxed text-text-primary">{currentQuestion?.text}</h2>
        <div className="space-y-4">
          {currentQuestion?.options.map((opt) => (
            <button 
              key={opt.id} 
              type="button"
              onClick={() => setSelectedOption(opt.id)}
              className={`w-full p-5 rounded-xl text-left font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                selectedOption === opt.id 
                  ? 'bg-surface-elevated border-border-color ring-2 ring-focus-ring text-text-primary' 
                  : 'bg-card-bg border-card-border text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-30 bg-surface border-t border-border-color">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button 
            type="button"
            onClick={handleNext} 
            className="px-8 py-4 font-bold rounded-xl flex gap-2 items-center transition-all active:scale-95 bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" 
          >
            পরবর্তী <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
