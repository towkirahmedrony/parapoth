import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { DBNotificationItem } from '../types/notificationTypes';
import NotificationHeader from '../components/NotificationHeader';
import NotificationItem from '../components/NotificationItem';
import NotificationEmptyState from '../components/NotificationEmptyState';
import { fetchNotifications, markNotificationAsRead } from '../services/notificationService';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'notifications' | 'notices'>('notifications');

  // Memoized query key to ensure strict reference equality across queries and mutations
  const queryKey = useMemo(() => ['notifications', user?.id], [user?.id]);

  // 1. Fetch Notifications using React Query
  const { data: notifications = [], isLoading } = useQuery<DBNotificationItem[]>({
    queryKey,
    queryFn: fetchNotifications,
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // 2. Memoize filtered data
  const filteredData = useMemo(() => {
    return notifications.filter(item => 
      activeTab === 'notifications' 
        ? item.type !== 'global_notice' 
        : item.type === 'global_notice'
    );
  }, [notifications, activeTab]);

  // 3. Mutation for updating read status with Optimistic UI update
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousNotifications = queryClient.getQueryData<DBNotificationItem[]>(queryKey);

      if (previousNotifications) {
        queryClient.setQueryData<DBNotificationItem[]>(queryKey, old => {
          if (!old) return [];
          return old.map(n => 
            n.id === notificationId 
              ? { ...n, notification_reads: [{ is_read: true, is_clicked: true }] } 
              : n
          );
        });
      }

      return { previousNotifications };
    },
    // FIXED TS6133: Added underscore to unused 'variables' parameter
    onError: (err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKey, context.previousNotifications);
      }
      console.error("Error updating read status via API:", err);
    }
  });

  // 4. Memoize click handler
  const handleItemClick = useCallback((item: DBNotificationItem) => {
    const isGlobalNotice = item.type === 'global_notice';
    const isRead = item.notification_reads?.[0]?.is_read ?? false;

    if (!isRead && user && !isGlobalNotice) {
      markAsReadMutation.mutate(item.id);
    }

    if (!item.action_link) return;

    if (item.action_link.startsWith('http') || item.action_link.startsWith('www')) {
      window.open(item.action_link, '_blank', 'noopener,noreferrer'); 
    } else {
      navigate(item.action_link); 
    }
  }, [user, markAsReadMutation, navigate]);

  return (
    <div className="min-h-screen flex flex-col font-['Hind_Siliguri']" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
      
      <NotificationHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onBack={() => navigate(-1)} 
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
           <div className="flex justify-center py-10" aria-label="Loading Notifications">
             <span 
               className="animate-spin h-6 w-6 border-2 border-t-transparent rounded-full"
               style={{ borderColor: 'var(--dyn-primary)', borderTopColor: 'transparent' }}
               role="status"
             ></span>
           </div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
            <NotificationItem 
              key={item.id} 
              item={item} 
              activeTab={activeTab} 
              onClick={handleItemClick} 
            />
          ))
        ) : (
          <NotificationEmptyState activeTab={activeTab} />
        )}
      </div>

    </div>
  );
};

export default Notifications;
