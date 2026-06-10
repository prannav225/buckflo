import { useEffect, useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { db } from '../db/database';

export function useNotificationPermission() {
  const { profile } = useProfile();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check current permission status
  const checkPermissionStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      if (!('Notification' in window)) {
        console.warn('Notifications API not supported');
        setPermission(null);
        return;
      }

      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      
      console.log(`[Notifications] Current permission: ${currentPermission}`);
      return currentPermission;
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
      if (!('Notification' in window)) {
        console.warn('[Notifications] API not supported on this device');
        return 'denied';
      }

      // If already granted, skip
      if (Notification.permission === 'granted') {
        console.log('[Notifications] Already granted');
        return 'granted';
      }

      // If denied before, don't ask again
      if (Notification.permission === 'denied') {
        console.log('[Notifications] User previously denied');
        return 'denied';
      }

      // Request permission
      console.log('[Notifications] Requesting permission...');
      const result = await Notification.requestPermission();
      setPermission(result);

      // Mark that we've asked the user
      if (profile?.id) {
        await db.profile.update(profile.id, {
          notificationPermissionAsked: true
        });
      }

      console.log(`[Notifications] Permission request result: ${result}`);
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
