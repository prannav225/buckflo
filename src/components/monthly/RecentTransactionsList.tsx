import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { TransactionCard } from "../../components/TransactionRow";
import { formatMonthYear } from "../../utils/dateUtils";
import { type Transaction } from "../../db/database";

interface Props {
  transactions: Transaction[];
  runningBalances: number[];
  monthYear: string;
}

export function RecentTransactionsList({ transactions, runningBalances, monthYear }: Props) {
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
    <div className="fade-in-up delay-3" style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            Expenditure Transactions
          </h3>
        </div>
        {transactions.length > 0 && (
          <button
            className="btn-ghost"
            onClick={() => navigate(`/monthly/transactions?month=${monthYear}`)}
            style={{
              fontSize: "0.8125rem",
              padding: "4px 8px",
              gap: 2,
              display: "flex",
              alignItems: "center",
            }}
            id="btn-view-all-monthly"
          >
            See all ({transactions.length}) <ChevronRight size={14} />
          </button>
        )}
      </div>
      {transactions.length === 0 ? (
        <div className="glass-card empty-state">
          <Calendar size={32} className="empty-state-icon" />
          <p className="empty-state-title">No expenses yet this month</p>
          <p className="empty-state-desc">
            No transactions logged for {formatMonthYear(monthYear)}. Start
            tracking!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
