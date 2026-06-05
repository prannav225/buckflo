

export interface DetectedSubscription {
  description: string;
  amount: number;
  category: string;
  nextDueDate: string; // "yyyy-MM-dd"
  daysLeft: number;
}

export function useSubscriptionAlerts(): DetectedSubscription[] {
  // Feature disabled as per user request to prevent misfiring of auto-detected subscriptions
  return [];
}
