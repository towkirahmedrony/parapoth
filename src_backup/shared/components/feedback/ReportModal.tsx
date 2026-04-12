import React, { useState } from 'react';
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
];

const QUESTION_ISSUES = [
  { value: 'wrong_answer', label: 'ভুল উত্তর' },
  { value: 'wrong_stem', label: 'উদ্দীপকে ভুল আছে' },
  { value: 'spelling_error', label: 'বানান ভুল বা টাইপো' },
  { value: 'image_issue', label: 'ছবি দেখা যাচ্ছে না বা অস্পষ্ট' },
  { value: 'out_of_syllabus', label: 'সিলেবাসের বাইরের প্রশ্ন' },
  { value: 'confusing', label: 'প্রশ্নটি অস্পষ্ট' }
];

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

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  questionData, 
  onSubmit 
}) => {
  const [issueCategory, setIssueCategory] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
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
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("রিপোর্ট সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueCategory('');
    setDescriptionText('');
  };

  const isQuestion = type === 'question_issue';
  const options = isQuestion ? QUESTION_ISSUES : APP_ISSUES;
  const title = isQuestion ? 'প্রশ্ন রিপোর্ট করুন' : 'সমস্যা বা মতামত জানান';
  const Icon = isQuestion ? FileQuestion : Bug;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: 'var(--dyn-card, #ffffff)',
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--dyn-text)' }}>
            <Icon style={{ color: 'var(--dyn-primary)' }} size={20} />
            {title}
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:opacity-70 transition-opacity"
            style={{ color: 'var(--dyn-text)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Context Info */}
          {isQuestion && questionData && (
            <div 
              className="rounded-lg p-3 flex items-start gap-3"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--dyn-accent) 20%, transparent)',
              }}
            >
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} style={{ color: 'var(--dyn-accent)' }} />
              <div className="text-xs space-y-1" style={{ color: 'var(--dyn-text)' }}>
                <p className="font-semibold">আপনি একটি প্রশ্নে রিপোর্ট করছেন:</p>
                <p className="line-clamp-2 italic opacity-80">"{questionData.questionText}"</p>
                <p className="text-[10px] uppercase tracking-wider opacity-60">ID: {questionData.questionId}</p>
              </div>
            </div>
          )}

          {/* Issue Type Dropdown */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
            >
              <CheckCircle size={14} style={{ color: 'var(--dyn-primary)' }} />
              সমস্যার ধরণ নির্বাচন করুন <span style={{ color: 'var(--dyn-accent)' }}>*</span>
            </label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-3 outline-none transition-all appearance-none cursor-pointer"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
                color: 'var(--dyn-text)',
                borderWidth: '1px'
              }}
            >
              <option value="" disabled>-- একটি অপশন বেছে নিন --</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
            >
              <MessageSquare size={14} style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} />
              বিস্তারিত মতামত (ঐচ্ছিক)
            </label>
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..."
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-3 outline-none transition-all resize-none"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
                color: 'var(--dyn-text)',
                borderWidth: '1px'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 flex gap-3 justify-end"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 2%, transparent)',
            borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--dyn-text)' }}
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !issueCategory}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
              isSubmitting || !issueCategory
                ? 'cursor-not-allowed opacity-50'
                : 'active:scale-95 hover:opacity-90'
            }`}
            style={{ 
              backgroundColor: 'var(--dyn-primary)', 
              color: '#ffffff' 
            }}
          >
            {isSubmitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
