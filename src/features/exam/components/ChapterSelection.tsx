import React, { useState, memo } from 'react';
import { ChevronDown, ChevronRight, Check, ChevronLeft, Minus, ArrowRight } from 'lucide-react';
import { Subject, Chapter } from '../types/content';

interface ChapterSelectionProps {
  subject: Subject;
  onBack: () => void;
  onProceed: (selectedTopicIds: string[]) => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ subject, onBack, onProceed }) => {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  const isTopicSelected = (topicId: string) => selectedTopicIds.has(topicId);

  const getChapterStatus = (chapter: Chapter) => {
    const totalTopics = chapter.children?.length || 0;
    if (totalTopics === 0) return 'unchecked';
    const selectedCount = chapter.children?.filter(t => selectedTopicIds.has(t.id)).length || 0;
    if (selectedCount === totalTopics) return 'checked';
    if (selectedCount > 0) return 'partial';
    return 'unchecked';
  };

  const getSubjectStatus = () => {
    if (!subject.children || subject.children.length === 0) return 'unchecked';
    const allTopics = subject.children.flatMap(ch => ch.children || []);
    const totalTopics = allTopics.length;
    const selectedCount = allTopics.filter(t => selectedTopicIds.has(t.id)).length;
    if (totalTopics > 0 && selectedCount === totalTopics) return 'checked';
    if (selectedCount > 0) return 'partial';
    return 'unchecked';
  };

  const handleTopicCheck = (topicId: string) => {
    const newSet = new Set(selectedTopicIds);
    if (newSet.has(topicId)) newSet.delete(topicId); else newSet.add(topicId);
    setSelectedTopicIds(newSet);
  };

  const handleChapterCheck = (chapter: Chapter) => {
    const newSet = new Set(selectedTopicIds);
    const status = getChapterStatus(chapter);
    const shouldSelect = status !== 'checked';
    chapter.children?.forEach(topic => {
      shouldSelect ? newSet.add(topic.id) : newSet.delete(topic.id);
    });
    setSelectedTopicIds(newSet);
  };

  const handleSubjectCheck = () => {
    const newSet = new Set(selectedTopicIds);
    const status = getSubjectStatus();
    const shouldSelect = status !== 'checked';
    subject.children?.forEach(chapter => {
      chapter.children?.forEach(topic => {
        shouldSelect ? newSet.add(topic.id) : newSet.delete(topic.id);
      });
    });
    setSelectedTopicIds(newSet);
  };

  const handleProceedClick = () => {
    if (selectedTopicIds.size === 0) {
      alert("অনুগ্রহ করে পরীক্ষা দেওয়ার জন্য ন্যূনতম একটি টপিক বা অধ্যায় সিলেক্ট করুন।");
      return;
    }
    onProceed(Array.from(selectedTopicIds));
  };

  // Extracted Component for performance and cleaner code
  const Checkbox = ({ status, onClick }: { status: 'checked' | 'unchecked' | 'partial', onClick: (e: React.MouseEvent) => void }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`w-6 h-6 rounded flex items-center justify-center transition-all border-2 shadow-sm ${status === 'unchecked' ? 'hover:border-[var(--dyn-primary)]' : ''}`}
      style={{
        backgroundColor: status === 'checked' ? 'var(--dyn-primary)' : status === 'partial' ? 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' : 'var(--dyn-card)',
        borderColor: status === 'checked' ? 'var(--dyn-primary)' : status === 'partial' ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
        color: status === 'checked' ? 'var(--dyn-bg)' : status === 'partial' ? 'var(--dyn-primary)' : 'transparent'
      }}
    >
      {status === 'checked' && <Check size={16} strokeWidth={3} />}
      {status === 'partial' && <Minus size={16} strokeWidth={3} />}
    </button>
  );

  return (
    <div className="p-4 animate-in slide-in-from-right duration-300 min-h-screen" style={{ backgroundColor: 'var(--dyn-bg)' }}>
      <div 
        className="rounded-xl p-4 mb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border"
        style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-95 hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
              borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
              color: 'var(--dyn-text)' 
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--dyn-primary)' }}>{subject.name_bn}</h2>
            <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{selectedTopicIds.size} টি টপিক সিলেক্ট করা হয়েছে</span>
          </div>
        </div>
        <Checkbox status={getSubjectStatus()} onClick={handleSubjectCheck} />
      </div>

      <div className="space-y-3 pb-24">
        {subject.children?.map((chapter) => {
          const isExpanded = expandedChapters.includes(chapter.id);
          const status = getChapterStatus(chapter);
          const totalTopics = chapter.children?.length || 0;
          const selectedCount = chapter.children?.filter(t => selectedTopicIds.has(t.id)).length || 0;

          return (
            <div 
              key={chapter.id} 
              className="rounded-lg border overflow-hidden shadow-sm"
              style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
            >
              <div 
                className="flex items-center p-4 gap-4 transition-colors hover:bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
              >
                <Checkbox status={status} onClick={() => handleChapterCheck(chapter)} />
                <div 
                  className="flex-1 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <span className="font-medium text-[15px]" style={{ color: 'var(--dyn-text)' }}>{chapter.name_bn}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>{selectedCount}/{totalTopics}</span>
                    {isExpanded ? <ChevronDown size={18} style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }} /> : <ChevronRight size={18} style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }} />}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div 
                  className="border-t"
                  style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--dyn-text) 2%, transparent)', 
                    borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
                  }}
                >
                  {chapter.children?.map((topic) => {
                    const isSelected = isTopicSelected(topic.id);
                    return (
                      <div 
                        key={topic.id} 
                        onClick={() => handleTopicCheck(topic.id)}
                        className="flex items-center gap-4 py-3 px-4 pl-[3.25rem] cursor-pointer border-b last:border-0 hover:bg-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
                        style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all`}
                          style={{
                            backgroundColor: isSelected ? 'var(--dyn-primary)' : 'var(--dyn-card)',
                            borderColor: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
                            color: isSelected ? 'var(--dyn-bg)' : 'transparent'
                          }}
                        >
                           {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className={`text-sm transition-colors ${isSelected ? 'font-medium' : ''}`}
                            style={{ color: isSelected ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
                          >
                            {topic.name_bn}
                          </span>
                          <span className="text-xs font-mono" style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}>0/{topic.total_questions || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div 
        className="fixed bottom-0 left-0 w-full p-4 backdrop-blur border-t z-20"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-card) 95%, transparent)', 
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <button 
          onClick={handleProceedClick}
          className={`w-full font-bold py-3.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
            selectedTopicIds.size > 0 
              ? 'hover:opacity-90' 
              : 'cursor-not-allowed'
          }`}
          style={selectedTopicIds.size > 0 
            ? { backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)', boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--dyn-primary) 30%, transparent)' }
            : { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)', color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)', boxShadow: 'none' }
          }
        >
          এগিয়ে যান
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// FIXED: Added memo export to fix 'memo is not defined' error if it was previously expected.
export default memo(ChapterSelection);
