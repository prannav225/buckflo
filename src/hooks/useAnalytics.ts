import { useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import {
  useAccount,
  useMonthSetup,
  useTransactions,
  useMonthSummary,
} from "../db/hooks";
import {
  getCurrentMonthYear,
  getDaysInCurrentMonth,
  getDaysElapsedInMonth,
  isDismissedWithin24Hours,
} from "../utils/dateUtils";
import {
  startOfDay,
  subDays,
  format,
  differenceInDays,
  addDays,
} from "date-fns";

// Helper to get ISO date string from Date object
const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

// ─── 1. Burn Rate Hook ───────────────────────────────────────────────────────
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

// ─── 2. Subscription Alerts Hook ─────────────────────────────────────────────
export interface DetectedSubscription {
  description: string;
  amount: number;
  category: string;
  nextDueDate: string; // "yyyy-MM-dd"
  daysLeft: number;
}

export function useSubscriptionAlerts(): DetectedSubscription[] {
  const expendAcc = useAccount("expenditure");

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id) return [];

      // Query past 90 days of expenditure debits
      const ninetyDaysAgo = toISODate(subDays(new Date(), 90));
      const txs = await db.transactions
        .where("[accountId+date]")
        .between(
          [expendAcc.id, ninetyDaysAgo],
          [expendAcc.id, "\uffff"],
          true,
          true,
        )
        .filter((t) => t.type === "debit")
        .toArray();

      // Group by lowercase description + amount
      const groups: { [key: string]: typeof txs } = {};
      for (const tx of txs) {
        // Clean description
        const descKey = tx.description.trim().toLowerCase();
        // Allow tiny variance in amount (e.g. within 2% or exact match)
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

        // Check date intervals
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

          // Calculate days remaining
          const daysLeft = differenceInDays(nextDate, today);

          // If next billing date is in the future and within the next 30 days
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

      // Sort by urgency (days left ascending)
      return detected.sort((a, b) => a.daysLeft - b.daysLeft);
    },
    [expendAcc?.id],
    [],
  );
}

// ─── 3. Week-Over-Week Spending Hook ──────────────────────────────────────────
export interface WoWResult {
  thisWeekTotal: number;
  lastWeekTotal: number;
  percentChange: number; // e.g. -15.5 for a 15.5% reduction
}

export function useWeekOverWeek(): WoWResult {
  const expendAcc = useAccount("expenditure");

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id)
        return { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 };

      const today = new Date();
      const thisWeekStart = toISODate(subDays(today, 6)); // last 7 days
      const lastWeekStart = toISODate(subDays(today, 13));
      const lastWeekEnd = toISODate(subDays(today, 7));

      const txs = await db.transactions
        .where("[accountId+date]")
        .between(
          [expendAcc.id, lastWeekStart],
          [expendAcc.id, "\uffff"],
          true,
          true,
        )
        .filter((t) => t.type === "debit")
        .toArray();

      let thisWeekTotal = 0;
      let lastWeekTotal = 0;

      for (const tx of txs) {
        if (
          tx.category === "transfer" ||
          tx.category === "Transfer" ||
          tx.category === "opening-transfer"
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
    [expendAcc?.id],
    { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 },
  );
}

export interface MoMResult {
  thisMonthTotal: number;
  lastMonthTotal: number;
  percentChange: number;
}

export function useMonthOverMonth(monthYear: string): MoMResult {
  const expendAcc = useAccount("expenditure");

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id)
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
            [expendAcc.id, `${monthYear}-01`],
            [expendAcc.id, `${monthYear}-31`],
            true,
            true,
          )
          .filter((t) => t.type === "debit")
          .toArray(),
        db.transactions
          .where("[accountId+date]")
          .between(
            [expendAcc.id, `${lastMonthYear}-01`],
            [expendAcc.id, `${lastMonthYear}-31`],
            true,
            true,
          )
          .filter((t) => t.type === "debit")
          .toArray()
      ]);

      const isNotTransfer = (tx: any) =>
        tx.category !== "transfer" &&
        tx.category !== "Transfer" &&
        tx.category !== "opening-transfer";

      const thisMonthTotal = thisMonthTxs
        .filter(isNotTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const lastMonthTotal = lastMonthTxs
        .filter(isNotTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);

      let percentChange = 0;
      if (lastMonthTotal > 0) {
        percentChange = +(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1);
      } else if (thisMonthTotal > 0) {
        percentChange = 100;
      }

      return {
        thisMonthTotal: +thisMonthTotal.toFixed(2),
        lastMonthTotal: +lastMonthTotal.toFixed(2),
        percentChange,
      };
    },
    [expendAcc?.id, monthYear],
    { thisMonthTotal: 0, lastMonthTotal: 0, percentChange: 0 },
  );
}

export interface FrequentPreset {
  description: string;
  amount: number;
  category: string;
  isCustom: boolean;
  id?: number;
}

let isSeedingPresets = false;

