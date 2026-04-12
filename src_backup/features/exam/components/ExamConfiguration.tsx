import React, { useState, useCallback, memo } from 'react';
import { ArrowRight, ChevronLeft, Clock, FileQuestion, AlertCircle } from 'lucide-react';

export interface ExamConfig {
  questionCount: number;
  duration: number;
  negativeMarking: boolean;
}

interface ExamConfigurationProps {
  topicCount: number;
  onBack: () => void;
  onStartExam: (config: ExamConfig) => void;
}

const ExamConfiguration: React.FC<ExamConfigurationProps> = memo(({ 
  topicCount, 
  onBack, 
  onStartExam 
}) => {
  // Use number | '' to allow the user to completely clear the input field while typing
  const [questionCount, setQuestionCount] = useState<number | ''>(30);
  const [duration, setDuration] = useState<number | ''>(30);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);

  const handleStart = useCallback(() => {
    // Ensure we always pass valid positive integers to the parent
    const finalQuestionCount = Math.max(1, Number(questionCount) || 30);
    const finalDuration = Math.max(1, Number(duration) || 30);

    onStartExam({
      questionCount: finalQuestionCount,
      duration: finalDuration,
      negativeMarking
    });
  }, [questionCount, duration, negativeMarking, onStartExam]);

  const handleInput = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setter(num);
    }
  };

  return (
    <div className="p-4 animate-in slide-in-from-right duration-300 pb-24" style={{ backgroundColor: 'var(--dyn-bg)' }}>
      {/* Header */}
      <div className="rounded-xl p-4 mb-6 flex items-center gap-4 sticky top-0 z-10 shadow-lg"
           style={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <button 
          onClick={onBack} 
          aria-label="Go back"
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
            color: 'var(--dyn-text)'
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--dyn-text)' }}>পরীক্ষার সেটিংস</h2>
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>{topicCount} টি টপিক সিলেক্ট করা হয়েছে</p>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="rounded-xl p-5 space-y-6"
           style={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        
        {/* Input Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Question Count */}
          <div className="space-y-2">
            <label htmlFor="questionCount" className="text-sm font-medium flex items-center gap-2" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
              <FileQuestion size={16} /> প্রশ্ন সংখ্যা
            </label>
            <input
              id="questionCount"
              type="number"
              min="1"
              value={questionCount}
              onChange={(e) => handleInput(e.target.value, setQuestionCount)}
              className="w-full text-center font-bold text-xl rounded-lg py-3 outline-none transition-all"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
                color: 'var(--dyn-text)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)'
              }}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium flex items-center gap-2" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
              <Clock size={16} /> সময় (মিনিট)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => handleInput(e.target.value, setDuration)}
              className="w-full text-center font-bold text-xl rounded-lg py-3 outline-none transition-all"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
                color: 'var(--dyn-text)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)'
              }}
            />
          </div>
        </div>

        {/* Negative Marking Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg"
             style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
          <div className="flex flex-col">
            <span id="negative-marking-label" className="font-medium text-sm" style={{ color: 'var(--dyn-text)' }}>নেগেটিভ মার্কিং (0.25)</span>
            <span id="negative-marking-desc" className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>ভুল উত্তরের জন্য নম্বর কাটা হবে</span>
          </div>
          <button
            role="switch"
            aria-checked={negativeMarking}
            aria-labelledby="negative-marking-label"
            aria-describedby="negative-marking-desc"
            onClick={() => setNegativeMarking(!negativeMarking)}
            className="w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: negativeMarking ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
              outlineColor: 'var(--dyn-primary)'
            }}
          >
            <div 
              className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                negativeMarking ? 'translate-x-6' : 'translate-x-0'
              }`} 
              style={{ backgroundColor: 'var(--dyn-card)' }}
            />
          </button>
        </div>

        {/* Info Note */}
        <div className="flex gap-3 p-3 rounded-lg"
             style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--dyn-accent) 20%, transparent)' }}>
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--dyn-accent)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--dyn-text)' }}>
            ডিফল্ট সেটিংস পরিবর্তন করতে চাইলে উপরের বক্সে লিখুন। প্রস্তুত হলে নিচের বাটনে ক্লিক করুন।
          </p>
        </div>
      </div>

      {/* Start Exam Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 backdrop-blur z-20"
           style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-card) 95%, transparent)', borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <button 
          onClick={handleStart}
          className="w-full font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-card)', outlineColor: 'var(--dyn-primary)' }}
        >
          পরীক্ষা শুরু করুন
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

ExamConfiguration.displayName = 'ExamConfiguration';

export default ExamConfiguration;
