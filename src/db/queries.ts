import { db } from "./core";
import {
  type Account,
  type Transaction,
  type SavingGoal,
  type Subscription,
  type Category,
  type Preset,
} from "./schema";

/** Fetch the spending wallet (always index 1) */
export async function getSpendingWallet(): Promise<Account | undefined> {
  let acc = await db.accounts.where("type").equals("spending").first();
  if (!acc)
    acc = (await db.accounts
      .where("type")
      .equals("expenditure")
      .first()) as Account;
  if (!acc) acc = await db.accounts.get(1);
  return acc;
}

/** Fetch the savings wallet */
export async function getSavingsWallet(): Promise<Account | undefined> {
  let acc = await db.accounts.where("type").equals("savings").first();
  if (!acc) acc = await db.accounts.get(2);
  return acc;
}

/** Update an account's currentBalance by delta (+/-) */
export async function adjustBalance(
  accountId: number,
  delta: number,
): Promise<void> {
  await db.accounts
    .where("id")
    .equals(accountId)
    .modify((acc) => {
      acc.currentBalance = +(acc.currentBalance + delta).toFixed(2);
    });
}

/** Add a transaction and auto-adjust the account's running balance */
export async function addTransaction(
  tx: Omit<Transaction, "id" | "createdAt">,
): Promise<number> {
  const id = await db.transactions.add({ ...tx, createdAt: Date.now() });
  const delta = tx.type === "credit" ? tx.amount : -tx.amount;
  await adjustBalance(tx.accountId, delta);
  return id as number;
}

export async function recordTransfer(
  amount: number,
  date: string,
  note = "Transfer to Spending",
  category = "transfer",
): Promise<void> {
  await recordTransferBidirectional(
    amount,
    date,
    "savings",
    "spending",
    note,
    category,
  );
}

export async function recordTransferBidirectional(
  amount: number,
  date: string,
  fromType: "spending" | "savings",
  toType: "spending" | "savings",
  note = "Transfer",
  category = "transfer",
): Promise<void> {
  const [savingsAcc, spendingAcc] = await Promise.all([
    getSavingsWallet(),
    getSpendingWallet(),
  ]);

  if (!savingsAcc?.id || !spendingAcc?.id) {
    throw new Error("Accounts not initialised");
  }

  const fromAcc = fromType === "savings" ? savingsAcc : spendingAcc;
  const toAcc = toType === "savings" ? savingsAcc : spendingAcc;

  const transferId = Date.now();

  await db.transaction("rw", db.transactions, db.accounts, async () => {
    await db.transactions.bulkAdd([
      {
        date,
        description: note,
        amount,
        type: "debit",
        accountId: fromAcc.id!,
        category,
        createdAt: transferId,
        transferId,
      },
      {
        date,
        description:
          fromType === "savings"
            ? "Transfer from Savings"
            : "Transfer from Spending",
        amount,
        type: "credit",
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
  updated: Omit<Transaction, "id" | "createdAt">,
): Promise<void> {
  const oldTx = await db.transactions.get(id);
  if (!oldTx) throw new Error("Transaction not found");

  await db.transaction("rw", db.transactions, db.accounts, async () => {
    // 1. Revert old balance adjustment
    const oldDelta = oldTx.type === "credit" ? -oldTx.amount : oldTx.amount;
    await adjustBalance(oldTx.accountId, oldDelta);

    // 2. Apply new balance adjustment
    const newDelta =
      updated.type === "credit" ? updated.amount : -updated.amount;
    await adjustBalance(updated.accountId, newDelta);

    // 3. Update the transaction record
    await db.transactions.update(id, {
      ...updated,
      createdAt: oldTx.createdAt,
    });
  });
}

/** Delete a transaction and revert its balance adjustment */
export async function deleteTransaction(id: number): Promise<void> {
  const tx = await db.transactions.get(id);
  if (!tx) throw new Error("Transaction not found");

  await db.transaction("rw", db.transactions, db.accounts, async () => {
    if (tx.transferId) {
      const siblings = await db.transactions
        .filter((t) => t.transferId === tx.transferId)
        .toArray();
      for (const sibling of siblings) {
        const delta =
          sibling.type === "credit" ? -sibling.amount : sibling.amount;
        await adjustBalance(sibling.accountId, delta);
        await db.transactions.delete(sibling.id!);
      }
    } else if (
      tx.category === "transfer" ||
      tx.category === "starting-transfer"
    ) {
      const sibling = await db.transactions
        .filter(
          (t) =>
            t.id !== tx.id &&
            t.amount === tx.amount &&
            t.type !== tx.type &&
            (t.category === "transfer" || t.category === "starting-transfer") &&
            Math.abs(t.createdAt - tx.createdAt) <= 5000,
        )
        .first();

      const delta = tx.type === "credit" ? -tx.amount : tx.amount;
      await adjustBalance(tx.accountId, delta);
      await db.transactions.delete(id);

      if (sibling) {
        const sibDelta =
          sibling.type === "credit" ? -sibling.amount : sibling.amount;
        await adjustBalance(sibling.accountId, sibDelta);
        await db.transactions.delete(sibling.id!);
      }
    } else {
      const delta = tx.type === "credit" ? -tx.amount : tx.amount;
      await adjustBalance(tx.accountId, delta);
      await db.transactions.delete(id);
    }
  });
}

// ─── Saving Goals ────────────────────────────────────────────────────────────

export async function addSavingGoal(
  goal: Omit<SavingGoal, "id">,
): Promise<number> {
  return db.savingGoals.add(goal) as Promise<number>;
}

export async function updateSavingGoal(
  id: number,
  goal: Partial<SavingGoal>,
): Promise<void> {
  await db.savingGoals.update(id, goal);
}

export async function deleteSavingGoal(id: number): Promise<void> {
  await db.savingGoals.delete(id);
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function addSubscription(
  sub: Omit<Subscription, "id">,
): Promise<number> {
  return db.subscriptions.add(sub) as Promise<number>;
}

export async function updateSubscription(
  id: number,
  sub: Partial<Subscription>,
): Promise<void> {
  await db.subscriptions.update(id, sub);
}

export async function deleteSubscription(id: number): Promise<void> {
  await db.subscriptions.delete(id);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function addCategory(
  cat: Omit<Category, "id" | "createdAt">,
): Promise<number> {
  return db.categories.add({
    ...cat,
    createdAt: Date.now(),
  }) as Promise<number>;
}

export async function deleteCategory(id: number): Promise<void> {
  await db.categories.delete(id);
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export async function addPreset(
  preset: Omit<Preset, "id" | "createdAt">,
): Promise<number> {
  return db.presets.add({
    ...preset,
    createdAt: Date.now(),
  }) as Promise<number>;
}

export async function updatePreset(
  id: number,
  preset: Partial<Preset>,
): Promise<void> {
  await db.presets.update(id, preset);
}

export async function deletePreset(id: number): Promise<void> {
  await db.presets.delete(id);
}

export async function incrementPresetUsage(id: number): Promise<void> {
  await db.presets
    .where("id")
    .equals(id)
    .modify((p) => {
      p.usageCount = (p.usageCount || 0) + 1;
    });
}
