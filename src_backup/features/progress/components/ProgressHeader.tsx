import React from 'react';

interface ProgressHeaderProps {
  user?: {
    name?: string;
    batch?: string;
  };
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ user }) => {
  // Safe fallbacks to prevent crashes
  const userName = user?.name || 'Student';
  const userBatch = user?.batch || 'N/A';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div 
      className="rounded-2xl p-6 shadow-sm relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
            style={{ 
              backgroundColor: 'var(--dyn-primary)', 
              color: 'var(--dyn-card)',
              border: '2px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
            }}
          >
            {initial}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--dyn-text)' }}>
              {userName}
            </h1>
            <span 
              className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)'
              }}
            >
              Batch: {userBatch}
            </span>
          </div>
        </div>
      </div>
      <div 
        className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)' }}
      ></div>
    </div>
  );
};
