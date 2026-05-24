import { formatINR } from "../../utils/currency";

interface CategorySpend {
  name: string;
  amount: number;
}

interface MonthSetup {
  categoryBudgets?: Record<string, number>;
}

interface Props {
  sortedCategories: CategorySpend[];
  monthSetup: MonthSetup | undefined;
  totalExpense: number;
}

export function BudgetOverviewCard({
  sortedCategories,
  monthSetup,
  totalExpense,
}: Props) {
  if (sortedCategories.length === 0) return null;

  const catBudgets = monthSetup?.categoryBudgets;
  const hasCatBudgets = catBudgets && Object.keys(catBudgets).length > 0;

  return (
    <div
      className="glass-card fade-in-up delay-2"
      style={{ padding: "18px 20px", marginBottom: 12 }}
    >
      <h3
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          marginBottom: 12,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {hasCatBudgets ? "Category Budgets" : "Category Spend"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sortedCategories.map(({ name, amount }) => {
          const catLimit = catBudgets?.[name];
          const hasBudget = catLimit !== undefined && catLimit > 0;

          // If budget exists: percentage is spend/budget, otherwise spend/total
          const pct = hasBudget
            ? (amount / catLimit) * 100
            : totalExpense > 0
              ? (amount / totalExpense) * 100
              : 0;
          const clampedPct = Math.min(pct, 100);

          // Colour thresholds (only apply when a per-category budget is set)
          let barColor =
            "linear-gradient(90deg, var(--accent) 0%, #eb9d85 100%)";
          let thresholdStatus: "ok" | "warning" | "danger" = "ok";
          if (hasBudget) {
            if (pct >= 100) {
              barColor =
                "linear-gradient(90deg, var(--debit) 0%, #e06055 100%)";
              thresholdStatus = "danger";
            } else if (pct >= 80) {
              barColor =
                "linear-gradient(90deg, #e0a045 0%, var(--debit) 100%)";
              thresholdStatus = "danger";
            } else if (pct >= 60) {
              barColor = "linear-gradient(90deg, #eab308 0%, #e0a045 100%)";
              thresholdStatus = "warning";
            }
          }

          return (
            <div
              key={name}
              style={{ display: "flex", flexDirection: "column", gap: 5 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {name}
                  {hasBudget && thresholdStatus === "warning" && (
                    <span className="category-budget-badge category-budget-badge-warning">
                      ⚠ {pct.toFixed(0)}%
                    </span>
                  )}
                  {hasBudget && thresholdStatus === "danger" && (
                    <span className="category-budget-badge category-budget-badge-danger">
                      {pct >= 100 ? "⚠ Over limit" : `⚠ ${pct.toFixed(0)}%`}
                    </span>
                  )}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {formatINR(amount)}
                  {hasBudget ? (
                    <span
                      style={{
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        marginLeft: 3,
                      }}
                    >
                      / {formatINR(catLimit)}
                    </span>
                  ) : (
                    <span
                      style={{
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        marginLeft: 2,
                      }}
                    >
                      ({pct.toFixed(0)}%)
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "var(--border)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${clampedPct}%`,
                    background: barColor,
                    borderRadius: 999,
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
