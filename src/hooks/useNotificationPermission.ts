import { useEffect, useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { db } from '../db/database';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotificationPermission() {
  const { profile } = useProfile();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check current permission status
  const checkPermissionStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        // Capacitor display permission: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'
        if (status.display === 'granted') {
          setPermission('granted');
          return 'granted';
        } else if (status.display === 'denied') {
          setPermission('denied');
          return 'denied';
        } else {
          setPermission('default');
          return 'default';
        }
      } else {
        if (!('Notification' in window)) {
          console.warn('Notifications API not supported');
          setPermission(null);
          return;
        }
        const currentPermission = Notification.permission;
        setPermission(currentPermission);
        return currentPermission;
      }
    } catch (error) {
      console.error('[Notifications] Error checking permission:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    setIsChecking(true);
    try {
      let result: NotificationPermission = 'default';

      if (Capacitor.isNativePlatform()) {
        const current = await LocalNotifications.checkPermissions();
        if (current.display === 'granted') {
          result = 'granted';
        } else {
          const req = await LocalNotifications.requestPermissions();
          result = req.display === 'granted' ? 'granted' : 'denied';
        }
      } else {
        if (!('Notification' in window)) {
          console.warn('[Notifications] API not supported on this device');
          return 'denied';
        }
        if (Notification.permission === 'granted') return 'granted';
        if (Notification.permission === 'denied') return 'denied';
        
        result = await Notification.requestPermission();
      }

      setPermission(result);

      // Mark that we've asked the user
      if (profile?.id) {
        await db.profile.update(profile.id, {
          notificationPermissionAsked: true
        });
      }

      return result;
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return 'denied';
    } finally {
      setIsChecking(false);
    }
  }, [profile?.id]);

  // On mount, check current permission status
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    permission,
    isChecking,
    requestPermission,
    checkPermissionStatus,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default'
  };
}
