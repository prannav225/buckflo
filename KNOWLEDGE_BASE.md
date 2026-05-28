# Codebase Knowledge Base — pocket_ledger (flo)

Welcome to the central technical documentation and knowledge base for **pocket_ledger** (branded as **flo**), a premium, offline-first personal finance advisor application.

This document details the application architecture, database schemas, custom hooks, smart analytical features, core flows, styling guidelines, and folder structure.

---

## 1. Project Overview & Tech Stack

**flo** is built for lightning-fast, offline-first personal financial management. The tech stack includes:

- **Core**: React (TypeScript) + Vite
- **Data Persistence**: IndexedDB managed via [Dexie.js](https://dexie.org/) for transparent transactional storage, utilizing reactive queries with `dexie-react-hooks`.
- **Charting**: Unified under [Chart.js](https://www.chartjs.org/) and `react-chartjs-2` for rich, performance-optimized, and consistent financial trend visualization.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) using modern CSS Custom Properties, glassmorphism systems, and theme variables.
- **Visual Elements**: [Boring Avatars](https://github.com/hihayk/boring-avatars) for brand-tailored, deterministic SVG avatar generation.
- **Utility Libraries**: `date-fns` for robust date math, `lucide-react` for iconography.
- **Target Audience**: Users seeking clean separate tracking of everyday Expenditure vs long-term Savings.

---

## 2. User Guide: How to Use flo

Below is the step-by-step operational guide for the application:

### Step 1: Complete Profile Setup & Onboarding
1.  **Profile Setup Gate**: On first launch, you are prompted to input your display name. Special characters, spaces, and numbers are blocked, enforcing alphabet-only validation up to 20 characters. This name is used to generate a unique, brand-colored deterministic avatar.
2.  **Onboarding slides**: Swipe through the slides to understand how flo manages your cash flow across two separate accounts (Expenditure and Savings).
3.  If you choose **"Skip for now"** during month setup, the app loads the dashboard immediately but hides transactional tracking. To begin, tap **"Set Up Now"** inside the orange dashboard card.
4.  Fill out the **New Month Setup** form:
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
  - [`App.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/App.tsx): Entry container setting up contexts and notifications.
  - [`index.css`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/index.css): Main stylesheet housing CSS variables, glassmorphic layout rules, typography setups, and Tailwind imports.
  - [`components/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components): Shared components, sub-divided into domain directories:
    - [`layout/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout): [`AppLayout.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/AppLayout.tsx) (global header/notifications wrapper), [`BottomNav.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BottomNav.tsx) (main layout tabs navigation), [`BrandedAvatar.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BrandedAvatar.tsx) (deterministic boring-avatar wrapper), [`CustomDropdown.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/CustomDropdown.tsx) (upward-opening custom theme selector), [`SplashScreen.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/SplashScreen.tsx).
    - [`ui/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui): Reusable interface controls.
    - [`transactions/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions): Sheets, presets, cards, and row item renderers.
    - [`savings/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings): Goal allocation, lists, and form cards.
    - [`insights/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights): Sub-components for charts, subscriptions, and budget grids.
    - [`features/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features): Onboarding elements.
  - [`context/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context): Global contexts such as [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx).
  - [`db/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db): Core data schema setup ([`database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts)) and hooks wrapper ([`hooks.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/hooks.ts)).
  - [`hooks/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks): Smart analytics calculators ([`useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts)), profile queries ([`useProfile.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useProfile.ts)), and notification engines ([`useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts)).
  - [`pages/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages): Screen controllers for views ([`Dashboard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Dashboard.tsx), [`ProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfilePage.tsx), [`ProfileSetupPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfileSetupPage.tsx), [`EditProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/EditProfilePage.tsx), [`AboutPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/AboutPage.tsx), etc.).
  - [`routes/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes): Application navigation routing definitions.
  - [`utils/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils): Core helpers for dates, currency formatting, exports, validations, and categories.

---

## 4. Database Architecture (Dexie Schema)

Data persistence relies on **IndexedDB** wrapped in Dexie. Configured in [`src/db/database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts), the database name is `PocketLedgerDB`.

### Table Schemas & Indexes (Upgraded to v6)

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
- **`profile`**: Singleton table housing user preferences.
  - _Schema_: `{ id?: number, displayName: string, currency: string, currencySymbol: string, theme: 'light' | 'dark' | 'system', createdAt: Date, updatedAt: Date }`
  - _Indexes_: `++id`

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

Calculates the user's average daily spend (burn rate) to project remaining spending for the month. This check is strictly validated against the reconstructed monthly closing balance (`summary.closingBalance`) of the Expenditure Account (aligning with the Expenditure Balance displayed to the user). If the balance exceeds the projected remaining spend by a safe margin of **₹1,000+**, it recommends transferring the surplus to the Savings Account via a "Move Now" shortcut button.

### 5. Projected Budget Exhaustion Day (`useBurnRate`)

Compares active budget configuration with total month-to-date spending. If current spending indicates that the budget will run out before the end of the month, it projects the exact calendar day of exhaustion (e.g. _"Exhaustion projected on Day 22"_), giving users foresight to scale back.

### 6. Week-Over-Week Trend Analytics (`useWeekOverWeek`)

Performs real-time comparison of the current week's spending (last 7 days) against the preceding week's spend. It calculates the percentage change, triggering high-spending velocity warnings (growth $\ge 15\%$) or positive optimization alerts (drop $\le -15\%$).

### 7. Category Budget Alerts (`useCategoryBudgetAlerts`)

Matches current-month category debits against per-category budget allocations. Surfaces warning alerts once spending in a specific category crosses **80%** of its allocation, and turns red/danger if it exceeds **100%**.

---

## 6. Key Application Flows

### Marketing Landing Page & Onboarding Flow

- On first load, if `flo_onboarded` is not set in `localStorage`, the app displays the **Marketing Landing Page** ([`LandingPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/LandingPage.tsx)).
- Tapping **"Get Started"** or **"Launch App"** transitions the layout into the onboarding slides ([`OnboardingFlow.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features/onboarding/OnboardingFlow.tsx)).
- On completing onboarding, the app requires setting up a **Local User Profile** (name & deterministic avatar) before gating access to month initialization.

### Local User Profile Creation & Setup Gate

- If the singleton profile does not exist in IndexedDB, the app gates access and presents the **Profile Setup Page** ([`ProfileSetupPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfileSetupPage.tsx)).
- Enforces alphabet-only string sanitization on name inputs (up to 20 characters) and presents a reactive avatar preview utilizing brand colors: Orange (`#d97757`), Dark Orange (`#c2633e`), Sage Green (`#788c5d`), Warm Cream (`#e8e6dc`), and Dark Charcoal (`#141413`).
- Submitting writes the singleton profile record to the database, completing the gate.

### Welcome / Splash Screen Flow

- When the application mounts, `AppRoutes.tsx` displays the `SplashScreen` overlay.
- The welcome screen animates the `flo` logo and a linear progress indicator for a minimum of 1.5 seconds.
- Once the IndexedDB connection is established and the 1.5s timer finishes, the screen transitions to an `opacity-0` fade-out and unmounts after 600ms, revealing the application underneath.

### Theme System (Light / Dark / System Selector)

Managed by [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx) in conjunction with user profile settings.

- Offers three modes: Light, Dark, and System (which binds to `prefers-color-scheme` listeners).
- Persistent selections are synced with IndexedDB and localStorage, dynamically adding or removing the `.dark` class from the `html` element.
- The selection is controlled via a custom-styled, upward-opening dropdown component (`CustomDropdown.tsx`) on the `/profile` page, preventing layout overflow on mobile screens.

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

### 4. Settings Card Groups & Dividers

- Settings sections are consolidated inside grouped cards on `/profile`, styled with minimal, theme-adaptive styling.
- List items inside cards are separated using thin border dividers (`divide-y divide-black/5 dark:divide-white/5`).
