import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useRunningBalances,
  useMonthSummary,
} from "../db/hooks";
import { MonthPicker } from "../components/MonthPicker";
import { MonthInitModal } from "../components/MonthInitModal";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear, formatMonthYear } from "../utils/dateUtils";
import { exportTransactionsCSV } from "../utils/csvExport";
import { useHistoricalData } from "../hooks/useAnalytics";
import { Line } from "react-chartjs-2";
import { commonOptions } from "../utils/chartConfig";
import { BudgetOverviewCard } from "../components/monthly/BudgetOverviewCard";
import { RecentTransactionsList } from "../components/monthly/RecentTransactionsList";
import { Tooltip as UITooltip } from "../components/ui/Tooltip";

export function MonthlyView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const expendAcc = useAccount("expenditure");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);
  const runningBalances = useRunningBalances(
    transactions,
    monthSetup?.openingBalance ?? 0,
  );
  const summary = useMonthSummary(
    transactions,
    monthSetup?.openingBalance ?? 0,
  );

  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const historicalData = useHistoricalData(6);

  const [showInitModal, setShowInitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-${monthYear}.csv`);
  };

  // Spend breakdown by category (for debits only)
  const categorySpend: { [key: string]: number } = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === "debit") {
      const cat = tx.category || "Other";
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const sortedCategories = Object.entries(categorySpend)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <h2 className="sub-header-title m-0">Monthly</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
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

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup ? (
        <>
          {/* Collapsible Spending Trend Chart */}
          <div className="glass-card fade-in-up delay-1 mb-3 py-3 px-[18px] cursor-pointer">
            <div
              id="trend-chart-header"
              className="flex items-start justify-between gap-3"
              onClick={() => setIsChartExpanded(!isChartExpanded)}
            >
              <span className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider leading-[1.4]">
                Spending Trend (6 Months)
                <span className="inline-flex ml-[6px] align-bottom translate-y-px">
                  <UITooltip
                    id="tooltip_trend_chart"
                    text="Tap to expand your 6-month spending trend."
                    preferredPosition="top"
                  />
                </span>
              </span>
              <span className="text-xs text-(--accent) font-semibold whitespace-nowrap pt-px">
                {isChartExpanded ? "Hide Chart" : "Show Trend"}
              </span>
            </div>
            {isChartExpanded && historicalData.length > 0 && (
              <div
                className="h-[160px] mt-3 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Line
                  data={{
                    labels: historicalData.map((d) => d.label),
                    datasets: [
                      {
                        label: "Spend",
                        data: historicalData.map((d) => d.totalDebited),
                        borderColor: "#d97757", // var(--accent)
                        backgroundColor: (context) => {
                          const ctx = context.chart.ctx;
                          const gradient = ctx.createLinearGradient(
                            0,
                            0,
                            0,
                            130,
                          );
                          gradient.addColorStop(0, "rgba(217, 119, 87, 0.2)");
                          gradient.addColorStop(1, "rgba(217, 119, 87, 0)");
                          return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        borderWidth: 2.5,
                      },
                    ],
                  }}
                  options={commonOptions}
                />
              </div>
            )}
          </div>

          {/* Consolidated 2x2 Summary Card */}
          <div className="glass-card fade-in-up delay-1 mb-3 overflow-hidden">
            <div className="flex items-center justify-between pt-3 pb-2 px-[18px] border-b border-(--border)">
              <span className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                Summary
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="btn-ghost text-xs py-0.5 px-2 h-auto min-h-[unset]"
                  onClick={() => setShowEditModal(true)}
                  id="btn-edit-setup"
                >
                  Edit Setup
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0 pb-3 px-3">
              <div className="p-3 bg-[rgba(0,0,0,0.02)] rounded-(--r-md)">
                <div className="label mb-[2px]">Opening Balance</div>
                <div className="amount-display text-xl">
                  {formatINR(monthSetup.openingBalance)}
                </div>
              </div>
              <div className="p-3 bg-[rgba(0,0,0,0.02)] rounded-(--r-md)">
                <div className="label mb-[2px]">Monthly Budget</div>
                <div className="amount-display text-xl">
                  {formatINR(monthSetup.monthlyBudget)}
                </div>
              </div>
              <div className="p-3 bg-[rgba(224,85,69,0.04)] rounded-(--r-md)">
                <div className="label mb-[2px]">Total Debited</div>
                <div className="amount-display amount-debit text-xl">
                  {formatINR(summary.totalDebited)}
                </div>
              </div>
              <div className="p-3 bg-[rgba(90,158,111,0.04)] rounded-(--r-md)">
                <div className="label mb-[2px]">Total Credited</div>
                <div className="amount-display amount-credit text-xl">
                  {formatINR(summary.totalCredited)}
                </div>
              </div>
            </div>
          </div>

          {/* Closing / Running balance */}
          <div className="glass-card fade-in-up delay-2 py-4 px-5 mb-3 text-center">
            <div className="label text-center mb-1">
              {isCurrentMonth ? "Running Balance" : "Closing Balance"}
            </div>
            <div
              id="running-balance-value"
              className={`amount-display text-[2rem] ${
                summary.closingBalance < 0 ? "text-(--debit)" : "text-(--text)"
              }`}
            >
              {formatINR(summary.closingBalance)}
            </div>
          </div>

          {/* Category-wise Spend Chart */}
          <div id="category-budget-bars" className="relative">
            <div className="absolute top-4 right-4 z-10">
              <UITooltip
                id="tooltip_category_budget"
                text="Set per-category limits in Edit Setup. Bar turns red when you're close to the cap."
                preferredPosition="top"
              />
            </div>
            <BudgetOverviewCard
              sortedCategories={sortedCategories}
              monthSetup={monthSetup}
              totalExpense={totalExpense}
            />
          </div>
        </>
      ) : (
        <div className="glass-card fade-in-up delay-1 mb-3 text-center py-[28px] px-5">
          <p className="text-(--text-secondary) m-0 mb-[14px] text-sm">
            No budget or opening balance setup found for{" "}
            {formatMonthYear(monthYear)}.
          </p>
          <button
            className="btn-primary text-[0.8125rem] py-2.5 px-5"
            onClick={() => setShowInitModal(true)}
            id="btn-init-month"
          >
            Configure {formatMonthYear(monthYear).split(" ")[0]} Setup
          </button>
        </div>
      )}

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <RecentTransactionsList
        transactions={transactions}
        runningBalances={runningBalances}
        monthYear={monthYear}
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
    </>
  );
}
