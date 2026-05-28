import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAccount } from '../db/hooks';
import { format, subMonths } from 'date-fns';

export interface MonthComparisonResult {
  percentChange: number;
  direction: 'up' | 'down' | 'neutral';
  hasLastMonthData: boolean;
  thisMonthSpent: number;
  lastMonthSpent: number;
}

/**
 * Compares spending from day 1 to TODAY this month vs day 1 to the SAME DAY last month.
 * This keeps the comparison fair regardless of where in the month we are.
 */
export function useMonthComparison(): MonthComparisonResult {
  const expendAcc = useAccount('expenditure');

  return useLiveQuery(
    async () => {
      const fallback: MonthComparisonResult = {
        percentChange: 0,
        direction: 'neutral',
        hasLastMonthData: false,
        thisMonthSpent: 0,
        lastMonthSpent: 0,
      };

      if (!expendAcc?.id) return fallback;

      const today = new Date();
      const dayOfMonth = today.getDate();

      // This month: day 1 → today
      const thisMonthStart = format(today, 'yyyy-MM') + '-01';
      const thisMonthEnd = format(today, 'yyyy-MM-dd');

      // Last month: day 1 → same day
      const lastMonthDate = subMonths(today, 1);
      const lastMonthStart = format(lastMonthDate, 'yyyy-MM') + '-01';
      const lastMonthEnd =
        format(lastMonthDate, 'yyyy-MM') +
        '-' +
        String(dayOfMonth).padStart(2, '0');

      // Query this month's debits
      const thisMonthTxs = await db.transactions
        .where('[accountId+date]')
        .between(
          [expendAcc.id, thisMonthStart],
          [expendAcc.id, thisMonthEnd],
          true,
          true,
        )
        .filter((t) => t.type === 'debit')
        .toArray();

      // Query last month's debits (up to same day)
      const lastMonthTxs = await db.transactions
        .where('[accountId+date]')
        .between(
          [expendAcc.id, lastMonthStart],
          [expendAcc.id, lastMonthEnd],
          true,
          true,
        )
        .filter((t) => t.type === 'debit')
        .toArray();

      const thisMonthSpent = thisMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const lastMonthSpent = lastMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);

      if (lastMonthSpent === 0) {
        return { ...fallback, thisMonthSpent };
      }

      const percentChange = +((
        ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
      ).toFixed(0));

      let direction: 'up' | 'down' | 'neutral';
      if (percentChange > 5) {
        direction = 'up';
      } else if (percentChange < -5) {
        direction = 'down';
      } else {
        direction = 'neutral';
      }

      return {
        percentChange: Math.abs(percentChange),
        direction,
        hasLastMonthData: true,
        thisMonthSpent: +thisMonthSpent.toFixed(2),
        lastMonthSpent: +lastMonthSpent.toFixed(2),
      };
    },
    [expendAcc?.id],
    {
      percentChange: 0,
      direction: 'neutral' as const,
      hasLastMonthData: false,
      thisMonthSpent: 0,
      lastMonthSpent: 0,
    },
  );
}
