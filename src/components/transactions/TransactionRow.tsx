import { useState } from "react";
import type { Transaction } from "../../db/database";
import { useAccounts } from "../../db/hooks";
import { formatINR } from "../../utils/currency";
import { formatDate } from "../../utils/dateUtils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionDetailsSheet } from "./TransactionDetailsSheet";

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
        onClick={handleAction}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAction();
          }
        }}
        className="flex items-center gap-3.5 py-3 transition-[transform,opacity] duration-150 ease-out active:scale-98 active:opacity-70 cursor-pointer"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-(--r-md) flex items-center justify-center border border-gray-50/10 shrink-0 bg-black/15 text-(--text-secondary)">
          {isDebit ? (
            <ArrowDownLeft
              size={17}
              className="text-(--debit)"
              strokeWidth={2}
            />
          ) : (
            <ArrowUpRight
              size={17}
              className="text-(--credit)"
              strokeWidth={2}
            />
          )}
        </div>

        {/* Description + Date only (simplified) */}
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[0.9375rem] font-medium text-(--text) truncate">
            {tx.description}
          </div>
          <div className="whitespace-nowrap text-xs text-(--text-secondary) mt-1">
            {formatDate(tx.date)}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={`font-display text-[1.0625rem] font-normal leading-[1.1] tracking-tight ${
              isDebit ? "amount-debit" : "amount-credit"
            }`}
          >
            {!isDebit && "+"}
            {formatINR(tx.amount)}
          </div>
          {showRunningBalance && runningBalance !== undefined && (
            <div className="font-sans text-[0.6875rem] text-(--text-muted) mt-0.5">
              {formatINR(runningBalance)}
            </div>
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

// Backward-compatible aliases
export { TransactionCard as TransactionListRow };
export { TransactionCard as TransactionRow };
