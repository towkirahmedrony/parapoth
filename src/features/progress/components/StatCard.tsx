import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = memo(({ title, value, subtext, icon: Icon }) => (
  <div 
    className="backdrop-blur-md rounded-2xl p-5 flex items-start justify-between relative overflow-hidden group transition-all shadow-sm hover:[border-color:color-mix(in_srgb,var(--dyn-text)_25%,transparent)]"
    style={{ 
      backgroundColor: 'var(--dyn-card)',
      border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
    }}
  >
    <div className="z-10 relative">
      <p 
        className="text-xs font-medium mb-1 uppercase tracking-wider"
        style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
      >
        {title}
      </p>
      <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--dyn-text)' }}>{value}</h3>
      <p className="text-xs font-medium" style={{ color: 'var(--dyn-primary)' }}>{subtext}</p>
    </div>
    <div 
      className="p-3 rounded-xl"
      style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)' }}
    >
      <Icon size={20} style={{ color: 'var(--dyn-primary)' }} />
    </div>
    {/* Decorative Glow */}
    <div 
      className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"
      style={{ backgroundColor: 'var(--dyn-primary)' }}
    />
  </div>
));

StatCard.displayName = 'StatCard';
