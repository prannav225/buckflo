import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { TransactionCard } from "../../components/transactions/TransactionRow";
import { formatMonthYear } from "../../utils/dateUtils";
import { type Transaction } from "../../db/database";

interface Props {
  transactions: Transaction[];
  runningBalances: number[];
  monthYear: string;
}

export function RecentTransactionsList({
  transactions,
  runningBalances,
  monthYear,
}: Props) {
  const navigate = useNavigate();
  const LIMIT = 5;
  const hasMore = transactions.length > LIMIT;
  const displayedTransactions = hasMore
    ? transactions.slice(-LIMIT).reverse()
    : [...transactions].reverse();

  const getOriginalIndex = (index: number) => {
    return transactions.length - 1 - index;
  };

  return (
    <div className="mt-8 fade-in-up delay-3">
      <div className="flex justify-between items-center mb-3.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-(--text-muted) m-0">
            Expenditure Transactions
          </h3>
        </div>
        {transactions.length > 0 && (
          <button
            className="btn-ghost text-[0.8125rem] py-1 px-2 gap-0.5 flex items-center"
            onClick={() => navigate(`/monthly/transactions?month=${monthYear}`)}
            id="btn-view-all-monthly"
          >
            See all ({transactions.length}) <ChevronRight size={14} />
          </button>
        )}
      </div>
      {transactions.length === 0 ? (
        <div className="glass-card text-center py-10 px-6 text-(--text-muted) flex flex-col items-center justify-center">
          <Calendar
            size={42}
            className="opacity-50 mb-3 text-(--text-secondary)"
          />
          <p className="text-base font-semibold text-(--text) mb-1">
            No expenses yet this month
          </p>
          <p className="text-sm text-(--text-muted) m-0">
            No transactions logged for {formatMonthYear(monthYear)}. Start
            tracking!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedTransactions.map((tx, i) => {
            const originalIndex = getOriginalIndex(i);
            return (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                runningBalance={runningBalances[originalIndex]}
                showRunningBalance={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
