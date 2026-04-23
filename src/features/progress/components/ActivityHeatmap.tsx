import React from 'react';
import { HeatmapData } from '../types/progress';

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

// Fixed: Removed inline styles and replaced with semantic Tailwind classes
const getHeatmapClass = (count: number): string => {
  if (count === 0) return 'bg-secondary';
  if (count === 1) return 'bg-primary opacity-30';
  if (count === 2) return 'bg-primary opacity-60';
  if (count >= 3) return 'bg-primary';
  return 'bg-secondary';
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl p-4 sm:p-6 shadow-sm bg-card-bg border border-border-color">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">অ্যাক্টিভিটি ক্যালেন্ডার</h3>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {data.map((day, index) => (
            <div
              key={day.cal_date || index}
              title={`${day.cal_date}: ${day.exams_taken} টি পরীক্ষা`}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-focus-ring ${getHeatmapClass(day.exams_taken)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-text-secondary">
        <span>কম</span>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-sm ${getHeatmapClass(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getHeatmapClass(1)}`} />
          <div className={`w-3 h-3 rounded-sm ${getHeatmapClass(2)}`} />
          <div className={`w-3 h-3 rounded-sm ${getHeatmapClass(3)}`} />
        </div>
        <span>বেশি</span>
      </div>
    </div>
  );
});

ActivityHeatmap.displayName = 'ActivityHeatmap';
