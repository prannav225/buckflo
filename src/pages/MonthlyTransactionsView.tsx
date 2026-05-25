import { ArrowLeft, Calendar, Download, Search, X } from "lucide-react";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { formatINR } from "../utils/currency";
import { useMonthlyTransactions } from "../hooks/useMonthlyTransactions";

export function MonthlyTransactionsView() {
  const {
    navigate,
    monthYear,
    searchQuery,
    setSearchQuery,
    activeTab,
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
  } = useMonthlyTransactions();

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost p-1.5 rounded-full min-h-0 h-auto flex items-center justify-center"
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
      <div className="flex justify-center mb-4 fade-in-up">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Dual Account Balances ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 mb-4 text-[0.8125rem] text-(--text-muted) fade-in-up delay-1">
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

      {/* ── Tab Switcher ────────────────────────────────────────────── */}
      <div className="seg-control fade-in-up delay-1 mb-4">
        {(["all", "expenditure", "savings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`seg-option ${
              activeTab === tab ? "seg-option-active" : ""
            } capitalize py-2`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      {tabFilteredItems.length > 0 && (
        <div className="glass-card fade-in-up delay-2 p-[8px_12px] mb-4 flex items-center gap-2">
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
          <div className="glass-card empty-state mt-3 p-[24px_16px]">
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
                className={`w-0.75 h-[13px] rounded-full shrink-0 ${
                  activeTab === "savings"
                    ? "bg-(--credit)"
                    : activeTab === "expenditure"
                      ? "bg-(--accent)"
                      : "bg-(--text-muted)"
                }`}
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
