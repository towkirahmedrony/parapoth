import React, { memo } from 'react';
import { FileText, AlertCircle, Bookmark } from 'lucide-react';
import { TabType } from '../types/history';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Extracted constant outside to prevent re-creation on every render
const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'history', label: 'ইতিহাস', icon: FileText },
  { id: 'mistakes', label: 'ভুলসমূহ', icon: AlertCircle },
  { id: 'bookmarks', label: 'বুকমার্কড', icon: Bookmark },
];

export const HistoryTabs: React.FC<Props> = memo(({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full mb-6 px-1">
      <div 
        className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl shadow-inner transition-colors"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 
                py-3 px-1 rounded-xl text-[12px] md:text-sm font-bold transition-all duration-300
                ${isActive ? 'shadow-lg scale-[1.02]' : 'hover:opacity-80 active:scale-95'}
              `}
              style={{
                backgroundColor: isActive ? 'var(--dyn-primary)' : 'transparent',
                color: isActive ? 'var(--dyn-bg)' : 'color-mix(in srgb, var(--dyn-text) 70%, transparent)',
                boxShadow: isActive ? '0 4px 12px color-mix(in srgb, var(--dyn-primary) 30%, transparent)' : 'none'
              }}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

HistoryTabs.displayName = 'HistoryTabs';
