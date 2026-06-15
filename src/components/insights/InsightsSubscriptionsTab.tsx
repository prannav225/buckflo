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
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatINR } from "../../utils/currency";
import { updateSubscription, type Subscription } from "../../db/database";
import { useConfirm } from "../../hooks/useConfirm";
import { useSubscriptionLogic } from "../../hooks/useSubscriptionLogic";
import { formatMonthYear, getCurrentMonthYear } from "../../utils/dateUtils";
import { useCategories, getCategoryColor, hexToRgba } from "../../hooks/useCategories";
const formatFrequency = (freq: string): string => {
  const f = freq.toLowerCase();
  if (f === "monthly") return "Monthly";
  if (f === "weekly") return "Weekly";
  if (f === "yearly") return "Yearly";
  if (f === "3_months") return "3 Months";
  if (f === "6_months") return "6 Months";
  return freq.charAt(0).toUpperCase() + freq.slice(1);
};

interface Props {
  openForm: (sub: Subscription | null) => void;
  monthYear?: string;
}

export function InsightsSubscriptionsTab({ openForm, monthYear }: Props) {
  const { confirm, dialog: confirmDialog } = useConfirm();
  const {
    approvedSubs,
    sortedSubs,
    totalCommitted,
    handleDeleteSub,
    toggleStatus,
  } = useSubscriptionLogic(monthYear);

  const categories = useCategories();

  const isCurrentMonth = !monthYear || monthYear === getCurrentMonthYear();

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

  if (!isCurrentMonth) {
    return (
      <div className="fade-in-up flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl">
        <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
          <Clock size={24} className="text-(--text-muted) opacity-50" />
        </div>
        <h3 className="text-[14px] font-bold text-(--text) m-0 mb-1">
          No Historical Data
        </h3>
        <p className="text-[12px] text-(--text-muted) leading-relaxed">
          Subscriptions are globally tracked to manage active and future
          recurring bills. Past subscription states are not recorded.
        </p>
      </div>
    );
  }

  return (
    <>
      {confirmDialog}
      <div className="fade-in-up flex flex-col gap-4">
        {/* Summary Card */}
        <div className="glass-card-strong px-5 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
              Active Total{" "}
              {monthYear ? `(${formatMonthYear(monthYear).split(" ")[0]})` : ""}
            </div>
            <div className="text-xl font-display text-(--text)">
              {formatINR(totalCommitted)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
              Subscriptions
            </div>
            <div className="text-lg font-display text-(--text)">
              {approvedSubs.filter((s) => s.status === "active").length}{" "}
              <span className="text-xs text-(--text-muted)">active</span>
            </div>
          </div>
        </div>

        {/* Subscription List Title & Add Button */}
        <div className="flex justify-between items-center mt-2.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
              Active Subscriptions ({sortedSubs.length})
            </h3>
            <div className="group relative flex items-center cursor-help">
              <HelpCircle
                size={12}
                className="text-(--text-muted) opacity-70 hover:opacity-100 transition-opacity"
              />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-white dark:bg-[#2e2e2c] text-[11px] text-(--text) font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center border border-black/10 dark:border-white/10 leading-relaxed">
                Recurring bills and subscriptions that are automatically
                deducted. These are completely separate from your Planned
                Budgets.
              </div>
            </div>
          </div>
          <button
            className="btn-primary h-7 px-3 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
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
              
              const catColor = getCategoryColor(categories, sub.category);
              const initial = sub.category ? sub.category.charAt(0).toUpperCase() : "S";

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
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                        style={
                          isPaused
                            ? { backgroundColor: "rgba(245,158,11,0.08)", color: "#f59e0b" }
                            : isCancelled
                              ? { backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444" }
                              : { backgroundColor: hexToRgba(catColor, 0.12), color: catColor }
                        }
                      >
                        <span className="font-display font-bold text-xl">{initial}</span>
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
                        <div className="text-[0.6875rem] text-(--text-muted) mt-0.5 font-medium flex items-center gap-1.5">
                          <span>{sub.category}</span>
                          <span className="opacity-50">•</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded font-semibold text-(--text-secondary) dark:text-white/80">
                            {formatFrequency(sub.frequency)}
                          </span>
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
                              `Subscription marked as ${isCancelled ? "Active" : "Cancelled"}`,
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
