import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ResultChartProps {
  correct: number;
  wrong: number;
  skipped: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const { name, value, payload: itemPayload } = payload[0];
    const color = itemPayload?.color || '#000'; 
    
    return (
      <div className="border border-border-color bg-surface-elevated px-4 py-3 rounded-xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
          <p className="font-medium text-[15px] text-text-primary">
            {name}: <span className="font-bold ml-1">{value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ResultChart: React.FC<ResultChartProps> = memo(({ correct, wrong, skipped }) => {
  // Using explicit hex for Recharts data-mapping compatibility
  const data = [
    { name: 'সঠিক', value: correct, color: '#10b981' },
    { name: 'ভুল', value: wrong, color: '#ef4444' },
    { name: 'স্কিপড', value: skipped, color: '#6b7280' },
  ];

  const activeData = data.filter((d) => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-2xl">
        <p className="font-medium text-text-secondary">কোনো তথ্য পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-80 relative" aria-label="Exam performance chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={6}
            dataKey="value"
            stroke="none"
            animationDuration={800}
            animationBegin={100}
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend 
            verticalAlign="bottom" 
            height={40} 
            iconType="circle"
            formatter={(value) => (
              <span className="font-medium ml-1.5 text-sm md:text-[15px] text-text-secondary">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-3xl font-bold text-text-primary">
          {correct + wrong + skipped}
        </span>
        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold mt-1">
          মোট প্রশ্ন
        </span>
      </div>
    </div>
  );
});

ResultChart.displayName = 'ResultChart';
export default ResultChart;
