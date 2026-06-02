import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { useAccount, useMonthSetup, useTransactions, useMonthSummary } from "../../db/hooks";
import {
  useSubscriptionAlerts,
  useCategoryBudgetAlerts,
  useSmartAllocationPrompt,
  useWeekOverWeek,
} from "../analytics";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useActiveAlerts } from "./useActiveAlerts";

export function useNotificationHub(
  setIsTransferOpen: (open: boolean) => void,
  setTransferConfig: (config: {
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }) => void,
) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [seenAlertKeys, setSeenAlertKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("flo_seen_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("flo_dismissed_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const monthYear = getCurrentMonthYear();
  const spendingAcc = useAccount("spending");
  const monthSetup = useMonthSetup(monthYear);
  const allMonthTxs = useTransactions(spendingAcc?.id, monthYear);
  const summary = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);

  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalExpense;
  const spentPct = budget > 0 ? (spent / budget) * 100 : 0;

  const subAlerts = useSubscriptionAlerts();
  const catAlerts = useCategoryBudgetAlerts();
  const advisor = useSmartAllocationPrompt();
  const wow = useWeekOverWeek();

  const savingGoals = useLiveQuery(() => db.savingGoals.toArray(), [], []);

  const approvedSubscriptions = useLiveQuery(
    () => db.subscriptions.where("status").equals("active").toArray(),
    [],
    [],
  );

  const activeAlerts = useActiveAlerts({
    budget,
    spent,
    spentPct,
    monthYear,
    subAlerts,
    catAlerts,
    advisor,
    wow,
    savingGoals,
    approvedSubscriptions,
    navigate,
    setTransferConfig,
    setIsTransferOpen,
  });

  const visibleAlerts = useMemo(() => {
    return activeAlerts.filter(
      (alert) => !dismissedAlertKeys.includes(alert.id),
    );
  }, [activeAlerts, dismissedAlertKeys]);

  const unreadAlerts = useMemo(() => {
    return visibleAlerts.filter((alert) => !seenAlertKeys.includes(alert.id));
  }, [visibleAlerts, seenAlertKeys]);

  const hasUnread = unreadAlerts.length > 0;

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    const activeIds = activeAlerts.map((a) => a.id);
    localStorage.setItem("flo_seen_alerts", JSON.stringify(activeIds));
    setSeenAlertKeys(activeIds);

    const activeIdsSet = new Set(activeIds);
    const cleanedDismissed = dismissedAlertKeys.filter((id) =>
      activeIdsSet.has(id),
    );
    if (cleanedDismissed.length !== dismissedAlertKeys.length) {
      localStorage.setItem(
        "flo_dismissed_alerts",
        JSON.stringify(cleanedDismissed),
      );
      setDismissedAlertKeys(cleanedDismissed);
    }
  };

  const handleDismissAlert = async (id: string) => {
    const alert = activeAlerts.find((a) => a.id === id);
    if (alert) {
      try {
        await db.notifications.add({
          title: alert.title,
          message: alert.description,
          type: alert.type,
          date: new Date().toISOString(),
          read: true,
          referenceId: alert.id,
        });
      } catch (e) {
        console.error("Failed to save notification history", e);
      }
    }

    setDismissedAlertKeys((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("flo_dismissed_alerts", JSON.stringify(updated));
      return updated;
    });
  };

  return {
    isNotificationsOpen,
    setIsNotificationsOpen,
    visibleAlerts,
    hasUnread,
    openNotifications,
    handleDismissAlert,
  };
}
