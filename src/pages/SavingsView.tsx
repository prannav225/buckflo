import { PiggyBank, Download, Plus, Target, ChevronRight } from "lucide-react";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { formatINR } from "../utils/currency";
import { formatMonthYear } from "../utils/dateUtils";
import { CreateGoalSheet } from "../components/savings/CreateGoalSheet";
import { ManageGoalSheet } from "../components/savings/ManageGoalSheet";
import { SavingsGoalCard } from "../components/savings/SavingsGoalCard";
import { useSavingsData } from "../hooks/useSavingsData";

export function SavingsView() {
  const {
    navigate,
    monthYear,
    isCurrentMonth,
    isCreateOpen,
    setIsCreateOpen,
    selectedGoal,
    setSelectedGoal,
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
    displayedTransactions,
    getOriginalIndex,
  } = useSavingsData();

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <h2 className="sub-header-title m-0">Savings</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
          id="savings-export-csv"
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
          isSavings={true}
          compact={true}
        />
      </div>

      {/* ── Balance Hero ──────────────────────────────────────────────────── */}
      <div className="hero-card hero-card-green fade-in-up mb-3">
        <div className="hero-card-orb-lg" />
        <div className="hero-card-orb-sm" />

        <div className="flex items-center gap-2 mb-1.5">
          <PiggyBank size={14} className="text-white/65" />
          <span className="font-ui text-[0.6875rem] font-semibold text-white/65 tracking-[0.08em] uppercase">
            {isCurrentMonth ? "Savings Balance" : "Savings Closing Balance"}
          </span>
        </div>

        <div className="amount-display text-4xl sm:text-5xl text-white">
          {formatINR(
            isCurrentMonth ? currentSavingsBalance : summary.closingBalance,
          )}
        </div>
      </div>

      {/* ── Savings Goal Jars ────────────────────────────────────────────── */}
      {isCurrentMonth && (
        <div className="fade-in-up delay-1 mb-5 mt-6">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-(--text-muted) m-0">
                Goal Jars
              </h3>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-ghost text-[0.8125rem] py-1 px-2 gap-1 rounded-(--r-sm)"
            >
              <Plus size={14} /> Add Jar
            </button>
          </div>

          {/* Unallocated balance card */}
          <div className="glass-card p-[14px_18px] flex justify-between items-center mb-3">
            <div>
              <div className="font-ui text-[0.75rem] text-(--text-muted) font-medium mb-0.5">
                Unallocated Savings
              </div>
              <div className="font-display text-2.5xl font-semibold text-(--text)">
                {formatINR(unallocatedBalance)}
              </div>
            </div>
            <div className="text-[0.75rem] text-(--text-muted) text-right">
              <div>Total Allocated</div>
              <div className="font-semibold text-(--text)">
                {formatINR(totalAllocated)}
              </div>
            </div>
          </div>

          {/* Goal Grid */}
          {savingGoals.length === 0 ? (
            <div className="glass-card empty-state p-[24px_16px] min-h-0">
              <Target size={28} className="empty-state-icon opacity-60" />
              <p className="empty-state-title text-[0.875rem]">
                No goal jars yet
              </p>
              <p className="empty-state-desc text-[0.75rem] max-w-[240px] m-[4px_auto_0]">
                Partition your savings into visual jars to track specific
                targets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(135px,1fr))] gap-3 mt-3">
              {savingGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => setSelectedGoal(goal)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div
        className={`fade-in-up ${summaryDelay} flex items-center justify-between px-1 mb-3.5 text-[0.8125rem] text-(--text-muted)`}
      >
        <div>
          Transferred Out:{" "}
          <span className="amount-debit ml-0.5">
            {formatINR(summary.totalDebited)}
          </span>
        </div>
        <div>
          Credited In:{" "}
          <span className="amount-credit ml-0.5">
            {formatINR(summary.totalCredited)}
          </span>
        </div>
      </div>

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className={`fade-in-up ${listDelay} mt-8`}>
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-(--text-muted) m-0">
              Savings Transactions
            </h3>
          </div>
          {transactions.length > 0 && (
            <button
              className="btn-ghost text-[0.8125rem] py-1 px-2 gap-0.5 flex items-center"
              onClick={() =>
                navigate(`/monthly/transactions?month=${monthYear}&tab=savings`)
              }
              id="btn-view-all-savings"
            >
              See all ({transactions.length}) <ChevronRight size={14} />
            </button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="glass-card empty-state">
            <PiggyBank size={32} className="empty-state-icon" />
            <p className="empty-state-title">No savings activity</p>
            <p className="empty-state-desc">
              No savings activity for {formatMonthYear(monthYear)}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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

      {/* Sheets / Overlays */}
      <CreateGoalSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        unallocatedBalance={unallocatedBalance}
      />

      <ManageGoalSheet
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        unallocatedBalance={unallocatedBalance}
      />
    </>
  );
}
