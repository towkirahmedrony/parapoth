import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ResultChartProps {
  correct: number;
  wrong: number;
  skipped: number;
}

// Custom interface to replace 'any' for Recharts tooltip payload
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}

// Extracted outside to prevent re-mounting on every render cycle
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const { name, value, payload: itemPayload } = payload[0];
    const color = itemPayload?.color || '#000'; // Safe fallback
    
    return (
      <div 
        className="border p-3 rounded-lg shadow-lg"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <p className="font-medium" style={{ color: 'var(--dyn-text)' }}>
            {name}: <span className="font-bold">{value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ResultChart: React.FC<ResultChartProps> = memo(({ correct, wrong, skipped }) => {
  const data = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Skipped', value: skipped, color: '#6b7280' },
  ];

  const activeData = data.filter((d) => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div 
        className="h-64 flex items-center justify-center" 
        style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-80" aria-label="Exam performance chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => (
              <span 
                className="font-medium ml-1" 
                style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

ResultChart.displayName = 'ResultChart';
export default ResultChart;
