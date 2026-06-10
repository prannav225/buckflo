import { useEffect } from "react";
import { useProfile } from "./useProfile";
import { db } from "../db/database";
import { todayISO, getCurrentMonthYear } from "../utils/dateUtils";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { formatINR } from "../utils/currency";

export function useNotificationScheduler() {
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile || !profile.notificationsEnabled) return;

    const [hour, minute] = (profile.notificationTime || "20:00")
      .split(":")
      .map(Number);

    const scheduleNextCheck = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(hour, minute, 0, 0);

      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      const timerId = setTimeout(async () => {
        if (Notification.permission === "granted") {
          const today = todayISO();
          const monthYear = getCurrentMonthYear();
          const todayDate = startOfDay(new Date());

          const alerts: {
            title: string;
            body: string;
            tag: string;
            url: string;
          }[] = [];

          // 1. Check Autopay Subscriptions
          if (profile.notifyAutopay !== false) {
            const subs = await db.subscriptions
              .where("status")
              .equals("active")
              .toArray();
            for (const sub of subs) {
              try {
                const due = startOfDay(parseISO(sub.nextDueDate));
                const daysLeft = differenceInDays(due, todayDate);
                if (daysLeft === 1) {
                  alerts.push({
                    title: `Autopay Tomorrow: ${sub.name}`,
                    body: `${formatINR(sub.amount)} will be auto-deducted tomorrow.`,
                    tag: `sub-${sub.id}`,
                    url: "/monthly?tab=subscriptions",
                  });
                }
              } catch {
                /* empty */
              }
            }
          }

          // 2. Check Committed Expenses
          if (profile.notifyBills !== false) {
            const setup = await db.monthSetups
              .where("monthYear")
              .equals(monthYear)
              .first();
            if (setup?.committedExpenses) {
              const currentDay = new Date().getDate();
              for (const ce of setup.committedExpenses) {
                if (!ce.isPaid && ce.dueDay === currentDay) {
                  alerts.push({
                    title: `Bill Due Today: ${ce.name}`,
                    body: `${formatINR(ce.amount)} is due today. Tap to mark as paid.`,
                    tag: `bill-${ce.name}`,
                    url: "/monthly?tab=committed",
                  });
                }
              }
            }
          }

          // 3. Check Budget
          if (profile.notifyBudget !== false) {
            const setup = await db.monthSetups
              .where("monthYear")
              .equals(monthYear)
              .first();
            const budget = setup?.monthlyBudget ?? 0;
            if (budget > 0) {
              const monthTxs = await db.transactions
                .filter(
                  (t) =>
                    t.date.startsWith(monthYear) &&
                    t.type === "debit" &&
                    t.category !== "transfer" &&
                    t.category !== "Transfer" &&
                    t.category !== "adjustment" &&
                    !t.isCommitted,
                )
                .toArray();

              const spent = monthTxs.reduce((sum, t) => sum + t.amount, 0);
              const pct = (spent / budget) * 100;

              if (pct >= 100) {
                alerts.push({
                  title: "Budget Exceeded",
                  body: `You've spent ${formatINR(spent)}, exceeding your ${formatINR(budget)} limit!`,
                  tag: "budget-100",
                  url: "/home",
                });
              } else if (pct >= 90) {
                alerts.push({
                  title: "Budget Warning",
                  body: `You've used ${Math.round(pct)}% of your monthly budget.`,
                  tag: "budget-90",
                  url: "/home",
                });
              }
            }
          }

          // Trigger Notifications
          const showPush = (
            title: string,
            body: string,
            url: string,
            tag: string,
          ) => {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready
                .then((reg) => {
                  reg.showNotification(title, {
                    body,
                    badge: "/buckflo_favicon.png",
                    tag,
                    data: { url },
                  } as NotificationOptions);
                })
                .catch(() => fallback(title, body, url, tag));
            } else {
              fallback(title, body, url, tag);
            }
          };

          const fallback = (
            title: string,
            body: string,
            url: string,
            tag: string,
          ) => {
            const n = new Notification(title, {
              body,
              tag,
            });
            n.onclick = () => {
              window.focus();
              window.location.pathname = url;
            };
          };

          if (alerts.length > 0) {
            // Bundle alerts if there are too many, or show individually if few
            if (alerts.length > 2) {
              showPush(
                "Smart Alerts",
                `You have ${alerts.length} important updates requiring your attention.`,
                "/notifications",
                "bundled-alerts",
              );
            } else {
              alerts.forEach((a) => showPush(a.title, a.body, a.url, a.tag));
            }
          } else {
            // 4. Fallback Daily Reminder
            const todayTxs = await db.transactions
              .where("date")
              .equals(today)
              .toArray();
            const hasRealTxs = todayTxs.some(
              (t) =>
                t.category !== "transfer" &&
                t.category !== "Transfer" &&
                t.category !== "starting-transfer" &&
                t.category !== "adjustment",
            );
            if (!hasRealTxs) {
              showPush(
                "Daily Reminder",
                `Hey ${profile.displayName || "there"}, anything to log today?`,
                "/home",
                "daily-reminder",
              );
            }
          }

          if ("setAppBadge" in navigator) {
            navigator
              .setAppBadge(alerts.length > 0 ? alerts.length : 1)
              .catch(console.error);
          }
        }

        scheduleNextCheck();
      }, delay);

      return timerId;
    };

    const timerId = scheduleNextCheck();

    return () => clearTimeout(timerId);
  }, [profile]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(console.error);
    }
  }, []);
}
