import { useEffect, useRef, useCallback } from "react";
import { useProfile } from "./useProfile";
import { db } from "../db/database";
import { todayISO, getCurrentMonthYear } from "../utils/dateUtils";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { formatINR } from "../utils/currency";

/**
 * Robust notification scheduler for offline-first PWAs.
 *
 * Strategy:
 *  1. On every `visibilitychange` → "visible", check if we're past the
 *     scheduled time and haven't fired today. If so, fire immediately.
 *     This handles the common case of the user backgrounding the app and
 *     returning later — the notification "catches up" on open.
 *
 *  2. Keep a `setTimeout` pointing at the scheduled time as a bonus.
 *     It works when the tab stays open on desktop, but is not relied upon.
 *
 *  3. Persist `lastNotificationDate` in the Profile (IndexedDB) so we:
 *     - never double-fire on the same day
 *     - can always catch up if the user opens the app after the scheduled time
 */
export function useNotificationScheduler() {
  const { profile } = useProfile();

  // Stable refs to avoid stale closures in the visibility listener
  const enabledRef = useRef(false);
  const timeRef = useRef("20:00");

  useEffect(() => {
    enabledRef.current = !!profile?.notificationsEnabled;
    timeRef.current = profile?.notificationTime || "20:00";
  }, [profile?.notificationsEnabled, profile?.notificationTime]);

  // ── Core: check conditions and fire if needed ─────────────────────────────
  const checkAndFire = useCallback(async () => {
    if (!enabledRef.current) return;
    if (Notification.permission !== "granted") return;

    // Always read fresh from DB to avoid stale React closure data
    const freshProfile = await db.profile.get(1);
    if (!freshProfile?.notificationsEnabled) return;

    const today = todayISO(); // "YYYY-MM-DD"

    // ── Dedup: already fired today? ──────────────────────────────────────
    if (freshProfile.lastNotificationDate === today) return;

    // ── Time gate: is it past the scheduled time? ────────────────────────
    const [hour, minute] = (freshProfile.notificationTime || "20:00")
      .split(":")
      .map(Number);
    const now = new Date();
    const scheduledToday = new Date();
    scheduledToday.setHours(hour, minute, 0, 0);

    if (now.getTime() < scheduledToday.getTime()) return; // too early

    // ── Passed all gates — build and fire ────────────────────────────────
    const monthYear = getCurrentMonthYear();
    const todayDate = startOfDay(new Date());

    const alerts: {
      title: string;
      body: string;
      tag: string;
      url: string;
    }[] = [];

    // 1. Autopay Subscriptions
    if (freshProfile.notifyAutopay !== false) {
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

    // 2. Committed Expenses
    if (freshProfile.notifyBills !== false) {
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

    // 3. Budget
    if (freshProfile.notifyBudget !== false) {
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

    // ── Dispatch notifications ───────────────────────────────────────────
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
          `Hey ${freshProfile.displayName || "there"}, anything to log today?`,
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

    // ── Mark today as fired ──────────────────────────────────────────────
    await db.profile.update(1, { lastNotificationDate: today });
  }, []);

  // ── Effect 1: visibilitychange listener (the primary mechanism) ─────────
  useEffect(() => {
    if (!profile || !profile.notificationsEnabled) return;

    // Fire on initial mount too (handles "user just opened the app")
    checkAndFire();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkAndFire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [profile?.notificationsEnabled, checkAndFire]);

  // ── Effect 2: setTimeout as a bonus for open-tab scenarios ──────────────
  useEffect(() => {
    if (!profile || !profile.notificationsEnabled) return;

    const [hour, minute] = (profile.notificationTime || "20:00")
      .split(":")
      .map(Number);

    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (now.getTime() >= target.getTime()) {
      // Already past today's time — schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timerId = setTimeout(() => {
      checkAndFire();
    }, delay);

    return () => clearTimeout(timerId);
  }, [profile?.notificationsEnabled, profile?.notificationTime, checkAndFire]);

  // ── Effect 3: Clear app badge on mount ──────────────────────────────────
  useEffect(() => {
    if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(console.error);
    }
  }, []);
}
