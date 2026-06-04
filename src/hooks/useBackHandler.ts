import { useEffect, useRef } from "react";
import { registerModal, unregisterModal } from "../utils/modalHelper";
import { hapticFeedback } from "../utils/haptics";

/**
 * Hook to handle back gestures/back button clicks on Android.
 * Integrates haptic feedback automatically on open and close.
 */
export function useBackHandler(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);

  // Always keep the ref updated with the latest onClose callback
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger haptic tick when the modal/sheet opens
    hapticFeedback.light();

    // Create a stable callback wrapper that calls the latest onClose from the ref
    const stableClose = () => {
      // Trigger haptic tick on dismissal
      hapticFeedback.light();
      onCloseRef.current();
    };

    registerModal(stableClose);
    return () => {
      unregisterModal(stableClose);
    };
  }, [isOpen]);
}
