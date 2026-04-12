import React from 'react';
import { useProgressData } from '../hooks/useProgressData'; 

import { ProgressHeader } from '../components/ProgressHeader';
import { MetricsGrid } from '../components/MetricsGrid';
import { ChartsSection } from '../components/ChartsSection';
import { AnalysisSection } from '../components/AnalysisSection';
import { SubjectReportSection } from '../components/SubjectReportSection';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

import { EmptyState } from '../../../shared/components/feedback/EmptyState'; 

const ProgressSkeleton: React.FC = () => {
  const skeletonColor = 'color-mix(in srgb, var(--dyn-text) 15%, transparent)';
  const borderStyle = '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)';

  return (
    <div 
      className="min-h-screen font-['Hind_Siliguri'] px-4 pt-4 pb-20 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--dyn-bg)' }}
    >
      <div 
        className="rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse" 
        style={{ backgroundColor: 'var(--dyn-card)', border: borderStyle }}
      >
        <div className="w-16 h-16 rounded-full shrink-0" style={{ backgroundColor: skeletonColor }}></div>
        <div className="flex-col space-y-2 flex-1">
          <div className="h-5 w-40 rounded-md" style={{ backgroundColor: skeletonColor }}></div>
          <div className="h-6 w-28 rounded-full" style={{ backgroundColor: skeletonColor }}></div>
        </div>
      </div>

      {[1, 2, 3, 4].map((item) => (
        <div 
          key={item} 
          className="rounded-2xl p-5 flex items-center justify-between shadow-sm animate-pulse" 
          style={{ backgroundColor: 'var(--dyn-card)', border: borderStyle }}
        >
          <div className="flex-col space-y-3 flex-1">
            <div className="h-4 w-20 rounded-md" style={{ backgroundColor: skeletonColor }}></div>
            <div className="h-6 w-24 rounded-md" style={{ backgroundColor: skeletonColor }}></div>
            <div className="h-3 w-32 rounded-md mt-1" style={{ backgroundColor: skeletonColor }}></div>
          </div>
          <div className="w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: skeletonColor }}></div>
        </div>
      ))}

      <div 
        className="h-[300px] w-full rounded-2xl shadow-sm animate-pulse mt-2" 
        style={{ backgroundColor: 'var(--dyn-card)', border: borderStyle }}
      ></div>
    </div>
  );
};

const Progress: React.FC = () => {
  const { data, isLoading, isError } = useProgressData(); 

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  if (isError || !data) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 font-['Hind_Siliguri']" 
        style={{ backgroundColor: 'var(--dyn-bg)' }}
      >
        <EmptyState 
          title="ডেটা লোড করতে সমস্যা হয়েছে!" 
          message="দয়া করে আবার চেষ্টা করুন অথবা ইন্টারনেট সংযোগ চেক করুন।" 
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen font-['Hind_Siliguri'] pb-24 flex flex-col gap-6 animate-in fade-in duration-500 px-4 pt-4"
      style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}
    >
      <ProgressHeader user={data.user} />
      <MetricsGrid metrics={data.metrics} />
      <ActivityHeatmap data={data.activityHeatmap} />
      <ChartsSection performanceChart={data.performanceChart} skillMapping={data.skillMapping} />
      <AnalysisSection weaknesses={data.weaknesses} focusTopic={data.focusTopic} />
      <SubjectReportSection subjectReport={data.subjectReport} />
    </div>
  );
};

export default Progress;
