import React, { memo } from 'react';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = memo(({ title, icon, children }) => {
  return (
    <div 
      className="p-4 rounded-xl shadow-sm transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div 
        className="flex items-center justify-between mb-3 pb-2"
        style={{ borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <h3 
          className="text-xs font-bold uppercase tracking-wider font-['Hind_Siliguri']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
        >
          {title}
        </h3>
        {icon && (
          <div style={{ color: 'var(--dyn-primary)' }}>
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

interface InfoRowProps {
  label: string;
  value?: string | number | null;
  isVerified?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = memo(({ label, value, isVerified }) => (
  <div className="flex justify-between items-start">
    <span 
      className="text-sm font-medium font-['Hind_Siliguri']"
      style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
    >
      {label}
    </span>
    <div className="text-right flex flex-col items-end">
      <span 
        className="text-sm font-semibold block text-right font-['Hind_Siliguri']"
        style={{ color: 'var(--dyn-text)' }}
      >
        {value || "দেওয়া নেই"}
      </span>
      {isVerified && (
        <span 
          className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 tracking-wide font-['Hind_Siliguri']"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)',
            color: 'var(--dyn-primary)'
          }}
        >
          ভেরিফাইড
        </span>
      )}
    </div>
  </div>
));

InfoRow.displayName = 'InfoRow';
