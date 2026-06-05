import { useAccount, useMonthSetup, useTransactions } from "../../db/hooks";
import { getCurrentMonthYear } from "../../utils/dateUtils";

export interface CategoryBudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentUsed: number;
  isExceeded: boolean;
}

export function useCategoryBudgetAlerts(): CategoryBudgetAlert[] {
  const monthYear = getCurrentMonthYear();
  const spendingAcc = useAccount("spending");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(spendingAcc?.id, monthYear);

  if (
    !monthSetup?.categoryBudgets ||
    Object.keys(monthSetup.categoryBudgets).length === 0
  ) {
    return [];
  }

  const catBudgets = monthSetup.categoryBudgets;
  const committedCatNames = new Set(
    (monthSetup.committedExpenses || []).map(e => e.category || e.name)
  );

  const catSpend: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === "debit") {
      if (
        tx.isCommitted ||
        tx.category === "transfer" ||
        tx.category === "Transfer" ||
        tx.category === "starting-transfer"
      ) {
        continue;
      }
      const cat = tx.category || "Other";
      catSpend[cat] = (catSpend[cat] || 0) + tx.amount;
    }
  }

  const alerts: CategoryBudgetAlert[] = [];
  for (const [category, budget] of Object.entries(catBudgets)) {
    if (committedCatNames.has(category)) {
      continue; // Do not alert on committed expenses
    }
    const spent = catSpend[category] || 0;
    const percentUsed = budget > 0 ? +((spent / budget) * 100).toFixed(1) : 0;
    if (percentUsed >= 80) {
      alerts.push({
        category,
        spent,
        budget,
        percentUsed,
        isExceeded: spent >= budget,
      });
    }
  }

  return alerts.sort((a, b) => {
    if (a.isExceeded !== b.isExceeded) return a.isExceeded ? -1 : 1;
    return b.percentUsed - a.percentUsed;
  });
}
