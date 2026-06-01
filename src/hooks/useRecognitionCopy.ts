/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { useAccount, useMonthSetup } from "../db/hooks";
import { format, subMonths, getDaysInMonth } from "date-fns";
import { formatNumber } from "../utils/currency";
import { getCurrentMonthYear } from "../utils/dateUtils";

export function useRecognitionCopy(): string | null {
  const spendingAcc = useAccount("spending");
  const currentMonthYear = getCurrentMonthYear();
  const monthSetup = useMonthSetup(currentMonthYear);

  return useLiveQuery(
    async () => {
      if (!spendingAcc?.id) return null;

      const today = new Date();
      const dayOfMonth = today.getDate();

      // 1. Fetch transactions in Spending Wallet for streak and comparisons
      // Filter out transfers and adjustments for real expense calculation
      const isRealExpense = (t: any) =>
        t.type === "debit" &&
        t.category !== "transfer" &&
        t.category !== "Transfer" &&
        t.category !== "starting-transfer" &&
        t.category !== "adjustment";

      const allTxs = await db.transactions
        .where("accountId")
        .equals(spendingAcc.id)
        .toArray();

      const expenseTxs = allTxs.filter(isRealExpense);

      // --- RULE 1: Consistency Streak ---
      // Get a unique set of date strings (YYYY-MM-DD) for logged expenses
      const expenseDates = new Set(expenseTxs.map((t) => t.date));

      let streak = 0;
      const checkDate = new Date(today);
      let dateStr = format(checkDate, "yyyy-MM-dd");

      if (expenseDates.has(dateStr)) {
        streak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          dateStr = format(checkDate, "yyyy-MM-dd");
          if (expenseDates.has(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      } else {
        // Try yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = format(checkDate, "yyyy-MM-dd");
        if (expenseDates.has(dateStr)) {
          streak = 1;
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            dateStr = format(checkDate, "yyyy-MM-dd");
            if (expenseDates.has(dateStr)) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      if (streak >= 7) {
        return `${streak} days logged straight. Nice consistency.`;
      }

      // --- RULE 2: MTD Spending Reduction ---
      // Compare current Month-To-Date spent vs last month's same MTD period
      const thisMonthStartStr = format(today, "yyyy-MM") + "-01";
      const thisMonthEndStr = format(today, "yyyy-MM-dd");

      const lastMonthDate = subMonths(today, 1);
      const lastMonthStartStr = format(lastMonthDate, "yyyy-MM") + "-01";
      const lastMonthEndStr =
        format(lastMonthDate, "yyyy-MM") +
        "-" +
        String(dayOfMonth).padStart(2, "0");

      const thisMonthTxs = expenseTxs.filter(
        (t) => t.date >= thisMonthStartStr && t.date <= thisMonthEndStr,
      );
      const lastMonthTxs = expenseTxs.filter(
        (t) => t.date >= lastMonthStartStr && t.date <= lastMonthEndStr,
      );

      const thisMonthSpent = thisMonthTxs.reduce((sum, t) => sum + t.amount, 0);
      const lastMonthSpent = lastMonthTxs.reduce((sum, t) => sum + t.amount, 0);

      if (lastMonthSpent > 0 && thisMonthSpent < lastMonthSpent) {
        const diff = lastMonthSpent - thisMonthSpent;
        if (diff >= 1) {
          return `₹${formatNumber(diff, 0)} less than this time last month.`;
        }
      }

      // --- RULE 3: Early Month Health ---
      // If day of month is <= 7 and total spent <= daily budget rate * current day
      if (dayOfMonth <= 7 && monthSetup && monthSetup.monthlyBudget > 0) {
        const totalDays = getDaysInMonth(today);
        const dailyRate = monthSetup.monthlyBudget / totalDays;
        const targetMTD = dailyRate * dayOfMonth;

        if (thisMonthSpent <= targetMTD) {
          const monthName = format(today, "MMMM");
          return `Good start to ${monthName}.`;
        }
      }

      return null;
    },
    [spendingAcc?.id, monthSetup?.monthlyBudget],
    null,
  );
}
