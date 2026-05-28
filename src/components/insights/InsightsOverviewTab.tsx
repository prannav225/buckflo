/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { commonOptions } from "../../utils/chartConfig";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useAccount, useTransactions } from "../../db/hooks";
import { useHistoricalData } from "../../hooks/useAnalytics";
import { useCategories } from "../../hooks/useCategories";

export function InsightsOverviewTab() {
  const historicalData = useHistoricalData(6);
  const monthYear = getCurrentMonthYear();
  const expendAcc = useAccount("expenditure");
  const currentMonthTxs = useTransactions(expendAcc?.id, monthYear);

  // Calculations for Overview Tab
  const categorySpend: Record<string, number> = {};
  let totalExpense = 0;
  for (const tx of currentMonthTxs) {
    if (
      tx.type === "debit" &&
      tx.category !== "transfer" &&
      tx.category !== "Transfer" &&
      tx.category !== "opening-transfer"
    ) {
      const cat = tx.category || "Other";
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const donutData = Object.entries(categorySpend).map(([name, value]) => ({
    name,
    value: +value.toFixed(2),
  }));

  const categories = useCategories();

  // Build colour array from categories table, falling back to defaults
  const DONUT_COLORS = donutData.map((d) => {
    const cat = categories.find((c) => c.name === d.name);
    return cat?.color || "#9d9d99";
  });

  return (
    <div className="fade-in-up flex flex-col gap-4">
      {/* Net Worth Trend Line Chart */}
      <div className="glass-card p-[18px_20px]">
        <h3 className="text-[0.8125rem] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
          Net Worth Trend
        </h3>
        <p className="text-[0.6875rem] text-(--text-muted) m-[0_0_16px_0]">
          Combined Expenditure & Savings balance over the last 6 months
        </p>
        {historicalData.length > 0 ? (
          <div className="h-[200px] w-full">
            <Line
              data={{
                labels: historicalData.map((d) => d.label),
                datasets: [
                  {
                    label: "Net Worth",
                    data: historicalData.map((d) => d.netWorth),
                    borderColor: "#5a9e6f", // var(--credit)
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 160);
                      gradient.addColorStop(0, "rgba(90, 158, 111, 0.2)");
                      gradient.addColorStop(1, "rgba(90, 158, 111, 0)");
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
          <div className="py-10 text-center text-(--text-muted) text-[0.8125rem]">
            No historical records found
          </div>
        )}
      </div>

      {/* Month-over-month Spend Bar Chart */}
      <div className="glass-card p-[18px_20px]">
        <h3 className="text-[0.8125rem] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
          Monthly Spending
        </h3>
        <p className="text-[0.6875rem] text-(--text-muted) m-[0_0_16px_0]">
          Comparison of total debited amounts per month
        </p>
        {historicalData.length > 0 ? (
          <div className="h-[200px] w-full">
            <Bar
              data={{
                labels: historicalData.map((d) => d.label),
                datasets: [
                  {
                    label: "Spend",
                    data: historicalData.map((d) => d.totalDebited),
                    backgroundColor: "#d97757", // var(--accent)
                    borderRadius: 4,
                    barThickness: 24,
                  },
                ],
              }}
              options={commonOptions}
            />
          </div>
        ) : (
          <div className="py-10 text-center text-(--text-muted) text-[0.8125rem]">
            No spending history found
          </div>
        )}
      </div>

      {/* Category Distribution Donut Chart */}
      <div className="glass-card p-[18px_20px]">
        <h3 className="text-[0.8125rem] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
          Category Spend Breakdown
        </h3>
        <p className="text-[0.6875rem] text-(--text-muted) m-[0_0_16px_0]">
          Spend distribution for the current month ({getCurrentMonthYear()})
        </p>
        {donutData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-[210px] w-full">
              <Doughnut
                data={{
                  labels: donutData.map((d) => d.name),
                  datasets: [
                    {
                      data: donutData.map((d) => d.value),
                      backgroundColor: DONUT_COLORS,
                      borderWidth: 0,
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  ...commonOptions,
                  cutout: "70%",
                  plugins: {
                    ...commonOptions.plugins,
                    legend: {
                      display: true,
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: { size: 11 },
                      },
                    },
                  },
                  scales: {}, // Remove scales for pie chart
                }}
              />
            </div>
          </div>
        ) : (
          <div className="py-[50px] text-center text-(--text-muted) text-[0.8125rem]">
            No expenses logged for this month
          </div>
        )}
      </div>
    </div>
  );
}
