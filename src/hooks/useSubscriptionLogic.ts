import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSubscriptions } from '../db/hooks';
import { db, updateSubscription, deleteSubscription, type Subscription } from '../db/database';

export function useSubscriptionLogic(monthYear?: string) {
  const subscriptions = useSubscriptions();

  // Delete all auto-detected subscriptions on mount to clean up database
  useEffect(() => {
    db.subscriptions
      .filter((s) => s.autoDetected === true)
      .primaryKeys()
      .then((keys) => {
        if (keys.length > 0) {
          db.subscriptions.bulkDelete(keys).catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

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
      toast.success(`Subscription ${newStatus === "active" ? "activated" : "paused"}`);
    } catch (err) {
      toast.error("Failed to change status");
      console.error(err);
    }
  };

  const approvedSubs = subscriptions.filter((s) => s.autoDetected !== true);

  const sortedSubs = [...approvedSubs].sort((a, b) =>
    a.nextDueDate.localeCompare(b.nextDueDate)
  );

  const totalCommitted = approvedSubs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const amount = s.amount;
      const freq = s.frequency.toLowerCase();
      
      if (monthYear) {
        const [targetYear, targetMonth] = monthYear.split("-").map(Number);
        const [dueYear, dueMonth] = s.nextDueDate.split("-").map(Number);
        
        if (isNaN(targetYear) || isNaN(targetMonth) || isNaN(dueYear) || isNaN(dueMonth)) {
          return sum + amount;
        }
        
        const diffMonths = (targetYear - dueYear) * 12 + (targetMonth - dueMonth);
        
        if (freq === "weekly") {
          return sum + (amount * 52) / 12;
        }
        if (freq === "monthly") {
          return sum + amount;
        }
        if (freq === "3_months") {
          return sum + (diffMonths % 3 === 0 ? amount : 0);
        }
        if (freq === "6_months") {
          return sum + (diffMonths % 6 === 0 ? amount : 0);
        }
        if (freq === "yearly") {
          return sum + (diffMonths % 12 === 0 ? amount : 0);
        }
        return sum + amount;
      }

      if (freq === "weekly") {
        return sum + (amount * 52) / 12;
      }
      if (freq === "monthly") {
        return sum + amount;
      }
      if (freq === "3_months") {
        return sum + amount / 3;
      }
      if (freq === "6_months") {
        return sum + amount / 6;
      }
      if (freq === "yearly") {
        return sum + amount / 12;
      }
      return sum + amount;
    }, 0);

  return {
    approvedSubs,
    sortedSubs,
    totalCommitted,
    handleDeleteSub,
    toggleStatus,
  };
}
