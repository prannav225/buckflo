# Codebase Knowledge Base — pocket_ledger (flo)

Welcome to the central technical documentation and knowledge base for **pocket_ledger** (branded as **flo**), a premium, offline-first personal finance advisor application.

This document details the application architecture, database schemas, custom hooks, smart analytical features, core flows, styling guidelines, and folder structure.

---

## 1. Project Overview & Tech Stack

**flo** is built for lightning-fast, offline-first personal financial management. The tech stack includes:

- **Core**: React (TypeScript) + Vite
- **Data Persistence**: IndexedDB managed via [Dexie.js](https://dexie.org/) for transparent transactional storage, utilizing reactive queries with `dexie-react-hooks`.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) using modern CSS Custom Properties, glassmorphism systems, and theme variables.
- **Utility Libraries**: `date-fns` for robust date math, `lucide-react` for iconography.
- **Target Audience**: Users seeking clean separate tracking of everyday Expenditure vs long-term Savings.

---

## 2. User Guide: How to Use flo

Below is the step-by-step operational guide for the application:

### Step 1: Complete Onboarding & Month Initialization

1.  On first load, swipe through the 5 onboarding screens to understand how flo manages your cash flow across two separate accounts (Expenditure and Savings).
2.  If you choose **"Skip for now"**, the app loads the dashboard immediately but hides transactional tracking. To begin, tap **"Set Up Now"** inside the orange dashboard card.
3.  Fill out the **New Month Setup** form:
    - **Expenditure Opening Balance**: Starting funds available for daily spending.
    - **Monthly Budget**: Total amount you plan to spend this month.
    - **Category Budgets** (Optional): Set individual budgets for standard categories.
    - **Savings Opening Balance** (Optional): Seed your Savings account balance.
    - **Opening Transfer** (Optional): Log a starting transfer from Savings to Expenditure.

### Step 2: Log Transactions & Use Shortcuts

1.  **Manual Logging**: Tap the **`+`** button in the navigation header to log a transaction.
    - Select **Debit** (Expense), **Credit** (Income), or **Transfer** (Move cash between Savings and Expenditure).
    - Fill out the Amount, Category, Date, and Description.
2.  **One-Tap Presets**: Once you log repeated transactions, the dashboard automatically surfaces them under **Quick Presets** (e.g. _"Coffee — ₹80"_). Tap any preset to log it instantly.

### Step 3: Track Burn Rate & Feed

1.  **Dashboard Balance Card**: Shows your current Expenditure balance and remaining budget. It calculates a dynamic **Daily budget left** based on how many days are left in the month.
2.  **Monthly Feed**: Navigate to the **Monthly** tab (`/monthly`) to view all daily transactions, check running balances after each transaction, and analyze visual budget progress bars per category.

### Step 4: Manage Savings Goals

1.  Navigate to the **Savings** tab (`/savings`).
2.  Tap **"Create Goal"** to define a savings target (description, target amount, optional deadline).
3.  Allocate money directly into goals from your Savings account balance. The app calculates remaining funding required and highlights achieved goals.

### Step 5: Insights & Bill Notifications

1.  Navigate to **Insights** (`/insights`):
    - **Overview Tab**: View week-over-week analytics, daily averages, and interactive category spending distribution.
    - **Subscriptions Tab**: Track bills. Tap **"Auto-Detect"** to let flo scan your history and identify recurring patterns automatically.
2.  **Notification Hub**: Tap the Bell icon in the header to check alerts:
    - Category budget threshold warnings (80% and 100%+ spent).
    - Bill reminders (due within 7 days).
    - **Smart Allocation Advisor**: Sweeps excess Expenditure funds into Savings with one tap.

---

## 3. Interactive Directory Map

The directory structure is organized logically into modules:

- `/` (Root): Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`) and entry points.
- `/public/`: Static branding assets and web app manifestation files.
- [`/src/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src): Core application logic.
  - [`App.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/App.tsx): Entry container setting up the `ThemeProvider`, `TooltipProvider`, and notifications container.
  - [`index.css`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/index.css): Main stylesheet housing CSS variables, glassmorphic layout rules, typography setups, and Tailwind imports.
  - [`components/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components): Shared components, sub-divided into domain directories:
    - [`layout/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout): [`AppLayout.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/AppLayout.tsx) (global layout/header/theme controls), [`SplashScreen.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/SplashScreen.tsx) (animated welcome/loading screen), navigation controllers.
    - [`ui/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui): Reusable interface controls ([`SegmentedControl.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/SegmentedControl.tsx), custom dropdowns).
    - [`transactions/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions): Sheets, presets, cards, and row item renderers.
    - [`savings/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings): Goal allocation, lists, and form cards.
    - [`insights/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights): Sub-components for charts, subscriptions, and budget grids.
    - [`features/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features): Onboarding elements ([`OnboardingFlow.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features/onboarding/OnboardingFlow.tsx)).
  - [`context/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context): Global contexts such as [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx).
  - [`db/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db): Core data schema setup ([`database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts)) and hooks wrapper ([`hooks.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/hooks.ts)).
  - [`hooks/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks): Smart analytics calculators ([`useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts)), event handlers, forms, and notification engines ([`useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts)).
  - [`pages/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages): Screen controllers for views ([`Dashboard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Dashboard.tsx), [`MonthlyView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/MonthlyView.tsx), [`Insights.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Insights.tsx), [`SavingsView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/SavingsView.tsx), [`PrivacyPolicy.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/PrivacyPolicy.tsx), [`TermsConditions.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/TermsConditions.tsx)).
  - [`routes/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes): Application navigation routing definitions.
  - [`utils/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils): Core helpers for dates, currency formatting, exports, and categories.

---

## 4. Database Architecture (Dexie Schema)

Data persistence relies on **IndexedDB** wrapped in Dexie. Configured in [`src/db/database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts), the database name is `PocketLedgerDB`.

### Table Schemas & Indexes

- **`accounts`**: Stores account records. Seeded on setup with two accounts.
  - _Schema_: `{ id?: number, name: string, type: 'expenditure' | 'savings', currentBalance: number }`
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
- **`subscriptions`**: Tracks recurring subscriptions.
  - _Schema_: `{ id?: number, name: string, amount: number, frequency: 'weekly' | 'monthly' | 'yearly', nextDueDate: string, category: string, status: 'active' | 'cancelled' | 'paused', autoDetected: boolean, notes?: string }`
  - _Indexes_: `++id, name, frequency, status, nextDueDate`

### Auto-Population & Seed Logic

On initial startup, `database.ts` hooks into the Dexie `populate` event to seed:

1.  **Expenditure Account** (ID `1`, type `'expenditure'`, starting balance `₹0`).
2.  **Savings Account** (ID `2`, type `'savings'`, starting balance `₹0`).

### Transactional Integrity Helper Functions

Operations modifying balances utilize transactional helper functions to enforce consistency:

- `addTransaction(tx)`: Adds transaction and adjusts account's `currentBalance` by `+` (credit) or `-` (debit).
- `recordTransferBidirectional(amount, date, fromType, toType, note, category)`: Simultaneously records a debit transaction on the source account and a credit transaction on the target account, updating both balances transactionally under a single `transferId`.
- `updateTransaction(id, updated)`: Calculates the differential between old and new transaction details, reverts the old balance impact, applies the new balance modification, and updates the record.
- `deleteTransaction(id)`: Reverts the balance impact of the transaction and deletes it. If it was a transfer, it searches for the sibling transaction with the same `transferId` and deletes both.

---

## 5. Smart Features List

**flo** contains a collection of smart analytical engines inside [`src/hooks/useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts) and [`src/hooks/useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts):

### 1. Frequent Presets Auto-Detection (`useFrequentPresets`)

Instead of hardcoding shortcuts, the app groups historical debit transactions by description and category. Combinations logged at least **twice** are sorted by frequency (descending) and surfaced on the dashboard as one-tap log buttons, using the amount of the most recently logged entry.

### 2. Subscription Active Scanning (`runSubscriptionAutoDetection`)

Scans historical data for debits with the same description and similar amounts (rounded to the nearest 5) occurring in at least **two separate months**. It automatically populates the `subscriptions` table and schedules a predicted due date based on the user's historical cadence.

### 3. Urgency-Based Bill Alerts (`useSubscriptionAlerts`)

Tracks recurring billing patterns (detecting intervals between 25 and 35 days) over the past 90 days. It dynamically predicts the next renewal date and surfaces alerts in the Notification Hub for bills due within **7 days** (info/warning) or **30 days** (insights), sorted by urgency.

### 4. Smart Surplus Allocation Advisor (`useSmartAllocationPrompt`)

Calculates the user's average daily spend (burn rate) to project remaining spending for the month. If the user's current Expenditure balance exceeds the projected remaining spend by a safe margin of **₹1,000+**, it alerts the user with a recommendation to sweep the surplus safely into the Savings Account. It provides a "Move Now" shortcut button linking directly to the transfer console.

### 5. Projected Budget Exhaustion Day (`useBurnRate`)

Compares active budget configuration with total month-to-date spending. If current spending indicates that the budget will run out before the end of the month, it projects the exact calendar day of exhaustion (e.g. _"Exhaustion projected on Day 22"_), giving users foresight to scale back.

### 6. Week-Over-Week Trend Analytics (`useWeekOverWeek`)

Performs real-time comparison of the current week's spending (last 7 days) against the preceding week's spend. It calculates the percentage change, triggering high-spending velocity warnings (growth $\ge 15\%$) or positive optimization alerts (drop $\le -15\%$).

### 7. Category Budget Alerts (`useCategoryBudgetAlerts`)

Matches current-month category debits against per-category budget allocations. Surfaces warning alerts once spending in a specific category crosses **80%** of its allocation, and turns red/danger if it exceeds **100%**.

---

## 6. Key Application Flows

### Marketing Landing Page & PWA Install Flow

- On first load, if `flo_onboarded` is not set in `localStorage`, the app displays the **Marketing Landing Page** ([`LandingPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/LandingPage.tsx)).
- The landing page presents:
  - An interactive feature grid showcasing the 5 smart features of flo.
  - A privacy callout emphasizing the app's offline-first structure.
  - A dynamic PWA installer that hooks into the browser's `beforeinstallprompt` event to let users download the app, or displays guidance on adding it to the Home Screen.
  - Footer links to `/privacy` and `/terms`.
