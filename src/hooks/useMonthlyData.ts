import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useRunningBalances,
  useMonthSummary,
} from "../db/hooks";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";
import { useHistoricalData } from "../hooks/useAnalytics";

export function useMonthlyData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const expendAcc = useAccount("expenditure");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);
  const runningBalances = useRunningBalances(
    transactions,
    monthSetup?.openingBalance ?? 0,
  );
  const summary = useMonthSummary(
    transactions,
    monthSetup?.openingBalance ?? 0,
  );

  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const historicalData = useHistoricalData(6);

  const [showEditModal, setShowEditModal] = useState(false);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-expenditure-${monthYear}.csv`);
  };

  // Group by category for visual analytics
  const categorySpend = useMemo(() => {
    const spends: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "debit") {
        const cat = tx.category || "Other";
        spends[cat] = (spends[cat] || 0) + tx.amount;
      }
    }
    return spends;
  }, [transactions]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categorySpend)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [categorySpend]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "debit")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  return {
    monthYear,
    isCurrentMonth,
    expendAcc,
    monthSetup,
    transactions,
    runningBalances,
    summary,
    isChartExpanded,
    setIsChartExpanded,
    historicalData,
    showEditModal,
    setShowEditModal,
    handleMonthChange,
    handleExport,
    categorySpend,
    sortedCategories,
    totalExpense,
  };
}
