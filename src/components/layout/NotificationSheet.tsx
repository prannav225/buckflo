import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Bell } from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { NotificationCard } from "./NotificationCard";
import { type NotificationItem } from "../../hooks/useNotificationHub";

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: NotificationItem[];
  onDismiss: (id: string) => void;
}

export function NotificationSheet({
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
      <div className="sheet-panel max-h-[85vh] flex flex-col">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              Notification Hub
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              Smart ledger analysis & alerts
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto pr-0.5 notification-list-scroll">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-15 px-5 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-(--bg-glass) border border-black/8 dark:border-white/6 text-(--text-muted) mb-4 shadow-(--glass-shadow)">
                <Bell size={28} />
              </div>
              <h4 className="font-sans text-[15px] font-semibold text-(--text) mt-0 mb-1.5">
                All Systems Nominal
              </h4>
              <p className="font-sans text-[0.8125rem] text-(--text-muted) max-w-[240px] m-0 leading-[1.4]">
                You are operating perfectly within your budget parameters, Sir.
              </p>
            </div>
          ) : (
            <>
              {/* System Alerts */}
              {systemAlerts.length > 0 && (
                <div className="mb-6">
                  <div className="font-sans text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] mb-2.5">
                    Critical & Warnings
                  </div>
                  <div className="flex flex-col gap-2.5">
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
                <div className="mb-6">
                  <div className="font-sans text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] mb-2.5">
                    Upcoming Bills
                  </div>
                  <div className="flex flex-col gap-2.5">
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
                <div className="mb-3">
                  <div className="font-sans text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] mb-2.5">
                    Smart Insights & Milestones
                  </div>
                  <div className="flex flex-col gap-2.5">
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