export function useFrequentPresets(limit = 6): FrequentPreset[] {

  // Seed default presets if empty using a side-effect (outside liveQuery read-only context)
  useEffect(() => {
    const seedAndDeduplicate = async () => {
      if (isSeedingPresets) return;
      isSeedingPresets = true;
      try {
        // 1. Run deduplication on existing presets (clean up already created duplicates)
        const allPresets = await db.presets.toArray();
        const seen = new Set<string>();
        const toDelete: number[] = [];
        
        for (const p of allPresets) {
          // Uniqueness key based on lowercased name + amount + category
          const key = `${p.name.trim().toLowerCase()}_${p.amount}_${p.category.trim().toLowerCase()}`;
          if (seen.has(key)) {
            if (p.id !== undefined) {
              toDelete.push(p.id);
            }
          } else {
            seen.add(key);
          }
        }
        
        if (toDelete.length > 0) {
          await db.presets.bulkDelete(toDelete);
        }

        // 2. Seed default presets if the database is completely empty
        const presetCount = await db.presets.count();
        if (presetCount === 0) {
          const expendAccDb = await db.accounts.where("type").equals("expenditure").first();
          if (expendAccDb?.id) {
            const now = Date.now();
            await db.presets.bulkAdd([
              { name: "Coffee", amount: 80, category: "Food", accountId: expendAccDb.id, isCustom: false, usageCount: 0, createdAt: now },
              { name: "Metro Fare", amount: 50, category: "Transport", accountId: expendAccDb.id, isCustom: false, usageCount: 0, createdAt: now + 1 },
            ]);
          }
        }
      } catch (err) {
        console.error("Error seeding or deduplicating presets:", err);
      } finally {
        isSeedingPresets = false;
      }
    };
    seedAndDeduplicate().catch(console.error);
  }, []);

  return useLiveQuery(
    async () => {
      const customPresets = await db.presets.toArray();
      
      // Sort: presets with higher usageCount first, then newest first
      const sortedPresets = [...customPresets]
        .sort((a, b) => {
          if (b.usageCount !== a.usageCount) {
            return (b.usageCount || 0) - (a.usageCount || 0);
          }
          return (b.createdAt || 0) - (a.createdAt || 0);
        })
        .map((p) => {
          const res: FrequentPreset = {
            description: p.name,
            amount: p.amount,
            category: p.category,
            isCustom: p.isCustom,
          };
          if (p.id !== undefined) res.id = p.id;
          return res;
        });

      return sortedPresets.slice(0, limit);
    },
    [limit],
    [],
  );
}

// ─── 5. Category Budget Alerts Hook ──────────────────────────────────────────
export interface CategoryBudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentUsed: number; // e.g. 85.3
  isExceeded: boolean; // true when ≥ 100%
}

/**
 * Returns alerts for categories where spending ≥ 80% of the per-category budget.
 * Uses the current month's setup and expenditure transactions.
 */
export function useCategoryBudgetAlerts(): CategoryBudgetAlert[] {
  const monthYear = getCurrentMonthYear();
  const expendAcc = useAccount("expenditure");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);

  if (
    !monthSetup?.categoryBudgets ||
    Object.keys(monthSetup.categoryBudgets).length === 0
  ) {
    return [];
  }

  const catBudgets = monthSetup.categoryBudgets;

  // Build spend-per-category from current month transactions
  const catSpend: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === "debit") {
      if (
        tx.category === "transfer" ||
        tx.category === "Transfer" ||
        tx.category === "opening-transfer"
      ) {
        continue;
      }
      const cat = tx.category || "Other";
      catSpend[cat] = (catSpend[cat] || 0) + tx.amount;
    }
  }

  const alerts: CategoryBudgetAlert[] = [];
  for (const [category, budget] of Object.entries(catBudgets)) {
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

  // Sort: exceeded first, then by percent descending
  return alerts.sort((a, b) => {
    if (a.isExceeded !== b.isExceeded) return a.isExceeded ? -1 : 1;
    return b.percentUsed - a.percentUsed;
  });
}

// ─── 6. Smart Allocation Prompt Hook ─────────────────────────────────────────
export interface SmartAllocationResult {
  shouldShow: boolean;
  surplus: number;
  suggestedAmount: number;
  expenditureBalance: number;
  projectedSpend: number;
}

export function useSmartAllocationPrompt(): SmartAllocationResult | null {
  const expendAcc = useAccount("expenditure");
  const monthYear = getCurrentMonthYear();
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);
  const summary = useMonthSummary(transactions, monthSetup?.openingBalance ?? 0);

  return useMemo(() => {
    if (!expendAcc?.id) return null;

    // Use reconstructed closing balance to match the dashboard's display balance
    const currentBalance = summary.closingBalance;

    // Check localStorage for dismissal (valid for 24 hours)
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

    const shouldShow = surplus > 1000 && currentBalance > 1000;
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
  }, [expendAcc, summary]);
}

// ─── 7. Historical Data Hook ──────────────────────────────────────────────────
export interface HistoricalDataPoint {
  label: string; // e.g. "Dec"
  monthYear: string; // "YYYY-MM"
  totalDebited: number;
  netWorth: number;
}

export function useHistoricalData(monthsCount = 6): HistoricalDataPoint[] {
  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");

  return useLiveQuery(
    async () => {
      if (!expendAcc || !savingsAcc) return [];

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
          });
          continue;
        }

        // 1. Calculate total debited in this month on expenditure account
        let totalExpense = 0;

        for (const tx of allTxs.filter(t => t.accountId === expendAcc.id && t.date.startsWith(mYear))) {
          if (tx.type === "debit") {
            if (
              tx.category !== "transfer" &&
              tx.category !== "Transfer" &&
              tx.category !== "opening-transfer"
            ) {
              totalExpense += tx.amount;
            }
          }
        }

        // 2. Reconstruct balances at the end of this month
        let expBal = expendAcc.currentBalance;
        let savBal = savingsAcc.currentBalance;

        for (const tx of allTxs) {
          const txMonth = tx.date.substring(0, 7);
          if (txMonth > mYear) {
            const amt = tx.amount;
            if (tx.accountId === expendAcc.id) {
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
        });
      }

      return points;
    },
    [expendAcc?.id, savingsAcc?.id, monthsCount],
    [],
  );
}
