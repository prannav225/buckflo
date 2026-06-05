import { useMemo } from "react";
import type { NotificationItem } from "./types";
import { formatINR } from "../../utils/currency";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { updateSubscription } from "../../db/database";
import { advanceDueDate } from "../../utils/autopay";
import toast from "react-hot-toast";

export function useActiveAlerts({
  budget,
  spent,
  spentPct,
  monthYear,
  monthSetup,
  subAlerts,
  catAlerts,
  advisor,
  wow,
  savingGoals,
  approvedSubscriptions,
  navigate,
  setTransferConfig,
  setIsTransferOpen,
}: any) {
  return useMemo(() => {
    const alerts: NotificationItem[] = [];

    if (budget > 0) {
      if (spent >= budget) {
        alerts.push({
          id: `budget-exceeded-${monthYear}`,
          type: "danger",
          category: "alerts",
          title: "Over your target",
          description: `You've spent the remaining budget for this month.`,
          iconName: "alert",
          action: {
            label: "View Feed",
            onClick: () => navigate("/monthly"),
          },
        });
      } else if (spentPct >= 80) {
        alerts.push({
          id: `budget-warning-${monthYear}`,
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

    for (const cat of catAlerts) {
      alerts.push({
        id: `cat-alert-${monthYear}-${cat.category}-${cat.isExceeded ? "exceeded" : "warning"}`,
        type: cat.isExceeded ? "danger" : "warning",
        category: "alerts",
        title: `${cat.category} Budget ${cat.isExceeded ? "Exceeded" : "Alert"}`,
        description: cat.isExceeded
          ? `${cat.category} limit of ${formatINR(cat.budget)} exceeded. Spent ${formatINR(cat.spent)}.`
          : `Spent ${Math.round(cat.percentUsed)}% of ${formatINR(cat.budget)} category limit (${formatINR(cat.spent)} used).`,
        iconName: cat.isExceeded ? "alert" : "budget",
        action: {
          label: "View Feed",
          onClick: () => navigate("/monthly"),
        },
      });
    }

    // ── Committed Expense Due Date Alerts ─────────────────────────────
    if (monthSetup?.committedExpenses) {
      const today = new Date().getDate();
      for (const ce of monthSetup.committedExpenses) {
        if (ce.isPaid || !ce.dueDay) continue;
        const daysUntilDue = ce.dueDay - today;

        if (daysUntilDue === 0) {
          alerts.push({
            id: `committed-due-today-${ce.name}-${monthYear}`,
            type: "warning",
            category: "bills",
            title: `${ce.name} is due today`,
            description: `${formatINR(ce.amount)} for ${ce.name} is due today. Go to Monthly → Committed Expenses to mark it as paid.`,
            iconName: "sub",
            action: {
              label: "Go to Monthly",
              onClick: () => navigate("/monthly?tab=committed"),
            },
          });
        } else if (daysUntilDue > 0 && daysUntilDue <= 2) {
          alerts.push({
            id: `committed-due-soon-${ce.name}-${monthYear}-${daysUntilDue}`,
            type: "info",
            category: "bills",
            title: `${ce.name} due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`,
            description: `${formatINR(ce.amount)} for ${ce.name} is due on the ${ce.dueDay}${ce.dueDay === 1 ? "st" : ce.dueDay === 2 ? "nd" : ce.dueDay === 3 ? "rd" : "th"}.`,
            iconName: "sub",
            action: {
              label: "Go to Monthly",
              onClick: () => navigate("/monthly?tab=committed"),
            },
          });
        }
      }
    }


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
          description: `Excellent! Weekly spending is down by ${Math.abs(wow.percentChange)}% (${formatINR(wow.thisWeekTotal)} spent vs ${formatINR(wow.lastWeekTotal)} last week).`,
          iconName: "trend-down",
          action: {
            label: "View Analytics",
            onClick: () => navigate("/insights"),
          },
        });
      }
    }

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
            description: `Congratulations! '${goal.name}' is fully funded at ${formatINR(goal.targetAmount)}.`,
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

    if (approvedSubscriptions) {
      const today = startOfDay(new Date());
      for (const sub of approvedSubscriptions) {
        try {
          const due = startOfDay(parseISO(sub.nextDueDate));
          const daysLeft = differenceInDays(due, today);

          if (daysLeft >= 0 && daysLeft <= 7) {
            const handleSkip = async () => {
              try {
                const newDueDate = advanceDueDate(
                  sub.nextDueDate,
                  sub.frequency,
                );
                await updateSubscription(sub.id!, { nextDueDate: newDueDate });
                toast.success(
                  `Skipped: ${sub.name} advanced to ${newDueDate} ✓`,
                );
              } catch {
                toast.error("Failed to skip subscription.");
              }
            };

            const handlePause = async () => {
              try {
                await updateSubscription(sub.id!, { status: "paused" });
                toast.success(
                  `Subscription '${sub.name}' paused successfully ✓`,
                );
              } catch {
                toast.error("Failed to pause subscription.");
              }
            };

            const isDueTomorrow = daysLeft <= 1;

            alerts.push({
              id: `approved-sub-due-${sub.id}-${sub.nextDueDate}`,
              type: isDueTomorrow
                ? "danger"
                : daysLeft <= 2
                  ? "warning"
                  : "info",
              category: "bills",
              title: isDueTomorrow
                ? `Autopay Due Tomorrow: ${sub.name}`
                : `Upcoming Auto-Pay: ${sub.name}`,
              description: isDueTomorrow
                ? `Autopay for ${sub.name} (₹${sub.amount.toFixed(2)}) is due tomorrow. Action will be taken automatically.`
                : `${formatINR(sub.amount)} is auto-renewing in ${daysLeft} days (${sub.nextDueDate}).`,
              iconName: "sub",
              action: {
                label: "View Subscription",
                onClick: () => navigate("/monthly?tab=subscriptions"),
              },
              actions: [
                {
                  label: "Skip Cycle",
                  onClick: handleSkip,
                },
                {
                  label: "Pause Autopay",
                  onClick: handlePause,
                },
              ],
            });
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    return alerts;
  }, [
    budget,
    spent,
    spentPct,
    monthYear,
    monthSetup,
    subAlerts,
    catAlerts,
    advisor,
    wow,
    savingGoals,
    approvedSubscriptions,
    navigate,
    setTransferConfig,
    setIsTransferOpen,
  ]);
}
