import { Calendar } from "lucide-react";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";

import { formatINR } from "../utils/currency";
import { useMonthlyTransactions } from "../hooks/useMonthlyTransactions";

export function MonthlyTransactionsView() {
  const {
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
    setPageSize,
    handleMonthChange,
    tabFilteredItems,
    filteredItems,
    displayedItems,
    hasMoreItems,
  } = useMonthlyTransactions();

  const expenses = filteredItems
    .filter(
      (item) =>
        !item.tx.isCommitted &&
        item.tx.type === "debit" &&
        item.tx.category !== "transfer" &&
        item.tx.category !== "Transfer" &&
        item.tx.category !== "starting-transfer" &&
        item.tx.category !== "adjustment",
    )
    .reduce((sum, item) => sum + item.tx.amount, 0);

  return (
    <>
      <div className="pb-2">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="fade-in-up flex items-center justify-center mb-4">
          <MonthPicker
            monthYear={monthYear}
            onChange={handleMonthChange}
            compact={true}
          />
        </div>

        {/* ── Transaction Activity Indicators ────────────────────────────── */}
        <div className="glass-card mb-4 fade-in-up delay-1 relative overflow-hidden bg-(--bg-glass-strong) border border-black/5 dark:border-white/5 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-(--accent)/10 blur-2xl pointer-events-none" />
          <div className="px-5 py-4 flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-(--accent) shadow-[0_0_8px_var(--accent)] animate-pulse"></div>
              <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">
                Total Spent
              </span>
            </div>
            <span className="text-[28px] font-display font-semibold text-(--text) tracking-tight leading-none">
              {formatINR(expenses, expenses % 1 === 0 ? 0 : 2, 100000)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}

      {tabFilteredItems.length > 0 && (
        <TransactionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          sortBy={sortBy}
          setSortBy={setSortBy}
          txTypeFilter={txTypeFilter}
          setTxTypeFilter={setTxTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onResetPage={() => setPageSize(20)}
        />
      )}

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className="fade-in-up delay-2 mb-2">
        {tabFilteredItems.length === 0 ? (
          <div className="glass-card empty-state mt-3">
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No transactions logged</p>
            <p className="empty-state-desc">
              There are no transactions logged for this month.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-card empty-state mt-3 py-6 px-4">
            <p className="empty-state-title text-[0.9375rem]">
              No matching results
            </p>
            <p className="empty-state-desc text-[0.8125rem]">
              Try searching or filtering for something else.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 pl-1">
              <div className="w-[3px] h-[13px] rounded-full shrink-0 bg-(--accent)" />
              <span className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em]">
                Showing {displayedItems.length} of {filteredItems.length}{" "}
                Transactions
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {displayedItems.map((item) => (
                <TransactionCard
                  key={item.tx.id}
                  transaction={item.tx}
                  runningBalance={item.runningBalance}
                  showRunningBalance={sortBy === "date_desc"}
                  showAccount={false}
                />
              ))}
            </div>
            {hasMoreItems && (
              <div className="mt-5 flex justify-center pb-2">
                <button
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-[0.8125rem] font-medium tracking-wide text-(--text-secondary) bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer outline-none border-0"
                  onClick={() => setPageSize((prev) => prev + 20)}
                >
                  Load more
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
