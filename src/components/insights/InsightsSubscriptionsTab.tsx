import { startOfDay, parseISO, differenceInDays, format } from "date-fns";
import {
  Lightbulb,
  Calendar,
  Clock,
  Play,
  Pause,
  CheckCircle,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatINR } from "../../utils/currency";
import { updateSubscription, type Subscription } from "../../db/database";
import { useConfirm } from "../../hooks/useConfirm";
import { useSubscriptionLogic } from "../../hooks/useSubscriptionLogic";

interface Props {
  openForm: (sub: Subscription | null) => void;
}

export function InsightsSubscriptionsTab({ openForm }: Props) {
  const { confirm, dialog: confirmDialog } = useConfirm();
  const {
    detectedSubs,
    approvedSubs,
    sortedSubs,
    totalCommitted,
    handleApproveSub,
    handleDeleteSub,
    toggleStatus,
  } = useSubscriptionLogic();

  // Calculate days remaining helper
  const getDaysLeft = (dateStr: string) => {
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(dateStr));
    return differenceInDays(due, today);
  };

  const getDaysBadgeColor = (days: number) => {
    if (days > 7)
      return {
        bg: "rgba(90,158,111,0.10)",
        text: "var(--credit)",
        border: "1px solid rgba(90,158,111,0.20)",
      };
    if (days >= 3)
      return {
        bg: "rgba(234,179,8,0.10)",
        text: "#b8960f",
        border: "1px solid rgba(234,179,8,0.20)",
      };
    return {
      bg: "rgba(224,85,69,0.10)",
      text: "var(--text)",
      border: "1px solid rgba(224,85,69,0.20)",
    };
  };

  return (
    <>
      {confirmDialog}
      <div className="fade-in-up flex flex-col gap-4">
        {/* Summary Card */}
        <div className="glass-card-strong px-5 py-4 text-center">
          <div className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
            Monthly Committed Spends
          </div>
          <div className="text-3xl font-display text-(--text)">
            {formatINR(totalCommitted)}
          </div>
          <div className="text-[0.6875rem] text-(--text-muted) mt-0.5">
            Across {approvedSubs.filter((s) => s.status === "active").length}{" "}
            active subscription(s)
          </div>
        </div>

        {/* Auto-detected Subscriptions Banner */}
        {detectedSubs.length > 0 && (
          <div className="glass-card p-[16px_18px] bg-[rgba(217,119,87,0.05)] shadow-(--glass-shadow-lg)">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} color="var(--accent)" />
              <h4 className="m-0 text-sm font-semibold text-(--text)">
                Review Detected Subscriptions
              </h4>
            </div>
            <p className="text-xs text-(--text-secondary) leading-relaxed m-[0_0_14px_0]">
              We scanned your transaction records and found{" "}
              {detectedSubs.length} potential subscription(s):
            </p>
            <div className="flex flex-col gap-2">
              {detectedSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between bg-(--bg-glass-strong) p-[10px_14px] rounded-(--r-md) border-(--glass-border)"
                >
                  <div>
                    <div className="text-[0.8125rem] font-semibold text-(--text)">
                      {sub.name}
                    </div>
                    <div className="text-[0.6875rem] text-(--text-muted) mt-0.5">
                      {formatINR(sub.amount)} • {sub.category}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary px-3 py-1.5 text-xs rounded-full h-auto shadow-none"
                      onClick={() => handleApproveSub(sub.id!)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-ghost px-3 py-1.5 text-xs text-(--text-muted)"
                      onClick={() => handleDeleteSub(sub.id!)}
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription List Title & Add Button */}
        <div className="flex justify-between items-center mt-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em] m-0">
              Committed Spends ({sortedSubs.length})
            </h3>
          </div>
          <button
            className="header-action-pill-btn h-7 px-2.5 text-xs inline-flex items-center gap-1"
            onClick={() => openForm(null)}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Cards List */}
        {sortedSubs.length === 0 ? (
          <div className="glass-card empty-state px-5 py-10">
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No subscriptions added</p>
            <p className="empty-state-desc">
              Log your recurring memberships, software services, and monthly
              bills here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sortedSubs.map((sub) => {
              const daysLeft = getDaysLeft(sub.nextDueDate);
              const badge = getDaysBadgeColor(daysLeft);
              const isPaused = sub.status === "paused";
              const isCancelled = sub.status === "cancelled";

              return (
                <div
                  key={sub.id}
                  className="glass-card px-4 py-3.5 flex flex-col gap-3"
                  style={{
                    opacity: isPaused || isCancelled ? 0.7 : 1,
                    border: isPaused
                      ? "1px solid var(--text-muted)"
                      : isCancelled
                        ? "1px solid var(--text-muted)"
                        : "var(--glass-border)",
                  }}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isPaused
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(217,119,87,0.08)",
                          color: isPaused
                            ? "var(--text-muted)"
                            : "var(--accent)",
                        }}
                      >
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                          {sub.name}
                          {isPaused && (
                            <span className="text-[0.625rem] px-1.25 py-0.25 bg-[rgba(0,0,0,0.06)] text-[var(--text-muted)] rounded-full">
                              Paused
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-[0.625rem] px-1.25 py-0.25 bg-[rgba(224,85,69,0.08)] text-[var(--text-muted)] rounded-full">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <div className="text-[0.6875rem] text-[var(--text-muted)] mt-0.5">
                          {sub.category} • Every {sub.frequency}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[0.9375rem] font-semibold text-[var(--text)]">
                        {formatINR(sub.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row — Due Date & urgency badge */}
                  <div className="flex justify-between items-center bg-[rgba(0,0,0,0.02)] px-2.5 py-2 rounded-[var(--r-sm)]">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Next due:{" "}
                      <strong>
                        {format(parseISO(sub.nextDueDate), "d MMM yyyy")}
                      </strong>
                    </span>
                    {!isCancelled && !isPaused && (
                      <span
                        className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: badge.bg,
                          color: badge.text,
                          border: badge.border,
                        }}
                      >
                        {daysLeft < 0
                          ? "Overdue"
                          : daysLeft === 0
                            ? "Due today"
                            : `${daysLeft} days left`}
                      </span>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex justify-between items-center border-t border-[var(--border)] pt-2.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleStatus(sub)}
                        className="btn-ghost text-xs px-1.5 py-1 inline-flex items-center gap-1"
                        style={{
                          color: isPaused
                            ? "var(--credit)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateSubscription(sub.id!, {
                              status: isCancelled ? "active" : "cancelled",
                            });
                            toast.success(
                              `Subscription marked as ${isCancelled ? "Active" : "Cancelled"} ✓`,
                            );
                          } catch {
                            toast.error("Failed to update subscription status");
                          }
                        }}
                        className="btn-ghost text-xs px-1.5 py-1 inline-flex items-center gap-1 text-[var(--text-secondary)]"
                      >
                        <CheckCircle size={12} />
                        {isCancelled ? "Mark Active" : "Mark Cancelled"}
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openForm(sub)}
                        className="btn-ghost p-1.5"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          confirm({
                            title: "Delete Subscription",
                            message: `Are you sure you want to delete the subscription for "${sub.name}"?`,
                            confirmLabel: "Delete",
                            variant: "danger",
                          }).then((yes) => {
                            if (yes) handleDeleteSub(sub.id!);
                          });
                        }}
                        className="btn-ghost p-1.5 text-[var(--text-muted)]"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
