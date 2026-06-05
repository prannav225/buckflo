import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { useAccount } from "../../db/hooks";
import { subDays, format } from "date-fns";

const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

export interface WoWResult {
  thisWeekTotal: number;
  lastWeekTotal: number;
  percentChange: number;
}

export function useWeekOverWeek(): WoWResult {
  const spendingAcc = useAccount("spending");

  return useLiveQuery(
    async () => {
      if (!spendingAcc?.id)
        return { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 };

      const today = new Date();
      const thisWeekStart = toISODate(subDays(today, 6));
      const lastWeekStart = toISODate(subDays(today, 13));
      const lastWeekEnd = toISODate(subDays(today, 7));

      const txs = await db.transactions
        .where("[accountId+date]")
        .between(
          [spendingAcc.id, lastWeekStart],
          [spendingAcc.id, "\uffff"],
          true,
          true,
        )
        .filter((t) => t.type === "debit")
        .toArray();

      let thisWeekTotal = 0;
      let lastWeekTotal = 0;

      for (const tx of txs) {
        if (
          tx.isCommitted ||
          tx.category === "transfer" ||
          tx.category === "Transfer" ||
          tx.category === "starting-transfer"
        ) {
          continue;
        }
        if (tx.date >= thisWeekStart) {
          thisWeekTotal += tx.amount;
        } else if (tx.date >= lastWeekStart && tx.date <= lastWeekEnd) {
          lastWeekTotal += tx.amount;
        }
      }

      let percentChange = 0;
      if (lastWeekTotal > 0) {
        percentChange = +(
          ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) *
          100
        ).toFixed(1);
      }

      return {
        thisWeekTotal: +thisWeekTotal.toFixed(2),
        lastWeekTotal: +lastWeekTotal.toFixed(2),
        percentChange,
      };
    },
    [spendingAcc?.id],
    { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 },
  );
}

export interface MoMResult {
  thisMonthTotal: number;
  lastMonthTotal: number;
  percentChange: number;
}

export function useMonthOverMonth(monthYear: string): MoMResult {
  const spendingAcc = useAccount("spending");

  return useLiveQuery(
    async () => {
      if (!spendingAcc?.id)
        return { thisMonthTotal: 0, lastMonthTotal: 0, percentChange: 0 };

      const [yearStr, monthStr] = monthYear.split("-");
      const currentYear = parseInt(yearStr);
      const currentMonth = parseInt(monthStr);

      let lastMonth = currentMonth - 1;
      let lastYear = currentYear;
      if (lastMonth < 1) {
        lastMonth = 12;
        lastYear -= 1;
      }

      const lastMonthYear = `${lastYear}-${lastMonth.toString().padStart(2, "0")}`;

      const [thisMonthTxs, lastMonthTxs] = await Promise.all([
        db.transactions
          .where("[accountId+date]")
          .between(
            [spendingAcc.id, `${monthYear}-01`],
            [spendingAcc.id, `${monthYear}-31`],
            true,
            true,
          )
          .filter((t) => t.type === "debit")
          .toArray(),
        db.transactions
          .where("[accountId+date]")
          .between(
            [spendingAcc.id, `${lastMonthYear}-01`],
            [spendingAcc.id, `${lastMonthYear}-31`],
            true,
            true,
          )
          .filter((t) => t.type === "debit")
          .toArray(),
      ]);

      const isNotTransfer = (tx: any) =>
        !tx.isCommitted &&
        tx.category !== "transfer" &&
        tx.category !== "Transfer" &&
        tx.category !== "starting-transfer";

      const thisMonthTotal = thisMonthTxs
        .filter(isNotTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const lastMonthTotal = lastMonthTxs
        .filter(isNotTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);

      let percentChange = 0;
      if (lastMonthTotal > 0) {
        percentChange = +(
          ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) *
          100
        ).toFixed(1);
      } else if (thisMonthTotal > 0) {
        percentChange = 100;
      }

      return {
        thisMonthTotal: +thisMonthTotal.toFixed(2),
        lastMonthTotal: +lastMonthTotal.toFixed(2),
        percentChange,
      };
    },
    [spendingAcc?.id, monthYear],
    { thisMonthTotal: 0, lastMonthTotal: 0, percentChange: 0 },
  );
}

export interface HistoricalDataPoint {
  label: string;
  monthYear: string;
  totalDebited: number;
  netWorth: number;
  savingsBalance: number;
}

export function useHistoricalData(monthsCount = 6): HistoricalDataPoint[] {
  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");

  return useLiveQuery(
    async () => {
      if (!spendingAcc || !savingsAcc) return [];

      const allTxs = await db.transactions.toArray();
      const allSetups = await db.monthSetups.toArray();
      const today = new Date();
      const points: HistoricalDataPoint[] = [];

      let earliestMonthYear = "9999-12";
      for (const setup of allSetups) {
        if (setup.monthYear < earliestMonthYear) {
          earliestMonthYear = setup.monthYear;
        }
      }
      for (const tx of allTxs) {
        const txMonth = tx.date.substring(0, 7);
        if (txMonth < earliestMonthYear) {
          earliestMonthYear = txMonth;
        }
      }

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mYear = format(d, "yyyy-MM");
        const label = format(d, "MMM");

        if (mYear < earliestMonthYear) {
          points.push({
            label,
            monthYear: mYear,
            totalDebited: 0,
            netWorth: 0,
            savingsBalance: 0,
          });
          continue;
        }

        let totalExpense = 0;
        for (const tx of allTxs.filter(
          (t) => t.accountId === spendingAcc.id && t.date.startsWith(mYear),
        )) {
          if (tx.type === "debit") {
            if (
              !tx.isCommitted &&
              tx.category !== "transfer" &&
              tx.category !== "Transfer" &&
              tx.category !== "starting-transfer"
            ) {
              totalExpense += tx.amount;
            }
          }
        }

        let expBal = spendingAcc.currentBalance;
        let savBal = savingsAcc.currentBalance;

        for (const tx of allTxs) {
          const txMonth = tx.date.substring(0, 7);
          if (txMonth > mYear) {
            const amt = tx.amount;
            if (tx.accountId === spendingAcc.id) {
              if (tx.type === "credit") {
                expBal -= amt;
              } else {
                expBal += amt;
              }
            } else if (tx.accountId === savingsAcc.id) {
              if (tx.type === "credit") {
                savBal -= amt;
              } else {
                savBal += amt;
              }
            }
          }
        }

        points.push({
          label,
          monthYear: mYear,
          totalDebited: +totalExpense.toFixed(2),
          netWorth: +(expBal + savBal).toFixed(2),
          savingsBalance: +savBal.toFixed(2),
        });
      }

      return points;
    },
    [spendingAcc?.id, savingsAcc?.id, monthsCount],
    [],
  );
}
