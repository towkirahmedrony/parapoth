import React, { memo } from 'react';
import { Check } from 'lucide-react';

interface NotificationEmptyStateProps {
  activeTab: 'notifications' | 'notices';
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ activeTab }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center py-20 space-y-4"
      style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
    >
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' }}
      >
        <Check size={32} style={{ color: 'color-mix(in srgb, var(--dyn-text) 30%, transparent)' }} />
      </div>
      <p>কোনো নতুন {activeTab === 'notifications' ? 'নোটিফিকেশন' : 'নোটিশ'} নেই</p>
    </div>
  );
};

export default memo(NotificationEmptyState);
