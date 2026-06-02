import { useMemo } from "react";
import { useAccount, useMonthSetup, useTransactions, useMonthSummary } from "../../db/hooks";
import {
  getCurrentMonthYear,
  getDaysInCurrentMonth,
  getDaysElapsedInMonth,
  isDismissedWithin24Hours,
} from "../../utils/dateUtils";

export interface SmartAllocationResult {
  shouldShow: boolean;
  surplus: number;
  suggestedAmount: number;
  expenditureBalance: number;
  projectedSpend: number;
}

export function useSmartAllocationPrompt(): SmartAllocationResult | null {
  const spendingAcc = useAccount("spending");
  const monthYear = getCurrentMonthYear();
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(spendingAcc?.id, monthYear);
  const summary = useMonthSummary(
    transactions,
    monthSetup?.openingBalance ?? 0,
  );

  return useMemo(() => {
    if (!spendingAcc?.id) return null;

    const currentBalance = summary.closingBalance;

    const dismissedTime = localStorage.getItem("flo_advisor_dismissed");
    if (isDismissedWithin24Hours(dismissedTime)) {
      return {
        shouldShow: false,
        surplus: 0,
        suggestedAmount: 0,
        expenditureBalance: currentBalance,
        projectedSpend: 0,
      };
    }

    const totalDays = getDaysInCurrentMonth();
    const daysElapsed = getDaysElapsedInMonth();
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const totalDebited = summary.totalExpense;
    const avgDailySpend = totalDebited / daysElapsed;
    const projectedRemainingSpend = avgDailySpend * daysRemaining;
    const surplus = currentBalance - projectedRemainingSpend;

    const budget = monthSetup?.monthlyBudget ?? 0;
    const shouldShow =
      daysElapsed >= 7 &&
      totalDebited > 0 &&
      budget > 0 &&
      surplus > 1000 &&
      currentBalance > 1000;
    const suggestedAmount = shouldShow
      ? Math.max(500, Math.floor((surplus * 0.8) / 500) * 500)
      : 0;

    return {
      shouldShow,
      surplus: +surplus.toFixed(2),
      suggestedAmount,
      expenditureBalance: currentBalance,
      projectedSpend: +projectedRemainingSpend.toFixed(2),
    };
  }, [spendingAcc, summary, monthSetup?.monthlyBudget]);
}
