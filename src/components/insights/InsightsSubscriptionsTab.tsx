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
      <div
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        className="fade-in-up"
      >
        {/* Summary Card */}
        <div
          className="glass-card-strong"
          style={{ padding: "16px 20px", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            Monthly Committed Spends
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontFamily: "var(--font-display)",
              color: "var(--text)",
            }}
          >
            {formatINR(totalCommitted)}
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            Across {approvedSubs.filter((s) => s.status === "active").length}{" "}
            active subscription(s)
          </div>
        </div>

        {/* Auto-detected Subscriptions Banner */}
        {detectedSubs.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: "16px 18px",
              background: "rgba(217,119,87,0.05)",
              boxShadow: "var(--glass-shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Lightbulb size={18} color="var(--accent)" />
              <h4
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                Review Detected Subscriptions
              </h4>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                lineHeight: 1.4,
                margin: "0 0 14px 0",
              }}
            >
              We scanned your transaction records and found{" "}
              {detectedSubs.length} potential subscription(s):
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {detectedSubs.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg-glass-strong)",
                    padding: "10px 14px",
                    borderRadius: "var(--r-md)",
                    border: "var(--glass-border)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {sub.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {formatINR(sub.amount)} • {sub.category}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleApproveSub(sub.id!)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        borderRadius: "var(--r-pill)",
                        height: "auto",
                        boxShadow: "none",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => handleDeleteSub(sub.id!)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              Committed Spends ({sortedSubs.length})
            </h3>
          </div>
          <button
            className="header-action-pill-btn"
            onClick={() => openForm(null)}
            style={{
              height: 28,
              padding: "0 10px",
              fontSize: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Cards List */}
        {sortedSubs.length === 0 ? (
          <div
            className="glass-card empty-state"
            style={{ padding: "40px 20px" }}
          >
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No subscriptions added</p>
            <p className="empty-state-desc">
              Log your recurring memberships, software services, and monthly
              bills here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedSubs.map((sub) => {
              const daysLeft = getDaysLeft(sub.nextDueDate);
              const badge = getDaysBadgeColor(daysLeft);
              const isPaused = sub.status === "paused";
              const isCancelled = sub.status === "cancelled";

              return (
                <div
                  key={sub.id}
                  className="glass-card"
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    opacity: isPaused || isCancelled ? 0.7 : 1,
                    border: isPaused
                      ? "1px solid var(--text-muted)"
                      : isCancelled
                        ? "1px solid var(--text-muted)"
                        : "var(--glass-border)",
                  }}
                >
                  {/* Top Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          background: isPaused
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(217,119,87,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isPaused
                            ? "var(--text-muted)"
                            : "var(--accent)",
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={16} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "var(--text)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {sub.name}
                          {isPaused && (
                            <span
                              style={{
                                fontSize: "0.625rem",
                                padding: "1px 5px",
                                background: "rgba(0,0,0,0.06)",
                                color: "var(--text-muted)",
                                borderRadius: "var(--r-pill)",
                              }}
                            >
                              Paused
                            </span>
                          )}
                          {isCancelled && (
                            <span
                              style={{
                                fontSize: "0.625rem",
                                padding: "1px 5px",
                                background: "rgba(224,85,69,0.08)",
                                color: "var(--text-muted)",
                                borderRadius: "var(--r-pill)",
                              }}
                            >
                              Cancelled
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {sub.category} • Every {sub.frequency}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {formatINR(sub.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row — Due Date & urgency badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(0,0,0,0.02)",
                      padding: "8px 10px",
                      borderRadius: "var(--r-sm)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Next due:{" "}
                      <strong>
                        {format(parseISO(sub.nextDueDate), "d MMM yyyy")}
                      </strong>
                    </span>
                    {!isCancelled && !isPaused && (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "var(--r-pill)",
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--border)",
                      paddingTop: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => toggleStatus(sub)}
                        className="btn-ghost"
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
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
                          } catch (e) {
                            toast.error(
                              "Failed to update subscription status",
                            );
                          }
                        }}
                        className="btn-ghost"
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <CheckCircle size={12} />
                        {isCancelled ? "Mark Active" : "Mark Cancelled"}
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openForm(sub)}
                        className="btn-ghost"
                        style={{ padding: 6 }}
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
                        className="btn-ghost"
                        style={{ padding: 6, color: "var(--text-muted)" }}
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
