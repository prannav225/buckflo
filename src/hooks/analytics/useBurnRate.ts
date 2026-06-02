import { getDaysInCurrentMonth, getDaysElapsedInMonth } from "../../utils/dateUtils";

export interface BurnRateResult {
  avgDailySpend: number;
  projectedTotalSpend: number;
  isOverrunProjected: boolean;
  dayOfExhaustion: number | null;
  daysRemaining: number;
}

export function useBurnRate(
  budget: number,
  totalSpent: number,
): BurnRateResult {
  const totalDays = getDaysInCurrentMonth();
  const elapsedDays = getDaysElapsedInMonth();
  const avgDailySpend = +(totalSpent / elapsedDays).toFixed(2);
  const projectedTotalSpend = +(avgDailySpend * totalDays).toFixed(2);
  const isOverrunProjected = budget > 0 && projectedTotalSpend > budget;

  // Day of the month on which budget will run out
  const dayOfExhaustion =
    isOverrunProjected && avgDailySpend > 0
      ? Math.floor(budget / avgDailySpend)
      : null;

  return {
    avgDailySpend,
    projectedTotalSpend,
    isOverrunProjected,
    dayOfExhaustion,
    daysRemaining: Math.max(0, totalDays - elapsedDays),
  };
}
