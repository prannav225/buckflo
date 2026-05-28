import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Download, Upload } from "lucide-react";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { ImportModal } from "../components/transactions/ImportModal";
import { ExportSheet } from "../components/transactions/ExportSheet";
import { formatINR } from "../utils/currency";
import { useMonthlyTransactions } from "../hooks/useMonthlyTransactions";

export function MonthlyTransactionsView() {
  const navigate = useNavigate();
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
    activeTab,
    setPageSize,
    expendAcc,
    savingsAcc,
    handleMonthChange,
    handleTabChange,
    tabFilteredItems,
    filteredItems,
    displayedItems,
    hasMoreItems,
    backUrl,
  } = useMonthlyTransactions();

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted)"
            onClick={() => navigate(backUrl)}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">All Transactions</h2>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            className="btn-ghost min-h-0 h-auto flex items-center justify-center rounded-lg"
            onClick={() => setIsImportOpen(true)}
            id="import-csv"
            title="Import from CSV"
          >
            <Upload size={16} />
          </button>
          <button
            className="btn-ghost p-1.5 min-h-0 h-auto flex items-center justify-center rounded-lg"
            onClick={() => setIsExportOpen(true)}
            disabled={tabFilteredItems.length === 0}
            id="export-csv"
            title="Export as CSV"
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
                className="btn-secondary w-full mt-4"
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
