import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Download, Search, X } from "lucide-react";
import { useAccount, useMonthSetup, useTransactions, useRunningBalances, useOpeningBalanceReconstructor } from "../db/hooks";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";

export function MonthlyTransactionsView() {
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

  // Compute opening balance of Savings for that month using our custom hook
  const savingsOpeningBalance = useOpeningBalanceReconstructor(
    savingsAcc?.id,
    monthYear,
  );

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

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost p-[6px] rounded-full min-h-0 h-auto flex items-center justify-center"
            onClick={() => navigate(backUrl)}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">All Transactions</h2>
        </div>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={tabFilteredItems.length === 0}
          id="export-csv"
          title="Export as CSV"
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div className="fade-in-up flex justify-center mb-4">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Dual Account Balances ────────────────────────────────────────── */}
      <div className="fade-in-up delay-1 flex items-center justify-between px-1 mb-4 text-[0.8125rem] text-(--text-muted)">
        <div>
          Expenditure Balance:{" "}
          <span className="text-(--text) font-semibold ml-0.5">
            {formatINR(expendAcc?.currentBalance ?? 0)}
          </span>
        </div>
        <div>
          Savings Balance:{" "}
          <span className="text-(--credit) font-semibold ml-0.5">
            {formatINR(savingsAcc?.currentBalance ?? 0)}
          </span>
        </div>
      </div>

      <SegmentedControl
        options={["all", "expenditure", "savings"] as const}
        value={activeTab}
        onChange={handleTabChange}
        idPrefix="tab"
        className="fade-in-up delay-1 max-w-[320px] mx-auto mb-4"
      />

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      {tabFilteredItems.length > 0 && (
        <div className="glass-card fade-in-up delay-2 px-3 py-2 mb-4 flex items-center gap-2">
          <Search size={16} className="text-(--text-muted) shrink-0" />
          <input
            type="text"
            placeholder="Search description, category, or amount..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageSize(20);
            }}
            className="w-full bg-transparent border-none outline-none text-[0.875rem] text-(--text) py-1"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPageSize(20);
              }}
              className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center text-(--text-muted)"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className="fade-in-up delay-2 mb-10">
        {tabFilteredItems.length === 0 ? (
          <div className="glass-card empty-state mt-3">
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No transactions logged</p>
            <p className="empty-state-desc">
              There are no transactions logged for this month.
            </p>
          </div>
        ) : searchedItems.length === 0 ? (
          <div className="glass-card empty-state mt-3 py-6 px-4">
            <p className="empty-state-title text-[0.9375rem]">
              No matching results
            </p>
            <p className="empty-state-desc text-[0.8125rem]">
              Try searching for something else.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 pl-1">
              <div
                className={`w-[3px] h-[13px] rounded-full shrink-0 ${activeTab === "savings" ? "bg-(--credit)" : activeTab === "expenditure" ? "bg-(--accent)" : "bg-(--text-muted)"}`}
              />
              <span className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em]">
                Showing {displayedItems.length} of {searchedItems.length}{" "}
                Transactions
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {displayedItems.map((item) => (
                <TransactionCard
                  key={item.tx.id}
                  transaction={item.tx}
                  runningBalance={item.runningBalance}
                  showRunningBalance={activeTab !== "all"}
                  showAccount={activeTab === "all"}
                />
              ))}
            </div>
            {hasMoreItems && (
              <button
                className="btn-secondary w-full mt-4"
                onClick={() => setPageSize((prev) => prev + 20)}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
