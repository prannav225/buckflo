import Dexie, { type Table } from 'dexie';

// ─── Entity Types ────────────────────────────────────────────────────────────

export interface Account {
  id?: number;
  name: string;
  type: 'expenditure' | 'savings';
  currentBalance: number;
}

export interface MonthSetup {
  id?: number;
  monthYear: string; // e.g. "2026-05"
  openingBalance: number;
  monthlyBudget: number;
  accountId: number;
  categoryBudgets?: Record<string, number>;
}

export interface Transaction {
  id?: number;
  date: string; // ISO date string "YYYY-MM-DD"
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  accountId: number;
  category?: string;
  createdAt: number; // Date.now()
  transferId?: number;
}

export interface SavingGoal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAllocated: number;
  deadline?: string; // "YYYY-MM-DD"
}

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // YYYY-MM-DD
  category: string;
  status: 'active' | 'cancelled' | 'paused';
  autoDetected: boolean;
  notes?: string;
}

// ─── Database Class ──────────────────────────────────────────────────────────

export class FloDB extends Dexie {
  accounts!: Table<Account, number>;
  monthSetups!: Table<MonthSetup, number>;
  transactions!: Table<Transaction, number>;
  savingGoals!: Table<SavingGoal, number>;
  subscriptions!: Table<Subscription, number>;

  constructor() {
    super('PocketLedgerDB');

    this.version(1).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
    });

    this.version(2).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
    });

    this.version(3).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
      subscriptions: '++id, name, frequency, status, nextDueDate',
    });

    // Seed default accounts on first install
    this.on('populate', async () => {
      await this.accounts.bulkAdd([
        { name: 'Expenditure Account', type: 'expenditure', currentBalance: 0 },
        { name: 'Savings Account', type: 'savings', currentBalance: 0 },
      ]);
    });
  }
}

export const db = new FloDB();

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Fetch the expenditure account (always index 1) */
export async function getExpenditureAccount(): Promise<Account | undefined> {
  return db.accounts.where('type').equals('expenditure').first();
}

/** Fetch the savings account */
export async function getSavingsAccount(): Promise<Account | undefined> {
  return db.accounts.where('type').equals('savings').first();
}

/** Update an account's currentBalance by delta (+/-) */
export async function adjustBalance(accountId: number, delta: number): Promise<void> {
  await db.accounts.where('id').equals(accountId).modify((acc) => {
    acc.currentBalance = +(acc.currentBalance + delta).toFixed(2);
  });
}

/** Add a transaction and auto-adjust the account's running balance */
export async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> {
  const id = await db.transactions.add({ ...tx, createdAt: Date.now() });
  const delta = tx.type === 'credit' ? tx.amount : -tx.amount;
  await adjustBalance(tx.accountId, delta);
  return id as number;
}

export async function recordTransfer(
  amount: number,
  date: string,
  note = 'Transfer to Expenditure',
  category = 'transfer',
): Promise<void> {
  await recordTransferBidirectional(amount, date, 'savings', 'expenditure', note, category);
}

export async function recordTransferBidirectional(
  amount: number,
  date: string,
  fromType: 'expenditure' | 'savings',
  toType: 'expenditure' | 'savings',
  note = 'Transfer',
  category = 'transfer',
): Promise<void> {
  const [savingsAcc, expendAcc] = await Promise.all([
    getSavingsAccount(),
    getExpenditureAccount(),
  ]);

  if (!savingsAcc?.id || !expendAcc?.id) {
    throw new Error('Accounts not initialised');
  }

  const fromAcc = fromType === 'savings' ? savingsAcc : expendAcc;
  const toAcc = toType === 'savings' ? savingsAcc : expendAcc;

  const transferId = Date.now();

  await db.transaction('rw', db.transactions, db.accounts, async () => {
    await db.transactions.bulkAdd([
      {
        date,
        description: note,
        amount,
        type: 'debit',
        accountId: fromAcc.id!,
        category,
        createdAt: transferId,
        transferId,
      },
      {
        date,
        description: fromType === 'savings' ? 'Transfer from Savings' : 'Transfer from Expenditure',
        amount,
        type: 'credit',
        accountId: toAcc.id!,
        category,
        createdAt: transferId,
        transferId,
      },
    ]);

    await adjustBalance(fromAcc.id!, -amount);
    await adjustBalance(toAcc.id!, amount);
  });
}

/** Update a transaction and recalculate the account balances */
export async function updateTransaction(
  id: number,
  updated: Omit<Transaction, 'id' | 'createdAt'>
): Promise<void> {
  const oldTx = await db.transactions.get(id);
  if (!oldTx) throw new Error('Transaction not found');

  await db.transaction('rw', db.transactions, db.accounts, async () => {
    // 1. Revert old balance adjustment
    const oldDelta = oldTx.type === 'credit' ? -oldTx.amount : oldTx.amount;
    await adjustBalance(oldTx.accountId, oldDelta);

    // 2. Apply new balance adjustment
    const newDelta = updated.type === 'credit' ? updated.amount : -updated.amount;
    await adjustBalance(updated.accountId, newDelta);

    // 3. Update the transaction record
    await db.transactions.update(id, { ...updated, createdAt: oldTx.createdAt });
  });
}

