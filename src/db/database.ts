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

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon?: string; // optional emoji
  isCustom: boolean;
  createdAt: number;
}

export interface Preset {
  id?: number;
  name: string;
  amount: number;
  category: string;
  accountId: number;
  isCustom: boolean;
  usageCount: number;
  createdAt: number;
}

export interface Profile {
  id?: number; // 1 (singleton — always a single record)
  displayName: string;
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppNotification {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'danger';
  date: string; // ISO date
  read: boolean;
  referenceId?: string; // to prevent duplicates
}


// ─── Default Categories ──────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Food', color: '#d97757', isCustom: false },
  { name: 'Transport', color: '#40a0c0', isCustom: false },
  { name: 'Bills', color: '#e0a045', isCustom: false },
  { name: 'Shopping', color: '#9060b0', isCustom: false },
  { name: 'Healthcare', color: '#5a9e6f', isCustom: false },
  { name: 'Entertainment', color: '#b04060', isCustom: false },
  { name: 'Rent', color: '#a0a860', isCustom: false },
  { name: 'Transfer', color: '#6b6b69', isCustom: false },
  { name: 'Other', color: '#9d9d99', isCustom: false },
];

// ─── Database Class ──────────────────────────────────────────────────────────

export class FloDB extends Dexie {
  accounts!: Table<Account, number>;
  monthSetups!: Table<MonthSetup, number>;
  transactions!: Table<Transaction, number>;
  savingGoals!: Table<SavingGoal, number>;
  subscriptions!: Table<Subscription, number>;
  categories!: Table<Category, number>;
  presets!: Table<Preset, number>;
  profile!: Table<Profile, number>;
  notifications!: Table<AppNotification, number>;

  constructor() {
    super('BuckfloDB');

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

    // v4: Add categories table
    this.version(4).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
      subscriptions: '++id, name, frequency, status, nextDueDate',
      categories: '++id, name, isCustom',
    }).upgrade(async (trans) => {
      // Seed default categories for existing users upgrading from v3
      const catCount = await trans.table('categories').count();
      if (catCount === 0) {
        const now = Date.now();
        await trans.table('categories').bulkAdd(
          DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i }))
        );
      }
    });

    // v5: Add presets table + compound index on subscriptions for uniqueness
    this.version(5).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
      subscriptions: '++id, name, frequency, status, nextDueDate, [name+amount]',
      categories: '++id, name, isCustom',
      presets: '++id, name, category, accountId, isCustom, usageCount',
    });

    // v6: Add profile table
    this.version(6).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
      subscriptions: '++id, name, frequency, status, nextDueDate, [name+amount]',
      categories: '++id, name, isCustom',
      presets: '++id, name, category, accountId, isCustom, usageCount',
      profile: 'id',
    });

    // v8: Add notifications table
    this.version(8).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
      savingGoals: '++id, name, targetAmount, currentAllocated, deadline',
      subscriptions: '++id, name, frequency, status, nextDueDate, [name+amount]',
      categories: '++id, name, isCustom',
      presets: '++id, name, category, accountId, isCustom, usageCount',
      profile: 'id',
      notifications: '++id, type, date, read, referenceId'
    });


    // Seed default accounts + categories on first install
    this.on('populate', async () => {
      await this.accounts.bulkAdd([
        { name: 'Expenditure Account', type: 'expenditure', currentBalance: 0 },
        { name: 'Savings Account', type: 'savings', currentBalance: 0 },
      ]);
      const now = Date.now();
      await this.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i }))
      );
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

// ─── Categories ──────────────────────────────────────────────────────────────

export async function addCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<number> {
  return db.categories.add({ ...cat, createdAt: Date.now() }) as Promise<number>;
}

export async function deleteCategory(id: number): Promise<void> {
  await db.categories.delete(id);
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export async function addPreset(preset: Omit<Preset, 'id' | 'createdAt'>): Promise<number> {
  return db.presets.add({ ...preset, createdAt: Date.now() }) as Promise<number>;
}

export async function updatePreset(id: number, preset: Partial<Preset>): Promise<void> {
  await db.presets.update(id, preset);
}

export async function deletePreset(id: number): Promise<void> {
  await db.presets.delete(id);
}

export async function incrementPresetUsage(id: number): Promise<void> {
  await db.presets.where('id').equals(id).modify((p) => {
    p.usageCount = (p.usageCount || 0) + 1;
  });
}


