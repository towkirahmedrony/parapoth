import React from 'react';
import { useProgressData } from '../hooks/useProgressData';

import { ProgressHeader } from '../components/ProgressHeader';
import { MetricsGrid } from '../components/MetricsGrid';
import { ChartsSection } from '../components/ChartsSection';
import { AnalysisSection } from '../components/AnalysisSection';
import { SubjectReportSection } from '../components/SubjectReportSection';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

import { EmptyState } from '@/shared/components/feedback/EmptyState';

const ProgressSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen font-['Hind_Siliguri'] px-4 pt-4 pb-20 flex flex-col gap-4 bg-app text-text-primary">
      <div className="rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse bg-card-bg border border-card-border">
        <div className="w-16 h-16 rounded-full shrink-0 bg-secondary" />
        <div className="flex-col space-y-2 flex-1">
          <div className="h-5 w-40 rounded-md bg-secondary" />
          <div className="h-6 w-28 rounded-full bg-secondary" />
        </div>
      </div>

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-2xl p-5 flex items-center justify-between shadow-sm animate-pulse bg-card-bg border border-card-border"
        >
          <div className="flex-col space-y-3 flex-1">
            <div className="h-4 w-20 rounded-md bg-secondary" />
            <div className="h-6 w-24 rounded-md bg-secondary" />
            <div className="h-3 w-32 rounded-md mt-1 bg-surface-elevated" />
          </div>
          <div className="w-12 h-12 rounded-xl shrink-0 bg-secondary" />
        </div>
      ))}

      <div className="h-[300px] w-full rounded-2xl shadow-sm animate-pulse mt-2 flex items-center justify-center bg-card-bg border border-card-border">
        <div className="w-[90%] h-[90%] rounded-xl bg-surface-elevated" />
      </div>
    </div>
  );
};

const Progress: React.FC = () => {
  const { data, isPending, isError } = useProgressData();

  if (isPending && !data) {
    return <ProgressSkeleton />;
  }

  if (isError && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-['Hind_Siliguri'] bg-app text-text-primary">
        <EmptyState
          title="ডেটা লোড করতে সমস্যা হয়েছে!"
          message="দয়া করে আবার চেষ্টা করুন অথবা ইন্টারনেট সংযোগ চেক করুন।"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-['Hind_Siliguri'] bg-app text-text-primary">
        <EmptyState
          title="কোনো প্রগ্রেস ডেটা পাওয়া যায়নি!"
          message="আপনি এখনো কোনো পরীক্ষায় অংশগ্রহণ করেননি।"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Hind_Siliguri'] pb-24 flex flex-col gap-6 animate-in fade-in duration-500 px-4 pt-4 bg-app text-text-primary">
      <ProgressHeader user={data.user} />
      <MetricsGrid metrics={data.metrics} />
      <ActivityHeatmap data={data.activityHeatmap} />
      <ChartsSection
        performanceChart={data.performanceChart}
        skillMapping={data.skillMapping}
      />
      <AnalysisSection
        weaknesses={data.weaknesses}
        focusTopic={data.focusTopic}
        aiAnalysis={data.aiAnalysis} // 🔥 AI Data Passed Here
      />
      <SubjectReportSection subjectReport={data.subjectReport} />
    </div>
  );
};

export default Progress;
