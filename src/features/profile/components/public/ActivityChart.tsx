import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ActivityChartProps {
  data: { day: string; you: number; them: number; }[];
  opponentName: string;
  isOwnProfile?: boolean;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, opponentName, isOwnProfile = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="m-4 p-5 rounded-2xl shadow-lg border"
      style={{ backgroundColor: 'var(--dyn-card)', borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold font-['Hind_Siliguri']" style={{ color: 'var(--dyn-text)' }}>
            {isOwnProfile ? 'আমার অ্যাক্টিভিটি 📊' : 'পরীক্ষার তুলনা 📊'}
          </h3>
          <p className="text-xs font-['Hind_Siliguri']" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
            গত ৭ দিনের অ্যাক্টিভিটি
          </p>
        </div>
        
        <div className="flex gap-4 text-xs font-['Hind_Siliguri'] font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--dyn-primary)' }}></div>
            <span style={{ color: 'var(--dyn-text)' }}>{isOwnProfile ? 'আমি' : 'You'}</span>
          </div>
          {!isOwnProfile && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--dyn-accent)' }}></div>
              <span style={{ color: 'var(--dyn-text)' }}>{opponentName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[200px] w-full mt-4 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in srgb, var(--dyn-text) 10%, transparent)" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--dyn-text)', opacity: 0.6, fontSize: 12, fontFamily: 'Hind Siliguri' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--dyn-text)', opacity: 0.6, fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--dyn-card)', border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)', borderRadius: '8px', color: 'var(--dyn-text)' }}
              labelStyle={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)', marginBottom: '0.5rem' }}
            />
            {!isOwnProfile && (
              <Area type="monotone" dataKey="them" name={opponentName} stroke="var(--dyn-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorThemActivity)" />
            )}
            <Area type="monotone" dataKey="you" name={isOwnProfile ? "আমি" : "You"} stroke="var(--dyn-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorYouActivity)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ActivityChart;
