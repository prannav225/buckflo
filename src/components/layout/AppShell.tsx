import { type ReactNode, useState, useMemo, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Calendar,
  PiggyBank,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useMonthSummary,
} from "../../db/hooks";
import {
  useSubscriptionAlerts,
  useCategoryBudgetAlerts,
  useSmartAllocationPrompt,
  useWeekOverWeek,
} from "../../hooks/useAnalytics";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { formatINR } from "../../utils/currency";
import { createPortal } from "react-dom";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { TransferSheet } from "../TransferSheet";

interface AppShellProps {
  children: ReactNode;
}

interface NotificationItem {
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

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Overlay states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<{
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }>({
    direction: "savings_to_expenditure",
    amount: "",
    note: "",
  });

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
  const subAlerts = useSubscriptionAlerts() || [];
  const catAlerts = useCategoryBudgetAlerts() || [];
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
  ]);

  // Clean dismissed alerts on mount or when active items change
  useEffect(() => {
    const activeIds = new Set(activeAlerts.map((a) => a.id));
    const cleanedDismissed = dismissedAlertKeys.filter((id) =>
      activeIds.has(id),
    );
    if (cleanedDismissed.length !== dismissedAlertKeys.length) {
      localStorage.setItem(
        "flo_dismissed_alerts",
        JSON.stringify(cleanedDismissed),
      );
      setDismissedAlertKeys(cleanedDismissed);
    }
  }, [activeAlerts]);

  // Compile currently visible alerts
  const visibleAlerts = useMemo(() => {
    return activeAlerts.filter(
      (alert) => !dismissedAlertKeys.includes(alert.id),
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
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlertKeys((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("flo_dismissed_alerts", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <div className="header-scrim" />
      <main className="page">
        {/* ── Persistent Global Header ────────────────────────────────────────── */}
        <header className="page-header">
          <div className="brand-logo-pill">
            <h1 className="brand-title">flo</h1>
          </div>
          <div className="header-actions-pill">
            <button
              onClick={toggleTheme}
              className="header-theme-btn"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              id="theme-switcher"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="header-actions-separator" />

            <button
              onClick={openNotifications}
              className="header-bell-btn"
              aria-label="Open notifications"
              title="Notifications"
              id="header-notification-btn"
              style={{ position: "relative" }}
            >
              <Bell size={16} />
              {hasUnread && <span className="bell-badge" />}
            </button>
          </div>
        </header>

        {children}
      </main>

      <BottomNav />

      {/* Sliding Glassmorphic Notifications sheet */}
      <NotificationSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={visibleAlerts}
        onDismiss={handleDismissAlert}
      />

      {/* Global Transfer Sheet (for Advisor prompt action) */}
      <TransferSheet
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        savingsBalance={0}
        defaultDirection={transferConfig.direction}
        defaultAmount={transferConfig.amount}
        defaultNote={transferConfig.note}
      />
    </>
  );
}

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: NotificationItem[];
  onDismiss: (id: string) => void;
}

function NotificationSheet({
  isOpen,
  onClose,
  alerts,
  onDismiss,
}: NotificationSheetProps) {
  useEffect(() => {
    if (isOpen) {
      updateSheetOpenState();
      return () => {
        setTimeout(updateSheetOpenState, 0);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const systemAlerts = alerts.filter((a) => a.category === "alerts");
  const bills = alerts.filter((a) => a.category === "bills");
  const insights = alerts.filter((a) => a.category === "insights");

  return createPortal(
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Notification Hub"
    >
      <div className="sheet-panel notification-sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
              Notification Hub
            </h2>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Smart ledger analysis & alerts
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "8px", borderRadius: "50%" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List content */}
        <div className="notification-list-scroll">
          {alerts.length === 0 ? (
            <div className="notification-empty-state">
              <div className="notification-empty-icon">
                <Bell size={28} />
              </div>
              <h4>All Systems Nominal</h4>
              <p>
                You are operating perfectly within your budget parameters, Sir.
              </p>
            </div>
          ) : (
            <>
              {/* System Alerts */}
              {systemAlerts.length > 0 && (
                <div className="notification-section">
                  <div className="notification-section-title">
                    Critical & Warnings
                  </div>
                  <div className="notification-section-items">
                    {systemAlerts.map((alert) => (
                      <NotificationCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                        onCloseSheet={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Bills */}
              {bills.length > 0 && (
                <div className="notification-section">
                  <div className="notification-section-title">
                    Upcoming Bills
                  </div>
                  <div className="notification-section-items">
                    {bills.map((alert) => (
                      <NotificationCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                        onCloseSheet={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {insights.length > 0 && (
                <div className="notification-section">
                  <div className="notification-section-title">
                    Smart Insights & Milestones
                  </div>
                  <div className="notification-section-items">
                    {insights.map((alert) => (
                      <NotificationCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                        onCloseSheet={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NotificationCard({
  alert,
  onDismiss,
  onCloseSheet,
}: {
  alert: NotificationItem;
  onDismiss: (id: string) => void;
  onCloseSheet: () => void;
}) {
  const getAlertIcon = (iconName: string) => {
    switch (iconName) {
      case "alert":
        return <AlertTriangle size={18} />;
      case "budget":
        return <TrendingDown size={18} />;
      case "trend-up":
        return <TrendingUp size={18} />;
      case "trend-down":
        return <TrendingUp size={18} style={{ transform: "rotate(180deg)" }} />;
      case "sub":
        return <Calendar size={18} />;
      case "goal":
        return <PiggyBank size={18} />;
      case "advisor":
        return <Lightbulb size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div
      className={`notification-item notification-item-${alert.type} fade-in-up`}
    >
      <div className="notification-item-icon-wrapper">
        {getAlertIcon(alert.iconName)}
      </div>
      <div className="notification-item-content">
        <div className="notification-item-header">
          <h4 className="notification-item-title">{alert.title}</h4>
          <button
            onClick={() => onDismiss(alert.id)}
            className="notification-item-dismiss-btn"
            title="Dismiss notification"
            aria-label="Dismiss"
          >
            <Check size={14} />
          </button>
        </div>
        <p className="notification-item-desc">{alert.description}</p>
        {alert.action && (
          <button
            onClick={() => {
              alert.action?.onClick();
              onCloseSheet();
            }}
            className="notification-item-action-btn"
          >
            <span>{alert.action.label}</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
