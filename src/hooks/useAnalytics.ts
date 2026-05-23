import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAccount } from '../db/hooks';
import { startOfDay, subDays, format, differenceInDays, addDays } from 'date-fns';

// Helper to get ISO date string from Date object
const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');

// ─── 1. Burn Rate Hook ───────────────────────────────────────────────────────
export interface BurnRateResult {
  avgDailySpend: number;
  projectedTotalSpend: number;
  isOverrunProjected: boolean;
  dayOfExhaustion: number | null;
  daysRemaining: number;
}

export function useBurnRate(budget: number, totalSpent: number): BurnRateResult {
  const today = new Date();
  const currentDay = today.getDate();
  const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Days elapsed in the month so far
  const elapsedDays = Math.max(1, currentDay);
  const avgDailySpend = +(totalSpent / elapsedDays).toFixed(2);
  const projectedTotalSpend = +(avgDailySpend * totalDays).toFixed(2);
  const isOverrunProjected = budget > 0 && projectedTotalSpend > budget;

  // Day of the month on which budget will run out
  const dayOfExhaustion = isOverrunProjected && avgDailySpend > 0
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
  const expendAcc = useAccount('expenditure');

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id) return [];

      // Query past 90 days of expenditure debits
      const ninetyDaysAgo = toISODate(subDays(new Date(), 90));
      const txs = await db.transactions
        .where('[accountId+date]')
        .between([expendAcc.id, ninetyDaysAgo], [expendAcc.id, '\uffff'], true, true)
        .filter(t => t.type === 'debit')
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
        const groupTxs = groups[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (groupTxs.length < 2) continue;

        // Check date intervals
        let isRecurring = false;
        let avgInterval = 30;
        const intervals = [];

        for (let i = 1; i < groupTxs.length; i++) {
          const diff = differenceInDays(new Date(groupTxs[i].date), new Date(groupTxs[i - 1].date));
          if (diff >= 25 && diff <= 35) {
            isRecurring = true;
            intervals.push(diff);
          }
        }

        if (isRecurring) {
          if (intervals.length > 0) {
            avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
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
              category: lastTx.category || 'Other',
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
    []
  );
}

// ─── 3. Week-Over-Week Spending Hook ──────────────────────────────────────────
export interface WoWResult {
  thisWeekTotal: number;
  lastWeekTotal: number;
  percentChange: number; // e.g. -15.5 for a 15.5% reduction
}

export function useWeekOverWeek(): WoWResult {
  const expendAcc = useAccount('expenditure');

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id) return { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 };

      const today = new Date();
      const thisWeekStart = toISODate(subDays(today, 6)); // last 7 days
      const lastWeekStart = toISODate(subDays(today, 13));
      const lastWeekEnd = toISODate(subDays(today, 7));

      const txs = await db.transactions
        .where('[accountId+date]')
        .between([expendAcc.id, lastWeekStart], [expendAcc.id, '\uffff'], true, true)
        .filter(t => t.type === 'debit')
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
        percentChange = +(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1);
      }

      return {
        thisWeekTotal: +thisWeekTotal.toFixed(2),
        lastWeekTotal: +lastWeekTotal.toFixed(2),
        percentChange,
      };
    },
    [expendAcc?.id],
    { thisWeekTotal: 0, lastWeekTotal: 0, percentChange: 0 }
  );
}

// ─── 4. Frequent Presets Hook ────────────────────────────────────────────────
export interface FrequentPreset {
  description: string;
  amount: number;
  category: string;
}

const FALLBACK_PRESETS: FrequentPreset[] = [
  { description: 'Coffee', amount: 80, category: 'Food' },
  { description: 'Metro Fare', amount: 50, category: 'Transport' },
  { description: 'Groceries', amount: 500, category: 'Shopping' },
  { description: 'Lunch Thali', amount: 150, category: 'Food' },
];

export function useFrequentPresets(limit = 4): FrequentPreset[] {
  const expendAcc = useAccount('expenditure');

  return useLiveQuery(
    async () => {
      if (!expendAcc?.id) return FALLBACK_PRESETS.slice(0, limit);

      // Query past transactions to calculate frequency
      const txs = await db.transactions
        .where('accountId')
        .equals(expendAcc.id)
        .filter(t => t.type === 'debit')
        .toArray();

      if (txs.length === 0) return FALLBACK_PRESETS.slice(0, limit);

      // Group and count occurrences of combination of description + category (ignoring amount differences)
      const freqMap = new Map<string, { desc: string; cat: string; count: number; lastAmount: number; lastCreatedAt: number }>();

      for (const tx of txs) {
        const descNorm = tx.description.trim();
        const catVal = tx.category || 'Other';
        const key = `${descNorm.toLowerCase()}_${catVal.toLowerCase()}`;

        const existing = freqMap.get(key);
        if (existing) {
          existing.count += 1;
          // Keep the amount of the most recently logged transaction of this pattern
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
            lastCreatedAt: tx.createdAt 
          });
        }
      }

      // Convert map to array, filter items logged at least twice, and sort by frequency descending
      const sortedFreq = Array.from(freqMap.values())
        .filter(item => item.count >= 2)
        .sort((a, b) => b.count - a.count);

      // Map to FrequentPreset format using the last logged amount
      const presets: FrequentPreset[] = sortedFreq.map(item => ({
        description: item.desc,
        amount: item.lastAmount,
        category: item.cat,
      }));

      // If we don't have enough presets, backfill with fallbacks that don't duplicate existing ones
      if (presets.length < limit) {
        for (const fallback of FALLBACK_PRESETS) {
          if (presets.length >= limit) break;
          // Check if fallback description is already present
          const isDuplicate = presets.some(
            p => p.description.toLowerCase() === fallback.description.toLowerCase()
          );
          if (!isDuplicate) {
            presets.push(fallback);
          }
        }
      }

      return presets.slice(0, limit);
    },
    [expendAcc?.id, limit],
    FALLBACK_PRESETS.slice(0, limit)
  );
}
