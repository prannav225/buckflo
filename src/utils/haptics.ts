/**
 * Lightweight wrapper for the Web Vibration API.
 * Provides preset patterns for common interactions.
 */

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore failures
      console.log(e);
    }
  }
};

export const hapticFeedback = {
  // Light tick for small interactions (toggles, tabs)
  light: () => vibrate(10),
  // Medium tick for standard buttons (save, add)
  medium: () => vibrate(30),
  // Heavy tick or double pulse for destructive actions (delete, wipe)
  heavy: () => vibrate([40, 60, 40]),
  // Success pattern
  success: () => vibrate([20, 50, 40]),
  // Error pattern
  error: () => vibrate([50, 50, 50, 50, 50]),
};
