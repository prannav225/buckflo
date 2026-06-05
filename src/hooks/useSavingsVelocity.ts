import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";

export function useSavingsVelocity() {
  const data = useLiveQuery(async () => {
    // 1. Get savings account id
    const savingsAcc = await db.accounts
      .where("type")
      .equals("savings")
      .first();
    if (!savingsAcc?.id) return { averageMonthlySavings: 0, monthsActive: 0 };

    // 2. Get all 'credit' transactions to the savings account
    const savingsTransactions = await db.transactions
      .where("accountId")
      .equals(savingsAcc.id)
      .toArray();

    const credits = savingsTransactions.filter((tx) => tx.type === "credit");

    if (credits.length === 0) {
      return { averageMonthlySavings: 0, monthsActive: 0 };
    }

    // 3. Group by month (YYYY-MM)
    const monthTotals: Record<string, number> = {};
    credits.forEach((tx) => {
      const monthYear = tx.date.slice(0, 7); // "YYYY-MM"
      monthTotals[monthYear] = (monthTotals[monthYear] || 0) + tx.amount;
    });

    const months = Object.keys(monthTotals);
    const monthsActive = months.length;

    // 4. Calculate average (only active months, or from first month to now? Active months is more encouraging)
    const totalSaved = Object.values(monthTotals).reduce((a, b) => a + b, 0);
    const averageMonthlySavings = monthsActive > 0 ? totalSaved / monthsActive : 0;

    return {
      averageMonthlySavings,
      monthsActive,
      monthTotals,
    };
  }, []);

  const averageMonthlySavings = data?.averageMonthlySavings || 0;

  // Calculate ETA for a specific goal
  const calculateETA = (target: number, current: number) => {
    if (current >= target) return 0;
    if (averageMonthlySavings <= 0) return null; // never reachable at current rate
    const remaining = target - current;
    return Math.ceil(remaining / averageMonthlySavings);
  };

  return {
    averageMonthlySavings,
    calculateETA,
    monthsActive: data?.monthsActive || 0,
  };
}
