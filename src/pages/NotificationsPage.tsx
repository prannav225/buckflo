/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import toast from "react-hot-toast";
import { CustomTimePicker } from "../components/ui/CustomTimePicker";
import { useNotificationPermission } from "../hooks/useNotificationPermission";

export function NotificationsPage() {
  const { profile, updateProfile } = useProfile();
  const { permission, requestPermission, isGranted } = useNotificationPermission();
  const initialized = useRef(false);

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");
  const [notifyAutopay, setNotifyAutopay] = useState(true);
  const [notifyBills, setNotifyBills] = useState(true);
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      setEnabled(profile.notificationsEnabled ?? false);
      setTime(profile.notificationTime ?? "20:00");
      setNotifyAutopay(profile.notifyAutopay ?? true);
      setNotifyBills(profile.notifyBills ?? true);
      setNotifyBudget(profile.notifyBudget ?? true);
      initialized.current = true;
    }
  }, [profile]);

  const handleToggle = async () => {
    setSubmitting(true);
    try {
      if (!isGranted && !enabled) {
        // User is trying to enable but permission not granted
        const result = await requestPermission();
        if (result !== "granted") {
          toast.error("Notification permission was denied");
          setSubmitting(false);
          return;
        }
      }

      const nextVal = !enabled;
      await updateProfile({
        notificationsEnabled: nextVal,
      });
      setEnabled(nextVal);
      
      toast.success(nextVal ? "Daily reminders enabled!" : "Daily reminders disabled.");
      
      if (nextVal && "serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg.pushManager) {
            const sub = await reg.pushManager.getSubscription();
            console.log("Existing Web Push subscription:", sub);
          }
        } catch (err) {
          console.warn("Service worker push registration check skipped:", err);
        }
      }
    } catch (err) {
      console.error("Failed to update notification settings:", err);
      toast.error("Failed to update settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 fade-in-up delay-1">
        {/* Banner Card */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-(--accent)/10 flex items-center justify-center">
                <Bell size={20} className="text-(--accent)" />
              </div>
              <div>
                <div className="font-sans text-[0.9375rem] font-semibold text-(--text)">
                  Daily Reminder
                </div>
                <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                  Receive a prompt if no transactions are logged for the day
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleToggle}
              className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? "bg-(--accent)" : "bg-black/10 dark:bg-white/10"
              }`}
              id="notifications-toggle-reminders"
            >
              <span
                className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-1 -mt-2">
            {isGranted && (
              <p className="text-xs text-green-600 dark:text-green-400 m-0">✓ Permission granted</p>
            )}
            {permission === "denied" && (
              <p className="text-xs text-red-600 dark:text-red-400 m-0 leading-snug">
                Permission denied. Enable in your device settings to use notifications.
              </p>
            )}
          </div>

          {enabled && (
            <div className="form-group border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-between gap-4 animate-fade-in">
              <label
                htmlFor="notifications-time-picker"
                className="label m-0 text-xs text-(--text-secondary) font-medium"
              >
                Delivery Time
              </label>
              <CustomTimePicker
                id="notifications-time-picker"
                value={time}
                onChange={async (newTime) => {
                  setTime(newTime);
                  try {
                    await updateProfile({
                      notificationTime: newTime,
                    });
                    toast.success(`Delivery time set to ${newTime}`);
                  } catch (err) {
                    console.error("Failed to save time:", err);
                    toast.error("Failed to update delivery time.");
                  }
                }}
              />
            </div>
          )}
        </div>

        {enabled && (
          <div className="glass-card p-5 flex flex-col gap-4 animate-fade-in">
            <h3 className="font-sans text-sm font-semibold text-(--text) m-0 border-b border-black/5 dark:border-white/5 pb-2">
              Smart Alerts
            </h3>

            {/* Autopay Toggle */}
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="font-sans text-[0.875rem] font-medium text-(--text)">
                  Autopay Subscriptions
                </div>
                <div className="font-sans text-[11px] text-(--text-muted) mt-0.5">
                  Warns you 1 day before auto-deduction
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const nextVal = !notifyAutopay;
                    await updateProfile({ notifyAutopay: nextVal });
                    setNotifyAutopay(nextVal);
                  } catch {
                    toast.error("Failed to update setting");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifyAutopay
                    ? "bg-(--accent)"
                    : "bg-black/10 dark:bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    notifyAutopay ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Bills Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-sans text-[0.875rem] font-medium text-(--text)">
                  Committed Expenses
                </div>
                <div className="font-sans text-[11px] text-(--text-muted) mt-0.5">
                  Reminds you on the due date to pay
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const nextVal = !notifyBills;
                    await updateProfile({ notifyBills: nextVal });
                    setNotifyBills(nextVal);
                  } catch {
                    toast.error("Failed to update setting");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifyBills ? "bg-(--accent)" : "bg-black/10 dark:bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    notifyBills ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Budget Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-sans text-[0.875rem] font-medium text-(--text)">
                  Budget Limits
                </div>
                <div className="font-sans text-[11px] text-(--text-muted) mt-0.5">
                  Alerts if budget crosses 90% or 100%
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const nextVal = !notifyBudget;
                    await updateProfile({ notifyBudget: nextVal });
                    setNotifyBudget(nextVal);
                  } catch {
                    toast.error("Failed to update setting");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifyBudget
                    ? "bg-(--accent)"
                    : "bg-black/10 dark:bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    notifyBudget ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