/** Delete a transaction and revert its balance adjustment */
export async function deleteTransaction(id: number): Promise<void> {
  const tx = await db.transactions.get(id);
  if (!tx) throw new Error('Transaction not found');

  await db.transaction('rw', db.transactions, db.accounts, async () => {
    if (tx.transferId) {
      // Find all transactions with this transferId
      const siblings = await db.transactions.filter(t => t.transferId === tx.transferId).toArray();
      for (const sibling of siblings) {
        const delta = sibling.type === 'credit' ? -sibling.amount : sibling.amount;
        await adjustBalance(sibling.accountId, delta);
        await db.transactions.delete(sibling.id!);
      }
    } else if (tx.category === 'transfer' || tx.category === 'opening-transfer') {
      // Fallback for historical transfers: find a sibling created around the same time with opposite type
      const sibling = await db.transactions
        .filter(t => t.id !== tx.id 
          && t.amount === tx.amount 
          && t.type !== tx.type 
          && (t.category === 'transfer' || t.category === 'opening-transfer')
          && Math.abs(t.createdAt - tx.createdAt) <= 5000)
        .first();

      // Delete the current transaction
      const delta = tx.type === 'credit' ? -tx.amount : tx.amount;
      await adjustBalance(tx.accountId, delta);
      await db.transactions.delete(id);

      if (sibling) {
        const sibDelta = sibling.type === 'credit' ? -sibling.amount : sibling.amount;
        await adjustBalance(sibling.accountId, sibDelta);
        await db.transactions.delete(sibling.id!);
      }
    } else {
      // Revert the balance adjustment
      const delta = tx.type === 'credit' ? -tx.amount : tx.amount;
      await adjustBalance(tx.accountId, delta);

      // Delete the transaction record
      await db.transactions.delete(id);
    }
  });
}

// ─── Saving Goals ────────────────────────────────────────────────────────────

/** Add a saving goal */
export async function addSavingGoal(goal: Omit<SavingGoal, 'id'>): Promise<number> {
  return db.savingGoals.add(goal) as Promise<number>;
}

/** Update a saving goal (either allocation or attributes) */
export async function updateSavingGoal(id: number, goal: Partial<SavingGoal>): Promise<void> {
  await db.savingGoals.update(id, goal);
}

/** Delete a saving goal */
export async function deleteSavingGoal(id: number): Promise<void> {
  await db.savingGoals.delete(id);
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function addSubscription(sub: Omit<Subscription, 'id'>): Promise<number> {
  return db.subscriptions.add(sub) as Promise<number>;
}

export async function updateSubscription(id: number, sub: Partial<Subscription>): Promise<void> {
  await db.subscriptions.update(id, sub);
}

export async function deleteSubscription(id: number): Promise<void> {
  await db.subscriptions.delete(id);
}

/**
 * Scan transactions table for description + similar amount appearing 2+ times across different months.
 * Populates subscriptions table with autoDetected: true.
 */
export async function runSubscriptionAutoDetection(): Promise<number> {
  // Get expenditure account
  const expendAcc = await db.accounts.where('type').equals('expenditure').first();
  if (!expendAcc?.id) return 0;

  // Query all debit transactions on expenditure account
  const txs = await db.transactions
    .where('accountId')
    .equals(expendAcc.id)
    .filter(t => t.type === 'debit')
    .toArray();

  // Group by name (lowercase, trimmed) and approximate amount (rounded to nearest 5)
  const groups: Record<string, typeof txs> = {};
  for (const tx of txs) {
    const nameKey = tx.description.trim().toLowerCase();
    const amtKey = Math.round(tx.amount / 5) * 5;
    const key = `${nameKey}_${amtKey}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }

  let addedCount = 0;

  for (const key in groups) {
    const groupTxs = groups[key];
    if (groupTxs.length < 2) continue;

    // Check if they occurred in different months
    const months = new Set(groupTxs.map(tx => tx.date.substring(0, 7)));
    if (months.size < 2) continue;

    // We found a recurring transaction!
    const sampleTx = groupTxs[0];
    const name = sampleTx.description.trim();
    const amount = sampleTx.amount;
    const category = sampleTx.category || 'Other';

    // Check if a subscription with the same name already exists
    const existing = await db.subscriptions
      .filter(s => s.name.toLowerCase() === name.toLowerCase())
      .first();

    if (!existing) {
      // Calculate next due date based on the last transaction date
      const sortedTxs = groupTxs.sort((a, b) => a.date.localeCompare(b.date));
      const lastTx = sortedTxs[sortedTxs.length - 1];
      const lastDate = new Date(lastTx.date);
      
      // Add 1 month to the last date
      const nextDueDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, lastDate.getDate());
      
      // Format as YYYY-MM-DD
      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];

      await db.subscriptions.add({
        name,
        amount,
        frequency: 'monthly',
        nextDueDate: nextDueDateStr,
        category,
        status: 'active',
        autoDetected: true,
        notes: 'Auto-detected recurring expense'
      });
      addedCount++;
    }
  }

  return addedCount;
}

