import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";
import { useAccount } from "../../db/hooks";
import { startOfDay, subDays, format, differenceInDays, addDays } from "date-fns";

const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

export interface DetectedSubscription {
  description: string;
  amount: number;
  category: string;
  nextDueDate: string; // "yyyy-MM-dd"
  daysLeft: number;
}

export function useSubscriptionAlerts(): DetectedSubscription[] {
  const spendingAcc = useAccount("spending");

  return useLiveQuery(
    async () => {
      if (!spendingAcc?.id) return [];

      const ninetyDaysAgo = toISODate(subDays(new Date(), 90));
      const txs = await db.transactions
        .where("[accountId+date]")
        .between(
          [spendingAcc.id, ninetyDaysAgo],
          [spendingAcc.id, "\uffff"],
          true,
          true,
        )
        .filter((t) => t.type === "debit")
        .toArray();

      const groups: { [key: string]: typeof txs } = {};
      for (const tx of txs) {
        const descKey = tx.description.trim().toLowerCase();
        const key = `${descKey}_${tx.amount.toFixed(0)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
      }

      const today = startOfDay(new Date());
      const detected: DetectedSubscription[] = [];

      for (const key in groups) {
        const groupTxs = groups[key].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        if (groupTxs.length < 2) continue;

        let isRecurring = false;
        let avgInterval = 30;
        const intervals = [];

        for (let i = 1; i < groupTxs.length; i++) {
          const diff = differenceInDays(
            new Date(groupTxs[i].date),
            new Date(groupTxs[i - 1].date),
          );
          if (diff >= 25 && diff <= 35) {
            isRecurring = true;
            intervals.push(diff);
          }
        }

        if (isRecurring) {
          if (intervals.length > 0) {
            avgInterval = Math.round(
              intervals.reduce((a, b) => a + b, 0) / intervals.length,
            );
          }

          const lastTx = groupTxs[groupTxs.length - 1];
          const lastTxDate = new Date(lastTx.date);
          const nextDate = addDays(lastTxDate, avgInterval);
          const daysLeft = differenceInDays(nextDate, today);

          if (daysLeft >= 0 && daysLeft <= 30) {
            detected.push({
              description: lastTx.description,
              amount: lastTx.amount,
              category: lastTx.category || "Other",
              nextDueDate: toISODate(nextDate),
              daysLeft,
            });
          }
        }
      }

      return detected.sort((a, b) => a.daysLeft - b.daysLeft);
    },
    [spendingAcc?.id],
    [],
  );
}
