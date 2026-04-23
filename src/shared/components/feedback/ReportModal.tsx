import React, { useState, useCallback, useEffect, memo } from 'react';
import { X, AlertTriangle, MessageSquare, CheckCircle, Bug, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';

export type ReportType = 'app_bug' | 'question_issue';

const APP_ISSUES = [
  { value: 'ui_bug', label: 'ডিজাইন বা UI সমস্যা' },
  { value: 'functional_bug', label: 'বাটন বা ফিচার কাজ করছে না' },
  { value: 'performance', label: 'অ্যাপ স্লো বা ল্যাগ করছে' },
  { value: 'login_issue', label: 'লগইন বা একাউন্ট সমস্যা' },
  { value: 'feature_request', label: 'নতুন ফিচারের অনুরোধ' },
  { value: 'other', label: 'অন্যান্য' }
] as const;

const QUESTION_ISSUES = [
  { value: 'wrong_answer', label: 'ভুল উত্তর' },
  { value: 'wrong_stem', label: 'উদ্দীপকে ভুল আছে' },
  { value: 'spelling_error', label: 'বানান ভুল বা টাইপো' },
  { value: 'image_issue', label: 'ছবি দেখা যাচ্ছে না বা অস্পষ্ট' },
  { value: 'out_of_syllabus', label: 'সিলেবাসের বাইরের প্রশ্ন' },
  { value: 'confusing', label: 'প্রশ্নটি অস্পষ্ট' }
] as const;

export interface QuestionMetaData {
  questionId: string;
  examId?: string;
  questionText?: string;
}

export interface ReportPayload {
  type: 'question' | 'bug_report';
  report_reason: string;
  description: string | null;
  status: string;
  created_at: string;
  target_question_id?: string;
  target_exam_id?: string | null;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ReportType; 
  questionData?: QuestionMetaData | null;
  onSubmit: (data: ReportPayload) => Promise<void> | void;
}

const ReportModal: React.FC<ReportModalProps> = memo(({ 
  isOpen, 
  onClose, 
  type, 
  questionData, 
  onSubmit 
}) => {
  const [issueCategory, setIssueCategory] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIssueCategory('');
      setDescriptionText('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!issueCategory) {
      toast.error("অনুগ্রহ করে সমস্যার ধরণ নির্বাচন করুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const dbReportType = type === 'question_issue' ? 'question' : 'bug_report';

      const reportPayload: ReportPayload = {
        type: dbReportType, 
        report_reason: issueCategory,
        description: descriptionText.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        ...(type === 'question_issue' && questionData ? {
          target_question_id: questionData.questionId,
          target_exam_id: questionData.examId || null,
        } : {})
      };

      await onSubmit(reportPayload);
      handleClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("রিপোর্ট সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setIsSubmitting(false);
    }
  }, [issueCategory, descriptionText, type, questionData, onSubmit, handleClose]);

  if (!isOpen) return null;

  const isQuestion = type === 'question_issue';
  const options = isQuestion ? QUESTION_ISSUES : APP_ISSUES;
  const title = isQuestion ? 'প্রশ্ন রিপোর্ট করুন' : 'সমস্যা বা মতামত জানান';
  const Icon = isQuestion ? FileQuestion : Bug;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 bg-black/70"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-surface-elevated border border-border-color"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-secondary/30 border-b border-border-color">
          <div className="flex items-center gap-2 font-bold text-lg text-text-primary">
            <Icon className="text-primary" size={20} aria-hidden="true" />
            {title}
          </div>
          <button 
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-full text-text-primary hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Context Info */}
          {isQuestion && questionData && (
            <div className="rounded-lg p-3 flex items-start gap-3 bg-accent/10 border border-accent/20">
              <AlertTriangle className="flex-shrink-0 mt-0.5 text-accent" size={16} aria-hidden="true" />
              <div className="text-xs space-y-1 text-text-primary">
                <p className="font-semibold">আপনি একটি প্রশ্নে রিপোর্ট করছেন:</p>
                {questionData.questionText && (
                  <p className="line-clamp-2 italic opacity-80">"{questionData.questionText}"</p>
                )}
                <p className="text-[10px] uppercase tracking-wider text-text-secondary">ID: {questionData.questionId}</p>
              </div>
            </div>
          )}

          {/* Issue Type Dropdown */}
          <div className="space-y-2">
            <label 
              htmlFor="issueCategory"
              className="text-sm font-medium flex items-center gap-2 text-text-secondary"
            >
              <CheckCircle className="text-primary" size={14} aria-hidden="true" />
              সমস্যার ধরণ নির্বাচন করুন <span className="text-accent">*</span>
            </label>
            <select
              id="issueCategory"
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-sm rounded-lg px-3 py-3 outline-none transition-all appearance-none cursor-pointer bg-input-bg border border-input-border text-text-primary focus:ring-2 focus:ring-focus-ring disabled:opacity-60"
            >
              <option value="" disabled className="bg-surface">-- একটি অপশন বেছে নিন --</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label 
              htmlFor="descriptionText"
              className="text-sm font-medium flex items-center gap-2 text-text-secondary"
            >
              <MessageSquare size={14} aria-hidden="true" />
              বিস্তারিত মতামত (ঐচ্ছিক)
            </label>
            <textarea
              id="descriptionText"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              disabled={isSubmitting}
              placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..."
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-3 outline-none transition-all resize-none bg-input-bg border border-input-border text-text-primary focus:ring-2 focus:ring-focus-ring disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-3 justify-end bg-secondary/10 border-t border-border-color">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !issueCategory}
            className="px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          >
            {isSubmitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
          </button>
        </div>
      </div>
    </div>
  );
});

ReportModal.displayName = 'ReportModal';

export default ReportModal;
