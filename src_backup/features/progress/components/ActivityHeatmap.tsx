import React from 'react';
import { HeatmapData } from '../types/progress';

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

// Moved outside to prevent re-creation on every render (Performance optimization)
const getColorStyle = (count: number): React.CSSProperties => {
  if (count === 0) return { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' };
  if (count === 1) return { backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 30%, transparent)' };
  if (count === 2) return { backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 60%, transparent)' };
  if (count >= 3) return { backgroundColor: 'var(--dyn-primary)' };
  return { backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' };
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div 
      className="w-full overflow-hidden rounded-xl p-4 sm:p-6 shadow-sm"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--dyn-text)' }}>অ্যাক্টিভিটি ক্যালেন্ডার</h3>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {data.map((day, index) => (
            <div
              key={day.cal_date || index}
              title={`${day.cal_date}: ${day.exams_taken} টি পরীক্ষা`}
              className="w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-200 hover:scale-110 hover:ring-2 hover:[ring-color:var(--dyn-primary)]"
              style={getColorStyle(day.exams_taken)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2 text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
        <span>কম</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm" style={getColorStyle(0)} />
          <div className="w-3 h-3 rounded-sm" style={getColorStyle(1)} />
          <div className="w-3 h-3 rounded-sm" style={getColorStyle(2)} />
          <div className="w-3 h-3 rounded-sm" style={getColorStyle(3)} />
        </div>
        <span>বেশি</span>
      </div>
    </div>
  );
});

ActivityHeatmap.displayName = 'ActivityHeatmap';
