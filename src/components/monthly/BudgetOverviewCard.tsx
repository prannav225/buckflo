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
    <div className="glass-card fade-in-up delay-2 p-5 mb-3">
      <h3 className="text-xs font-semibold mb-3 text-(--text-secondary) uppercase tracking-[0.04em]">
        {hasCatBudgets ? "Category Budgets" : "Category Spend"}
      </h3>
      <div className="flex flex-col gap-3 mt-3">
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
            <div key={name} className="flex flex-col gap-1.25">
              <div className="flex justify-between items-center text-[0.8125rem] font-medium">
                <span className="text-(--text) flex items-center gap-1.5">
                  {name}
                  {hasBudget && thresholdStatus === "warning" && (
                    <span className="inline-block font-sans text-[11px] font-semibold px-2 py-0.5 rounded-(--r-pill) leading-[1.6] whitespace-nowrap bg-[rgba(234,179,8,0.12)] text-[#b8960f] dark:text-[#eab308]">
                      ⚠ {pct.toFixed(0)}%
                    </span>
                  )}
                  {hasBudget && thresholdStatus === "danger" && (
                    <span className="inline-block font-sans text-[11px] font-semibold px-2 py-0.5 rounded-(--r-pill) leading-[1.6] whitespace-nowrap bg-[rgba(224,85,69,0.1)] text-(--debit)">
                      {pct >= 100 ? "⚠ Over limit" : `⚠ ${pct.toFixed(0)}%`}
                    </span>
                  )}
                </span>
                <span className="text-(--text-secondary)">
                  {formatINR(amount)}
                  {hasBudget ? (
                    <span className="opacity-50 text-xs ml-2">
                      / {formatINR(catLimit)}
                    </span>
                  ) : (
                    <span className="opacity-50 text-xs ml-2">
                      ({pct.toFixed(0)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-(--border) rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-600 ease-in-out"
                  style={{
                    width: `${clampedPct}%`,
                    background: barColor,
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
