import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useRunningBalances,
  useOpeningBalanceReconstructor,
  useMonthSummary,
} from "../db/hooks";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";

export function useMonthlyTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMonth = searchParams.get("month") || getCurrentMonthYear();
  const [monthYear, setMonthYear] = useState(initialMonth);
  const [searchQuery, setSearchQuery] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState<
    "date_desc" | "amount_desc" | "amount_asc"
  >("date_desc");
  const [txTypeFilter, setTxTypeFilter] = useState<
    "all" | "expense" | "income" | "transfer"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const initialTab =
    (searchParams.get("tab") as "all" | "spending" | "savings") || "all";
  const [activeTab, setActiveTab] = useState<"all" | "spending" | "savings">(
    initialTab,
  );
  const [pageSize, setPageSize] = useState(20);

  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");

  // Fetch month transactions
  const expendTxs = useTransactions(spendingAcc?.id, monthYear);
  const savingsTxs = useTransactions(savingsAcc?.id, monthYear);

  const monthSetupExpend = useMonthSetup(monthYear);

  // Compute reconstructed opening balances
  const expendOpeningBalanceReconstructed = useOpeningBalanceReconstructor(
    spendingAcc?.id,
    monthYear,
  );
  const expendOpeningBalance = monthSetupExpend?.openingBalance ?? expendOpeningBalanceReconstructed;

  const savingsOpeningBalance = useOpeningBalanceReconstructor(
    savingsAcc?.id,
    monthYear,
  );

  const runningBalancesExpend = useRunningBalances(
    expendTxs,
    expendOpeningBalance,
  );
  const runningBalancesSavings = useRunningBalances(
    savingsTxs,
    savingsOpeningBalance,
  );

  // Compute month-specific closing balances
  const expendSummary = useMonthSummary(expendTxs, expendOpeningBalance);
  const expendClosingBalance = expendSummary.closingBalance;

  const savingsSummary = useMonthSummary(savingsTxs, savingsOpeningBalance);
  const savingsClosingBalance = savingsSummary.closingBalance;

  const handleMonthChange = (newMonth: string) => {
    setMonthYear(newMonth);
    setSearchParams(
      (prev) => {
        prev.set("month", newMonth);
        return prev;
      },
      { replace: true },
    );
  };

  const handleTabChange = (tab: "all" | "spending" | "savings") => {
    setActiveTab(tab);
    setPageSize(20);
    setSearchParams(
      (prev) => {
        prev.set("tab", tab);
        return prev;
      },
      { replace: true },
    );
  };

  const handleExport = () => {
    const txsToExport =
      activeTab === "spending"
        ? expendTxs
        : activeTab === "savings"
          ? savingsTxs
          : [...expendTxs, ...savingsTxs].sort((a, b) =>
              b.date.localeCompare(a.date),
            );
    exportTransactionsCSV(txsToExport, `flo-${activeTab}-${monthYear}.csv`);
  };

  // Build items with original index and sort descending (newest first)
  const allItems = useMemo(() => {
    const expItems = expendTxs.map((tx, idx) => ({
      tx,
      runningBalance: runningBalancesExpend[idx],
      accountType: "spending" as const,
    }));

    const savItems = savingsTxs.map((tx, idx) => ({
      tx,
      runningBalance: runningBalancesSavings[idx],
      accountType: "savings" as const,
    }));

    return [...expItems, ...savItems].sort((a, b) => {
      // Primary sort: Date descending (newest first)
      if (b.tx.date !== a.tx.date) {
        return b.tx.date.localeCompare(a.tx.date);
      }
      // Secondary sort: ID descending (newest entries first)
      return (b.tx.id || 0) - (a.tx.id || 0);
    });
  }, [expendTxs, savingsTxs, runningBalancesExpend, runningBalancesSavings]);

  // Filter based on active tab
  const tabFilteredItems = useMemo(() => {
    if (activeTab === "spending") {
      return allItems.filter((item) => item.accountType === "spending");
    }
    if (activeTab === "savings") {
      return allItems.filter((item) => item.accountType === "savings");
    }
    return allItems;
  }, [allItems, activeTab]);

  // Filter items based on search query, cost range limits, and type
  const filteredItems = useMemo(() => {
    let items = tabFilteredItems;

    // 0. Transaction Type Filter
    if (txTypeFilter !== "all") {
      items = items.filter((item) => {
        const isTransfer =
          item.tx.category === "transfer" ||
          item.tx.category === "Transfer" ||
          item.tx.category === "starting-transfer";

        if (txTypeFilter === "transfer") return isTransfer;
        if (isTransfer) return false;

        if (txTypeFilter === "expense") return item.tx.type === "debit";
        if (txTypeFilter === "income") return item.tx.type === "credit";
        return true;
      });
    }

    // 0.5 Category Filter
    if (categoryFilter !== "all") {
      items = items.filter((item) => {
        const cat = item.tx.category || "Uncategorized";
        return cat.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const descMatch = item.tx.description.toLowerCase().includes(q);
        const catMatch = item.tx.category
          ? item.tx.category.toLowerCase().includes(q)
          : false;
        const amtMatch = item.tx.amount.toString().includes(q);
        return descMatch || catMatch || amtMatch;
      });
    }

    // 2. Cost Min Amount filter
    if (minAmount.trim()) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        items = items.filter((item) => item.tx.amount >= min);
      }
    }

    // 3. Cost Max Amount filter
    if (maxAmount.trim()) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        items = items.filter((item) => item.tx.amount <= max);
      }
    }

    // 4. Sorting
    return [...items].sort((a, b) => {
      if (sortBy === "amount_desc") {
        return b.tx.amount - a.tx.amount;
      }
      if (sortBy === "amount_asc") {
        return a.tx.amount - b.tx.amount;
      }
      // default: date_desc (newest first)
      if (b.tx.date !== a.tx.date) {
        return b.tx.date.localeCompare(a.tx.date);
      }
      return (b.tx.id || 0) - (a.tx.id || 0);
    });
  }, [tabFilteredItems, searchQuery, minAmount, maxAmount, sortBy, txTypeFilter, categoryFilter]);

  const hasMoreItems = filteredItems.length > pageSize;
  const displayedItems = filteredItems.slice(0, pageSize);

  const backUrl =
    activeTab === "savings"
      ? `/savings?month=${monthYear}`
      : `/monthly?month=${monthYear}`;

  return {
    monthYear,
    searchQuery,
    setSearchQuery,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    sortBy,
    setSortBy,
    txTypeFilter,
    setTxTypeFilter,
    categoryFilter,
    setCategoryFilter,
    activeTab,
    setPageSize,
    spendingAcc,
    savingsAcc,
    expendClosingBalance,
    savingsClosingBalance,
    handleMonthChange,
    handleTabChange,
    handleExport,
    tabFilteredItems,
    filteredItems,
    displayedItems,
    hasMoreItems,
    backUrl,
  };
}
