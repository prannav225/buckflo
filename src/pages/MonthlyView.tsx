import { Download } from "lucide-react";
import { MonthPicker } from "../components/MonthPicker";
import { MonthInitModal } from "../components/MonthInitModal";
import { formatINR } from "../utils/currency";
import { formatMonthYear } from "../utils/dateUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { BudgetOverviewCard } from "../components/monthly/BudgetOverviewCard";
import { RecentTransactionsList } from "../components/monthly/RecentTransactionsList";
import { useMonthlyData } from "../hooks/useMonthlyData";

export function MonthlyView() {
  const {
    monthYear,
    isCurrentMonth,
    monthSetup,
    transactions,
    runningBalances,
    summary,
    isChartExpanded,
    setIsChartExpanded,
    historicalData,
    showEditModal,
    setShowEditModal,
    handleMonthChange,
    handleExport,
    sortedCategories,
    totalExpense,
  } = useMonthlyData();

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <h2 className="sub-header-title m-0">Monthly</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
          id="btn-export-csv"
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

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup ? (
        <>
          {/* Collapsible Spending Trend Chart */}
          <div
            className="glass-card fade-in-up delay-1 mb-3 p-[12px_18px] cursor-pointer"
            onClick={() => setIsChartExpanded(!isChartExpanded)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] font-semibold text-(--text-secondary) uppercase tracking-[0.05em]">
                Spending Trend (6 Months)
              </span>
              <span className="text-[0.75rem] text-(--accent) font-semibold">
                {isChartExpanded ? "Hide Chart" : "Show Trend"}
              </span>
            </div>
            {isChartExpanded && historicalData.length > 0 && (
              <div
                className="h-40 mt-3 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historicalData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSpend"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent)"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(value) => [formatINR(Number(value)), "Spend"]}
                      contentStyle={{
                        background: "var(--bg-glass-strong)",
                        border: "var(--glass-border)",
                        borderRadius: "var(--r-md)",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalDebited"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSpend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Consolidated 2x2 Summary Card */}
          <div className="glass-card fade-in-up delay-1 mb-3 overflow-hidden">
            <div className="flex items-center justify-between p-[12px_18px_8px] border-b border-(--border)">
              <span className="text-[0.75rem] font-semibold text-(--text-secondary) uppercase tracking-[0.05em]">
                Summary
              </span>
              <button
                className="btn-ghost text-[0.75rem] py-0.5 px-2 h-auto min-h-0"
                onClick={() => setShowEditModal(true)}
                id="btn-edit-setup"
              >
                Edit Setup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-[0_12px_12px_12px]">
              <div className="p-3 bg-black/2 dark:bg-white/2 rounded-(--r-md)">
                <div className="label mb-0.5">Opening Balance</div>
                <div className="amount-display text-[1.25rem]">
                  {formatINR(monthSetup.openingBalance)}
                </div>
              </div>
              <div className="p-3 bg-black/2 dark:bg-white/2 rounded-(--r-md)">
                <div className="label mb-0.5">Monthly Budget</div>
                <div className="amount-display text-[1.25rem]">
                  {formatINR(monthSetup.monthlyBudget)}
                </div>
              </div>
              <div className="p-3 bg-(--debit)/5 rounded-(--r-md)">
                <div className="label mb-0.5">Total Debited</div>
                <div className="amount-display amount-debit text-[1.25rem]">
                  {formatINR(summary.totalDebited)}
                </div>
              </div>
              <div className="p-3 bg-(--credit)/5 rounded-(--r-md)">
                <div className="label mb-0.5">Total Credited</div>
                <div className="amount-display amount-credit text-[1.25rem]">
                  {formatINR(summary.totalCredited)}
                </div>
              </div>
            </div>
          </div>

          {/* Closing / Running balance */}
          <div className="glass-card fade-in-up delay-2 p-[16px_20px] mb-3 text-center">
            <div className="label text-center mb-1">
              {isCurrentMonth ? "Running Balance" : "Closing Balance"}
            </div>
            <div
              className={`amount-display text-3.5xl ${
                summary.closingBalance < 0 ? "text-(--debit)" : "text-(--text)"
              }`}
            >
              {formatINR(summary.closingBalance)}
            </div>
          </div>

          {/* Budget Progress & Category Breakdown */}
          <BudgetOverviewCard
            monthSetup={monthSetup}
            sortedCategories={sortedCategories}
            totalExpense={totalExpense}
          />

          {/* Transactions list */}
          <RecentTransactionsList
            transactions={transactions}
            runningBalances={runningBalances}
            monthYear={monthYear}
          />

          {/* Config Setup Modal */}
          <MonthInitModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            monthYear={monthYear}
            onSaved={() => setShowEditModal(false)}
            isEdit={true}
          />
        </>
      ) : (
        <div className="glass-card fade-in-up delay-1 mb-3 text-center p-[28px_20px]">
          <p className="text-(--text-secondary) mb-3.5 text-sm">
            No budget or opening balance setup found for{" "}
            {formatMonthYear(monthYear)}.
          </p>
          <button
            className="btn-primary text-[0.8125rem] py-2.5 px-5"
            onClick={() => setShowEditModal(true)}
            id="btn-init-month"
          >
            Configure {formatMonthYear(monthYear).split(" ")[0]} Setup
          </button>

          <MonthInitModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            monthYear={monthYear}
            onSaved={() => setShowEditModal(false)}
          />
        </div>
      )}
    </>
  );
}
