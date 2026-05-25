import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useRunningBalances,
} from "../db/hooks";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";

export function useMonthlyTransactions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMonth = searchParams.get("month") || getCurrentMonthYear();
  const [monthYear, setMonthYear] = useState(initialMonth);
  const [searchQuery, setSearchQuery] = useState("");

  const initialTab =
    (searchParams.get("tab") as "all" | "expenditure" | "savings") || "all";
  const [activeTab, setActiveTab] = useState<"all" | "expenditure" | "savings">(
    initialTab,
  );
  const [pageSize, setPageSize] = useState(20);

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");

  // Fetch month transactions
  const expendTxs = useTransactions(expendAcc?.id, monthYear);
  const savingsTxs = useTransactions(savingsAcc?.id, monthYear);

  const monthSetupExpend = useMonthSetup(monthYear);

  // Fetch savings transactions from the 1st of the selected month to today
  // (Required to walk back and compute opening balance of Savings for that month)
  const savingsTxsSinceStart = useLiveQuery(
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

  const savingsOpeningBalance = useMemo(() => {
    if (!savingsAcc) return 0;
    let bal = savingsAcc.currentBalance;
    for (const tx of savingsTxsSinceStart) {
      bal = tx.type === "credit" ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  }, [savingsAcc, savingsTxsSinceStart]);

  const runningBalancesExpend = useRunningBalances(
    expendTxs,
    monthSetupExpend?.openingBalance ?? 0,
  );
  const runningBalancesSavings = useRunningBalances(
    savingsTxs,
    savingsOpeningBalance,
  );

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

  const handleTabChange = (tab: "all" | "expenditure" | "savings") => {
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
      activeTab === "expenditure"
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
      accountType: "expenditure" as const,
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
    if (activeTab === "expenditure") {
      return allItems.filter((item) => item.accountType === "expenditure");
    }
    if (activeTab === "savings") {
      return allItems.filter((item) => item.accountType === "savings");
    }
    return allItems;
  }, [allItems, activeTab]);

  // Filter items based on search query (matches desc, category, or amount)
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredItems;
    const q = searchQuery.toLowerCase();
    return tabFilteredItems.filter((item) => {
      const descMatch = item.tx.description.toLowerCase().includes(q);
      const catMatch = item.tx.category
        ? item.tx.category.toLowerCase().includes(q)
        : false;
      const amtMatch = item.tx.amount.toString().includes(q);
      return descMatch || catMatch || amtMatch;
    });
  }, [tabFilteredItems, searchQuery]);

  const hasMoreItems = searchedItems.length > pageSize;
  const displayedItems = searchedItems.slice(0, pageSize);

  const backUrl =
    activeTab === "savings"
      ? `/savings?month=${monthYear}`
      : `/monthly?month=${monthYear}`;

  return {
    navigate,
    monthYear,
    searchQuery,
    setSearchQuery,
    activeTab,
    pageSize,
    setPageSize,
    expendAcc,
    savingsAcc,
    handleMonthChange,
    handleTabChange,
    handleExport,
    tabFilteredItems,
    searchedItems,
    hasMoreItems,
    displayedItems,
    backUrl,
  };
}
