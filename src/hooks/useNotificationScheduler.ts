import { useEffect, useRef, useCallback } from "react";
import { useProfile } from "./useProfile";
import { db } from "../db/database";
import { todayISO, getCurrentMonthYear } from "../utils/dateUtils";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import { formatINR } from "../utils/currency";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Robust notification scheduler using native OS alarms via Capacitor.
 * 
 * 1. Smart Alerts: Fired immediately on app open / visibility change (limited to once per day).
 * 2. Daily Reminder: Handed over to the native OS to fire exactly at the scheduled time.
 */
export function useNotificationScheduler() {
  const { profile } = useProfile();

  const enabledRef = useRef(false);
  const timeRef = useRef("20:00");

  useEffect(() => {
    enabledRef.current = !!profile?.notificationsEnabled;
    timeRef.current = profile?.notificationTime || "20:00";
  }, [profile?.notificationsEnabled, profile?.notificationTime]);

  // ── Smart Alerts (Immediate Catch-up) ─────────────────────────────────────
  const checkSmartAlerts = useCallback(async () => {
    if (!enabledRef.current) return;

    // Request permissions for native or web
    if (Capacitor.isNativePlatform()) {
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }
    } else {
      if (Notification.permission !== "granted") return;
    }

    const freshProfile = await db.profile.get(1);
    if (!freshProfile?.notificationsEnabled) return;

    const today = todayISO();

    // Dedup: only check smart alerts once per day
    if (freshProfile.lastNotificationDate === today) return;

    const monthYear = getCurrentMonthYear();
    const todayDate = startOfDay(new Date());

    const alerts: { title: string; body: string; id: number; url: string }[] = [];
    let alertIdCounter = 1000; // start native IDs at 1000 to avoid collision

    // 1. Autopay Subscriptions
    if (freshProfile.notifyAutopay !== false) {
      const subs = await db.subscriptions.where("status").equals("active").toArray();
      for (const sub of subs) {
        try {
          const due = startOfDay(parseISO(sub.nextDueDate));
          const daysLeft = differenceInDays(due, todayDate);
          if (daysLeft === 1) {
            alerts.push({
              id: alertIdCounter++,
              title: `Autopay Tomorrow: ${sub.name}`,
              body: `${formatINR(sub.amount)} will be auto-deducted tomorrow.`,
              url: "/monthly?tab=subscriptions",
            });
          }
        } catch { }
      }
    }

    // 2. Committed Expenses
    if (freshProfile.notifyBills !== false) {
      const setup = await db.monthSetups.where("monthYear").equals(monthYear).first();
      if (setup?.committedExpenses) {
        const currentDay = new Date().getDate();
        for (const ce of setup.committedExpenses) {
          if (!ce.isPaid && ce.dueDay === currentDay) {
            alerts.push({
              id: alertIdCounter++,
              title: `Bill Due Today: ${ce.name}`,
              body: `${formatINR(ce.amount)} is due today. Tap to mark as paid.`,
              url: "/monthly?tab=committed",
            });
          }
        }
      }
    }

    // 3. Budget
    if (freshProfile.notifyBudget !== false) {
      const setup = await db.monthSetups.where("monthYear").equals(monthYear).first();
      const budget = setup?.monthlyBudget ?? 0;
      if (budget > 0) {
        const monthTxs = await db.transactions
          .filter((t) => t.date.startsWith(monthYear) && t.type === "debit" && !t.isCommitted && t.category !== "transfer" && t.category !== "Transfer" && t.category !== "adjustment")
          .toArray();

        const spent = monthTxs.reduce((sum, t) => sum + t.amount, 0);
        const pct = (spent / budget) * 100;

        if (pct >= 100) {
          alerts.push({
            id: alertIdCounter++,
            title: "Budget Exceeded",
            body: `You've spent ${formatINR(spent)}, exceeding your ${formatINR(budget)} limit!`,
            url: "/home",
          });
        } else if (pct >= 90) {
          alerts.push({
            id: alertIdCounter++,
            title: "Budget Warning",
            body: `You've used ${Math.round(pct)}% of your monthly budget.`,
            url: "/home",
          });
        }
      }
    }

    if (alerts.length > 0) {
      if (Capacitor.isNativePlatform()) {
        const nativeAlerts = alerts.map(a => ({
          id: a.id,
          title: a.title,
          body: a.body,
          smallIcon: "ic_stat_icon",
          iconColor: "#d97757",
          extra: { url: a.url }
        }));
        await LocalNotifications.schedule({ notifications: nativeAlerts });
      } else {
        alerts.forEach((a) => {
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(a.title, { body: a.body, data: { url: a.url }, badge: "/buckflo_favicon.png" });
            }).catch(() => new Notification(a.title, { body: a.body }));
          } else {
            new Notification(a.title, { body: a.body });
          }
        });
      }
      // Only mark smart alerts as fired if we actually found something
      await db.profile.update(1, { lastNotificationDate: today });
    }
  }, []);

  // ── Visibility Listener for Smart Alerts ──────────────────────────────────
  useEffect(() => {
    checkSmartAlerts(); // check on mount

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSmartAlerts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [checkSmartAlerts]);

  // ── Native Daily Reminder (OS Level Alarm) ────────────────────────────────
  useEffect(() => {
    if (!profile) return;

    const setupNativeDailyAlarm = async () => {
      if (!Capacitor.isNativePlatform()) return;

      // Clear any previously scheduled daily alarms (ID: 999 is our designated daily reminder ID)
      await LocalNotifications.cancel({ notifications: [{ id: 999 }] });

      if (!profile.notificationsEnabled) return;

      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') return;

      const [hour, minute] = (profile.notificationTime || "20:00").split(":").map(Number);

      // Schedule the native repeating alarm
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999, // Static ID for the daily reminder so we can easily cancel/replace it
            title: "Daily Reminder",
            body: `Hey ${profile.displayName || "there"}, anything to log today?`,
            smallIcon: "ic_stat_icon",
            iconColor: "#d97757",
            schedule: {
              on: {
                hour: hour,
                minute: minute,
              },
              allowWhileIdle: true, // Fire even in Doze mode / deep sleep
            },
            extra: { url: "/home" }
          }
        ]
      });
    };

    setupNativeDailyAlarm();
  }, [profile?.notificationsEnabled, profile?.notificationTime, profile?.displayName]);

  // ── Web Fallback for Daily Reminder ───────────────────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform() || !profile || !profile.notificationsEnabled) return;

    // Web-only: Fallback timeout approach
    const [hour, minute] = (profile.notificationTime || "20:00").split(":").map(Number);
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    const now = new Date();
    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const delay = target.getTime() - now.getTime();

    const timerId = setTimeout(async () => {
      if (Notification.permission === "granted") {
        const today = todayISO();
        const todayTxs = await db.transactions.where("date").equals(today).toArray();
        const hasRealTxs = todayTxs.some(
          (t) => t.category !== "transfer" && t.category !== "Transfer" && t.category !== "adjustment"
        );
        if (!hasRealTxs) {
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification("Daily Reminder", {
                body: `Hey ${profile.displayName || "there"}, anything to log today?`,
                data: { url: "/home" },
                badge: "/buckflo_favicon.png",
              });
            }).catch(() => { });
          } else {
            new Notification("Daily Reminder", { body: `Hey ${profile.displayName || "there"}, anything to log today?` });
          }
        }
      }
    }, delay);

    return () => clearTimeout(timerId);
  }, [profile]);
}
