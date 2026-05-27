import { useEffect } from "react";
import { processAutopaySubscriptions } from "../utils/autopay";

export function useAutopayTrigger(isOnboarded: boolean) {
  useEffect(() => {
    if (isOnboarded) {
      // 1. Run the autopay check 1 second after onboarding confirmation
      const timer = setTimeout(() => {
        processAutopaySubscriptions().catch((err) => {
          console.error("Autopay processing failed:", err);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded]);
}
