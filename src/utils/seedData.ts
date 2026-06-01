import { db } from "../db/database";
import { getCurrentMonthYear } from "./dateUtils";

export async function seedSampleData() {
  const monthYear = getCurrentMonthYear();
  const now = Date.now();
  
  // 1. Month Setup
  await db.monthSetups.put({
    monthYear,
    accountId: 1, // Spending
    openingBalance: 15000,
    monthlyBudget: 20000,
    categoryBudgets: {
      "Food": 6000,
      "Transport": 3000,
      "Bills": 5000,
      "Shopping": 4000
    }
  });

  // 2. Transactions
  const dateStr = new Date().toISOString().split('T')[0];
  await db.transactions.bulkAdd([
    {
      date: dateStr,
      description: "Coffee Shop",
      amount: 150,
      type: "debit",
      accountId: 1,
      category: "Food",
      createdAt: now
    },
    {
      date: dateStr,
      description: "Grocery Store",
      amount: 800,
      type: "debit",
      accountId: 1,
      category: "Food",
      createdAt: now - 1000
    },
    {
      date: dateStr,
      description: "Monthly Rent",
      amount: 10000,
      type: "debit",
      accountId: 1,
      category: "Rent",
      createdAt: now - 2000
    },
    {
      date: dateStr,
      description: "Salary",
      amount: 50000,
      type: "credit",
      accountId: 1,
      category: "Other",
      createdAt: now - 3000
    },
    {
      date: dateStr,
      description: "Uber",
      amount: 300,
      type: "debit",
      accountId: 1,
      category: "Transport",
      createdAt: now - 4000
    }
  ]);

  // Update Account Balances
  // 15000 (opening) + 50000 (salary) - 150 - 800 - 10000 - 300 = 53750
  await db.accounts.update(1, { currentBalance: 53750 });
  await db.accounts.update(2, { currentBalance: 25000 }); // Savings

  // 3. Subscriptions
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 5);
  const nextDateStr = nextMonth.toISOString().split('T')[0];
  await db.subscriptions.bulkAdd([
    {
      name: "Netflix",
      amount: 649,
      frequency: "monthly",
      nextDueDate: nextDateStr,
      category: "Entertainment",
      status: "active",
      autoDetected: false
    },
    {
      name: "Spotify",
      amount: 119,
      frequency: "monthly",
      nextDueDate: nextDateStr,
      category: "Entertainment",
      status: "active",
      autoDetected: false
    }
  ]);

  // 4. Goals
  const nextYear = new Date();
  nextYear.setMonth(nextYear.getMonth() + 6);
  await db.savingGoals.add({
    name: "Emergency Fund",
    targetAmount: 100000,
    currentAllocated: 25000,
    deadline: nextYear.toISOString().split('T')[0]
  });
}
