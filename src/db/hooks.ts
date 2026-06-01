import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type Account,
  type MonthSetup,
  type Transaction,
  type Subscription,
  getSpendingWallet,
} from "./database";
import { getCurrentMonthYear, getMonthDateRange } from "../utils/dateUtils";

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useAccounts(): Account[] {
  return useLiveQuery(() => db.accounts.toArray(), [], []);
}

export function useAccount(
  type: "spending" | "savings",
): Account | undefined {
  return useLiveQuery(
    async () => {
      if (type === "spending") {
        let acc = await db.accounts.where("type").equals("spending").first();
        if (!acc) acc = await db.accounts.where("type").equals("expenditure").first() as Account;
        if (!acc) acc = await db.accounts.get(1);
        return acc;
      } else {
        let acc = await db.accounts.where("type").equals("savings").first();
        if (!acc) acc = await db.accounts.get(2);
        return acc;
      }
    },
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
      const expAcc = await getSpendingWallet();
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
): { totalDebited: number; totalExpense: number; totalCredited: number; closingBalance: number } {
  let totalDebited = 0;
  let totalExpense = 0;
  let totalCredited = 0;

  for (const tx of transactions) {
    if (tx.type === "debit") {
      totalDebited += tx.amount;
      if (
        tx.category !== "transfer" &&
        tx.category !== "Transfer" &&
        tx.category !== "starting-transfer"
      ) {
        totalExpense += tx.amount;
      }
    }
    else totalCredited += tx.amount;
  }

  const closingBalance = +(
    openingBalance -
    totalDebited +
    totalCredited
  ).toFixed(2);
  return {
    totalDebited: +totalDebited.toFixed(2),
    totalExpense: +totalExpense.toFixed(2),
    totalCredited: +totalCredited.toFixed(2),
    closingBalance,
  };
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export function useSubscriptions(): Subscription[] {
  return useLiveQuery(() => db.subscriptions.toArray(), [], []);
}

// ─── Starting Balance Reconstructor ───────────────────────────────────────────

export function useOpeningBalanceReconstructor(
  accountId: number | undefined,
  monthYear: string,
): number {
  const currentBalance = useLiveQuery(
    async () => {
      if (!accountId) return 0;
      const acc = await db.accounts.get(accountId);
      return acc?.currentBalance ?? 0;
    },
    [accountId],
    0,
  );

  const txsSinceStart = useLiveQuery(
    async () => {
      if (!accountId) return [];
      const [year, month] = monthYear.split("-").map(Number);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      return db.transactions
        .where("accountId")
        .equals(accountId)
        .filter((tx) => tx.date >= startDate)
        .toArray();
    },
    [accountId, monthYear],
    [],
  );

  const openingBalance = useMemo(() => {
    let bal = currentBalance;
    for (const tx of txsSinceStart) {
      bal = tx.type === "credit" ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  }, [currentBalance, txsSinceStart]);

  return openingBalance;
}

