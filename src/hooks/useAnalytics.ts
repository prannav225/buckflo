import { useMemo } from "react";
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

// ─── 4. Frequent Presets Hook ────────────────────────────────────────────────
export interface FrequentPreset {
  description: string;
  amount: number;
  category: string;
  isCustom: boolean;
  id?: number;
}

const FALLBACK_PRESETS: FrequentPreset[] = [
  { description: "Coffee", amount: 80, category: "Food", isCustom: false },
  { description: "Metro Fare", amount: 50, category: "Transport", isCustom: false },
  { description: "Groceries", amount: 500, category: "Shopping", isCustom: false },
  { description: "Lunch Thali", amount: 150, category: "Food", isCustom: false },
];

export function useFrequentPresets(limit = 6): FrequentPreset[] {
  const expendAcc = useAccount("expenditure");

  return useLiveQuery(
    async () => {
      // 1. Fetch custom presets from DB
      const customPresets = await db.presets.toArray();
      const customMapped: (FrequentPreset & { sortScore: number })[] = customPresets.map((p) => ({
        description: p.name,
        amount: p.amount,
        category: p.category,
        isCustom: true,
        id: p.id,
        sortScore: p.usageCount + 2, // +2 base so new custom presets appear alongside used auto ones
      }));

      if (!expendAcc?.id) {
        // No account yet — just return custom + fallbacks
        const combined: FrequentPreset[] = customMapped.map((p) => {
          const res: FrequentPreset = {
            description: p.description,
            amount: p.amount,
            category: p.category,
            isCustom: p.isCustom,
          };
          if (p.id !== undefined) res.id = p.id;
          return res;
        });
        if (combined.length < limit) {
          for (const fb of FALLBACK_PRESETS) {
            if (combined.length >= limit) break;
            if (!combined.some((p) => p.description.toLowerCase() === fb.description.toLowerCase())) {
              combined.push(fb);
            }
          }
        }
        return combined.slice(0, limit);
      }

      // 2. Query past transactions to calculate frequency for auto-detection
      const txs = await db.transactions
        .where("accountId")
        .equals(expendAcc.id)
        .filter((t) => t.type === "debit")
        .toArray();

      const autoPresets: (FrequentPreset & { sortScore: number })[] = [];

      if (txs.length > 0) {
        const freqMap = new Map<
          string,
          {
            desc: string;
            cat: string;
            count: number;
            lastAmount: number;
            lastCreatedAt: number;
          }
        >();

        for (const tx of txs) {
          const descNorm = tx.description.trim();
          const catVal = tx.category || "Other";
          const key = `${descNorm.toLowerCase()}_${catVal.toLowerCase()}`;

          const existing = freqMap.get(key);
          if (existing) {
            existing.count += 1;
            if (tx.createdAt > existing.lastCreatedAt) {
              existing.lastAmount = tx.amount;
              existing.lastCreatedAt = tx.createdAt;
            }
          } else {
            freqMap.set(key, {
              desc: descNorm,
              cat: catVal,
              count: 1,
              lastAmount: tx.amount,
              lastCreatedAt: tx.createdAt,
            });
          }
        }

        const sortedFreq = Array.from(freqMap.values())
          .filter((item) => item.count >= 2)
          .sort((a, b) => b.count - a.count);

        for (const item of sortedFreq) {
          // Skip if a custom preset with same name already exists
          const isDuplicate = customMapped.some(
            (cp) => cp.description.toLowerCase() === item.desc.toLowerCase(),
          );
          if (!isDuplicate) {
            autoPresets.push({
              description: item.desc,
              amount: item.lastAmount,
              category: item.cat,
              isCustom: false,
              sortScore: item.count,
            });
          }
        }
      }

      // 3. Merge custom + auto, sort by usage frequency
      const merged: FrequentPreset[] = [...customMapped, ...autoPresets]
        .sort((a, b) => b.sortScore - a.sortScore)
        .map((p) => {
          const res: FrequentPreset = {
            description: p.description,
            amount: p.amount,
            category: p.category,
            isCustom: p.isCustom,
          };
          if (p.id !== undefined) res.id = p.id;
          return res;
        });

      // 4. Backfill with fallbacks if needed
      if (merged.length < limit) {
        for (const fallback of FALLBACK_PRESETS) {
          if (merged.length >= limit) break;
          const isDuplicate = merged.some(
            (p) => p.description.toLowerCase() === fallback.description.toLowerCase(),
          );
          if (!isDuplicate) {
            merged.push(fallback);
          }
        }
      }

      return merged.slice(0, limit);
    },
    [expendAcc?.id, limit],
    FALLBACK_PRESETS.slice(0, limit),
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
      const today = new Date();
      const points: HistoricalDataPoint[] = [];

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mYear = format(d, "yyyy-MM");
        const label = format(d, "MMM");

        // 1. Calculate total debited in this month on expenditure account
        let totalExpense = 0;

        for (const tx of allTxs.filter(t => t.accountId === expendAcc.id && t.date.startsWith(mYear))) {
          if (tx.type === "debit") {
            if (tx.category !== "Transfer") totalExpense += tx.amount;
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
