import React, { useEffect, useState, useCallback, memo } from 'react';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Removed missing sub-components (CardHeader, CardContent, etc.) to fix compiler error.
// Using generic semantic HTML instead.
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

// Fixed import path based on the project file tree
import { useGetExamDetails } from '../hooks/useExamData';
import { useCurriculumTree } from '../hooks/useContentData';

export interface ExamFormData {
  title: string;
  subject_id: string;
  category: string;
  exam_type: string;
  total_marks: number;
  pass_mark: number;
  default_negative_marks: number;
  duration_min: number;
  start_time: string;
  end_time: string;
  result_publish_time: string;
  syllabus_details: string;
  instructions: string;
  show_leaderboard: boolean;
  is_premium: boolean;
  is_published: boolean;
}

interface Props {
  onNext: (data: ExamFormData) => void;
  editingExamId?: string | null;
}

const DEFAULT_FORM_DATA: ExamFormData = {
  title: '', subject_id: '', category: '', exam_type: '',
  total_marks: 100, pass_mark: 40, default_negative_marks: 0.25,
  duration_min: 25, start_time: '', end_time: '', result_publish_time: '',
  syllabus_details: '', instructions: '', show_leaderboard: true,
  is_premium: false, is_published: true,
};

export const ExamStep1Settings: React.FC<Props> = memo(({ onNext, editingExamId }) => {
  const { 
    data: examData, 
    isLoading: isExamLoading, 
    isError: isExamError 
  } = useGetExamDetails(editingExamId || null);
  
  const { 
    data: subjects = [], 
    isLoading: isSubjectsLoading, 
    isError: isSubjectsError 
  } = useCurriculumTree();

  const [formData, setFormData] = useState<ExamFormData>(DEFAULT_FORM_DATA);

  // Error Handling with react-hot-toast
  useEffect(() => {
    if (isExamError) {
      toast.error('Failed to load exam configuration. Please try again.');
    }
    if (isSubjectsError) {
      toast.error('Failed to load subjects. Please refresh the page.');
    }
  }, [isExamError, isSubjectsError]);

  // Sync external data to local state when editing
  useEffect(() => {
    if (examData && editingExamId) {
      setFormData({
        title: examData.title || '', 
        subject_id: examData.subject_id || '', 
        category: examData.category || '',
        exam_type: examData.exam_type || '', 
        total_marks: examData.total_marks || 100,
        pass_mark: examData.pass_mark || 40, 
        default_negative_marks: examData.default_negative_marks || 0.25,
        duration_min: examData.duration_min || 25, 
        start_time: examData.start_time || '',
        end_time: examData.end_time || '', 
        result_publish_time: examData.result_publish_time || '',
        syllabus_details: examData.syllabus_details || '', 
        instructions: examData.instructions || '',
        show_leaderboard: examData.show_leaderboard ?? true, 
        is_premium: examData.is_premium ?? false,
        is_published: examData.is_published ?? true,
      });
    } else if (!editingExamId) {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [examData, editingExamId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  }, []);

  const handleNext = () => {
    onNext(formData);
  };

  const isLoading = isExamLoading || isSubjectsLoading;
  const isError = isExamError || isSubjectsError;
  const isValid = formData.title.trim() !== '' && formData.subject_id.trim() !== '';

  if (isLoading) {
    return (
      <Card className="p-12 flex flex-col justify-center items-center h-[500px]" 
            style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: 'var(--dyn-primary)' }} />
        <span className="font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          Loading exam configuration...
        </span>
      </Card>
    );
  }

  if (isError && !examData && subjects.length === 0) {
    return (
      <Card className="p-12 flex flex-col justify-center items-center h-[500px]" 
            style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <AlertCircle className="h-10 w-10 mb-4 text-red-500" />
        <span className="font-medium text-red-500 text-center">
          Failed to load necessary data.<br/>Please check your connection and reload.
        </span>
      </Card>
    );
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 p-6" 
          style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
      
      {/* Replaced CardHeader with standard semantic div */}
      <div className="flex flex-col space-y-1.5 mb-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight" style={{ color: 'var(--dyn-text)' }}>
          {editingExamId ? 'Edit Exam Configuration' : 'New Exam Configuration'}
        </h3>
        <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
          {editingExamId 
            ? `Editing details for exam ID: ${editingExamId}` 
            : 'Define rules, timing, marks, and platform constraints.'}
        </p>
      </div>
      
      {/* Replaced CardContent with standard semantic div */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label htmlFor="subject_id" className="text-sm font-medium" style={{ color: 'var(--dyn-text)' }}>
              Subject *
            </label>
            <select 
              id="subject_id"
              name="subject_id" 
              value={formData.subject_id} 
              onChange={handleChange} 
              className="w-full h-10 px-3 rounded-md text-sm outline-none transition-colors"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
                color: 'var(--dyn-text)', 
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)' 
              }}
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name_bn}</option>
              ))}
            </select>
          </div>

          {/* Exam Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium" style={{ color: 'var(--dyn-text)' }}>
              Exam Title *
            </label>
            <Input 
              id="title"
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g., HSC Physics Grand Mock" 
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
                color: 'var(--dyn-text)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)' 
              }} 
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleNext} 
            disabled={!isValid}
            className="transition-all"
            style={{ 
              backgroundColor: isValid ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 20%, transparent)', 
              color: isValid ? 'var(--dyn-card)' : 'color-mix(in srgb, var(--dyn-text) 50%, transparent)',
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            Next: Question Selection <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

ExamStep1Settings.displayName = 'ExamStep1Settings';
