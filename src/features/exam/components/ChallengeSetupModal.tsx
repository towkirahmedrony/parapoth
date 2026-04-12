import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { X, Swords } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import toast from 'react-hot-toast';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { SubjectSelector } from './SubjectSelector';
import { ChapterSelector } from './ChapterSelector';
import { Subject, Chapter } from '../types/content';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentId: string;
  opponentName: string;
  groupId?: string;
}

export const ChallengeSetupModal: React.FC<ChallengeModalProps> = ({ 
  isOpen, 
  onClose, 
  opponentId, 
  opponentName, 
  groupId 
}) => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  // Reset chapter selection when subject changes
  useEffect(() => {
    setSelectedChapter('all');
  }, [selectedSubject]);

  // 1. Fetch Subjects using React Query
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name_bn')
        .eq('is_active', true);
        
      if (error) throw error;
      return data as Pick<Subject, 'id' | 'name_bn'>[];
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Fetch Chapters using React Query
  const { data: chapters = [], isLoading: isChaptersLoading } = useQuery({
    queryKey: ['chapters', 'active', selectedSubject],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, name_bn')
        .eq('subject_id', selectedSubject)
        .eq('is_active', true);
        
      if (error) throw error;
      return data as Pick<Chapter, 'id' | 'name_bn'>[];
    },
    enabled: isOpen && !!selectedSubject,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Handle Challenge Submission using React Query Mutation
  const challengeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubject) {
        throw new Error('অনুগ্রহ করে একটি বিষয় নির্বাচন করুন');
      }

      if (!user?.id) {
        throw new Error('ইউজার তথ্য পাওয়া যাচ্ছে না');
      }

      const examId = `battle_${Date.now()}`;
      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); 
      
      // Step 1: Create Exam Paper
      const { error: examError } = await supabase.from('exam_papers').insert({
        id: examId,
        title: `${opponentName}-এর সাথে যুদ্ধ ⚔️`,
        subject_id: selectedSubject,
        category: 'group_battle',
        is_premium: false,
        total_marks: 50, 
        pass_mark: 0,
        duration_min: 15,
        is_published: true,
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
      });

      if (examError) throw examError;

      const validGroupId = groupId || null; 

      // Step 2: Create Group Battle Entry
      const { error: battleError } = await supabase.from('group_battles').insert({
        group_id: validGroupId,
        exam_id: examId,
        initiated_by: user.id,
        status: 'pending',
        scores_snapshot: {
          [user.id]: 0,
          [opponentId]: 0
        },
        start_time: now.toISOString(),
        end_time: endTime.toISOString(), 
      });

      // Manual Rollback if Battle creation fails
      if (battleError) {
        await supabase.from('exam_papers').delete().eq('id', examId);
        throw battleError;
      }

      return true;
    },
    onSuccess: () => {
      toast.success('চ্যালেঞ্জ সফলভাবে পাঠানো হয়েছে! 🚀');
      onClose();
    },
    onError: (error: Error) => {
      console.error("Battle Creation Error:", error);
      toast.error(error.message || 'চ্যালেঞ্জ পাঠাতে সমস্যা হয়েছে');
    }
  });

  const handleChallengeSubmit = useCallback(() => {
    challengeMutation.mutate();
  }, [challengeMutation]);

  // Hook rules strictly followed: early return comes AFTER all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 transform transition-all animate-slide-up"
        style={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--dyn-text)' }}>
            <Swords style={{ color: 'var(--dyn-primary)' }} /> চ্যালেঞ্জ সেটআপ
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
            aria-label="Close modal"
          >
            <X size={20} style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} />
          </button>
        </div>

        <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
          আপনি <strong style={{ color: 'var(--dyn-primary)' }}>{opponentName}</strong>-কে চ্যালেঞ্জ করছেন।
        </p>

        <SubjectSelector 
          isLoading={isSubjectsLoading} 
          subjects={subjects} 
          selectedSubject={selectedSubject} 
          onSelect={setSelectedSubject} 
        />

        <ChapterSelector 
          isLoading={isChaptersLoading} 
          chapters={chapters} 
          selectedChapter={selectedChapter} 
          selectedSubject={selectedSubject} 
          onSelect={setSelectedChapter} 
        />

        <div 
          className="p-4 rounded-xl border mb-6"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' 
          }}
        >
          <p className="text-sm text-center font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-primary) 80%, var(--dyn-text))' }}>
            🏆 বিজয়ী প্রতিটি সঠিক উত্তরের জন্য গ্রুপ XP অর্জন করবেন।
          </p>
        </div>

        {challengeMutation.isPending ? (
           <Skeleton className="w-full h-[52px] rounded-xl" />
        ) : (
          <button 
            onClick={handleChallengeSubmit}
            disabled={challengeMutation.isPending}
            className="w-full py-3.5 font-bold rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
          >
            চ্যালেঞ্জ ছুঁড়ে দিন 🚀
          </button>
        )}
      </div>
    </div>
  );
};
