import { useState, useEffect } from "react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "../db/database";
import { deleteTransaction } from "../db/database";
import { useAccounts } from "../db/hooks";
import { formatINR } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";
import { updateSheetOpenState } from "../utils/modalHelper";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Calendar,
  Folder,
  CreditCard,
  X,
  TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface TransactionCardProps {
  transaction: Transaction;
  runningBalance?: number;
  showRunningBalance?: boolean;
  showAccount?: boolean;
}

export function TransactionCard({
  transaction: tx,
  runningBalance,
  showRunningBalance = false,
}: TransactionCardProps) {
  const isDebit = tx.type === "debit";
  const accounts = useAccounts();
  const account = accounts.find((a) => a.id === tx.accountId);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAction = () => {
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div
        className="tx-card"
        onClick={handleAction}
        role="button"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAction();
          }
        }}
      >
        {/* Icon */}
        <div
          className={`tx-icon ${isDebit ? "tx-icon-debit" : "tx-icon-credit"}`}
        >
          {isDebit ? (
            <ArrowDownLeft size={17} color="var(--debit)" strokeWidth={2} />
          ) : (
            <ArrowUpRight size={17} color="var(--credit)" strokeWidth={2} />
          )}
        </div>

        {/* Description + Date only (simplified) */}
        <div className="tx-desc">
          <div className="tx-desc-title">{tx.description}</div>
          <div className="tx-date">{formatDate(tx.date)}</div>
        </div>

        <div className="tx-right">
          <div
            className={`tx-amount ${isDebit ? "amount-debit" : "amount-credit"}`}
          >
            {!isDebit && "+"}
            {formatINR(tx.amount)}
          </div>
          {showRunningBalance && runningBalance !== undefined && (
            <div className="tx-amount-sub">{formatINR(runningBalance)}</div>
          )}
        </div>
      </div>

      {/* Transaction Details Bottom Sheet */}
      <TransactionDetailsSheet
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={tx}
        accountName={
          account ? `${account.name} (${account.type})` : "Unknown Account"
        }
        runningBalance={runningBalance}
        showRunningBalance={showRunningBalance}
      />
    </>
  );
}

// ── Transaction Details Sheet Component ─────────────────────────────────────

interface TransactionDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  accountName: string;
  runningBalance?: number;
  showRunningBalance?: boolean;
}

function TransactionDetailsSheet({
  isOpen,
  onClose,
  transaction: tx,
  accountName,
  runningBalance,
  showRunningBalance,
}: TransactionDetailsSheetProps) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const isDebit = tx.type === "debit";

  const handleDelete = async () => {
    try {
      if (tx.id === undefined) return;
      await deleteTransaction(tx.id);
      toast.success("Transaction deleted successfully ✓");
      onClose();
    } catch (err) {
      toast.error("Failed to delete transaction");
      console.error(err);
    }
  };

  return createPortal(
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction Details"
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                letterSpacing: "-0.03em",
                fontWeight: 600,
              }}
            >
              Transaction Details
            </h2>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
              }}
            >
              Detailed overview of this ledger entry
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "8px", borderRadius: "50%" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Amount Display */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 20px",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div
            className="tx-icon"
            style={{
              background: "var(--bg-surface)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            {isDebit ? (
              <ArrowDownLeft size={22} color="var(--text-secondary)" strokeWidth={2} />
            ) : (
              <ArrowUpRight size={22} color="var(--text-secondary)" strokeWidth={2} />
            )}
          </div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--text)",
              margin: "0 0 4px 0",
            }}
          >
            {tx.description}
          </h3>
          <div
            className="amount-display"
            style={{
              fontSize: "2rem",
              color: isDebit ? "var(--text)" : "var(--credit)",
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            {!isDebit && "+"}
            {formatINR(tx.amount)}
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {/* Date Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text-secondary)",
              }}
            >
              <Calendar size={16} />
              <span style={{ fontSize: "0.875rem" }}>Date</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text)",
                }}
              >
                {formatDate(tx.date)}
              </span>
              {tx.createdAt && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {format(new Date(tx.createdAt), "hh:mm a")}
                </span>
              )}
            </div>
          </div>

          {/* Account Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text-secondary)",
              }}
            >
              <CreditCard size={16} />
              <span style={{ fontSize: "0.875rem" }}>Account</span>
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text)",
                textAlign: "right",
                maxWidth: "60%",
              }}
            >
              {accountName}
            </span>
          </div>

          {/* Category Row */}
          {tx.category && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-secondary)",
                }}
              >
                <Folder size={16} />
                <span style={{ fontSize: "0.875rem" }}>Category</span>
              </div>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text)",
                }}
              >
                {tx.category}
              </span>
            </div>
          )}

          {/* Running Balance Row */}
          {showRunningBalance && runningBalance !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-secondary)",
                }}
              >
                <TrendingDown
                  size={16}
                  style={{ transform: isDebit ? "none" : "rotate(180deg)" }}
                />
                <span style={{ fontSize: "0.875rem" }}>Running Balance</span>
              </div>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text)",
                }}
              >
                {formatINR(runningBalance)}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: 12 }}>
          {confirmDelete ? (
            <div
              className="fade-in-up glass-card"
              style={{
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "0.875rem",
                  color: "var(--text)",
                  fontWeight: 600,
                }}
              >
                Are you sure you want to delete this transaction? This action is
                permanent.
              </p>
              <div
                style={{ display: "flex", gap: 10, justifyContent: "center" }}
              >
                <button
                  className="btn-primary"
                  onClick={handleDelete}
                  style={{
                    background: "var(--debit)",
                    borderColor: "var(--debit)",
                    padding: "8px 20px",
                    fontSize: "0.8125rem",
                    height: "auto",
                    borderRadius: "var(--r-pill)",
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: "8px 20px",
                    fontSize: "0.8125rem",
                    height: "auto",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-primary"
                onClick={() => {
                  onClose();
                  navigate(`/edit/${tx.id}`);
                }}
                style={{ flex: 1, gap: 8, height: 46 }}
              >
                <Edit2 size={16} /> Edit Entry
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete(true)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 46,
                  color: "var(--debit)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Backward-compatible aliases
export { TransactionCard as TransactionListRow };
export { TransactionCard as TransactionRow };
