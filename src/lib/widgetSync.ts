import { registerPlugin, Capacitor } from "@capacitor/core";
import { db } from "../db/core";
import { formatCurrency } from "../utils/currency";
import type { Transaction } from "../db/schema";
import { getSpendingWallet } from "../db/queries";
import { getCurrentMonthYear, getMonthDateRange } from "../utils/dateUtils";

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

let syncTimeout: number | null = null;

export const syncWidgetData = async () => {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    const now = new Date();
    const monthYear = getCurrentMonthYear();
    const { startDate, endDate } = getMonthDateRange(monthYear);

    const spendingAcc = await getSpendingWallet();
    if (!spendingAcc?.id) return;
    const accountId = spendingAcc.id;

    // 1. Get Total Spent this month for this account
    const monthlyTxs = await db.transactions
      .where("[accountId+date]")
      .between([accountId, startDate], [accountId, endDate], true, true)
      .toArray();

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

    // 5. Calculate budget percent (using monthSetup)
    let spentPercent = 0;
    try {
      const setup = await db.table("monthSetups")
        .where("[accountId+monthYear]")
        .equals([accountId, monthYear])
        .first();
      const budget = setup?.monthlyBudget ?? 0;
      
      const flexibleSpent = monthlyTxs
        .filter((t: Transaction) => 
          t.type === "debit" && 
          !t.isCommitted && 
          t.category !== "transfer" && 
          t.category !== "Transfer" && 
          t.category !== "starting-transfer"
        )
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      if (budget > 0) spentPercent = Math.round((flexibleSpent / budget) * 100);
    } catch (e) {
      console.error("Failed to fetch monthly setup for widget:", e);
    }

    const spendingBalance = spendingAcc?.currentBalance ?? 0;

    // 6. Calculate last 7 days activity (Pixel Heatmap)
    const last7Days: boolean[] = [];
    const last7DayNames: string[] = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      last7Days.push(uniqueDates.includes(dateStr));
      last7DayNames.push(dayNames[d.getDay()]);
    }

    // 7. Send to Android
    const payload = {
      totalSpentFull: formatCurrency(spendingBalance, 2, 100000000), // Won't truncate until 10 Cr
      totalSpentCompact: formatCurrency(spendingBalance, 2, 10000), // Truncates at 10k+ (e.g. 10k, 1L)
      totalSpentMicro: formatCurrency(spendingBalance, 0, 1000), // Aggressive truncation, no decimals (e.g. 9k, 1L)
      spentPercent,
      streakCount,
      recentTransactions: recentFormatted,
      last7Days,
      last7DayNames,
    };

    await WidgetData.setWidgetData({ data: JSON.stringify(payload) });
    console.log("Widget synced successfully");
  } catch (error) {
    console.error("Failed to sync widget data", error);
  }
};

export const triggerWidgetSync = () => {
  if (syncTimeout) {
    window.clearTimeout(syncTimeout);
  }
  syncTimeout = window.setTimeout(() => {
    syncWidgetData();
  }, 1000); // Debounce for 1 second
};

export const setupWidgetSyncHooks = () => {
  if (Capacitor.getPlatform() !== "android") return;

  const tables = ["transactions", "accounts", "profile"] as const;
  tables.forEach((tableName) => {
    const table = db.table(tableName);
    table.hook("creating", function (_primKey, _obj, trans) {
      trans.on("complete", triggerWidgetSync);
    });
    table.hook("updating", function (_mods, _primKey, _obj, trans) {
      trans.on("complete", triggerWidgetSync);
    });
    table.hook("deleting", function (_primKey, _obj, trans) {
      trans.on("complete", triggerWidgetSync);
    });
  });
};
