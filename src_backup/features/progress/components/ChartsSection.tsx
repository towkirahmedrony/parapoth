import React from 'react';
import { BarChart2, Brain } from 'lucide-react';
import { PerformanceChart } from './charts/PerformanceChart';
import { SubjectRadar } from './charts/SubjectRadar';
import { ChartData, RadarData } from '../types/progress';

interface ChartsSectionProps {
  performanceChart: ChartData[];
  skillMapping: RadarData[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ performanceChart, skillMapping }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div 
        className="lg:col-span-2 backdrop-blur-sm rounded-2xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--dyn-text)' }}>
              <BarChart2 size={18} style={{ color: 'var(--dyn-primary)' }} />
              পারফরম্যান্স গ্রাফ
            </h3>
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>গত ৭টি পরীক্ষার ফলাফলের ভিত্তিতে</p>
          </div>
        </div>
        <PerformanceChart data={performanceChart} />
      </div>

      <div 
        className="backdrop-blur-sm rounded-2xl p-6 flex flex-col shadow-sm"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--dyn-text)' }}>
          <Brain size={18} style={{ color: 'var(--dyn-primary)' }} />
          স্কিল ম্যাপিং
        </h3>
        <p className="text-xs mb-4" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>বিষয়ভিত্তিক দক্ষতার চিত্র</p>
        <div className="flex-1 flex items-center justify-center">
          <SubjectRadar data={skillMapping} />
        </div>
      </div>
    </div>
  );
};