- Tapping **"Get Started"** or **"Launch App"** transitions the layout into the onboarding slides ([`OnboardingFlow.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features/onboarding/OnboardingFlow.tsx)).
- Once the user completes onboarding, subsequent visits bypass the Landing Page and show the Dashboard.

### Onboarding & Skipped Setup Flow

- During the onboarding deck, if the user completes the flow, they configure their month parameters immediately.
- If they select **"Skip for now"**, a `flo_skipped_setup_YYYY-MM` flag is set to true. The system hides the setup modal and displays a **"Set Up Now"** button directly inside the orange `DashboardHeroCard` at the top of the dashboard. Tapping this button launches the modal later.

### Welcome / Splash Screen Flow

- When the application mounts, `AppRoutes.tsx` displays the `SplashScreen` overlay.
- The welcome screen animates the `flo` logo and a linear progress indicator for a minimum of 1.5 seconds.
- Once the IndexedDB connection is established (`monthSetup` changes from `undefined` to loaded) and the 1.5s timer finishes, the screen transitions to an `opacity-0` fade-out and unmounts after 600ms, revealing the application underneath.

### Theme System (Dark / Light Selector)

Managed by [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx), the user can toggle the visual theme.

- Tailwind CSS v4 is configured with:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- Toggling theme adds/removes the `.dark` class from the `html` element. This prevents standard system `prefers-color-scheme` preferences from overriding manually chosen configurations.

---

## 7. Design System & Styling Guidelines

The visual aesthetic is governed by `src/index.css`. Key tokens and classes to maintain:

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

### 3. Typography Rules

- Body text uses standard sans-serif: `"Inter", system-ui, sans-serif`.
- Display currency values use a premium serif typography: `.amount-display { font-family: "Instrument Serif", Georgia, serif; }`.

### 4. Codebase Button Guidelines

- **Primary Button (`.btn-primary`)**: Pill-shaped (`var(--r-pill)`), colored with `--accent`, displays white text, and uses a custom active transform scale of `0.96`.
- **Secondary Button (`.btn-secondary`)**: Semi-transparent border card pill, transitions size and background, suited for secondary user choices.
- **Ghost Button (`.btn-ghost`)**: Transparent backgrounds, muted labels, used for layout-neutral utilities.
