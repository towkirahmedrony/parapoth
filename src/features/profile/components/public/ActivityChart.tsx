import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ActivityChartProps {
  data: {
    day: string;
    you: number;
    them: number;
  }[];
  opponentName: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, opponentName }) => {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 
            className="text-lg font-bold font-['Hind_Siliguri']"
            style={{ color: 'var(--dyn-text)' }}
          >
            পরীক্ষার তুলনা 📊
          </h3>
          <p 
            className="text-xs font-['Hind_Siliguri']"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
          >
            গত ৭ দিনের অ্যাক্টিভিটি
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--dyn-primary)' }}></div>
            <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>You</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--dyn-accent)' }}></div>
            <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>Them</span>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorYouActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--dyn-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--dyn-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorThemActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--dyn-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--dyn-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dyn-text)" opacity={0.15} />
            
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--dyn-text)', opacity: 0.6, fontSize: 12, fontFamily: 'Hind Siliguri' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--dyn-text)', opacity: 0.6, fontSize: 11 }} 
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--dyn-card)', 
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)', 
                borderRadius: '8px',
                color: 'var(--dyn-text)' 
              }}
              labelStyle={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)', marginBottom: '0.5rem' }}
            />

            <Area 
              type="monotone" 
              dataKey="them" 
              name={opponentName}
              stroke="var(--dyn-accent)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorThemActivity)" 
            />

            <Area 
              type="monotone" 
              dataKey="you" 
              name="You"
              stroke="var(--dyn-primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorYouActivity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ActivityChart;
