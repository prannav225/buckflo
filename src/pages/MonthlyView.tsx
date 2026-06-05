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
import { getCurrentMonthYear } from "../utils/dateUtils";
import { InsightsSubscriptionsTab } from "../components/insights/InsightsSubscriptionsTab";
import { SubscriptionFormSheet } from "../components/insights/SubscriptionFormSheet";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import type { Subscription } from "../db/database";

import { useCommittedExpenses } from "../hooks/useCommittedExpenses";
import { MonthlySetupPlaceholder } from "../components/monthly/MonthlySetupPlaceholder";
import { MonthlySummaryCard } from "../components/monthly/MonthlySummaryCard";
import { CommittedExpensesList } from "../components/monthly/CommittedExpensesList";

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
      { replace: true },
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
  const [showEditModal, setShowEditModal] = useState(
    searchParams.get("edit") === "true",
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Clear the edit param so it doesn't reopen if they close and do something else
  if (showEditModal && searchParams.has("edit")) {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("edit");
        return p;
      },
      { replace: true },
    );
  }

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  // ── Custom Hook for Committed Expenses ────────────────────────────────
  const {
    handleMarkAsPaid,
    handleUndoPaid,
    committedTotal,
    committedPaid,
  } = useCommittedExpenses(monthSetup, spendingAcc);

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
        <MonthlySetupPlaceholder
          monthYear={monthYear}
          spent={spent}
          setShowInitModal={setShowInitModal}
        />
      )}

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup && (
        <MonthlySummaryCard
          monthYear={monthYear}
          summary={summary}
          openingBalance={openingBalance}
          spent={spent}
          budget={budget}
          spendableLeft={spendableLeft}
          spentPct={spentPct}
          overBudget={overBudget}
          setShowEditModal={setShowEditModal}
        />
      )}

      {/* ── Tabs: Committed Expenses vs Subscriptions ──────────────── */}
      <div className="mb-4">
        <SegmentedControl
          options={["committed", "subscriptions"]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as "committed" | "subscriptions")}
          renderLabel={(val) =>
            val === "committed" ? "Committed Expenses" : "Subscriptions"
          }
        />
      </div>

      {activeTab === "committed" ? (
        <div className="fade-in-up">
          {monthSetup ? (
            <CommittedExpensesList
              monthSetup={monthSetup}
              committedTotal={committedTotal}
              committedPaid={committedPaid}
              handleUndoPaid={handleUndoPaid}
              handleMarkAsPaid={handleMarkAsPaid}
              setShowEditModal={setShowEditModal}
            />
          ) : (
            <div className="glass-card text-center py-8 px-4 rounded-xl">
              <p className="text-(--text-secondary) dark:text-white/60 mb-0 text-sm">
                No budget setup found.
              </p>
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
