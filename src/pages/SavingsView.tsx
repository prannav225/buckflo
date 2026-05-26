import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PiggyBank, Download, Plus, Target, ChevronRight } from "lucide-react";
import { type SavingGoal } from "../db/database";
import {
  useAccount,
  useTransactions,
  useRunningBalances,
  useMonthSummary,
  useOpeningBalanceReconstructor,
} from "../db/hooks";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { MonthPicker } from "../components/MonthPicker";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear, formatMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";
import { CreateGoalSheet } from "../components/savings/CreateGoalSheet";
import { ManageGoalSheet } from "../components/savings/ManageGoalSheet";
import { SavingsGoalCard } from "../components/savings/SavingsGoalCard";
import { useSavingsGoals } from "../hooks/useSavingsGoals";
import { Tooltip } from "../components/ui/Tooltip";

export function SavingsView() {
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

  const openingBalance = useOpeningBalanceReconstructor(
    savingsAcc?.id,
    monthYear,
  );

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
  const displayedTransactions = hasMore
    ? transactions.slice(-LIMIT).reverse()
    : [...transactions].reverse();
  const getOriginalIndex = (index: number) => {
    return transactions.length - 1 - index;
  };

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
      <div className="fade-in-up flex justify-center mb-4">
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
          <PiggyBank size={14} color="rgba(255,255,255,0.65)" />
          <span className="font-sans text-[0.6875rem] font-semibold text-[rgba(255,255,255,0.65)] tracking-[0.08em] uppercase">
            {isCurrentMonth ? "Savings Balance" : "Savings Closing Balance"}
          </span>
        </div>

        <div className="amount-display text-[clamp(2.25rem,10vw,3rem)] text-white">
          {formatINR(
            isCurrentMonth ? currentSavingsBalance : summary.closingBalance,
          )}
        </div>
      </div>

      {/* ── Savings Goal Jars ────────────────────────────────────────────── */}
      {isCurrentMonth && (
        <div id="goal-jars-section" className="fade-in-up delay-1 mb-5 mt-6">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-(--text-muted) m-0 flex items-center gap-1">
                Goal Jars
                <Tooltip
                  id="tooltip_goal_jars"
                  text="Allocate portions of your savings toward specific goals. Tap + Add Jar to create one."
                  preferredPosition="top"
                />
              </h3>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-ghost bg-transparent border-none text-(--accent) text-[0.8125rem] font-semibold cursor-pointer flex items-center gap-1 py-1 px-2 rounded-(--r-sm)"
            >
              <Plus size={14} /> Add Jar
            </button>
          </div>

          {/* Unallocated balance card */}
          <div
            id="unallocated-savings"
            className="glass-card py-3.5 px-[18px] flex justify-between items-center mb-3"
          >
            <div>
              <div className="font-sans text-xs text-(--text-muted) font-medium mb-[2px]">
                Unallocated Savings
              </div>
              <div className="font-['Instrument_Serif',Georgia,serif] text-2xl font-semibold text-(--text)">
                {formatINR(unallocatedBalance)}
              </div>
            </div>
            <div className="text-xs text-(--text-muted) text-right">
              <div>Total Allocated</div>
              <div className="font-semibold text-(--text)">
                {formatINR(totalAllocated)}
              </div>
            </div>
          </div>

          {/* Goal Grid */}
          {savingGoals.length === 0 ? (
            <div className="glass-card empty-state py-6 px-4 min-h-auto">
              <Target size={28} className="empty-state-icon opacity-60" />
              <p className="empty-state-title text-sm">No goal jars yet</p>
              <p className="empty-state-desc text-xs max-w-[240px] mt-1 mx-auto mb-0">
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
        className={`fade-in-up ${summaryDelay} flex items-center justify-between py-0 px-1 mb-3.5 text-[0.8125rem] text-(--text-muted)`}
      >
        <div>
          Transferred Out:{" "}
          <span className="amount-debit font-semibold ml-[2px]">
            {formatINR(summary.totalDebited)}
          </span>
        </div>
        <div>
          Credited In:{" "}
          <span className="amount-credit font-semibold ml-[2px]">
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
