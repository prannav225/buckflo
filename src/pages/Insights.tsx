import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Calendar } from "lucide-react";
import { commonOptions } from "../utils/chartConfig";
import { getCurrentMonthYear, formatMonthYear } from "../utils/dateUtils";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
} from "../db/hooks";
import { useHistoricalData } from "../hooks/useAnalytics";
import { MonthPicker } from "../components/MonthPicker";
import { BudgetOverviewCard } from "../components/monthly/BudgetOverviewCard";
import { SegmentedControl } from "../components/ui/SegmentedControl";

export function Insights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();

  const expendAcc = useAccount("expenditure");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);

  const [chartRange, setChartRange] = useState<"3" | "6" | "12">("6");
  const historicalData = useHistoricalData(parseInt(chartRange));

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
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up flex items-center justify-between mb-2">
        <h2 className="sub-header-title m-0">Insights</h2>
      </div>

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div className="fade-in-up flex justify-center mb-5">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Spending Trend Chart Card ───────────────────────────────────── */}
      <div className="glass-card fade-in-up delay-1 mb-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Spending Trend
            </h3>
            <p className="text-[0.6875rem] text-(--text-muted) m-0">
              Your overall expenditure trends over time
            </p>
          </div>
          <div className="w-[180px] sm:w-[200px]">
            <SegmentedControl
              options={["3", "6", "12"] as const}
              value={chartRange}
              onChange={(val) => setChartRange(val)}
              renderLabel={(val) => `${val} M`}
              idPrefix="range"
            />
          </div>
        </div>

        {historicalData.length > 0 ? (
          <div className="h-[180px] w-full mt-2">
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
                      const gradient = ctx.createLinearGradient(0, 0, 0, 150);
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
        ) : (
          <div className="py-12 text-center text-(--text-muted) text-xs">
            No historical spending trend records found
          </div>
        )}
      </div>

      {/* ── Category Spend breakdown ────────────────────────────────────── */}
      {sortedCategories.length > 0 ? (
        <BudgetOverviewCard
          sortedCategories={sortedCategories}
          monthSetup={monthSetup || undefined}
          totalExpense={totalExpense}
        />
      ) : (
        <div className="glass-card empty-state px-5 py-10 mt-3 fade-in-up delay-2">
          <Calendar size={32} className="empty-state-icon" />
          <p className="empty-state-title">No category spend recorded</p>
          <p className="empty-state-desc">
            No expenditure entries logged for {formatMonthYear(monthYear)}.
          </p>
        </div>
      )}
    </>
  );
}
