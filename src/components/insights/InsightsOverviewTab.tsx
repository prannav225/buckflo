import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatINR } from "../../utils/currency";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useAccount, useTransactions } from "../../db/hooks";
import { useHistoricalData } from "../../hooks/useAnalytics";

export function InsightsOverviewTab() {
  const historicalData = useHistoricalData(6);
  const monthYear = getCurrentMonthYear();
  const expendAcc = useAccount("expenditure");
  const currentMonthTxs = useTransactions(expendAcc?.id, monthYear);

  // Calculations for Overview Tab
  const categorySpend: Record<string, number> = {};
  let totalExpense = 0;
  for (const tx of currentMonthTxs) {
    if (tx.type === "debit") {
      const cat = tx.category || "Other";
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const donutData = Object.entries(categorySpend).map(([name, value]) => ({
    name,
    value: +value.toFixed(2),
  }));

  const DONUT_COLORS = [
    "var(--accent)",
    "var(--credit)",
    "#e0a045",
    "#9060b0",
    "#40a0c0",
    "#b04060",
    "#a0a860",
    "var(--text-secondary)",
  ];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
      className="fade-in-up"
    >
      {/* Net Worth Trend Line Chart */}
      <div className="glass-card" style={{ padding: "18px 20px" }}>
        <h3
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          Net Worth Trend
        </h3>
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            margin: "0 0 16px 0",
          }}
        >
          Combined Expenditure & Savings balance over the last 6 months
        </p>
        {historicalData.length > 0 ? (
          <div style={{ height: 200, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorNetWorth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--credit)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--credit)"
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
                  formatter={(value: any) => [
                    formatINR(value),
                    "Net Worth",
                  ]}
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
                  dataKey="netWorth"
                  stroke="var(--credit)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorNetWorth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            No historical records found
          </div>
        )}
      </div>

      {/* Month-over-month Spend Bar Chart */}
      <div className="glass-card" style={{ padding: "18px 20px" }}>
        <h3
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          Monthly Spending
        </h3>
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            margin: "0 0 16px 0",
          }}
        >
          Comparison of total debited amounts per month
        </p>
        {historicalData.length > 0 ? (
          <div style={{ height: 200, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historicalData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
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
                  formatter={(value: any) => [formatINR(value), "Spent"]}
                  contentStyle={{
                    background: "var(--bg-glass-strong)",
                    border: "var(--glass-border)",
                    borderRadius: "var(--r-md)",
                    color: "var(--text)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="totalDebited"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            No spending history found
          </div>
        )}
      </div>

      {/* Category Distribution Donut Chart */}
      <div className="glass-card" style={{ padding: "18px 20px" }}>
        <h3
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          Category Spend Breakdown
        </h3>
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            margin: "0 0 16px 0",
          }}
        >
          Spend distribution for the current month ({getCurrentMonthYear()})
        </p>
        {donutData.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ height: 210, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatINR(value), "Spent"]}
                    contentStyle={{
                      background: "var(--bg-glass-strong)",
                      border: "var(--glass-border)",
                      borderRadius: "var(--r-md)",
                      color: "var(--text)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "11px",
                      fontFamily: "var(--font-ui)",
                      bottom: 0,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "50px 0",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            No expenses logged for this month
          </div>
        )}
      </div>
    </div>
  );
}
