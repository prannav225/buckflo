import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSubscriptions } from '../db/hooks';
import { updateSubscription, deleteSubscription, runSubscriptionAutoDetection, type Subscription } from '../db/database';

export function useSubscriptionLogic() {
  const subscriptions = useSubscriptions();

  // Run auto-detection on mount
  useEffect(() => {
    runSubscriptionAutoDetection().then((count) => {
      if (count > 0) {
        toast.success(`Auto-detected ${count} recurring subscription(s)!`);
      }
    });
  }, []);

  const handleApproveSub = async (id: number) => {
    try {
      await updateSubscription(id, { autoDetected: false });
      toast.success("Subscription approved ✓");
    } catch (err) {
      toast.error("Failed to approve subscription");
      console.error(err);
    }
  };

  const handleDeleteSub = async (id: number) => {
    try {
      await deleteSubscription(id);
      toast.success("Subscription removed");
    } catch (err) {
      toast.error("Failed to remove subscription");
      console.error(err);
    }
  };

  const toggleStatus = async (sub: Subscription) => {
    const nextStatusMap: Record<Subscription["status"], Subscription["status"]> = {
      active: "paused",
      paused: "active",
      cancelled: "active",
    };
    const newStatus = nextStatusMap[sub.status];
    try {
      await updateSubscription(sub.id!, { status: newStatus });
      toast.success(`Subscription ${newStatus === "active" ? "activated" : "paused"} ✓`);
    } catch (err) {
      toast.error("Failed to change status");
      console.error(err);
    }
  };

  const detectedSubs = subscriptions.filter((s) => s.autoDetected === true);
  const approvedSubs = subscriptions.filter((s) => s.autoDetected !== true);

  const sortedSubs = [...approvedSubs].sort((a, b) =>
    a.nextDueDate.localeCompare(b.nextDueDate)
  );

  const totalCommitted = approvedSubs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  return {
    detectedSubs,
    approvedSubs,
    sortedSubs,
    totalCommitted,
    handleApproveSub,
    handleDeleteSub,
    toggleStatus,
  };
}
