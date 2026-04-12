import React, { memo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface SkillRadarProps {
  data: { subject: string; score: number; fullMark: number }[];
}

// Extracted styles to prevent unnecessary Recharts object diffing overhead
const TOOLTIP_CONTENT_STYLE: React.CSSProperties = { 
  backgroundColor: 'var(--dyn-card)', 
  borderRadius: '8px', 
  border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
  color: 'var(--dyn-text)'
};

const TOOLTIP_ITEM_STYLE: React.CSSProperties = { 
  color: 'var(--dyn-primary)', 
  fontWeight: 'bold' 
};

const SkillRadar: React.FC<SkillRadarProps> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="m-4 p-5 rounded-2xl shadow-lg border"
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 
          className="text-lg font-bold font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-text)' }}
        >
          দক্ষতা গ্রাফ 🕸️
        </h3>
        <span 
          className="text-xs font-medium font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-primary)' }}
        >
          সেরা বিষয়সমূহ
        </span>
      </div>

      <div className="h-[250px] w-full flex items-center justify-center text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="color-mix(in srgb, var(--dyn-text) 30%, transparent)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--dyn-text)', opacity: 0.8, fontSize: 11, fontWeight: '500', fontFamily: 'Hind Siliguri' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="স্কোর"
              dataKey="score"
              stroke="var(--dyn-primary)"
              strokeWidth={2}
              fill="var(--dyn-primary)"
              fillOpacity={0.3}
            />
            <Tooltip 
                contentStyle={TOOLTIP_CONTENT_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default memo(SkillRadar);
