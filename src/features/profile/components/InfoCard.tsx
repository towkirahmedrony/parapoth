import React, { memo } from 'react';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = memo(({ title, icon, children }) => {
  return (
    <div 
      className="p-5 rounded-3xl shadow-sm transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 5%, transparent)'
      }}
    >
      <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: '1px dashed color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}>
        <div className="p-2 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)', color: 'var(--dyn-primary)' }}>
          {icon}
        </div>
        <h3 
          className="text-sm font-bold uppercase tracking-wider font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-text)' }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-4">
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
  <div className="flex justify-between items-center group">
    <span 
      className="text-sm font-medium font-['Hind_Siliguri'] transition-colors"
      style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
    >
      {label}
    </span>
    <div className="text-right flex items-center gap-2">
      <span 
        className="text-sm font-semibold font-['Hind_Siliguri']"
        style={{ color: value ? 'var(--dyn-text)' : 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
      >
        {value || "দেওয়া নেই"}
      </span>
      {isVerified && (
        <span 
          className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide font-['Hind_Siliguri']"
          style={{ 
            backgroundColor: 'color-mix(in srgb, #10B981 15%, transparent)',
            color: '#10B981'
          }}
        >
          ভেরিফাইড
        </span>
      )}
    </div>
  </div>
));

InfoRow.displayName = 'InfoRow';
