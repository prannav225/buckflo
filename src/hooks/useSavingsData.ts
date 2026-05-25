import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type SavingGoal } from "../db/database";
import {
  useAccount,
  useTransactions,
  useRunningBalances,
  useMonthSummary,
} from "../db/hooks";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";
import { useSavingsGoals } from "../hooks/useSavingsGoals";

export function useSavingsData() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  const savingsAcc = useAccount("savings");
  const transactions = useTransactions(savingsAcc?.id, monthYear);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  // Fetch all savings transactions from the 1st of the selected month to today
  const txsSinceStart = useLiveQuery(
    async () => {
      if (!savingsAcc?.id) return [];
      const [year, month] = monthYear.split("-").map(Number);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      return db.transactions
        .where("accountId")
        .equals(savingsAcc.id)
        .filter((tx) => tx.date >= startDate)
        .toArray();
    },
    [savingsAcc?.id, monthYear],
    [],
  );

  // Reconstruct opening balance
  const openingBalance = useMemo(() => {
    if (!savingsAcc) return 0;
    let bal = savingsAcc.currentBalance;
    for (const tx of txsSinceStart) {
      bal = tx.type === "credit" ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  }, [savingsAcc, txsSinceStart]);

  const runningBalances = useRunningBalances(transactions, openingBalance);
  const summary = useMonthSummary(transactions, openingBalance);

  const {
    savingGoals,
    totalAllocated,
    unallocatedBalance,
    currentSavingsBalance,
  } = useSavingsGoals();

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-savings-${monthYear}.csv`);
  };

  // Staggered delay classes based on current month layout
  const summaryDelay = isCurrentMonth ? "delay-2" : "delay-1";
  const listDelay = isCurrentMonth ? "delay-3" : "delay-2";

  const LIMIT = 5;
  const hasMore = transactions.length > LIMIT;
  const displayedTransactions = useMemo(() => {
    return hasMore
      ? transactions.slice(-LIMIT).reverse()
      : [...transactions].reverse();
  }, [transactions, hasMore]);

  const getOriginalIndex = (index: number) => {
    return transactions.length - 1 - index;
  };

  return {
    navigate,
    monthYear,
    isCurrentMonth,
    isCreateOpen,
    setIsCreateOpen,
    selectedGoal,
    setSelectedGoal,
    savingsAcc,
    transactions,
    handleMonthChange,
    runningBalances,
    summary,
    savingGoals,
    totalAllocated,
    unallocatedBalance,
    currentSavingsBalance,
    handleExport,
    summaryDelay,
    listDelay,
    hasMore,
    displayedTransactions,
    getOriginalIndex,
  };
}
