# Codebase Knowledge Base — pocket_ledger (buckflo)

Welcome to the central technical documentation and knowledge base for **pocket_ledger** (branded as **buckflo**), a premium, offline-first personal finance advisor application.

This document details the application architecture, database schemas, custom hooks, smart analytical features, core flows, styling guidelines, and folder structure.

---

## 1. Project Overview & Tech Stack

**buckflo** is built for lightning-fast, offline-first personal financial management. The tech stack includes:

- **Core**: React (TypeScript) + Vite
- **Data Persistence**: IndexedDB managed via [Dexie.js](https://dexie.org/) for transparent transactional storage, utilizing reactive queries with `dexie-react-hooks`.
- **Charting**: Unified under [Chart.js](https://www.chartjs.org/) and `react-chartjs-2` for rich, performance-optimized, and consistent financial trend visualization.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) using modern CSS Custom Properties, glassmorphism systems, and theme variables.
- **Visual Elements**: [Boring Avatars](https://github.com/hihayk/boring-avatars) for brand-tailored, deterministic SVG avatar generation.
- **Utility Libraries**: `date-fns` for robust date math, `lucide-react` for iconography.
- **Target Audience**: Users seeking clean separate tracking of everyday Spending vs long-term Savings.

---

## 2. User Guide: How to Use buckflo

Below is the step-by-step operational guide for the application:

### Step 1: Complete Profile Setup & Onboarding

1.  **Profile Setup Gate**: On first launch, you are prompted to input your display name. Special characters, spaces, and numbers are blocked, enforcing alphabet-only validation up to 20 characters. This name is used to generate a unique, brand-colored deterministic avatar.
2.  **Onboarding slides**: Swipe through the slides to understand how buckflo manages your cash flow across two separate wallets (Spending and Savings).
3.  If you choose **"Skip for now"** during month setup, the app loads the dashboard immediately but hides transactional tracking. To begin, tap **"Set Up Now"** inside the orange dashboard card.
4.  **Income-Based Month Setup Wizard**: Set up your month using a conversational flow:
    - **Income Input**: Enter your total expected monthly income. (If you prefer not to share this, you can skip to an alternative flow where you simply set your starting Spending and Savings wallet balances manually).
    - **Committed Expenditure**: Assign fixed budgets to standard categories (Rent, Bills, etc.) with the option to create custom categories.
    - **Leftover Decision**: Decide what to do with the remaining unassigned funds—send it all to Savings, keep it flexible in Spending, or split it.
    - **Monthly Close Summary**: When a new month begins, you are greeted with a "month wrapped" screen detailing your total spend, top category, and leftover savings opportunity from the previous month.

### Step 2: Log Transactions & Use Shortcuts

1.  **Manual Logging**: Tap the **`+`** button in the center of the bottom navigation bar to log a transaction.
    - Select **Debit** (Expense), **Credit** (Income), or **Transfer** (Move cash between Savings and Spending).
    - Fill out the Amount, Category, Date, and Description.
2.  **CSV Import**: You can bulk import transactions from other apps or bank statements. Navigate to the main transaction feed header and tap the import icon to upload a CSV file.
3.  **One-Tap Presets**: Once you log repeated transactions, the dashboard automatically surfaces them under **Quick Presets** (e.g. _"Coffee — ₹80"_). Tap any preset to log it instantly.

### Step 3: Track Burn Rate & Feed

1.  **Dashboard Balance Card**: Shows your current Spending wallet balance and remaining budget. It calculates a dynamic **Daily budget left** based on how many days are left in the month.
2.  **Monthly Feed**: Navigate to the **Monthly** tab (`/monthly`) to view all daily transactions, check running balances after each transaction, and analyze visual budget progress bars per category.

### Step 4: Manage Savings Goals

1.  Navigate to the **Savings** tab (`/savings`).
2.  Tap **"Create Goal"** to define a savings target (description, target amount, optional deadline).
3.  Allocate money directly into goals from your Savings wallet balance. The app calculates remaining funding required and highlights achieved goals.

### Step 5: Insights & Bill Notifications

1.  Navigate to **Insights** (`/insights`):
    - **Overview Tab**: View week-over-week analytics, daily averages, and interactive category spending distribution.
    - **Subscriptions Tab**: Track committed monthly subscriptions and bills, showing upcoming due dates and payment status.
2.  **Notification Hub**: Tap the Bell icon in the header to check alerts:
    - Category budget threshold warnings (80% and 100%+ spent).
    - Bill reminders (due within 7 days).
    - **Smart Allocation Advisor**: Sweeps excess Spending funds into Savings with one tap.

---

## 3. Interactive Directory Map

The directory structure is organized logically into modules:

- `/` (Root): Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`) and entry points.
- `/public/`: Static branding assets and web app manifestation files.
- [`/src/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src): Core application logic.
  - [`App.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/App.tsx): Entry container setting up contexts and notifications.
  - [`index.css`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/index.css): Main stylesheet housing CSS variables, glassmorphic layout rules, typography setups, and Tailwind imports.
  - [`components/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components): Shared components, sub-divided into domain directories:
    - [`layout/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout): [`AppLayout.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/AppLayout.tsx) (global header/notifications wrapper), [`BottomNav.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BottomNav.tsx) (main layout tabs navigation), [`BrandedAvatar.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BrandedAvatar.tsx) (deterministic boring-avatar wrapper), [`CustomDropdown.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/CustomDropdown.tsx) (upward-opening custom theme selector), [`NotificationSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/NotificationSheet.tsx) (full-screen hub with Active/History tabs), [`NotificationCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/NotificationCard.tsx) (individual alert renderer with action buttons), [`PixelBanner.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/PixelBanner.tsx) (generative pixel-art mosaic for profile headers), [`ChangelogModal.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/ChangelogModal.tsx) (version update announcement modal).
    - [`ui/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui): Reusable interface controls — [`SegmentedControl.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/SegmentedControl.tsx), [`Tooltip.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/Tooltip.tsx), [`blur-fade.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/blur-fade.tsx), [`rich-word-fade-in.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/rich-word-fade-in.tsx).
    - [`transactions/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions): Sheets, presets, cards, and row item renderers.
    - [`savings/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings): Goal allocation, lists, and form cards.
    - [`insights/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights): Sub-components for charts, subscriptions, and budget grids.
    - [`landing/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing): Marketing landing page sub-components — [`FAQItem.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/FAQItem.tsx), [`FeatureCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/FeatureCard.tsx), [`IPhoneMockup.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/IPhoneMockup.tsx) (interactive CSS-animated device mockup).
    - [`features/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features): Onboarding elements.
  - [`context/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context): Global contexts such as [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx).
  - [`db/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db): Core data schema setup ([`database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts)), hooks wrapper ([`hooks.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/hooks.ts)), and legacy migration logic ([`migration.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/migration.ts)).
  - [`hooks/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks): Smart analytics calculators ([`useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts)), profile queries ([`useProfile.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useProfile.ts)), notification engines ([`useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts)), category management ([`useCategories.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useCategories.ts)), confirmation dialogs ([`useConfirm.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useConfirm.tsx)), month comparison ([`useMonthComparison.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useMonthComparison.ts)), autopay trigger ([`useAutopayTrigger.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAutopayTrigger.ts)), and balance reconciliation ([`useDatabaseSync.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useDatabaseSync.ts)).
  - [`pages/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages): Screen controllers — [`Dashboard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Dashboard.tsx), [`MonthlyView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/MonthlyView.tsx), [`MonthlyTransactionsView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/MonthlyTransactionsView.tsx), [`SavingsView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/SavingsView.tsx), [`Insights.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Insights.tsx), [`AddEditTransaction.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/AddEditTransaction.tsx), [`ProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfilePage.tsx), [`ProfileSetupPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfileSetupPage.tsx), [`EditProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/EditProfilePage.tsx), [`ManageCategoriesPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ManageCategoriesPage.tsx), [`AboutPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/AboutPage.tsx), [`LandingPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/LandingPage.tsx), [`PrivacyPolicy.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/PrivacyPolicy.tsx), [`TermsConditions.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/TermsConditions.tsx).
  - [`routes/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes): Application navigation routing definitions ([`AppRoutes.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes/AppRoutes.tsx)).
  - [`utils/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils): Core helpers — [`dateUtils.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/dateUtils.ts), [`currency.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/currency.ts), [`csvExport.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/csvExport.ts), [`csvImport.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/csvImport.ts), [`backup.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/backup.ts), [`validation.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/validation.ts), [`categories.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/categories.ts), [`seedData.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/seedData.ts), [`autopay.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/autopay.ts), [`haptics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/haptics.ts), [`chartConfig.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/chartConfig.ts), [`modalHelper.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/modalHelper.ts), [`cn.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/cn.ts).

---

## 4. Database Architecture (Dexie Schema)

Data persistence relies on **IndexedDB** wrapped in Dexie. Configured in [`src/db/database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts), the database name is `BuckfloDB`. (Legacy data is safely migrated from `PocketLedgerDB` via `src/db/migration.ts`).

### Table Schemas & Indexes (Upgraded to v9)

- **`accounts`**: Stores account records. Seeded on setup with two accounts.
  - _Schema_: `{ id?: number, name: string, type: 'spending' | 'savings', currentBalance: number }`
  - _Indexes_: `++id, type`
- **`monthSetups`**: Defines the target parameters of a month.
  - _Schema_: `{ id?: number, monthYear: string, openingBalance: number, monthlyBudget: number, accountId: number, categoryBudgets?: Record<string, number> }`
  - _Indexes_: `++id, monthYear, accountId, [accountId+monthYear]`
- **`transactions`**: Houses logged debits, credits, and transfers.
  - _Schema_: `{ id?: number, date: string, description: string, amount: number, type: 'debit' | 'credit', accountId: number, category?: string, createdAt: number, transferId?: number }`
  - _Indexes_: `++id, date, accountId, type, [accountId+date]`
- **`savingGoals`**: Tracks individual savings targets.
  - _Schema_: `{ id?: number, name: string, targetAmount: number, currentAllocated: number, deadline?: string }`
  - _Indexes_: `++id, name, targetAmount, currentAllocated, deadline`
- **`subscriptions`**: Tracks recurring subscriptions and bills.
  - _Schema_: `{ id?: number, name: string, amount: number, frequency: 'weekly' | 'monthly' | 'yearly', nextDueDate: string, category: string, status: 'active' | 'cancelled' | 'paused', autoDetected: boolean, notes?: string }`
  - _Indexes_: `++id, name, frequency, status, nextDueDate, [name+amount]`
- **`categories`**: Tracks standard and user-defined transaction categories with brand colours.
  - _Schema_: `{ id?: number, name: string, color: string, icon?: string, isCustom: boolean, createdAt: number }`
  - _Indexes_: `++id, name, isCustom`
- **`presets`**: Dynamic transaction shortcuts based on user habits.
  - _Schema_: `{ id?: number, name: string, amount: number, category: string, accountId: number, isCustom: boolean, usageCount: number, createdAt: number }`
  - _Indexes_: `++id, name, category, accountId, isCustom, usageCount`
- **`profile`**: Singleton table housing user preferences.
  - _Schema_: `{ id?: number, displayName: string, currency: string, currencySymbol: string, theme: 'light' | 'dark' | 'system', createdAt: Date, updatedAt: Date, monthlyIncome?: number | null, wizardCompleted?: boolean, watchCategories?: string[] }`
  - _Indexes_: `++id`
- **`notifications`**: Persistent store for dismissed alerts, enabling historical recall in the Notification Hub's History tab.
  - _Schema_: `{ id?: number, title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success', date: string, read: boolean, referenceId?: string }`
  - _Indexes_: `++id, date, read, referenceId`

### Auto-Population & Seed Logic

On initial startup, `database.ts` hooks into the Dexie `populate` event to seed:

1.  **Spending Wallet** (ID `1`, type `'spending'`, starting balance `₹0`).
2.  **Savings Wallet** (ID `2`, type `'savings'`, starting balance `₹0`).

### Transactional Integrity Helper Functions

Operations modifying balances utilize transactional helper functions to enforce consistency:

- `addTransaction(tx)`: Adds transaction and adjusts account's `currentBalance` by `+` (credit) or `-` (debit).
- `recordTransferBidirectional(amount, date, fromType, toType, note, category)`: Simultaneously records a debit transaction on the source account and a credit transaction on the target account, updating both balances transactionally under a single `transferId`.
- `updateTransaction(id, updated)`: Calculates the differential between old and new transaction details, reverts the old balance impact, applies the new balance modification, and updates the record.
- `deleteTransaction(id)`: Reverts the balance impact of the transaction and deletes it. If it was a transfer, it searches for the sibling transaction with the same `transferId` and deletes both.

### Database Balance Reconciliation (Self-Healing on Load)

To prevent discrepancies between stored account balances and transaction totals:

- **`useDatabaseSync` Hook**: Loaded on app startup inside `AppLayout.tsx`. It runs a one-time background reconciliation.
- **Savings Wallet**: Sums all historical savings transactions to recalculate and correct the Savings Wallet balance.
- **Spending Wallet**: Recalculates balance by taking the active month's `MonthSetup.openingBalance` plus/minus all transactions recorded within the active month.
- Overwrites the wallets' `currentBalance` values only if a mismatch is found.

### Database Upgrades & Migration (`migration.ts` & `core.ts`)

The database schema is heavily versioned (currently v9) to gracefully handle feature expansions like the `notifications` table or multi-currency `profile` settings. If a user updates their app from an older version, Dexie intercepts the initialization and executes custom upgrader logic defined in `src/db/core.ts` (and legacy fallback in `migration.ts`) to transform their legacy data safely.

Specifically, the upgrade path ensures full schema evolution without data loss. It performs several critical data transformations in v9:

- Scans and upgrades the `profile` table to include the new `monthlyIncome`, `wizardCompleted`, and `watchCategories` schema fields.
- Transforms legacy `Account` definitions by migrating the string types (`'expenditure'`, `'savings'`) to align with the new Wallet terminology (`'spending'`, `'savings'`).
- Renames the physical database from `PocketLedgerDB` to `BuckfloDB` securely (via legacy migration block), copying over all tables, records, and preferences.

### Dexie Querying Limitations & Best Practices

- **Strict Indexing Requirements:** Dexie throws `SchemaError` if you attempt to run a `.where("field")` clause on a field that is not explicitly indexed in the schema (e.g., querying `.where("description")` on the `transactions` table). 
- **The Filter Fallback Pattern:** If you need to search or match against a non-indexed field, you must retrieve the records via a broad indexed query or `.toArray()` first, and then apply a memory filter using standard JavaScript `.filter(tx => tx.description === ...)` before picking the `.last()` or `.first()` record.

### Local Storage & Client State Key Nomenclature

While IndexedDB handles all heavy transactional data, `localStorage` is used exclusively for lightweight client-state persistence (like theme settings, dismissed banners, and seen alerts).
- **Prefix Rule:** All `localStorage` keys and custom window events must be strictly prefixed with `buckflo_` (e.g., `buckflo_onboarded`, `buckflo_seen_alerts`, `buckflo_profile_updated`) to maintain brand consistency and avoid collisions. Legacy `flo_` keys have been systematically purged.

---

## 5. Smart Features List

**buckflo** contains a collection of smart analytical engines inside [`src/hooks/useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts) and [`src/hooks/useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts):

> [!NOTE]
> **Data Aggregation Rule (Analytics Isolation):** Across all analytical engines (Insights charts, Week-over-Week, Month-over-Month, Category Budgets, and Burn Rates), the application explicitly isolates two types of debits:
> 1. **Wealth Accumulation**: Debit transactions logged with the `transfer` or `starting-transfer` category are ignored. Moving funds from Spending to Savings is treated mathematically as wealth accumulation, ensuring it never penalizes the user's budget progress.
> 2. **Committed Expenses**: Any transaction with `isCommitted = true` (like Rent or Bills) is completely blacklisted from flexible spending algorithms, wallet balance mutators, and notification loops. Since these funds are "parked" at the start of the month, they are structurally walled off from the main ledger's mathematical totals.

### 1. Frequent Presets Auto-Detection (`useFrequentPresets`)

Instead of hardcoding shortcuts, the app groups historical debit transactions by description and category. Combinations logged at least **twice** are sorted by frequency (descending) and surfaced on the dashboard as one-tap log buttons, using the amount of the most recently logged entry.

### 2. CSV Data Portability & JSON Data Backup

- **JSON Data Backup (Data Ownership)**: Users can export their entire IndexedDB instance (`Buckflo_Backup.json`) directly from the Profile page. This supports complete migration of profiles, setups, goals, and transactions. A dangerous "Wipe All Data" action also resets the local database entirely.
- **CSV Import / Export**: Users can upload external bank sheets or export transaction histories by date ranges directly from the main transaction feed header.

### 3. Urgency-Based Bill Alerts (`useSubscriptionAlerts`)

Tracks recurring billing patterns (detecting intervals between 25 and 35 days) over the past 90 days. It dynamically predicts the next renewal date and surfaces alerts in the Notification Hub for bills due within **7 days** (info/warning) or **30 days** (insights), sorted by urgency.

### 4. Smart Surplus Allocation Advisor (`useSmartAllocationPrompt`)

Calculates the user's average daily spend (burn rate) to project remaining spending for the month. This check is strictly validated against the reconstructed monthly closing balance (`summary.closingBalance`) of the Spending Wallet (aligning with the Spending Balance displayed to the user). If the balance exceeds the projected remaining spend by a safe margin of **₹1,000+**, it recommends transferring the surplus to the Savings Wallet via a "Move Now" shortcut button.

### 5. Persistent Notification History

All alerts triggered by smart analytical engines are transient by nature. However, when a user dismisses an alert (e.g. an advisor prompt or bill warning) via the `NotificationSheet`, the notification is explicitly inserted into the `notifications` IndexedDB table. Users can view their historical alerts in a dedicated "History" tab within the Notification Hub.

### 6. Automated Month Carry-Forward & Budget Cloning

**Q: What happens when a month ends? Does the balance roll over?**
A: Yes. On the first of a new month, remaining balances from the previous month are dynamically calculated via `useOpeningBalanceReconstructor`. The leftover Spending wallet balance is automatically presented to the user as the default "Opening Balance" during the New Month Setup prompt.

**Q: Do users have to re-enter category budgets every month?**
A: No. Users can tap the "Copy from last month" shortcut during month setup. This instantly maps their previous month's total budgets and granular category allocations to the new month, drastically reducing friction.

### 7. Goal Deadlines & Smart Pacing

**Q: How does the app utilize the deadline field for saving goals?**
A: If a deadline is defined, the system automatically checks the target amount against the current allocations and the remaining months to deadline. It instantly calculates the exact monthly allocation required to stay on track (e.g., "Requires ₹5,000/mo") and renders pacing visualizers.

### 8. Smart Narrative Insights

The Insights page is topped with a sleek, animated "Smart Summary" powered by a `RichWordFadeIn` word-by-word reveal. Upon triggering:

- **For Current Month**: It processes `useWeekOverWeek` analytics to generate a human-readable narrative comparing recent spend trajectories over the last 7 days.
- **For Past Months**: It falls back to `useMonthOverMonth` logic, generating a retrospective summary that compares the selected month's total spending against the month prior and points out the highest spend category.

### 9. Projected Budget Exhaustion Day (`useBurnRate`)

Compares active budget configuration with total month-to-date spending. If current spending indicates that the budget will run out before the end of the month, it projects the exact calendar day of exhaustion (e.g. _"Exhaustion projected on Day 22"_), giving users foresight to scale back.

### 10. Week-Over-Week & Month-Over-Month Trend Analytics

Performs real-time comparison of spending periods:

- **`useWeekOverWeek`**: Tracks the last 7 days against the preceding 7 days, triggering warnings for growth $\ge 15\%$ or optimization alerts for drops $\le -15\%$.
- **`useMonthOverMonth`**: Powers historical narratives by comparing aggregated full-month spends. It calculates the percentage change between a selected past month and the month prior to it. If the previous month has no data, it defaults the change to 0%. It also scans the selected month's transactions to find the highest-spend category. The narrative tone dynamically adapts based on these thresholds: if spending increased by $>10\%$, it's a cautionary tone; if it dropped by $<-10\%$, it's a congratulatory tone.

### 11. Category Budget Alerts (`useCategoryBudgetAlerts`)

Matches current-month flexible category debits against per-category budget allocations. Surfaces warning alerts once spending in a specific category crosses **80%** of its allocation, and turns red/danger if it exceeds **100%**. Alert IDs are strictly deduplicated by month (stripping out fluctuating percentage mathematics) to guarantee the Notification Hub never spams the user with duplicate warnings as their spending scales up.

### 12. Global Multi-Currency Support

Designed for a global audience, buckflo supports dynamic currency mapping. Users can choose their preferred currency (e.g., INR ₹, USD $, EUR €, GBP £) during Profile Setup or from Edit Profile. The selection is saved to `localStorage` and utilized globally via the `formatCurrency` utility wrapper, seamlessly swapping `Intl.NumberFormat` locales app-wide.

### 13. Progressive Web App (PWA) Install Prompt

A `usePWAInstall` hook actively listens for the browser's native `beforeinstallprompt` event. If installable, it dynamically surfaces a sleek, dismissible banner below the global header, encouraging users to "Install buckflo" to their device's home screen for an optimal, full-screen, offline-first experience.

### 14. Database Self-Healing (Auto-Reconciliation)

Powered by the `useDatabaseSync` hook, buckflo runs a background reconciliation sweep on app startup. It recalculates the balances of both the Savings and Spending wallets by summarizing the entire transaction ledger and the active month's opening balance, automatically correcting any database drift or discrepancies without user intervention.

### 15. Automatic Bill Payment (Autopay Engine)

The [`useAutopayTrigger`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAutopayTrigger.ts) hook fires 1 second after onboarding confirmation. It calls [`processAutopaySubscriptions`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/autopay.ts) which scans all active subscriptions whose `nextDueDate` is today or past. For each due subscription, it:

1. Records a debit transaction on the Spending wallet (using the subscription's scheduled date for historical accuracy).
2. Advances the subscription's `nextDueDate` by its frequency (weekly/monthly/yearly).
3. Surfaces a visible toast notification (e.g. "Netflix — ₹649 auto-logged today ✓") confirming the autopay execution so the user knows it happened silently.
   All mutations run inside a single Dexie transaction for atomicity.

### 16. Haptic Feedback System

The [`haptics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/haptics.ts) utility wraps the Web Vibration API with preset patterns for different interaction contexts: `light` (10ms — toggles, tabs), `medium` (30ms — save, add), `heavy` (double pulse — destructive actions), `success` (confirm pattern), and `error` (rapid triple pulse). Gracefully degrades on unsupported devices.

**Where it is used:**

- `BottomNav.tsx`: Light feedback when switching primary tabs.
- `Dashboard.tsx`: Medium feedback when tapping a Quick Preset to log.
- `AddEditTransaction.tsx`: Medium feedback when saving a transaction.
- `TransactionDetailsCard.tsx`: Heavy feedback when confirming transaction deletion.
- `ChangelogModal.tsx`: Light feedback when opening the changelog.

### 17. Full Category Management System

Users can create, colour-code, and delete custom categories via the dedicated [`ManageCategoriesPage`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ManageCategoriesPage.tsx) accessible from Profile settings. Features include:

- **Colour Picker**: 12 curated preset colours plus a native colour picker for full custom hex selection.
- **Live Preview**: Real-time badge preview of the category before saving.
- **Safe Deletion**: Before deleting, the app queries all transactions referencing the category and warns the user of the impact count.
- **Reactive Data**: Powered by [`useCategories`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useCategories.ts) hook (Dexie `useLiveQuery`), which includes `getCategoryColor()` for colour lookups and `hexToRgba()` for opacity-adjusted badge backgrounds.

### 18. Same-Day Month Comparison (`useMonthComparison`)

The [`useMonthComparison`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useMonthComparison.ts) hook powers the dashboard's month-over-month spending badge. Unlike naive full-month comparisons, it compares spending from Day 1 to **today's date** this month vs Day 1 to the **same day** last month. This ensures a fair, apples-to-apples comparison regardless of where in the month the user is. Returns direction (`up`/`down`/`neutral` with a ±5% deadzone), percentage change, and absolute amounts.

### 19. Promise-Based Confirmation Dialogs (`useConfirm`)

The [`useConfirm`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useConfirm.tsx) hook provides a branded, promise-based confirmation dialog system. Calling `await confirm({ title, message, variant })` renders a [`ConfirmDialog`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ConfirmDialog.tsx) and resolves with `true` (confirmed) or `false` (cancelled). Supports `danger` variant for destructive actions (red styling). Used across category deletion, data wipe, goal deletion, and transaction deletion flows.

---

## 6. Zero-to-One & Empty States (Cold Start)

When a brand new user joins, all 19 smart features (presets, trend analytics, subscription detection, etc.) are invisible due to the lack of historical data. To handle this "cold start" period gracefully:

- **Seed Data Generator**: During Profile Setup, users can check "Generate sample data". This securely invokes `src/utils/seedData.ts` which populates:
  - 3 months of mock realistic transactions (including salary, groceries, transit, etc.)
  - 3 mock recurring subscriptions
  - 1 partially funded Savings Goal ("Emergency Fund")
    This instantly demonstrates the app's full analytical capabilities without manual labor.
- **Empty State UI**: If no seed data is used, the dashboard and Insights pages gracefully render empty placeholders (e.g., "Log your first transaction to see presets"). The app's intelligence layer silently waits until a threshold of data is crossed (e.g., two identical logs for a preset, or 7 days of data for `useWeekOverWeek`) before organically revealing its smart features.

---

## 7. Key Application Flows

### Marketing Landing Page & Onboarding Flow

- On first load, [`AppRoutes.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes/AppRoutes.tsx) renders the **Marketing Landing Page** ([`LandingPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/LandingPage.tsx)) featuring an interactive iPhone mockup, feature cards, and FAQ section.
- **PWA Standalone Bypass**: If the app is running in standalone/PWA mode and a profile exists, it skips the landing page entirely and navigates straight to `/home`.
- Tapping **"Get Started"** or **"Launch App"** navigates to `/setup` (if no profile) or `/home` (if profile exists).

### Local User Profile Creation & Setup Gate

- If the singleton profile does not exist in IndexedDB, the app gates access and presents the **Profile Setup Page** ([`ProfileSetupPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfileSetupPage.tsx)).
- Enforces alphabet-only string sanitization on name inputs (up to 20 characters) and presents a reactive avatar preview utilizing brand colors: Orange (`#d97757`), Dark Orange (`#c2633e`), Sage Green (`#788c5d`), Warm Cream (`#e8e6dc`), and Dark Charcoal (`#141413`).
- Submitting writes the singleton profile record to the database, completing the gate.

### Income-Based Month Setup Wizard

- The first time a user encounters a new month, they are prompted via the **Income-Based Setup Wizard** ([`IncomeWizard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/IncomeWizard.tsx)).
- This multi-step wizard handles the most critical onboarding flow: capturing expected monthly income, allocating fixed committed expenses, and intelligently deciding how to partition the leftover surplus (between the Savings Wallet and flexible Spending).
- **Decoupled Income Flow**: For users with irregular income (e.g., students or freelancers), skipping the "Income" step intelligently reroutes them directly to the "Committed Expenses" setup, bypassing the surplus allocation screen and proceeding to manual balance entry. This ensures all users can access the flagship isolated-expense feature without providing artificial income data.
- At the end of the flow, a `MonthSetup` record is generated, establishing the budget baseline that all smart analytics will track against.

### Generative Pixel-Art Profile Banner

- The [`PixelBanner`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/PixelBanner.tsx) component renders a symmetrically-mirrored pattern of geometric shapes (crosses, L-shapes, diamonds, tetrominoes, etc.) unique to each user.
- Uses a DJB2-style string hash and a Mulberry32 deterministic PRNG seeded from user data (name + createdAt timestamp), guaranteeing a distinct pattern for every user.
- Shapes are placed in the top strip with opacity gradients based on distance from center (horizontal) and vertical position, then mirrored across the center axis.

### Theme System (Light / Dark / System Selector)

Managed by [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx) in conjunction with user profile settings.

- Offers three modes: Light, Dark, and System (which binds to `prefers-color-scheme` listeners).
- Persistent selections are synced with IndexedDB and localStorage, dynamically adding or removing the `.dark` class from the `html` element.
- The selection is controlled via a custom-styled, upward-opening dropdown component (`CustomDropdown.tsx`) on the `/profile` page, preventing layout overflow on mobile screens.

### Legal Pages

- [`PrivacyPolicy.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/PrivacyPolicy.tsx) and [`TermsConditions.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/TermsConditions.tsx) are accessible from the About page and Landing page footer. Routed at `/privacy` and `/terms` respectively.

---

## 8. Design System & Styling Guidelines

The visual aesthetic is governed by [`src/index.css`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/index.css). Key tokens and classes to maintain:

### 1. Palette Variables

- `--accent` (`#d97757`): Primary brand color.
- `--accent-dark` (`#c2633e`): Hover/Active brand color.
- `--debit` (`#e05545`): Semantic warning / debit / budget overrun color.
- `--credit` (`#5a9e6f`): Semantic success / credit / savings color.
- `--bg`: Background tone (`#f8f8f6` light, `#1f1f1e` dark).
- `--text`: Principal copy color (`#1f1f1e` light, `#f5f5f3` dark).
- `--text-muted`: Secondary metadata copy (`#9d9d99` light, `#6b6b69` dark).

### 2. Glassmorphic Surface System

For standard cards, overlays, and sheets, use:

- `.glass-card`: Utilizes `var(--bg-glass)`, `backdrop-filter: var(--glass-blur)`, and `border: var(--glass-border)`.
- `.glass-card-strong`: Heavy glassmorphic surfaces using `var(--bg-glass-strong)`.
- `.sheet-overlay` / `.sheet-panel`: Full-screen bottom-sheet system. Uses `modalHelper.ts` to add `.sheet-open` class to `<body>`, which triggers a scale/dim transition on the main content behind the overlay.

### 3. Typography Rules

- Body text uses standard sans-serif: `"Inter", system-ui, sans-serif`.
- Display currency values use a premium serif typography: `.amount-display { font-family: "Instrument Serif", Georgia, serif; }`.

### 4. Settings Card Groups & Dividers

- Settings sections are consolidated inside grouped cards on `/profile`, styled with minimal, theme-adaptive styling.
- List items inside cards are separated using thin border dividers (`divide-y divide-black/5 dark:divide-white/5`).

### 5. Chart Configuration

- All Chart.js instances share a global configuration defined in [`chartConfig.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/chartConfig.ts). It registers all required Chart.js modules (CategoryScale, LinearScale, ArcElement, etc.), sets default font to Inter, applies brand-consistent tooltip styling (dark background, rounded corners), and formats Y-axis tick labels with compact notation (e.g., `₹1.2k`, `₹3.5M`).
- `devicePixelRatio` is forced to at least `2.5` for crisp rendering on high-DPI screens.

### 6. Utility: `cn()` Class Merge

- [`cn.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/cn.ts) exports a `cn(...inputs)` function combining `clsx` (conditional class joining) with `twMerge` (Tailwind conflict resolution). Used throughout components for clean, conflict-free dynamic class composition.

### 7. Page Transition Classes

- `AppRoutes.tsx` wraps each route's element in either `.page-transition-tab` (for main tab routes) or `.page-transition-sheet` (for sub-pages). These classes drive entry animations (fade, slide) based on navigation context.

### 8. Copywriting & Tone

- **Strict Gender Neutrality:** The application's UI copy, smart analytics, and push notifications must maintain a universally neutral and professional tone. Hardcoded gendered titles or colloquialisms (e.g., "Sir", "Bro", "Man") are strictly prohibited. The system acts as a financial ledger, not a gendered persona.
