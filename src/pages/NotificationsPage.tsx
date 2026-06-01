/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import toast from "react-hot-toast";
import { CustomTimePicker } from "../components/ui/CustomTimePicker";

export function NotificationsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setEnabled(profile.notificationsEnabled ?? false);
      setTime(profile.notificationTime ?? "20:00");
    }
  }, [profile]);

  const handleToggle = async () => {
    const nextVal = !enabled;
    setSubmitting(true);
    try {
      if (nextVal) {
        if (!("Notification" in window) || !Notification.requestPermission) {
          toast.error("This browser does not support notifications.");
          setSubmitting(false);
          return;
        }

        if (Notification.permission === "denied") {
          toast.error(
            "Notifications are blocked. Please reset site permissions in your browser's address bar settings.",
          );
          setSubmitting(false);
          return;
        }

        let permission: NotificationPermission;
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = await new Promise<NotificationPermission>((resolve) => {
            Notification.requestPermission(resolve);
          });
        }

        if (permission === "granted") {
          await updateProfile({
            notificationsEnabled: true,
            notificationPermissionAsked: true,
          });
          setEnabled(true);
          toast.success("Daily reminders enabled!");

          // Attempt client-side push subscription registration for future backend integration
          if ("serviceWorker" in navigator) {
            try {
              const reg = await navigator.serviceWorker.ready;
              if (reg.pushManager) {
                const sub = await reg.pushManager.getSubscription();
                console.log("Existing Web Push subscription:", sub);
              }
            } catch (err) {
              console.warn(
                "Service worker push registration check skipped:",
                err,
              );
            }
          }
        } else {
          await updateProfile({
            notificationsEnabled: false,
            notificationPermissionAsked: true,
          });
          setEnabled(false);
          toast.error(
            "Notification permission denied. Please enable them in browser settings.",
          );
        }
      } else {
        await updateProfile({
          notificationsEnabled: false,
        });
        setEnabled(false);
        toast.success("Daily reminders disabled.");
      }
    } catch (err) {
      console.error("Failed to update notification settings:", err);
      toast.error(
        "Notification request blocked. If you are in a preview iframe, please open the app in a new tab.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted) hover:text-(--text) cursor-pointer bg-transparent border-0 outline-none"
            onClick={() => navigate("/profile")}
            title="Back to profile"
            id="notifications-btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">Notifications</h2>
        </div>
      </div>

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

          {enabled && (
            <div className="form-group border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-between gap-4 animate-fade-in">
              <label
                htmlFor="notifications-time-picker"
                className="label m-0 text-xs text-(--text-secondary) font-medium"
              >
                Reminder Time
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
                    toast.success(`Reminder time set to ${newTime}`);
                  } catch (err) {
                    console.error("Failed to save time:", err);
                    toast.error("Failed to update reminder time.");
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
