import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { RadarData } from '../../types/progress';

interface SubjectRadarProps {
  data: RadarData[];
}

export const SubjectRadar: React.FC<SubjectRadarProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="h-[300px] w-full flex items-center justify-center text-sm" 
        style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
      >
        স্কিল ম্যাপিং এর জন্য ডেটা নেই।
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full relative" style={{ color: 'var(--dyn-primary)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="color-mix(in srgb, var(--dyn-text) 20%, transparent)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)', fontSize: 12 }} 
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="currentColor"
            strokeWidth={2}
            fill="currentColor"
            fillOpacity={0.4}
          />
          <Tooltip 
            cursor={{ fill: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
            contentStyle={{ 
              backgroundColor: 'var(--dyn-card)', 
              borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)', 
              borderRadius: '8px', 
              color: 'var(--dyn-text)' 
            }}
            itemStyle={{ color: 'var(--dyn-primary)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span 
          className="text-[10px] font-bold opacity-50"
          style={{ color: 'var(--dyn-text)' }}
        >
          MASTERY
        </span>
      </div>
    </div>
  );
});

SubjectRadar.displayName = 'SubjectRadar';
