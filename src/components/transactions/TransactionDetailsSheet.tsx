import { createPortal } from "react-dom";
import { format } from "date-fns";
import type { Transaction } from "../../db/database";
import { formatINR } from "../../utils/currency";
import { formatDate } from "../../utils/dateUtils";
import { useTransactionDetails } from "../../hooks/useTransactionDetails";
import { useBackHandler } from "../../hooks/useBackHandler";
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

interface TransactionDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  accountName: string;
  runningBalance?: number;
  showRunningBalance?: boolean;
}

export function TransactionDetailsSheet({
  isOpen,
  onClose,
  transaction: tx,
  accountName,
  runningBalance,
  showRunningBalance,
}: TransactionDetailsSheetProps) {
  const { confirmDelete, setConfirmDelete, handleDelete, handleEdit } =
    useTransactionDetails(tx, onClose);

  useBackHandler(isOpen, onClose);

  if (!isOpen) return null;

  const isDebit = tx.type === "debit";

  return createPortal(
    <div
      className="sheet-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction Details"
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              Transaction Details
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              Detailed overview of this ledger entry
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

        {/* Hero Amount Display */}
        <div className="glass-card p-[24px_20px] mb-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-(--bg-surface) mb-3 flex items-center justify-center border border-black/8 dark:border-white/6 shadow-[var(--glass-shadow)]">
            {isDebit ? (
              <ArrowDownLeft
                size={22}
                className="text-(--text-secondary)"
                strokeWidth={2}
              />
            ) : (
              <ArrowUpRight
                size={22}
                className="text-(--text-secondary)"
                strokeWidth={2}
              />
            )}
          </div>
          <h3 className="text-[1.125rem] font-semibold text-(--text) m-[0_0_4px_0]">
            {tx.description}
          </h3>
          <div
            className={`amount-display text-3xl font-medium tracking-tight ${
              isDebit ? "text-(--text)" : "text-(--credit)"
            }`}
          >
            {!isDebit && "+"}
            {formatINR(tx.amount)}
          </div>
        </div>

        {/* Details Grid */}
        <div className="flex flex-col gap-3.5 mb-7">
          {/* Date Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-(--text-secondary)">
              <Calendar size={16} />
              <span className="text-sm">Date</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-(--text)">
                {formatDate(tx.date)}
              </span>
              {tx.createdAt && (
                <span className="text-xs text-(--text-muted) mt-0.5">
                  {format(new Date(tx.createdAt), "hh:mm a")}
                </span>
              )}
            </div>
          </div>

          {/* Account Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-(--text-secondary)">
              <CreditCard size={16} />
              <span className="text-sm">Account</span>
            </div>
            <span className="text-sm font-medium text-(--text) text-right max-w-[60%]">
              {accountName}
            </span>
          </div>

          {/* Category Row */}
          {tx.category && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-(--text-secondary)">
                <Folder size={16} />
                <span className="text-sm">Category</span>
              </div>
              <span className="text-sm font-medium text-(--text)">
                {tx.category}
              </span>
            </div>
          )}

          {/* Running Balance Row */}
          {showRunningBalance && runningBalance !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-(--text-secondary)">
                <TrendingDown
                  size={16}
                  className={isDebit ? "" : "rotate-180"}
                />
                <span className="text-sm">Running Balance</span>
              </div>
              <span className="text-sm font-medium text-(--text)">
                {formatINR(runningBalance)}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-3">
          {confirmDelete ? (
            <div className="fade-in-up glass-card p-4 text-center">
              <p className="m-[0_0_14px_0] text-sm text-(--text) font-semibold">
                Are you sure you want to delete this transaction? This action is
                permanent.
              </p>
              <div className="flex gap-2.5 justify-center">
                <button
                  className="btn-primary !bg-(--debit) !border-(--debit) py-2 px-5 text-[0.8125rem] !h-auto rounded-[var(--r-pill)]"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>
                <button
                  className="btn-secondary py-2 px-5 text-[0.8125rem] !h-auto"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                className="btn-primary flex-1 gap-2 h-11.5"
                onClick={handleEdit}
              >
                <Edit2 size={16} /> Edit Entry
              </button>
              <button
                className="btn-secondary flex-1 flex items-center justify-center gap-2 h-11.5 text-(--debit) text-[0.9375rem] font-semibold cursor-pointer"
                onClick={() => setConfirmDelete(true)}
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
