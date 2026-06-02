import { useEffect } from "react";
import { useProfile } from "./useProfile";
import { db } from "../db/database";
import { todayISO } from "../utils/dateUtils";

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

      // If target time is already in the past for today, schedule for tomorrow
      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      const timerId = setTimeout(async () => {
        if (Notification.permission === "granted") {
          const today = todayISO();
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
            if ("serviceWorker" in navigator) {
              try {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification("buckflo", {
                  body: `Hey ${profile.displayName || "there"}, anything to log today?`,
                  icon: "/buckflo_appicon.svg",
                  badge: "/buckflo_favicon.svg",
                  tag: "daily-reminder",
                  renotify: true,
                } as NotificationOptions);
              } catch {
                // Fallback to new Notification if service worker is unavailable
                const n = new Notification("buckflo", {
                  body: `Hey ${profile.displayName || "there"}, anything to log today?`,
                  icon: "/buckflo_appicon.svg",
                  tag: "daily-reminder",
                });
                n.onclick = () => {
                  window.focus();
                  window.location.pathname = "/home";
                };
              }
            } else {
              const n = new Notification("buckflo", {
                body: `Hey ${profile.displayName || "there"}, anything to log today?`,
                icon: "/buckflo_appicon.svg",
                tag: "daily-reminder",
              });
              n.onclick = () => {
                window.focus();
                window.location.pathname = "/home";
              };
            }
          }
        }
        // Reschedule for tomorrow
        scheduleNextCheck();
      }, delay);

      return timerId;
    };

    const timerId = scheduleNextCheck();

    return () => {
      clearTimeout(timerId);
    };
  }, [
    profile?.notificationsEnabled,
    profile?.notificationTime,
    profile?.displayName,
    profile,
  ]);
}
