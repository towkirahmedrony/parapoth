import React, { memo } from 'react';
import { Bell, Megaphone, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { DBNotificationItem } from '../types/notificationTypes'; 

interface NotificationItemProps {
  item: DBNotificationItem;
  activeTab: 'notifications' | 'notices';
  onClick: (item: DBNotificationItem) => void;
}

// Extracted outside the component to prevent function recreation on every render
const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const utcDateStr = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
  const date = new Date(utcDateStr);
  
  return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + 
         date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item, activeTab, onClick }) => {
  const isRead = item.notification_reads?.[0]?.is_read || false;

  return (
    <div 
      onClick={() => onClick(item)}
      className="relative group flex gap-4 p-4 rounded-xl border transition-all active:scale-[0.99] cursor-pointer shadow-sm"
      style={{
        backgroundColor: isRead ? 'color-mix(in srgb, var(--dyn-text) 3%, transparent)' : 'var(--dyn-card)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
        color: isRead ? 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' : 'var(--dyn-text)'
      }}
    >
      <div className="shrink-0">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt="icon" 
            className="w-10 h-10 rounded-full object-cover border"
            style={{ 
              borderColor: 'color-mix(in srgb, var(--dyn-text) 15%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' 
            }}
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)',
              color: 'var(--dyn-primary)'
            }}
          >
            {activeTab === 'notifications' ? <Bell size={20} /> : <Megaphone size={20} />}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h3 
            className={`text-sm ${isRead ? 'font-medium' : 'font-bold'}`}
            style={{ color: isRead ? 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' : 'var(--dyn-text)' }}
          >
            {item.title_bn || item.title_en}
          </h3>
          {!isRead && (
            <span 
              className="w-2 h-2 rounded-full mt-1.5 animate-pulse" 
              style={{ backgroundColor: 'var(--dyn-accent)' }} 
            />
          )}
        </div>
        <p 
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: isRead ? 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' : 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
        >
          {item.body_bn || item.body_en}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <div 
            className="flex items-center gap-1"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
          >
            <Clock size={12} />
            <span className="text-[10px]">{formatTime(item.created_at)}</span>
          </div>
          {item.action_link && (
            <div 
              className="flex items-center gap-1 text-[10px] hover:underline"
              style={{ color: 'var(--dyn-primary)' }}
            >
              <span>ভিজিট করুন</span>
              <ExternalLink size={10} />
            </div>
          )}
        </div>
      </div>

      <div 
        className="flex items-center justify-center"
        style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
      >
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

// React.memo prevents unnecessary re-renders of list items if their props haven't changed.
// TanStack Query's structural sharing ensures object references remain stable if data is unchanged.
export default memo(NotificationItem);
