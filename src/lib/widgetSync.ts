import { registerPlugin, Capacitor } from "@capacitor/core";
import { db } from "../db/core";
import { formatCurrency } from "../utils/currency";
import type { Transaction } from "../db/schema";

export interface WidgetDataPlugin {
  setWidgetData(options: { data: string }): Promise<void>;
  checkIntent(): Promise<{ action?: string; category?: string }>;
}

const WidgetData = registerPlugin<WidgetDataPlugin>("WidgetData");

export const checkWidgetIntent = async () => {
  if (Capacitor.getPlatform() !== "android") return null;
  try {
    const res = await WidgetData.checkIntent();
    return res;
  } catch {
    return null;
  }
};

export const syncWidgetData = async () => {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Get Total Spent this month
    const monthlyTxs = await db.transactions
      .where("date")
      .aboveOrEqual(firstDay.toISOString())
      .toArray();

    const totalSpent = monthlyTxs
      .filter((t: Transaction) => t.type === "debit")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    // 2. Get Top 2 Categories
    const catTotals = monthlyTxs
      .filter((t: Transaction) => t.type === "debit")
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {});

    const topCategories = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    // 3. Get Recent 6 Transactions
    const recentTxs = await db.transactions
      .orderBy("date")
      .reverse()
      .limit(6)
      .toArray();

    const recentFormatted = recentTxs.map(
      (t: Transaction) => `${t.description} • ${formatCurrency(t.amount)}`,
    );

    // 4. Calculate Streak Count
    const allTxs = await db.transactions.toArray();
    const uniqueDates = Array.from(new Set(allTxs.map((t) => t.date)))
      .sort()
      .reverse();

    let streakCount = 0;
    const todayStr = now.toISOString().split("T")[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let checkDate = new Date(
        uniqueDates.includes(todayStr) ? todayStr : yesterdayStr,
      );
      for (const d of uniqueDates) {
        if (d === checkDate.toISOString().split("T")[0]) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (d < checkDate.toISOString().split("T")[0]) {
          break; // Gap found
        }
      }
    }

    // 5. Calculate budget percent (using profile monthlyBudget if set)
    let spentPercent = 0;
    try {
      const profile = await db.table("profile").toCollection().first();
      const budget = profile?.monthlyBudget ?? 0;
      if (budget > 0) spentPercent = Math.round((totalSpent / budget) * 100);
    } catch {
      /* No profile/budget set */
    }

    // 6. Send to Android
    const payload = {
      totalSpent: formatCurrency(totalSpent),
      spentPercent,
      streakCount,
      topCategories,
      recentTransactions: recentFormatted,
    };

    await WidgetData.setWidgetData({ data: JSON.stringify(payload) });
    console.log("Widget synced successfully");
  } catch (error) {
    console.error("Failed to sync widget data", error);
  }
};
