import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useMonthSummary,
} from "../db/hooks";
import {
  useSubscriptionAlerts,
  useCategoryBudgetAlerts,
  useSmartAllocationPrompt,
  useWeekOverWeek,
} from "./useAnalytics";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { formatINR } from "../utils/currency";

export interface NotificationItem {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  category: "alerts" | "bills" | "insights";
  title: string;
  description: string;
  iconName:
    | "alert"
    | "budget"
    | "trend-up"
    | "trend-down"
    | "sub"
    | "goal"
    | "advisor";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotificationHub(
  setIsTransferOpen: (open: boolean) => void,
  setTransferConfig: (config: {
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }) => void
) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Seen and dismissed alert state
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

  // 1. Gather all required state from hooks/queries
  const monthYear = getCurrentMonthYear();
  const expendAcc = useAccount("expenditure");
  const monthSetup = useMonthSetup(monthYear);
  const allMonthTxs = useTransactions(expendAcc?.id, monthYear);
  const summary = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);

  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalDebited;
  const spentPct = budget > 0 ? (spent / budget) * 100 : 0;

  // Active alerts from useAnalytics
  const subAlerts = useSubscriptionAlerts();
  const catAlerts = useCategoryBudgetAlerts();
  const advisor = useSmartAllocationPrompt();
  const wow = useWeekOverWeek();

  // Saving goals
  const savingGoals = useLiveQuery(() => db.savingGoals.toArray(), [], []);

  // 2. Compile active notifications dynamically
  const activeAlerts = useMemo(() => {
    const alerts: NotificationItem[] = [];

    // A. Total budget alert
    if (budget > 0) {
      if (spent >= budget) {
        alerts.push({
          id: `budget-exceeded-${monthYear}-${Math.floor(spent)}`,
          type: "danger",
          category: "alerts",
          title: "Monthly Budget Exceeded",
          description: `You have spent ${formatINR(spent)} of your ${formatINR(budget)} monthly budget.`,
          iconName: "alert",
          action: {
            label: "View Feed",
            onClick: () => navigate("/monthly"),
          },
        });
      } else if (spentPct >= 80) {
        alerts.push({
          id: `budget-warning-${monthYear}-${Math.floor(spentPct)}`,
          type: "warning",
          category: "alerts",
          title: "Budget Threshold Crossed",
          description: `You have spent ${Math.round(spentPct)}% of your monthly budget (${formatINR(spent)} / ${formatINR(budget)}).`,
          iconName: "budget",
          action: {
            label: "View Feed",
            onClick: () => navigate("/monthly"),
          },
        });
      }
    }

    // B. Category budget alerts
    for (const cat of catAlerts) {
      alerts.push({
        id: `cat-alert-${monthYear}-${cat.category}-${cat.isExceeded ? "exceeded" : "warning"}-${Math.floor(cat.spent)}`,
        type: cat.isExceeded ? "danger" : "warning",
        category: "alerts",
        title: `${cat.category} Budget ${cat.isExceeded ? "Exceeded" : "Alert"}`,
        description: cat.isExceeded
          ? `${cat.category} limit of ${formatINR(cat.budget)} exceeded. Spent ${formatINR(cat.spent)}.`
          : `Spent ${Math.round(cat.percentUsed)}% of ${formatINR(cat.budget)} category limit (${formatINR(cat.spent)} used).`,
        iconName: cat.isExceeded ? "alert" : "budget",
        action: {
          label: "Adjust Budgets",
          onClick: () => navigate("/monthly"),
        },
      });
    }

    // C. Subscriptions auto-pay reminders (due in <= 7 days)
    for (const sub of subAlerts) {
      if (sub.daysLeft <= 7) {
        alerts.push({
          id: `sub-due-${sub.description}-${sub.nextDueDate}`,
          type: sub.daysLeft <= 2 ? "warning" : "info",
          category: "bills",
          title: `Upcoming Auto-Pay: ${sub.description}`,
          description: `${formatINR(sub.amount)} is auto-renewing in ${sub.daysLeft} days (${sub.nextDueDate}).`,
          iconName: "sub",
          action: {
            label: "Manage Subs",
            onClick: () => navigate("/insights"),
          },
        });
      }
    }

    // D. Smart allocation advisor
    if (advisor?.shouldShow) {
      alerts.push({
        id: `smart-advisor-surplus-${advisor.suggestedAmount}`,
        type: "info",
        category: "insights",
        title: "Smart Allocation Recommendation",
        description: `You have an estimated monthly surplus of ${formatINR(advisor.surplus)}. Move ${formatINR(advisor.suggestedAmount)} to Savings?`,
        iconName: "advisor",
        action: {
          label: "Move Now",
          onClick: () => {
            setTransferConfig({
              direction: "expenditure_to_savings",
              amount: advisor.suggestedAmount.toString(),
              note: "Smart allocation",
            });
            setIsTransferOpen(true);
          },
        },
      });
    }

    // E. Week-over-Week spending trends (if change is substantial)
    if (wow.lastWeekTotal > 0) {
      if (wow.percentChange >= 15) {
        alerts.push({
          id: `wow-high-${wow.percentChange}`,
          type: "warning",
          category: "insights",
          title: "High Spend Velocity",
          description: `Weekly spending is up by ${wow.percentChange}% (${formatINR(wow.thisWeekTotal)} spent this week vs ${formatINR(wow.lastWeekTotal)} last week).`,
          iconName: "trend-up",
          action: {
            label: "View Analytics",
            onClick: () => navigate("/insights"),
          },
        });
      } else if (wow.percentChange <= -15) {
        alerts.push({
          id: `wow-low-${wow.percentChange}`,
          type: "success",
          category: "insights",
          title: "Efficient Spend Velocity",
          description: `Excellent, Sir! Weekly spending is down by ${Math.abs(wow.percentChange)}% (${formatINR(wow.thisWeekTotal)} spent vs ${formatINR(wow.lastWeekTotal)} last week).`,
          iconName: "trend-down",
          action: {
            label: "View Analytics",
            onClick: () => navigate("/insights"),
          },
        });
      }
    }

    // F. Savings goal milestones
    if (savingGoals) {
      for (const goal of savingGoals) {
        const pct =
          goal.targetAmount > 0
            ? (goal.currentAllocated / goal.targetAmount) * 100
            : 0;
        if (goal.currentAllocated >= goal.targetAmount) {
          alerts.push({
            id: `goal-milestone-funded-${goal.id}-${goal.targetAmount}`,
            type: "success",
            category: "insights",
            title: "Goal Achieved!",
            description: `Congratulations, Sir! '${goal.name}' is fully funded at ${formatINR(goal.targetAmount)}.`,
            iconName: "goal",
            action: {
              label: "View Goals",
              onClick: () => navigate("/savings"),
            },
          });
        } else if (pct >= 90) {
          alerts.push({
            id: `goal-milestone-almost-${goal.id}-${Math.floor(pct)}`,
            type: "success",
            category: "insights",
            title: "Goal Near Completion",
            description: `'${goal.name}' is ${Math.round(pct)}% funded (${formatINR(goal.currentAllocated)} / ${formatINR(goal.targetAmount)}).`,
            iconName: "goal",
            action: {
              label: "View Goals",
              onClick: () => navigate("/savings"),
            },
          });
        }
      }
    }

    return alerts;
  }, [
    budget,
    spent,
    spentPct,
    monthYear,
    subAlerts,
    catAlerts,
    advisor,
    wow,
    savingGoals,
    navigate,
    setTransferConfig,
    setIsTransferOpen,
  ]);

  // Compile currently visible alerts
  const visibleAlerts = useMemo(() => {
    return activeAlerts.filter(
      (alert) => !dismissedAlertKeys.includes(alert.id)
    );
  }, [activeAlerts, dismissedAlertKeys]);

  // Check for unseen alerts
  const unreadAlerts = useMemo(() => {
    return visibleAlerts.filter((alert) => !seenAlertKeys.includes(alert.id));
  }, [visibleAlerts, seenAlertKeys]);

  const hasUnread = unreadAlerts.length > 0;

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    // Mark current active alerts as seen
    const activeIds = activeAlerts.map((a) => a.id);
    localStorage.setItem("flo_seen_alerts", JSON.stringify(activeIds));
    setSeenAlertKeys(activeIds);

    // Clean up dismissed alerts from localStorage/state that are no longer active
    const activeIdsSet = new Set(activeIds);
    const cleanedDismissed = dismissedAlertKeys.filter((id) =>
      activeIdsSet.has(id)
    );
    if (cleanedDismissed.length !== dismissedAlertKeys.length) {
      localStorage.setItem(
        "flo_dismissed_alerts",
        JSON.stringify(cleanedDismissed)
      );
      setDismissedAlertKeys(cleanedDismissed);
    }
  };

  const handleDismissAlert = (id: string) => {
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
