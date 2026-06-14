/**
 * Lightweight wrapper for the Web Vibration API.
 * Provides preset patterns for common interactions.
 */

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log(e);
    }
  }
};

const isIosNative = Capacitor.getPlatform() === "ios";

export const hapticFeedback = {
  light: async () => {
    if (isIosNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else {
      vibrate(5); // Ultra-short 5ms vibration feels like a subtle Taptic "tick"
    }
  },
  medium: async () => {
    if (isIosNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      vibrate(12); 
    }
  },
  heavy: async () => {
    if (isIosNative) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      vibrate(25);
    }
  },
  success: async () => {
    if (isIosNative) {
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      vibrate([15, 40, 20]); // Fast double tick
    }
  },
  error: async () => {
    if (isIosNative) {
      await Haptics.notification({ type: NotificationType.Error });
    } else {
      vibrate([20, 30, 20, 30, 30]); // Shuttering buzz
    }
  },
};
