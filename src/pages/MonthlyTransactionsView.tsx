import { useState } from "react";
import { Calendar, Upload, Download } from "lucide-react";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { ImportModal } from "../components/transactions/ImportModal";
import { ExportSheet } from "../components/transactions/ExportSheet";
import { formatINR } from "../utils/currency";
import { useMonthlyTransactions } from "../hooks/useMonthlyTransactions";

export function MonthlyTransactionsView() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
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
    activeTab,
    setPageSize,
    handleMonthChange,
    handleTabChange,
    tabFilteredItems,
    filteredItems,
    displayedItems,
    hasMoreItems,
  } = useMonthlyTransactions();

  const expenses = filteredItems
    .filter(
      (item) =>
        item.tx.type === "debit" &&
        item.tx.category !== "transfer" &&
        item.tx.category !== "Transfer" &&
        item.tx.category !== "opening-transfer" &&
        item.tx.category !== "adjustment",
    )
    .reduce((sum, item) => sum + item.tx.amount, 0);

  const income = filteredItems
    .filter(
      (item) =>
        item.tx.type === "credit" &&
        item.tx.category !== "transfer" &&
        item.tx.category !== "Transfer" &&
        item.tx.category !== "opening-transfer" &&
        item.tx.category !== "adjustment",
    )
    .reduce((sum, item) => sum + item.tx.amount, 0);

  const transfersCredit = filteredItems
    .filter(
      (item) =>
        item.tx.type === "credit" &&
        (item.tx.category === "transfer" ||
          item.tx.category === "Transfer" ||
          item.tx.category === "opening-transfer"),
    )
    .reduce((sum, item) => sum + item.tx.amount, 0);

  const transfersDebit = filteredItems
    .filter(
      (item) =>
        item.tx.type === "debit" &&
        (item.tx.category === "transfer" ||
          item.tx.category === "Transfer" ||
          item.tx.category === "opening-transfer"),
    )
    .reduce((sum, item) => sum + item.tx.amount, 0);

  const netTransfers = transfersCredit - transfersDebit;

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="sub-header-title m-0">All Transactions</h2>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            className="btn-ghost min-h-0 h-auto flex items-center justify-center rounded-lg"
            onClick={() => setIsImportOpen(true)}
            id="import-csv"
            title="Import from CSV"
          >
            <Upload size={16} />
          </button>
          <button
            className="btn-ghost min-h-0 h-auto flex items-center justify-center rounded-lg"
            onClick={() => setIsExportOpen(true)}
            id="export-csv"
            title="Export to CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div className="fade-in-up flex justify-center mb-4">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Transaction Activity Indicators ────────────────────────────── */}
      <div className="glass-card fade-in-up delay-1 grid grid-cols-3 gap-2 p-3.5 mb-4 text-[0.8125rem] text-center">
        <div className="flex flex-col gap-0.5 border-r border-black/5 dark:border-white/5">
          <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Expenses
          </span>
          <span className="text-[0.9375rem] font-bold text-(--debit)">
            -{formatINR(expenses)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-r border-black/5 dark:border-white/5">
          <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Income
          </span>
          <span className="text-[0.9375rem] font-bold text-(--credit)">
            +{formatINR(income)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Transfers
          </span>
          <span
            className={`text-[0.9375rem] font-bold ${
              netTransfers >= 0 ? "text-(--credit)" : "text-(--debit)"
            }`}
          >
            {netTransfers >= 0 ? "+" : ""}
            {formatINR(netTransfers)}
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
          onResetPage={() => setPageSize(20)}
        />
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
              <div
                className={`w-[3px] h-[13px] rounded-full shrink-0 ${
                  activeTab === "savings"
                    ? "bg-(--credit)"
                    : activeTab === "expenditure"
                      ? "bg-(--accent)"
                      : "bg-(--text-muted)"
                }`}
              />
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
                  showRunningBalance={
                    activeTab !== "all" && sortBy === "date_desc"
                  }
                  showAccount={activeTab === "all"}
                />
              ))}
            </div>
            {hasMoreItems && (
              <button
                className="btn-secondary w-full mt-4 py-2!"
                onClick={() => setPageSize((prev) => prev + 20)}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          // Reactively updated via Dexie hook listeners automatically
        }}
        activeTab={activeTab}
      />
      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        defaultAccount={activeTab}
      />
    </>
  );
}
