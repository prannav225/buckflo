import { registerPlugin, Capacitor } from '@capacitor/core';
import { db } from '../db/core';
import { formatCurrency } from '../utils/currency';
import type { Transaction } from '../db/schema';

export interface WidgetDataPlugin {
  setWidgetData(options: { data: string }): Promise<void>;
  checkIntent(): Promise<{ action?: string }>;
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData');

export const checkWidgetIntent = async () => {
  if (Capacitor.getPlatform() !== 'android') return null;
  try {
    const res = await WidgetData.checkIntent();
    return res.action;
  } catch (e) {
    return null;
  }
};

export const syncWidgetData = async () => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Get Total Spent this month
    const monthlyTxs = await db.transactions
      .where('date')
      .aboveOrEqual(firstDay.toISOString())
      .toArray();

    const totalSpent = monthlyTxs
      .filter((t: Transaction) => t.type === 'debit')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    // 2. Get Top 2 Categories
    const catTotals = monthlyTxs
      .filter((t: Transaction) => t.type === 'debit')
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {});

    const topCategories = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    // 3. Get Recent 3 Transactions
    const recentTxs = await db.transactions
      .orderBy('date')
      .reverse()
      .limit(3)
      .toArray();

    const recentFormatted = recentTxs.map(
      (t: Transaction) => `${t.description} • ${formatCurrency(t.amount)}`
    );

    // 4. Send to Android
    const payload = {
      totalSpent: formatCurrency(totalSpent),
      topCategories,
      recentTransactions: recentFormatted,
    };

    await WidgetData.setWidgetData({ data: JSON.stringify(payload) });
    console.log('Widget synced successfully');
  } catch (error) {
    console.error('Failed to sync widget data', error);
  }
};
