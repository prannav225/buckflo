import { useState } from "react";
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
import type { Subscription } from "../db/database";

export function MonthlyView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();

  const spendingAcc = useAccount("spending");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(spendingAcc?.id, monthYear);

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

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

      {/* ── Subscriptions Section (Replacing RecentTransactionsList) ────── */}
      <InsightsSubscriptionsTab
        openForm={(sub) => {
          setEditingSub(sub);
          setShowFormModal(true);
        }}
      />

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
