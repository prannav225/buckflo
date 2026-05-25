import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type Account,
  type MonthSetup,
  type Transaction,
  type Subscription,
} from "./database";
import { getCurrentMonthYear, getMonthDateRange } from "../utils/dateUtils";

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useAccounts(): Account[] {
  return useLiveQuery(() => db.accounts.toArray(), [], []);
}

export function useAccount(
  type: "expenditure" | "savings",
): Account | undefined {
  return useLiveQuery(
    () => db.accounts.where("type").equals(type).first(),
    [type],
  );
}

// ─── Month Setup ─────────────────────────────────────────────────────────────

export function useMonthSetup(
  monthYear?: string,
): MonthSetup | null | undefined {
  const my = monthYear ?? getCurrentMonthYear();
  return useLiveQuery(
    async () => {
      const expAcc = await db.accounts
        .where("type")
        .equals("expenditure")
        .first();
      if (!expAcc?.id) return null;
      const setup = await db.monthSetups
        .where("[accountId+monthYear]")
        .equals([expAcc.id, my])
        .first();
      return setup ?? null;
    },
    [my],
    undefined,
  );
}

export function useAllMonthSetups(): MonthSetup[] {
  return useLiveQuery(() => db.monthSetups.toArray(), [], []);
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function useTransactions(
  accountId: number | undefined,
  monthYear: string,
): Transaction[] {
  return useLiveQuery(
    () => {
      if (!accountId) return [];
      const { startDate, endDate } = getMonthDateRange(monthYear);

      return db.transactions
        .where("[accountId+date]")
        .between([accountId, startDate], [accountId, endDate], true, true)
        .sortBy("date");
    },
    [accountId, monthYear],
    [],
  );
}

export function useRecentTransactions(
  accountId?: number,
  limit = 5,
): Transaction[] {
  return useLiveQuery(
    () => {
      let queryPromise;
      if (accountId !== undefined) {
        queryPromise = db.transactions
          .where("accountId")
          .equals(accountId)
          .toArray();
      } else {
        queryPromise = db.transactions.toArray();
      }
      return queryPromise.then((txs) => {
        return txs
          .sort((a, b) => {
            // Sort by spent date descending
            if (b.date !== a.date) {
              return b.date.localeCompare(a.date);
            }
            // Fallback to createdAt descending
            const timeB = b.createdAt || 0;
            const timeA = a.createdAt || 0;
            return timeB - timeA;
          })
          .slice(0, limit);
      });
    },
    [accountId, limit],
    [],
  );
}

// ─── Running Balance ─────────────────────────────────────────────────────────

/**
 * Returns an array of running balances per transaction,
 * computed from the month's opening balance.
 */
export function useRunningBalances(
  transactions: Transaction[],
  openingBalance: number,
): number[] {
  let running = openingBalance;
  return transactions.map((tx) => {
    running =
      tx.type === "credit"
        ? +(running + tx.amount).toFixed(2)
        : +(running - tx.amount).toFixed(2);
    return running;
  });
}

// ─── Monthly Summary ─────────────────────────────────────────────────────────

export function useMonthSummary(
  transactions: Transaction[],
  openingBalance: number,
): { totalDebited: number; totalCredited: number; closingBalance: number } {
  let totalDebited = 0;
  let totalCredited = 0;

  for (const tx of transactions) {
    if (tx.type === "debit") totalDebited += tx.amount;
    else totalCredited += tx.amount;
  }

  const closingBalance = +(
    openingBalance -
    totalDebited +
    totalCredited
  ).toFixed(2);
  return {
    totalDebited: +totalDebited.toFixed(2),
    totalCredited: +totalCredited.toFixed(2),
    closingBalance,
  };
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export function useSubscriptions(): Subscription[] {
  return useLiveQuery(() => db.subscriptions.toArray(), [], []);
}
