import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useMonthSummary,
  useOpeningBalanceReconstructor,
} from "../db/hooks";
import { MonthPicker } from "../components/MonthPicker";
import { MonthInitModal } from "../components/MonthInitModal";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear, formatMonthYear } from "../utils/dateUtils";
import { InsightsSubscriptionsTab } from "../components/insights/InsightsSubscriptionsTab";
import { SubscriptionFormSheet } from "../components/insights/SubscriptionFormSheet";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { db, addTransaction, type Subscription } from "../db/database";
import { Check, Undo2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function MonthlyView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();

  const spendingAcc = useAccount("spending");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(spendingAcc?.id, monthYear);

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "subscriptions" ? "subscriptions" : "committed";
  const setActiveTab = (tab: "committed" | "subscriptions") => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        return next;
      },
      { replace: true }
    );
  };

  const reconstructedOpeningBalance = useOpeningBalanceReconstructor(
    spendingAcc?.id,
    monthYear,
  );
  const openingBalance =
    monthSetup?.openingBalance ?? reconstructedOpeningBalance;

  const summary = useMonthSummary(transactions, openingBalance);

  const spent = summary.totalExpense;
  const budget = monthSetup?.monthlyBudget ?? 0;
  const remaining = budget - spent;
  const actualBalance = summary.closingBalance;
  const spendableLeft = Math.max(0, Math.min(remaining, actualBalance));
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;

  const [showInitModal, setShowInitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(searchParams.get("edit") === "true");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Clear the edit param so it doesn't reopen if they close and do something else
  if (showEditModal && searchParams.has("edit")) {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.delete("edit");
      return p;
    }, { replace: true });
  }

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  // ── Mark as Paid handler ──────────────────────────────────────────────
  const handleMarkAsPaid = useCallback(async (expenseIdx: number) => {
    if (!monthSetup || !spendingAcc?.id) return;
    const expenses = monthSetup.committedExpenses;
    if (!expenses || !expenses[expenseIdx]) return;
    const expense = expenses[expenseIdx];

    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const txId = await addTransaction({
        date: todayStr,
        description: `${expense.name} (Committed)`,
        amount: expense.amount,
        type: "debit",
        accountId: spendingAcc.id,
        category: expense.category,
        isCommitted: true,
      });

      // Update the monthSetup with paid status
      const updatedExpenses = [...expenses];
      updatedExpenses[expenseIdx] = {
        ...expense,
        isPaid: true,
        paidDate: todayStr,
        transactionId: txId,
      };

      await db.monthSetups
        .where("[accountId+monthYear]")
        .equals([spendingAcc.id, monthSetup.monthYear])
        .modify({ committedExpenses: updatedExpenses });

      toast.success(`${expense.name} marked as paid ✓`);
    } catch (err) {
      console.error("Failed to mark as paid:", err);
      toast.error("Failed to mark as paid");
    }
  }, [monthSetup, spendingAcc]);

  // ── Undo Paid handler ─────────────────────────────────────────────────
  const handleUndoPaid = useCallback(async (expenseIdx: number) => {
    if (!monthSetup || !spendingAcc?.id) return;
    const expenses = monthSetup.committedExpenses;
    if (!expenses || !expenses[expenseIdx]) return;
    const expense = expenses[expenseIdx];

    try {
      // Delete the associated transaction
      if (expense.transactionId) {
        await db.transactions.delete(expense.transactionId);
      }

      // Update the monthSetup
      const updatedExpenses = [...expenses];
      updatedExpenses[expenseIdx] = {
        ...expense,
        isPaid: false,
        paidDate: undefined,
        transactionId: undefined,
      };

      await db.monthSetups
        .where("[accountId+monthYear]")
        .equals([spendingAcc.id, monthSetup.monthYear])
        .modify({ committedExpenses: updatedExpenses });

      toast.success(`${expense.name} unmarked ✓`);
    } catch (err) {
      console.error("Failed to undo:", err);
      toast.error("Failed to undo");
    }
  }, [monthSetup, spendingAcc]);

  // Compute committed totals
  const committedTotal = monthSetup?.committedExpenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const committedPaid = monthSetup?.committedExpenses?.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <h2 className="sub-header-title m-0">Monthly</h2>
      </div>

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div className="fade-in-up flex justify-center mb-4">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Setup Prompt (rendered if monthSetup is missing) ── */}
      {!monthSetup && (
        <div className="glass-card fade-in-up delay-1 mb-4 text-center py-5.5 px-5">
          <p className="text-(--text-secondary) m-0 mb-3.5 text-sm">
            No budget or opening balance setup found for{" "}
            {formatMonthYear(monthYear)}.
          </p>

          {spent > 0 && (
            <div className="mb-4 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-xl p-3.5 inline-block min-w-[220px]">
              <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider block mb-1">
                Total Spent This Month
              </span>
              <span className="font-display text-2xl font-bold text-(--debit) block">
                {formatINR(spent)}
              </span>
            </div>
          )}

          <div>
            <button
              className="btn-primary text-[0.8125rem] py-2.5 px-5 h-auto min-h-0 cursor-pointer"
              onClick={() => setShowInitModal(true)}
              id="btn-init-month"
            >
              Configure {formatMonthYear(monthYear).split(" ")[0]} Setup
            </button>
          </div>
        </div>
      )}

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup ? (
        <>
          {/* ── Monthly Hero Card ──────────────────────────────────────── */}
          <div className="fade-in-up delay-1 mb-4.5 relative overflow-hidden bg-white/70 dark:bg-linear-to-br dark:from-[#2e2e2c] dark:to-[#1f1f1e] text-(--text) dark:text-white border border-white/80 dark:border-white/5 rounded-(--r-2xl) p-5.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-lg [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]">
            {/* Orbs for background depth */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-orange-100/50 dark:bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-orange-200/40 dark:bg-[rgba(217,119,87,0.1)] blur-2xl pointer-events-none" />
            <div className="absolute -inset-full bg-linear-to-tr from-transparent via-white/8 to-transparent rotate-45 pointer-events-none" />

            {/* Header Label Row */}
            <div className="flex justify-between items-center mb-1.5 font-sans text-[0.6875rem] font-semibold text-(--text-muted) dark:text-white/60 tracking-wider uppercase">
              <span>Spending Balance</span>
              <span>{formatMonthYear(monthYear)}</span>
            </div>

            {/* Big Balance Amount */}
            <div className="amount-display text-[clamp(2.25rem,10vw,2.75rem)] text-(--text) dark:text-white mb-5">
              {formatINR(summary.closingBalance)}
            </div>

            {/* Optional Budget Progress Bar */}
            {monthSetup && budget > 0 && (
              <div className="mb-5">
                {/* Small Starting Balance & Monthly Budget display */}
                <div className="flex justify-between font-sans text-[10px] text-(--text-muted) dark:text-white/50 mb-1.5 font-medium tracking-wide">
                  <span>Opening: {formatINR(openingBalance)}</span>
                  <span>Budget: {formatINR(budget)}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-in-out ${
                      overBudget
                        ? "bg-(--debit)"
                        : spentPct >= 80
                          ? "bg-orange-500"
                          : "bg-black/80 dark:bg-white/90"
                    }`}
                    style={{
                      width: `${spentPct}%`,
                    }}
                  />
                </div>

                {/* Spent vs Left */}
                <div className="flex justify-between font-sans text-xs text-(--text-secondary) dark:text-white/80 font-medium">
                  <span>
                    <strong className="text-sm font-bold text-(--text) dark:text-white tracking-tight">
                      {formatINR(spent)}
                    </strong>{" "}
                    spent
                  </span>
                  <span>
                    {overBudget ? (
                      <span className="text-(--debit) font-semibold">
                        Exceeded
                      </span>
                    ) : (
                      <span className="text-(--text) dark:text-white/90 font-semibold">
                        {formatINR(spendableLeft)} left
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Cash Flow Metrics (Debits & Credits) */}
            <div className="flex items-center justify-between border-t border-black/8 dark:border-white/10 pt-4 mt-1">
              <div className="flex gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-semibold text-(--text-muted) dark:text-white/50 uppercase tracking-wider">
                    Total Debited
                  </span>
                  <span className="text-sm font-bold text-(--debit) dark:text-[#eb9d85] font-sans">
                    -{formatINR(summary.totalDebited)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-semibold text-(--text-muted) dark:text-white/50 uppercase tracking-wider">
                    Total Credited
                  </span>
                  <span className="text-sm font-bold text-(--credit) dark:text-[#a7d3b5] font-sans">
                    +{formatINR(summary.totalCredited)}
                  </span>
                </div>
              </div>

              {monthSetup && (
                <button
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/18 border border-black/10 dark:border-white/32 text-(--text) dark:text-white hover:bg-black/10 dark:hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                  onClick={() => setShowEditModal(true)}
                  id="btn-edit-setup"
                >
                  Edit Setup
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* ── Tabs: Committed Expenses vs Subscriptions ──────────────── */}
      <div className="mb-4">
        <SegmentedControl
          options={["committed", "subscriptions"]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as "committed" | "subscriptions")}
          renderLabel={(val) => val === "committed" ? "Committed Expenses" : "Subscriptions"}
        />
      </div>

      {activeTab === "committed" ? (
        <div className="space-y-3 mb-6 fade-in-up">
          {/* Committed Total Summary */}
          {monthSetup?.committedExpenses && monthSetup.committedExpenses.length > 0 && (
            <div className="glass-card-strong px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
                  Committed Total
                </div>
                <div className="text-xl font-display text-(--text)">
                  {formatINR(committedTotal)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
                  Paid
                </div>
                <div className="text-lg font-display text-(--credit)">
                  {formatINR(committedPaid)} <span className="text-xs text-(--text-muted)">/ {formatINR(committedTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {monthSetup?.committedExpenses && monthSetup.committedExpenses.length > 0 ? (
            monthSetup.committedExpenses.map((expense, idx) => {
              const today = new Date().getDate();
              const isDue = expense.dueDay !== undefined && today >= expense.dueDay && !expense.isPaid;

              return (
                <div
                  key={`${expense.name}-${idx}`}
                  className={`glass-card p-4 rounded-xl transition-all duration-200 ${
                    expense.isPaid ? "opacity-75" : isDue ? "ring-1 ring-(--accent)/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-(--text) dark:text-white text-sm">
                          {expense.name}
                        </span>
                        {expense.isPaid && (
                          <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                            Paid ✓
                          </span>
                        )}
                        {isDue && (
                          <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/20 animate-pulse">
                            Due
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--text-muted)">
                        {expense.category !== expense.name && (
                          <span className="whitespace-nowrap">{expense.category}</span>
                        )}
                        {expense.dueDay && (
                          <>
                            {expense.category !== expense.name && <span className="opacity-50">•</span>}
                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                              <CalendarDays size={10} />
                              Due on {expense.dueDay}{expense.dueDay === 1 ? "st" : expense.dueDay === 2 ? "nd" : expense.dueDay === 3 ? "rd" : "th"}
                            </span>
                          </>
                        )}
                        {expense.paidDate && (
                          <>
                            {(expense.category !== expense.name || expense.dueDay) && <span className="opacity-50">•</span>}
                            <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Paid {expense.paidDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2.5 shrink-0">
                      <span className="font-display text-base font-bold text-(--text) dark:text-white whitespace-nowrap">
                        {formatINR(expense.amount)}
                      </span>
                      {expense.isPaid ? (
                        <button
                          onClick={() => handleUndoPaid(idx)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
                        >
                          <Undo2 size={12} /> Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(idx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(217,119,87,0.1)] text-(--accent) rounded-lg font-semibold text-[11px] border border-(--accent)/20 hover:bg-(--accent) hover:text-white transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Check size={12} strokeWidth={3} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card text-center py-8 px-4 rounded-xl">
              <p className="text-(--text-secondary) dark:text-white/60 mb-4 text-sm">
                No committed expenses set for this month.
              </p>
              <button
                className="btn-primary py-2 px-5 text-sm"
                onClick={() => setShowEditModal(true)}
              >
                Edit Setup
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="fade-in-up">
          <InsightsSubscriptionsTab
            openForm={(sub) => {
              setEditingSub(sub);
              setShowFormModal(true);
            }}
            monthYear={monthYear}
          />
        </div>
      )}

      {/* ── Setup / Edit Modals ──────────────────────────────────────────── */}
      <MonthInitModal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        monthYear={monthYear}
        isEdit={false}
        onSaved={() => {}}
      />
      <MonthInitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        monthYear={monthYear}
        isEdit={true}
        onSaved={() => {}}
      />

      {/* ── Manual Add / Edit Modal Overlay for Subscriptions ───────────── */}
      {showFormModal && (
        <SubscriptionFormSheet
          showFormModal={showFormModal}
          setShowFormModal={setShowFormModal}
          editingSub={editingSub}
        />
      )}
    </>
  );
}
