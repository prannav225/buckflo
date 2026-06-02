export interface Account {
  id?: number;
  name: string;
  type: "spending" | "savings";
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
  type: "debit" | "credit";
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
  frequency: "weekly" | "monthly" | "yearly";
  nextDueDate: string; // YYYY-MM-DD
  category: string;
  status: "active" | "cancelled" | "paused";
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
  theme: "light" | "dark" | "system";
  createdAt: Date;
  updatedAt: Date;
  lastMonthSetupSnapshot?: string;
  watchCategories?: string[];
  monthlyIncome?: number | null;
  savingsNudgeDismissed?: boolean;
  wizardCompleted?: boolean;
  notificationsEnabled?: boolean;
  notificationTime?: string;
  notificationPermissionAsked?: boolean;
}

export interface AppNotification {
  id?: number;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success" | "danger";
  date: string; // ISO date
  read: boolean;
  referenceId?: string; // to prevent duplicates
}

// ─── Default Categories ──────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Omit<Category, "id" | "createdAt">[] = [
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
