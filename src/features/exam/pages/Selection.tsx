import React, { useState, useRef, useCallback } from 'react';
import { FileText, Building2 } from 'lucide-react';
import ModelTestTab from '../components/ModelTestTab';
import BoardExamTab from '../components/BoardExamTab';

type TabType = 'model' | 'board';

const MIN_SWIPE_DISTANCE = 50;

const Selection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('model');
  const [isDetailView, setIsDetailView] = useState<boolean>(false); 
  
  // Using useRef instead of useState to prevent continuous re-renders during swipe
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isDetailView) return; 
    touchStartX.current = e.targetTouches[0].clientX;
  }, [isDetailView]);

  const onTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isDetailView || touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;

    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && activeTab === 'model') {
      setActiveTab('board');
    } else if (isRightSwipe && activeTab === 'board') {
      setActiveTab('model');
    }

    // Reset the touch tracking reference
    touchStartX.current = null;
  }, [isDetailView, activeTab]);

  return (
    <div 
      className="min-h-screen pb-20 overflow-x-hidden"
      style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {!isDetailView && (
        <div 
          className="sticky top-0 z-10 backdrop-blur-sm transition-all duration-300"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 95%, transparent)', 
            borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab('model')}
              className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-300 relative"
              style={{ color: activeTab === 'model' ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
            >
              <FileText size={18} />
              মডেল টেস্ট
              <div 
                className={`absolute bottom-0 left-0 w-full h-0.5 transition-opacity duration-300 ${activeTab === 'model' ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundColor: 'var(--dyn-primary)', boxShadow: '0 0 10px color-mix(in srgb, var(--dyn-primary) 50%, transparent)' }}
              />
            </button>

            <button
              onClick={() => setActiveTab('board')}
              className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-300 relative"
              style={{ color: activeTab === 'board' ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
            >
              <Building2 size={18} />
              বোর্ড পরীক্ষা
              <div 
                className={`absolute bottom-0 left-0 w-full h-0.5 transition-opacity duration-300 ${activeTab === 'board' ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundColor: 'var(--dyn-primary)', boxShadow: '0 0 10px color-mix(in srgb, var(--dyn-primary) 50%, transparent)' }}
              />
            </button>
          </div>
        </div>
      )}

      <div className={!isDetailView ? "p-4" : "p-0"}>
        {activeTab === 'model' ? (
          <div className={!isDetailView ? "animate-in slide-in-from-left-4 fade-in duration-300" : ""}>
            <ModelTestTab onViewChange={setIsDetailView} />
          </div>
        ) : (
          <div className={!isDetailView ? "animate-in slide-in-from-right-4 fade-in duration-300" : ""}>
            <BoardExamTab onViewChange={setIsDetailView} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Selection;
