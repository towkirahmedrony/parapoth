import { useState, useEffect } from 'react';
import { requestNotificationPermission, saveDeviceTokenToAPI, getOrCreateDeviceId } from '../services/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';

export const useNotification = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('আপনার ব্রাউজার নোটিফিকেশন সাপোর্ট করে না।');
      return;
    }

    if (notificationsEnabled) {
      const confirmDisable = window.confirm('আপনি কি নিশ্চিত যে নোটিফিকেশন বন্ধ করতে চান? আপনি গুরুত্বপূর্ণ আপডেট মিস করতে পারেন।');
      if (confirmDisable) {
        setNotificationsEnabled(false);
        
        // API কল করে FCM টোকেন রিমুভ (null) করা
        const deviceId = getOrCreateDeviceId();
        if (user) {
          await saveDeviceTokenToAPI(deviceId, null);
          console.log("FCM token invalidated via API");
        }
      }
    } else {
      if ((Notification.permission as string) === 'denied') {
        setShowDeniedModal(true);
        return;
      }

      try {
        if (!user) {
          console.warn("User must be logged in to enable notifications.");
          return;
        }

        const token = await requestNotificationPermission();
        
        if (token) {
          setNotificationsEnabled(true);
        } else if ((Notification.permission as string) === 'denied') {
          setShowDeniedModal(true);
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  return { notificationsEnabled, toggleNotifications, showDeniedModal, setShowDeniedModal };
};
