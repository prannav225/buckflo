import { startOfDay, parseISO, differenceInDays, format } from "date-fns";
import {
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

const formatFrequency = (freq: string): string => {
  const f = freq.toLowerCase();
  if (f === "monthly") return "Monthly";
  if (f === "weekly") return "Weekly";
  if (f === "yearly") return "Yearly";
  return freq.charAt(0).toUpperCase() + freq.slice(1);
};

interface Props {
  openForm: (sub: Subscription | null) => void;
}

export function InsightsSubscriptionsTab({ openForm }: Props) {
  const { confirm, dialog: confirmDialog } = useConfirm();
  const {
    approvedSubs,
    sortedSubs,
    totalCommitted,
    handleDeleteSub,
    toggleStatus,
  } = useSubscriptionLogic();

  // Calculate days remaining helper
  const getDaysLeft = (dateStr: string) => {
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(dateStr));
    return differenceInDays(due, today);
  };

  const getDaysBadgeClass = (days: number) => {
    if (days > 7) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }
    if (days >= 3) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
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

        {/* Subscription List Title & Add Button */}
        <div className="flex justify-between items-center mt-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
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
              const badgeClass = getDaysBadgeClass(daysLeft);
              const isPaused = sub.status === "paused";
              const isCancelled = sub.status === "cancelled";

              return (
                <div
                  key={sub.id}
                  className={`glass-card px-4 py-4 flex flex-col gap-3.5 transition-all duration-200 hover:shadow-md ${
                    isPaused || isCancelled ? "opacity-75" : "opacity-100"
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isPaused
                            ? "bg-[rgba(245,158,11,0.08)] text-[#f59e0b]"
                            : isCancelled
                              ? "bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
                              : "bg-[rgba(217,119,87,0.08)] text-(--accent)"
                        }`}
                      >
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-(--text) flex items-center gap-2 flex-wrap">
                          {sub.name}
                          {isPaused && (
                            <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
                              Paused
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <div className="text-[0.6875rem] text-(--text-muted) mt-0.5 font-medium">
                          {sub.category} • {formatFrequency(sub.frequency)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[1.0625rem] font-bold text-(--text) font-display">
                        {formatINR(sub.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row — Due Date & urgency badge */}
                  <div className="flex justify-between items-center bg-black/3 dark:bg-white/4 px-3 py-2.5 rounded-xl border border-black/8 dark:border-white/8">
                    <span className="text-[0.75rem] text-(--text-secondary) flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-(--text-muted)" />
                      <span>
                        Next due:{" "}
                        <strong className="text-(--text) font-semibold">
                          {format(parseISO(sub.nextDueDate), "d MMM yyyy")}
                        </strong>
                      </span>
                    </span>
                    {!isCancelled && !isPaused && (
                      <span
                        className={`text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}
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
                  <div className="flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(sub)}
                        className={`text-[0.6875rem] px-2.5 py-1.5 rounded-lg bg-black/3 dark:bg-white/4 border border-black/8 dark:border-white/8 transition-all flex items-center gap-1 font-medium cursor-pointer ${
                          isPaused
                            ? "text-(--credit)"
                            : "text-(--text-secondary)"
                        }`}
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
                        className="text-[0.6875rem] px-2.5 py-1.5 rounded-lg bg-black/3 dark:bg-white/4 border border-black/8 dark:border-white/8 transition-all flex items-center gap-1 font-medium text-(--text-secondary) cursor-pointer"
                      >
                        <CheckCircle size={12} />
                        {isCancelled ? "Activate" : "Cancel"}
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openForm(sub)}
                        className="p-1.5 rounded-lg bg-black/3 dark:bg-white/4 border border-black/8 dark:border-white/8 text-(--text-secondary) transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 size={13} />
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
                        className="p-1.5 rounded-lg bg-black/3 dark:bg-white/4 border border-black/8 dark:border-white/8 text-(--text-muted) hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
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
