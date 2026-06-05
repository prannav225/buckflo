import Dexie, { type Table } from "dexie";
import {
  type Account,
  type MonthSetup,
  type Transaction,
  type SavingGoal,
  type Subscription,
  type Category,
  type Preset,
  type Profile,
  type AppNotification,
  DEFAULT_CATEGORIES,
} from "./schema";

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
    super("BuckfloDB");

    this.version(1).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
    });

    this.version(2).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
      savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
    });

    this.version(3).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
      savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
      subscriptions: "++id, name, frequency, status, nextDueDate",
    });

    this.version(4)
      .stores({
        accounts: "++id, type",
        monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
        transactions: "++id, date, accountId, type, [accountId+date]",
        savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
        subscriptions: "++id, name, frequency, status, nextDueDate",
        categories: "++id, name, isCustom",
      })
      .upgrade(async (trans) => {
        const catCount = await trans.table("categories").count();
        if (catCount === 0) {
          const now = Date.now();
          await trans
            .table("categories")
            .bulkAdd(
              DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i })),
            );
        }
      });

    this.version(5).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
      savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
      subscriptions:
        "++id, name, frequency, status, nextDueDate, [name+amount]",
      categories: "++id, name, isCustom",
      presets: "++id, name, category, accountId, isCustom, usageCount",
    });

    this.version(6).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
      savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
      subscriptions:
        "++id, name, frequency, status, nextDueDate, [name+amount]",
      categories: "++id, name, isCustom",
      presets: "++id, name, category, accountId, isCustom, usageCount",
      profile: "id",
    });

    this.version(8).stores({
      accounts: "++id, type",
      monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
      transactions: "++id, date, accountId, type, [accountId+date]",
      savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
      subscriptions:
        "++id, name, frequency, status, nextDueDate, [name+amount]",
      categories: "++id, name, isCustom",
      presets: "++id, name, category, accountId, isCustom, usageCount",
      profile: "id",
      notifications: "++id, type, date, read, referenceId",
    });

    this.version(9)
      .stores({
        accounts: "++id, type",
        monthSetups: "++id, monthYear, accountId, [accountId+monthYear]",
        transactions: "++id, date, accountId, type, [accountId+date]",
        savingGoals: "++id, name, targetAmount, currentAllocated, deadline",
        subscriptions:
          "++id, name, frequency, status, nextDueDate, [name+amount]",
        categories: "++id, name, isCustom",
        presets: "++id, name, category, accountId, isCustom, usageCount",
        profile: "id",
        notifications: "++id, type, date, read, referenceId",
      })
      .upgrade(async (trans) => {
        await trans.table("accounts").where("type").equals("spending").modify({
          type: "spending",
          name: "Spending Wallet",
        });
        await trans
          .table("accounts")
          .where("type")
          .equals("expenditure")
          .modify({
            type: "spending",
            name: "Spending Wallet",
          });
        await trans.table("accounts").where("type").equals("savings").modify({
          name: "Savings Wallet",
        });

        await trans
          .table("profile")
          .toCollection()
          .modify((profile) => {
            if (profile.watchCategories === undefined)
              profile.watchCategories = [];
            if (profile.monthlyIncome === undefined)
              profile.monthlyIncome = null;
            if (profile.savingsNudgeDismissed === undefined)
              profile.savingsNudgeDismissed = false;
            if (profile.wizardCompleted === undefined)
              profile.wizardCompleted = true;
            if (profile.notificationsEnabled === undefined)
              profile.notificationsEnabled = false;
            if (profile.notificationTime === undefined)
              profile.notificationTime = "20:00";
            if (profile.notificationPermissionAsked === undefined)
              profile.notificationPermissionAsked = false;
          });
      });

    this.on("populate", async () => {
      await this.accounts.bulkAdd([
        { name: "Spending Wallet", type: "spending", currentBalance: 0 },
        { name: "Savings Wallet", type: "savings", currentBalance: 0 },
      ]);
      const now = Date.now();
      await this.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i })),
      );
    });

    this.on("ready", async () => {
      const accCount = await this.accounts.count();
      if (accCount === 0) {
        await this.accounts.bulkAdd([
          { name: "Spending Wallet", type: "spending", currentBalance: 0 },
          { name: "Savings Wallet", type: "savings", currentBalance: 0 },
        ]);
      }
      const catCount = await this.categories.count();
      if (catCount === 0) {
        const now = Date.now();
        await this.categories.bulkAdd(
          DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i })),
        );
      }

      // Migrate old categoryBudgets to committedExpenses for existing users
      const setups = await this.monthSetups.toArray();
      for (const setup of setups) {
        if (!setup.committedExpenses && setup.categoryBudgets) {
          const committedExpensesList = Object.entries(setup.categoryBudgets).map(([cat, amount]) => ({
            name: cat,
            category: cat,
            amount,
            isPaid: false,
          }));
          await this.monthSetups.update(setup.id!, {
            committedExpenses: committedExpensesList
          });
        }
      }
    });
  }
}

export const db = new FloDB();
