import React, { memo } from 'react';
import { ArrowLeft, Bell, Megaphone } from 'lucide-react';

interface NotificationHeaderProps {
  activeTab: 'notifications' | 'notices';
  setActiveTab: (tab: 'notifications' | 'notices') => void;
  onBack: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ activeTab, setActiveTab, onBack }) => {
  return (
    <div 
      className="sticky top-0 z-30 backdrop-blur-md border-b"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 95%, transparent)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-1 -ml-1 transition-colors hover:opacity-70"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--dyn-text)' }}>নোটিফিকেশন</h1>
        </div>
      </div>

      <div 
        className="flex px-4 border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <button
          onClick={() => setActiveTab('notifications')}
          className="flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium transition-all relative"
          style={{ 
            color: activeTab === 'notifications' ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' 
          }}
        >
          <Bell size={18} />
          নোটিফিকেশন
          {activeTab === 'notifications' && (
            <span 
              className="absolute bottom-0 w-full h-0.5 rounded-t-full shadow-sm" 
              style={{ backgroundColor: 'var(--dyn-primary)' }}
            />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('notices')}
          className="flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium transition-all relative"
          style={{ 
            color: activeTab === 'notices' ? 'var(--dyn-primary)' : 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' 
          }}
        >
          <Megaphone size={18} />
          নোটিশ বোর্ড
          {activeTab === 'notices' && (
            <span 
              className="absolute bottom-0 w-full h-0.5 rounded-t-full shadow-sm" 
              style={{ backgroundColor: 'var(--dyn-primary)' }}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(NotificationHeader);
