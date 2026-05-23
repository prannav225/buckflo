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

// ─── Database Class ──────────────────────────────────────────────────────────

export class FloDB extends Dexie {
  accounts!: Table<Account, number>;
  monthSetups!: Table<MonthSetup, number>;
  transactions!: Table<Transaction, number>;

  constructor() {
    super('PocketLedgerDB');

    this.version(1).stores({
      accounts: '++id, type',
      monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
      transactions: '++id, date, accountId, type, [accountId+date]',
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

/**
 * Record a transfer from savings → expenditure.
 * Creates a debit in savings and a credit in expenditure.
 */
export async function recordTransfer(
  amount: number,
  date: string,
  note = 'Transfer to Expenditure',
  category = 'transfer',
): Promise<void> {
  const [savingsAcc, expendAcc] = await Promise.all([
    getSavingsAccount(),
    getExpenditureAccount(),
  ]);

  if (!savingsAcc?.id || !expendAcc?.id) {
    throw new Error('Accounts not initialised');
  }

  const transferId = Date.now();

  await db.transaction('rw', db.transactions, db.accounts, async () => {
    await db.transactions.bulkAdd([
      {
        date,
        description: note,
        amount,
        type: 'debit',
        accountId: savingsAcc.id!,
        category,
        createdAt: transferId,
        transferId,
      },
      {
        date,
        description: 'Transfer from Savings',
        amount,
        type: 'credit',
        accountId: expendAcc.id!,
        category,
        createdAt: transferId,
        transferId,
      },
    ]);

    await adjustBalance(savingsAcc.id!, -amount);
    await adjustBalance(expendAcc.id!, amount);
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

