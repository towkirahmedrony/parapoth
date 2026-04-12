import React from 'react';
import { TrendingUp, Target, Zap, Crown } from 'lucide-react';
import { StatCard } from './StatCard';
import { MetricData } from '../types/progress';

interface MetricsGridProps {
  metrics: MetricData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="গড় স্কোর" 
        value={`${metrics.averageScore || 0}%`} 
        subtext="সর্বশেষ ডেটা অনুযায়ী" 
        icon={TrendingUp} 
      />
      <StatCard 
        title="টোটাল এক্সাম" 
        value={(metrics.totalExams || 0).toString()} 
        subtext="সর্বমোট দেওয়া হয়েছে" 
        icon={Target} 
      />
      <StatCard 
        title="স্ট্রিক" 
        value={`${metrics.streak || 0} দিন`} 
        subtext="টানা পড়াশোনা চলছে" 
        icon={Zap} 
      />
      <StatCard 
        title="গ্লোবাল র‍্যাংক" 
        value={(metrics.globalRank || 0).toString()} 
        subtext="লিডারবোর্ড অনুযায়ী" 
        icon={Crown} 
      />
    </div>
  );
};
