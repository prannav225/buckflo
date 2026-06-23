const fs = require("fs");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#d97757", isCustom: false },
  { name: "Transport", color: "#40a0c0", isCustom: false },
  { name: "Bills", color: "#e0a045", isCustom: false },
  { name: "Shopping", color: "#9060b0", isCustom: false },
  { name: "Healthcare", color: "#5a9e6f", isCustom: false },
  { name: "Entertainment", color: "#b04060", isCustom: false },
  { name: "Rent", color: "#a0a860", isCustom: false },
  { name: "Transfer", color: "#6b6b69", isCustom: false },
  { name: "Other", color: "#9d9d99", isCustom: false },
];

const now = new Date();
const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

// 1. Profile
const profileRow = {
  id: 1,
  displayName: "Pranav",
  currency: "INR",
  currencySymbol: "₹",
  theme: "dark",
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).getTime(),
  updatedAt: Date.now(),
  watchCategories: ["Food", "Shopping", "Entertainment"],
  monthlyIncome: 80000,
  savingsNudgeDismissed: true,
  wizardCompleted: true,
  notificationsEnabled: true,
  notificationTime: "20:00",
  notificationPermissionAsked: true,
  $types: {
    createdAt: "date",
    updatedAt: "date"
  }
};

// 2. Accounts
const accountsRows = [
  { id: 1, name: "Spending Wallet", type: "spending", currentBalance: 14500.50 },
  { id: 2, name: "Savings Wallet", type: "savings", currentBalance: 45000.00 }
];

// 3. Categories
const categoriesRows = DEFAULT_CATEGORIES.map((c, i) => ({
  id: i + 1,
  ...c,
  createdAt: Date.now() - (100 - i) * 1000
}));

// 4. Transactions
const transactionsRows = [];
const startDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago

let txId = 1;
// Salary
transactionsRows.push({
  id: txId++,
  date: formatDate(prevMonth),
  description: "Salary",
  amount: 80000,
  type: "credit",
  accountId: 1,
  category: "Other",
  createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000
});
transactionsRows.push({
  id: txId++,
  date: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  description: "Salary",
  amount: 80000,
  type: "credit",
  accountId: 1,
  category: "Other",
  createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
});

// Generate 80 random debits
for (let i = 0; i < 80; i++) {
  const d = randomDate(startDate, now);
  const cat = DEFAULT_CATEGORIES[randomInt(0, DEFAULT_CATEGORIES.length - 2)].name; // exclude Transfer
  
  let amount = 0;
  let desc = "";
  if (cat === "Food") { amount = randomInt(150, 1200); desc = ["Swiggy", "Zomato", "Starbucks", "Local Cafe", "Groceries"][randomInt(0, 4)]; }
  else if (cat === "Transport") { amount = randomInt(50, 400); desc = ["Uber", "Ola", "Metro Recharge", "Fuel"][randomInt(0, 3)]; }
  else if (cat === "Shopping") { amount = randomInt(500, 4000); desc = ["Amazon", "Myntra", "Zara", "Local Store"][randomInt(0, 3)]; }
  else if (cat === "Entertainment") { amount = randomInt(300, 1500); desc = ["Movie Tickets", "Gaming", "Netflix", "Spotify"][randomInt(0, 3)]; }
  else if (cat === "Healthcare") { amount = randomInt(200, 1500); desc = ["Pharmacy", "Consultation", "Vitamins"][randomInt(0, 2)]; }
  else if (cat === "Bills") { amount = randomInt(800, 3000); desc = ["Electricity", "Internet", "Mobile Recharge"][randomInt(0, 2)]; }
  else if (cat === "Rent") { amount = 15000; desc = "Monthly Rent"; }
  else { amount = randomInt(100, 1000); desc = "Miscellaneous"; }

  transactionsRows.push({
    id: txId++,
    date: formatDate(d),
    description: desc,
    amount: amount,
    type: "debit",
    accountId: 1,
    category: cat,
    createdAt: d.getTime()
  });
}

// 5. Saving Goals
const savingGoalsRows = [
  { id: 1, name: "Emergency Fund", targetAmount: 100000, currentAllocated: 25000, deadline: "2026-12-31" },
  { id: 2, name: "New Laptop", targetAmount: 80000, currentAllocated: 15000, deadline: "2026-09-15" },
  { id: 3, name: "Goa Trip", targetAmount: 20000, currentAllocated: 5000, deadline: "2026-08-01" }
];

// 6. Subscriptions
const subscriptionsRows = [
  { id: 1, name: "Netflix", amount: 649, frequency: "monthly", nextDueDate: formatDate(new Date(now.getTime() + 5*24*60*60*1000)), category: "Entertainment", status: "active", autoDetected: false },
  { id: 2, name: "Spotify", amount: 119, frequency: "monthly", nextDueDate: formatDate(new Date(now.getTime() + 12*24*60*60*1000)), category: "Entertainment", status: "active", autoDetected: false },
  { id: 3, name: "Broadband", amount: 999, frequency: "monthly", nextDueDate: formatDate(new Date(now.getTime() + 2*24*60*60*1000)), category: "Bills", status: "active", autoDetected: false }
];

// 7. Month Setup
const monthSetupRows = [
  {
    id: 1,
    monthYear: prevMonthStr,
    openingBalance: 10000,
    monthlyBudget: 40000,
    accountId: 1,
    categoryBudgets: { "Food": 10000, "Shopping": 5000, "Transport": 3000 },
    committedExpenses: [
      { name: "Rent", category: "Rent", amount: 15000, isPaid: true, dueDay: 5 }
    ]
  },
  {
    id: 2,
    monthYear: currentMonthStr,
    openingBalance: 12000,
    monthlyBudget: 45000,
    accountId: 1,
    categoryBudgets: { "Food": 12000, "Shopping": 6000, "Transport": 4000 },
    committedExpenses: [
      { name: "Rent", category: "Rent", amount: 15000, isPaid: false, dueDay: 5 },
      { name: "Internet", category: "Bills", amount: 999, isPaid: false, dueDay: 10 }
    ]
  }
];

const backupData = {
  formatName: "dexie",
  formatVersion: 1,
  data: {
    databaseName: "pocket_ledger_db",
    databaseVersion: 9,
    tables: [
      { name: "profile", schema: "++id", rowCount: 1 },
      { name: "accounts", schema: "++id", rowCount: 2 },
      { name: "categories", schema: "++id", rowCount: 9 },
      { name: "transactions", schema: "++id", rowCount: transactionsRows.length },
      { name: "savingGoals", schema: "++id", rowCount: 3 },
      { name: "subscriptions", schema: "++id", rowCount: 3 },
      { name: "monthSetups", schema: "++id", rowCount: 2 }
    ],
    data: [
      { tableName: "profile", inbound: true, rows: [profileRow] },
      { tableName: "accounts", inbound: true, rows: accountsRows },
      { tableName: "categories", inbound: true, rows: categoriesRows },
      { tableName: "transactions", inbound: true, rows: transactionsRows },
      { tableName: "savingGoals", inbound: true, rows: savingGoalsRows },
      { tableName: "subscriptions", inbound: true, rows: subscriptionsRows },
      { tableName: "monthSetups", inbound: true, rows: monthSetupRows }
    ]
  }
};

fs.writeFileSync("buckflo_mock_data.json", JSON.stringify(backupData, null, 2));
console.log("buckflo_mock_data.json generated successfully.");
