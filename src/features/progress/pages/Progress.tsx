import React, { useMemo } from 'react';
import { useProgressData } from '../hooks/useProgressData';

import { ProgressHeader } from '../components/ProgressHeader';
import { MetricsGrid } from '../components/MetricsGrid';
import { ChartsSection } from '../components/ChartsSection';
import { AnalysisSection } from '../components/AnalysisSection';
import { SubjectReportSection } from '../components/SubjectReportSection';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useTheme } from '@/shared/hooks/useTheme';

type SkeletonPalette = {
  pageBg: string;
  pageText: string;
  cardBg: string;
  cardBorder: string;
  block: string;
  blockSoft: string;
};

const LIGHT_SKELETON: SkeletonPalette = {
  pageBg: '#F8FAFC',
  pageText: '#0F172A',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(148, 163, 184, 0.18)',
  block: '#E2E8F0',
  blockSoft: '#F1F5F9',
};

const DARK_SKELETON: SkeletonPalette = {
  pageBg: '#0F172A',
  pageText: '#F8FAFC',
  cardBg: '#1E293B',
  cardBorder: 'rgba(148, 163, 184, 0.22)',
  block: '#334155',
  blockSoft: '#293548',
};

const ProgressSkeleton: React.FC<{ palette: SkeletonPalette }> = ({ palette }) => {
  const pageStyle: React.CSSProperties = {
    backgroundColor: palette.pageBg,
    color: palette.pageText,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: palette.cardBg,
    border: `1px solid ${palette.cardBorder}`,
  };

  const blockStyle: React.CSSProperties = {
    backgroundColor: palette.block,
  };

  const softBlockStyle: React.CSSProperties = {
    backgroundColor: palette.blockSoft,
  };

  return (
    <div
      className="min-h-screen font-['Hind_Siliguri'] px-4 pt-4 pb-20 flex flex-col gap-4"
      style={pageStyle}
    >
      <div
        className="rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse"
        style={cardStyle}
      >
        <div className="w-16 h-16 rounded-full shrink-0" style={blockStyle} />
        <div className="flex-col space-y-2 flex-1">
          <div className="h-5 w-40 rounded-md" style={blockStyle} />
          <div className="h-6 w-28 rounded-full" style={blockStyle} />
        </div>
      </div>

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-2xl p-5 flex items-center justify-between shadow-sm animate-pulse"
          style={cardStyle}
        >
          <div className="flex-col space-y-3 flex-1">
            <div className="h-4 w-20 rounded-md" style={blockStyle} />
            <div className="h-6 w-24 rounded-md" style={blockStyle} />
            <div className="h-3 w-32 rounded-md mt-1" style={softBlockStyle} />
          </div>
          <div className="w-12 h-12 rounded-xl shrink-0" style={blockStyle} />
        </div>
      ))}

      <div
        className="h-[300px] w-full rounded-2xl shadow-sm animate-pulse mt-2 flex items-center justify-center"
        style={cardStyle}
      >
        <div className="w-[90%] h-[90%] rounded-xl" style={softBlockStyle} />
      </div>
    </div>
  );
};

const Progress: React.FC = () => {
  const { data, isPending, isError } = useProgressData();
  const { theme } = useTheme();

  const isDarkMode = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  }, [theme]);

  const palette = isDarkMode ? DARK_SKELETON : LIGHT_SKELETON;

  const pageStyle: React.CSSProperties = {
    backgroundColor: palette.pageBg,
    color: palette.pageText,
  };

  if (isPending && !data) {
    return <ProgressSkeleton palette={palette} />;
  }

  if (isError && !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 font-['Hind_Siliguri']"
        style={pageStyle}
      >
        <EmptyState
          title="ডেটা লোড করতে সমস্যা হয়েছে!"
          message="দয়া করে আবার চেষ্টা করুন অথবা ইন্টারনেট সংযোগ চেক করুন।"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 font-['Hind_Siliguri']"
        style={pageStyle}
      >
        <EmptyState
          title="কোনো প্রগ্রেস ডেটা পাওয়া যায়নি!"
          message="আপনি এখনো কোনো পরীক্ষায় অংশগ্রহণ করেননি।"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-['Hind_Siliguri'] pb-24 flex flex-col gap-6 animate-in fade-in duration-500 px-4 pt-4"
      style={{
        backgroundColor: 'var(--dyn-bg, #F8FAFC)',
        color: 'var(--dyn-text, #0F172A)',
      }}
    >
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
