# Codebase Knowledge Base — pocket_ledger (buckflo)

Welcome to the central technical documentation and knowledge base for **pocket_ledger** (branded as **buckflo**), a premium, offline-first personal finance advisor application built as a native Android app and Progressive Web App.

This document details the application architecture, database schemas, custom hooks, smart analytical features, core flows, styling guidelines, and folder structure.

> Version pulled from package.json. Update manually if docs are out of sync.

**Quick Reference:**
- DB: Dexie.js (IndexedDB), singleton `FloDB` via `src/db/core.ts`
- State: React hooks in `src/hooks/`, Dexie `useLiveQuery` for reactivity
- Entry Point: `src/App.tsx` (contexts) → `src/routes/AppRoutes.tsx` (routing)

---

## 1. Project Overview & Tech Stack

**buckflo** is built for lightning-fast, offline-first personal financial management. The tech stack includes:

- **Core**: React 19 (TypeScript) + Vite 8
- **Data Persistence**: IndexedDB managed via [Dexie.js](https://dexie.org/) v4 for transparent transactional storage, utilizing reactive queries with `dexie-react-hooks`. Import/export via `dexie-export-import`.
- **Charting**: Unified under [Chart.js](https://www.chartjs.org/) v4 and `react-chartjs-2` for rich, performance-optimized, and consistent financial trend visualization.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) using modern CSS Custom Properties, glassmorphism systems, and theme variables.
- **Animation**: [Framer Motion](https://www.framer.com/motion/) v12 for declarative, physics-based animations on insight cards and transitions.
- **Visual Elements**: [Boring Avatars](https://github.com/hihayk/boring-avatars) for brand-tailored, deterministic SVG avatar generation.
- **Utility Libraries**: `date-fns` v4 for robust date math, `lucide-react` v1 for iconography, `clsx` + `tailwind-merge` for class composition.
- **Native Mobile**: [Capacitor](https://capacitorjs.com/) v8 stack for Android (and iOS) bridging, with plugins for haptics, local notifications, status bar, keyboard, safe-area, and splash screen.
- **OTA Updates**: `@capgo/capacitor-updater` for self-hosted, free Over-The-Air bundle delivery.
- **Analytics**: `@vercel/analytics` for web traffic insights.
- **PWA**: `vite-plugin-pwa` for service worker, manifest, and offline support.
- **Image Generation**: `html-to-image` for widget/share card capture.
- **Target Audience**: Users seeking clean separate tracking of everyday Spending vs long-term Savings.

---

## 2. User Guide: How to Use buckflo

Below is the step-by-step operational guide for the application:

### Step 1: Complete Profile Setup & Onboarding

1. **Profile Setup Gate**: On first launch, you are prompted to input your display name. Special characters, spaces, and numbers are blocked, enforcing alphabet-only validation up to 20 characters. This name is used to generate a unique, brand-colored deterministic avatar.
2. **Onboarding slides**: Swipe through the `OnboardingFlow` slides to understand how buckflo manages your cash flow across two separate wallets (Spending and Savings).
3. If you choose **"Skip for now"** during month setup, the app loads the dashboard immediately but hides transactional tracking. To begin, tap **"Set Up Now"** inside the dashboard card.
4. **Income-Based Month Setup Wizard**: Set up your month using a conversational flow:
   - **Income Input**: Enter your total expected monthly income. (If you prefer not to share this, you can skip to an alternative flow where you simply set your starting Spending and Savings wallet balances manually).
   - **Committed Expenditure**: Assign fixed budgets to standard categories (Rent, Bills, etc.) with optional due-day tracking and the option to create custom categories.
   - **Leftover Decision**: Decide what to do with the remaining unassigned funds—send it all to Savings, keep it flexible in Spending, or split it.
   - **Monthly Close Summary**: When a new month begins, you are greeted with a "month wrapped" screen featuring a **Bento Box grid layout** over a **Pixel Art background**, detailing your total spend, top category, leftover, and activity record from the previous month.

### Step 2: Log Transactions & Use Shortcuts

1. **Manual Logging**: Tap the **`+`** button in the center of the bottom navigation bar to log a transaction.
   - Select **Debit** (Expense), **Credit** (Income), or **Transfer** (Move cash between Savings and Spending).
   - Fill out the Amount, Category, Date, and Description.
2. **CSV Import**: You can bulk import transactions from other apps or bank statements. Navigate to the main transaction feed header and tap the import icon to upload a CSV file.
3. **One-Tap Presets**: Once you log repeated transactions, the dashboard automatically surfaces them under **Quick Presets** (e.g. _"Coffee — ₹80"_). Tap any preset to log it instantly.
4. **Create Preset Manually**: Users can also manually create and manage presets via `CreatePresetSheet`.

### Step 3: Track Burn Rate & Feed

1. **Dashboard Balance Card**: Shows your current Spending wallet balance and remaining budget. It calculates a dynamic **Daily budget left** based on how many days are left in the month.
2. **Monthly Feed**: Navigate to the **Monthly** tab (`/monthly`) to view:
   - All daily transactions with running balances.
   - **Committed Expenses tab** — marking fixed bills as paid/unpaid with a linked transaction.
   - **Subscriptions tab** — autopay management.
   - Visual budget progress bars per category.

### Step 4: Manage Savings Goals

1. Navigate to the **Savings** tab (`/savings`).
2. Tap **"Create Goal"** to define a savings target (description, target amount, optional deadline).
3. Allocate money directly into goals from your Savings wallet balance. The app calculates remaining funding required and highlights achieved goals.
4. **Savings Velocity**: The `useSavingsVelocity` hook calculates your average monthly savings rate and provides ETA predictions for individual goals based on historical savings patterns.
5. **Savings Nudge Sheet**: When no savings balance is set, the `SavingsNudgeSheet` prompts first-time allocation of funds from Spending to Savings.

### Step 5: Insights & Bill Notifications

1. Navigate to **Insights** (`/insights`):
   - **Overview Tab**: View week-over-week analytics, daily averages, interactive category spending charts, a **Historical Trend Chart** (6-month net worth + savings balance), and the **Burn Velocity Card**.
   - **Subscriptions Tab**: Track committed monthly subscriptions and bills, showing upcoming due dates and payment status.
2. **Notification Hub**: Tap the Bell icon in the header to check alerts:
   - Category budget threshold warnings (80% and 100%+ spent).
   - Bill reminders (due within 7 days).
   - Committed expense due-date alerts (today or within 2 days).
   - Savings goal milestones (90%+ funded, 100% achieved).
   - Week-over-week spend velocity alerts (≥15% increase or ≤-15% decrease).
   - **Smart Allocation Advisor**: Sweeps excess Spending funds into Savings with one tap.

---

## 3. Interactive Directory Map

### Part A: Core Folder Structure
A visual high-level map of the codebase architecture:

```
/
├── android/              # Capacitor Android project
├── public/               # Static assets & manifest files
├── src/
│   ├── components/       # UI Components (layout, dashboard, UI controls, feature folders)
│   ├── context/          # Global state contexts (Theme, Tooltip)
│   ├── db/               # Dexie.js schema, core definitions, and database helper queries
│   ├── hooks/            # Core React custom hooks (analytics, notification logic)
│   ├── pages/            # Lazy-loaded route-level screen components
│   ├── routes/           # AppRoutes mapping routes to screen pages
│   └── utils/            # Shared utility functions (currency formats, seed data, haptics, CSVs)
```

### Part B: Deep Directory Dive
The exhaustive directory structure organized by module:

- `/` (Root): Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`, `capacitor.config.ts`) and entry points.
- `/public/`: Static branding assets and web app manifestation files.
- `/android/`: Capacitor-managed native Android project.
- [`/src/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src): Core application logic.
  - [`App.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/App.tsx): Root component setting up contexts (`ThemeProvider`, `BrowserRouter`, `TooltipProvider`), global toast configuration, Vercel Analytics, and Android Widget sync hooks.
  - [`main.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/main.tsx): Application bootstrap. Runs legacy database migration, initializes Capacitor plugins (SafeArea, OTA Updater, back button, SplashScreen), and mounts the React root.
  - [`index.css`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/index.css): Main stylesheet housing CSS variables, glassmorphic layout rules, typography setups, and Tailwind imports.
  - [`components/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components): Shared components, sub-divided into domain directories:
    - [`layout/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout):
      - [`AppLayout.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/AppLayout.tsx): Global shell. Manages header, scroll-blur transitions, PWA install banner, onboarding gate, notification hub, global transfer sheet, changelog modal, update prompt, and notification permission dialog.
      - [`BottomNav.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BottomNav.tsx): Main tab navigation bar with center `+` action button.
      - [`BrandedAvatar.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/BrandedAvatar.tsx): Deterministic boring-avatar wrapper component.
      - [`CustomDropdown.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/CustomDropdown.tsx): Upward-opening custom theme selector dropdown.
      - [`NotificationSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/NotificationSheet.tsx): Full-screen bottom-sheet notification hub with Active/History tabs.
      - [`NotificationCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/NotificationCard.tsx): Individual alert renderer with action buttons (primary + inline secondary actions).
      - [`PixelBanner.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/PixelBanner.tsx): Generative pixel-art mosaic header for profile page.
    - [`ui/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui): Reusable interface controls:
      - [`SegmentedControl.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/SegmentedControl.tsx): Animated segmented tabs control.
      - [`Tooltip.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/Tooltip.tsx): Positioned tooltip with smart viewport-aware positioning.
      - [`ChangelogModal.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/ChangelogModal.tsx): Auto-shows "What's New" bottom sheet on version change using `localStorage` key `last_seen_version`.
      - [`UpdatePrompt.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/UpdatePrompt.tsx): PWA service-worker update pill banner using `vite-plugin-pwa`'s `useRegisterSW`.
      - [`PixelArtBackground.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/PixelArtBackground.tsx): Generative SVG pixel-art background supporting six named patterns: `core`, `portal`, `matrix`, `circuit`, `flow`, `signal`.
      - [`CurrencyInput.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/CurrencyInput.tsx): Formatted currency input field with ref forwarding.
      - [`CustomTimePicker.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/CustomTimePicker.tsx): Styled time input for notification time scheduling.
      - [`DueDatePicker.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/DueDatePicker.tsx): Day-of-month picker for committed expense due-date assignment.
      - [`blur-fade.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/blur-fade.tsx): Blur-and-fade entry animation wrapper.
      - [`rich-word-fade-in.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ui/rich-word-fade-in.tsx): Word-by-word fade-in animation for narrative insights text.
    - [`dashboard/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/dashboard):
      - [`DashboardWidgets.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/dashboard/DashboardWidgets.tsx): All widget cards rendered below the main balance card (presets, recognition copy, monthly comparison badge, etc.).
    - [`transactions/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions):
      - [`TransactionRow.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/TransactionRow.tsx): Individual transaction list item renderer.
      - [`TransactionDetailsSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/TransactionDetailsSheet.tsx): Bottom-sheet detail view for a single transaction with edit/delete actions.
      - [`TransferSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/TransferSheet.tsx): Sheet for transferring funds between wallets.
      - [`ImportModal.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/ImportModal.tsx): CSV bulk import flow with column mapping and validation.
      - [`ExportSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/ExportSheet.tsx): Date-range CSV export sheet.
      - [`TransactionFilters.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/TransactionFilters.tsx): Filter controls for the monthly transaction view (type, category, date range).
      - [`CreatePresetSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/CreatePresetSheet.tsx): Sheet for manually creating a transaction preset shortcut.
      - [`form/TransactionAmountCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/form/TransactionAmountCard.tsx): Amount entry sub-card for the Add/Edit transaction page.
      - [`form/TransactionDetailsCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/transactions/form/TransactionDetailsCard.tsx): Details entry sub-card (category, date, description) for Add/Edit.
    - [`savings/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings):
      - [`CreateGoalSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings/CreateGoalSheet.tsx): Bottom sheet for creating a new savings goal.
      - [`ManageGoalSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings/ManageGoalSheet.tsx): Sheet for allocating funds to / withdrawing from an existing goal.
      - [`SavingsGoalCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings/SavingsGoalCard.tsx): Individual savings goal card with progress ring and pacing info.
      - [`SavingsNudgeSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/savings/SavingsNudgeSheet.tsx): First-time savings allocation prompt sheet.
    - [`insights/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights):
      - [`BurnVelocityCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights/BurnVelocityCard.tsx): Collapsible card showing projected EOM spend vs budget, with Framer Motion animations, skeleton loading, and narrative `RichWordFadeIn` text.
      - [`CollapsibleInsightCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights/CollapsibleInsightCard.tsx): Reusable expandable card wrapper used by all insight sub-cards.
      - [`InsightsSubscriptionsTab.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights/InsightsSubscriptionsTab.tsx): Full subscriptions management tab within Insights.
      - [`SubscriptionFormSheet.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/insights/SubscriptionFormSheet.tsx): Form sheet for creating/editing a subscription entry. Supports `weekly`, `monthly`, `3_months`, `6_months`, and `yearly` frequencies.
    - [`monthly/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/monthly):
      - [`BudgetOverviewCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/monthly/BudgetOverviewCard.tsx): Summary card showing budget vs. flexible spend for the month.
      - [`CommittedExpensesList.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/monthly/CommittedExpensesList.tsx): List of committed expenses with "Mark as Paid" / "Undo" actions.
      - [`MonthPlannerDashboard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/monthly/MonthPlannerDashboard.tsx): Main monthly planner overview (budget bars, category breakdowns).
      - [`MonthlySetupPlaceholder.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/monthly/MonthlySetupPlaceholder.tsx): Empty-state placeholder shown before a month is set up.
    - [`month-init/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/month-init): Components used within the monthly view's init sections:
      - [`CategoryBudgetsSection.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/month-init/CategoryBudgetsSection.tsx): Per-category budget allocation controls.
      - [`SavingsSection.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/month-init/SavingsSection.tsx): Savings wallet allocation section.
      - [`SpendingSection.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/month-init/SpendingSection.tsx): Spending wallet setup section.
      - [`SectionHeader.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/month-init/SectionHeader.tsx): Reusable section title header component.
    - [`profile/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/profile):
      - [`ProfileSections.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/profile/ProfileSections.tsx): All profile page section cards (account info, data management, settings, about links).
    - [`setup/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup):
      - [`IncomeWizard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/IncomeWizard.tsx): Multi-step month setup wizard. Logic extracted to `useIncomeWizard.ts`.
      - [`MonthlyCloseSummary.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/MonthlyCloseSummary.tsx): Full-screen month-wrapped card with Bento Box grid and `PixelArtBackground`.
      - [`QuickReviewScreen.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/QuickReviewScreen.tsx): Quick overview review screen within the wizard flow.
      - [`useIncomeWizard.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/useIncomeWizard.ts): All stateful logic for the multi-step income wizard (step management, form state, validation, DB writes).
    - [`landing/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing): Marketing landing page sub-components:
      - [`LandingHero.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/LandingHero.tsx): Hero section with headline, CTA, and animated elements.
      - [`LandingFeatures.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/LandingFeatures.tsx): Features grid section.
      - [`LandingProblem.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/LandingProblem.tsx): "Problem" narrative section.
      - [`LandingHowItWorks.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/LandingHowItWorks.tsx): Step-by-step how-it-works section.
      - [`LandingFooter.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/LandingFooter.tsx): Footer with links to Privacy & Terms pages.
      - [`FloatingHeroCards.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/FloatingHeroCards.tsx): Animated floating card previews in the hero.
      - [`FAQItem.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/FAQItem.tsx): Collapsible FAQ accordion item.
      - [`FeatureCard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/landing/FeatureCard.tsx): Individual feature highlight card.
    - [`features/onboarding/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features/onboarding):
      - [`OnboardingFlow.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/features/onboarding/OnboardingFlow.tsx): Swipeable intro slides shown on first app launch before month setup.
    - Root-level components:
      - [`ConfirmDialog.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/ConfirmDialog.tsx): Branded portal-rendered confirmation dialog (used via `useConfirm` hook).
      - [`CustomDatePicker.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/CustomDatePicker.tsx): Custom-styled date picker (alternative to native `<input type="date">`).
      - [`DashboardCards.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/DashboardCards.tsx): Main balance display cards for the dashboard (Spending + Savings wallets).
      - [`MonthInitModal.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/MonthInitModal.tsx): Modal prompting month initialization.
      - [`MonthPicker.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/MonthPicker.tsx): Month selection dropdown component.
      - [`NotificationPermissionDialog.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/NotificationPermissionDialog.tsx): First-launch notification permission request dialog.
  - [`context/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context):
    - [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx): Provides `useTheme` hook for Light/Dark/System theme management. Syncs with IndexedDB and localStorage. Adds/removes `.dark` class on `<html>`.
    - [`TooltipContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/TooltipContext.tsx): Provides `useTooltip` for global tooltip state management (ensures only one tooltip is visible at a time).
  - [`data/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/data):
    - [`changelog.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/data/changelog.ts): Typed changelog data array (`ChangelogEntry[]`) consumed by `ChangelogModal`. Latest version must always be index `0`.
  - [`db/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db):
    - [`schema.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/schema.ts): All TypeScript interface definitions for DB tables + `DEFAULT_CATEGORIES` seed array.
    - [`core.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/core.ts): `FloDB` Dexie class definition with all versioned schema upgrades (v1–v10) and `on('populate')` / `on('ready')` hooks. Exports singleton `db`.
    - [`database.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/database.ts): Re-export barrel for `db` and all transactional helper functions.
    - [`hooks.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/hooks.ts): All Dexie `useLiveQuery`-powered React hooks for reactive DB reads (`useAccount`, `useMonthSetup`, etc.).
    - [`queries.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/queries.ts): Non-reactive one-shot async query functions (e.g. `getSpendingWallet`).
    - [`migration.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/migration.ts): Handles renaming the legacy `PocketLedgerDB` database to `BuckfloDB`, copying all data over.
  - [`hooks/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks): Custom React hooks:
    - [`useAnalytics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAnalytics.ts): Re-export barrel for analytics hooks.
    - [`useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationHub.ts): Re-export barrel for notification hub hooks.
    - [`useProfile.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useProfile.ts): Reactive profile queries and `updateProfile` mutation.
    - [`useCategories.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useCategories.ts): Live categories list with `getCategoryColor()` and `hexToRgba()` utilities.
    - [`useConfirm.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useConfirm.tsx): Promise-based confirmation dialog via `ConfirmDialog`.
    - [`useMonthComparison.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useMonthComparison.ts): Same-day month-over-month comparison hook.
    - [`useAutopayTrigger.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useAutopayTrigger.ts): Fires autopay processing 1s after onboarding completion.
    - [`useDatabaseSync.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useDatabaseSync.ts): Background wallet balance reconciliation on app startup.
    - [`useMonthInit.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useMonthInit.ts): Complex hook managing the month initialization state machine (detecting whether a new month needs setup, showing close summary, etc.).
    - [`useMonthlyTransactions.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useMonthlyTransactions.ts): All transactions for the current month with filtering and grouping.
    - [`useCommittedExpenses.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useCommittedExpenses.ts): Handlers for marking committed expenses as paid/unpaid, including linked transaction creation/deletion.
    - [`useSavingsGoals.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useSavingsGoals.ts): Reactive savings goals list query.
    - [`useSavingsVelocity.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useSavingsVelocity.ts): Calculates average monthly savings rate and `calculateETA(target, current)` utility.
    - [`useNotificationScheduler.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationScheduler.ts): Full notification engine. Handles smart catch-up alerts (once/day via `lastNotificationDate`), native OS daily alarm via `@capacitor/local-notifications`, and web fallback timeout.
    - [`useNotificationPermission.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useNotificationPermission.ts): Abstracts browser/native notification permission state and `requestPermission` function.
    - [`usePWAInstall.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/usePWAInstall.ts): Listens for `beforeinstallprompt` event and provides `promptInstall` / `dismissPrompt`.
    - [`useRecognitionCopy.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useRecognitionCopy.ts): Generates a short contextual praise string for the dashboard ("7 days logged straight.", "₹X less than last month.", "Good start to June.").
    - [`useSubscriptionLogic.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useSubscriptionLogic.ts): CRUD and business logic for subscription records.
    - [`useTransactionForm.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useTransactionForm.ts): Full form state and submission logic for `AddEditTransaction` page.
    - [`useTransferForm.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useTransferForm.ts): Form state and submission for the transfer sheet.
    - [`useTransactionDetails.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useTransactionDetails.ts): Fetches a single transaction record for the details sheet.
    - [`useDatePicker.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useDatePicker.ts): State logic for the custom date picker component.
    - [`useCreateGoal.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useCreateGoal.ts): Form logic for creating a new savings goal.
    - [`useManageGoal.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useManageGoal.ts): State and handlers for the goal management sheet (allocate/withdraw).
    - [`useQuickPresetLog.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useQuickPresetLog.tsx): Handles one-tap logging from a preset shortcut.
    - [`useBackHandler.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/useBackHandler.ts): Listens for Android hardware back button events and Capacitor `backButton` to close open sheets.
    - [`analytics/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics):
      - [`index.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/index.ts): Barrel export.
      - [`useBurnRate.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useBurnRate.ts): Calculates `avgDailySpend`, `projectedTotalSpend`, `isOverrunProjected`, and `dayOfExhaustion`.
      - [`useCategoryBudgetAlerts.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useCategoryBudgetAlerts.ts): Detects categories hitting 80%/100% of budget.
      - [`useFrequentPresets.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useFrequentPresets.ts): Auto-detects frequent debit patterns (logged ≥2 times) for Quick Preset suggestions.
      - [`useSmartAllocationPrompt.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useSmartAllocationPrompt.ts): Calculates surplus above projected remaining spend + ₹1,000 buffer.
      - [`useSubscriptionAlerts.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useSubscriptionAlerts.ts): Subscription due-within-7-days alert detection.
      - [`useTrends.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics/useTrends.ts): Exports `useWeekOverWeek`, `useMonthOverMonth`, and `useHistoricalData` (6-month net worth reconstruction).
    - [`notifications/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications):
      - [`index.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications/index.ts): Barrel export.
      - [`types.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications/types.ts): `NotificationItem` interface definition.
      - [`useActiveAlerts.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications/useActiveAlerts.ts): Assembles all active in-app alert items from budget, category, committed expenses, advisor, WoW, goals, and subscriptions data.
      - [`useNotificationHub.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications/useNotificationHub.ts): Orchestrates the notification hub — combines active alerts, handles dismiss-to-persist logic, manages open/close state.
  - [`lib/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/lib):
    - [`widgetSync.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/lib/widgetSync.ts): Android Home Screen Widget data bridge. Registers `WidgetData` Capacitor plugin, calls `setWidgetData` with spending balance, budget percent, streak count, recent transactions, and 7-day activity heatmap. Uses Dexie hooks to debounce and auto-sync on DB mutations.
  - [`pages/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages): Screen controllers (all lazy-loaded):
    - [`Dashboard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Dashboard.tsx): Main home screen.
    - [`MonthlyView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/MonthlyView.tsx): Monthly planner with tabbed sections (Overview, Committed Expenses, Subscriptions).
    - [`MonthlyTransactionsView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/MonthlyTransactionsView.tsx): Full scrollable transaction feed for a month.
    - [`SavingsView.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/SavingsView.tsx): Savings goals dashboard.
    - [`Insights.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/Insights.tsx): Analytics overview with chart, burn velocity, WoW comparison, and narrative summary.
    - [`AddEditTransaction.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/AddEditTransaction.tsx): Unified add/edit transaction page with three modes (debit, credit, transfer).
    - [`ProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfilePage.tsx): User profile with pixel banner, avatar, and settings sections.
    - [`ProfileSetupPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ProfileSetupPage.tsx): First-time profile creation page.
    - [`EditProfilePage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/EditProfilePage.tsx): Profile editing form (name, currency, avatar).
    - [`ManageCategoriesPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ManageCategoriesPage.tsx): Category management with color picker, live preview, and safe deletion.
    - [`NotificationsPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/NotificationsPage.tsx): Notification settings page with Daily Reminder toggle, time picker, and granular Smart Alert toggles (Autopay, Bills, Budget).
    - [`AboutPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/AboutPage.tsx): App info, version, and links.
    - [`LandingPage.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/LandingPage.tsx): Marketing landing page (web-only, bypassed in standalone/native).
    - [`PrivacyPolicy.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/PrivacyPolicy.tsx): Privacy policy page at `/privacy`.
    - [`TermsConditions.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/TermsConditions.tsx): Terms & conditions page at `/terms`.
  - [`routes/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes):
    - [`AppRoutes.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes/AppRoutes.tsx): All route definitions. All pages are lazy-loaded via `React.lazy`. Bootstraps `useNotificationScheduler`. Handles PWA/native standalone bypass of landing page.
  - [`utils/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils): Core helpers:
    - [`dateUtils.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/dateUtils.ts): `todayISO()`, `getCurrentMonthYear()`, `getMonthDateRange()`, and other date helpers.
    - [`currency.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/currency.ts): `formatCurrency()`, `formatINR()`, `formatNumber()` using `Intl.NumberFormat` with compact notation.
    - [`csvExport.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/csvExport.ts): Generates and triggers download of a CSV file from transaction arrays.
    - [`csvImport.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/csvImport.ts): Parses uploaded CSV files with flexible column detection.
    - [`backup.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/backup.ts): Full JSON database export (`dexie-export-import`) and "Wipe All Data" reset function.
    - [`validation.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/validation.ts): Name sanitization helpers (alphabet-only, max 20 chars).
    - [`categories.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/categories.ts): Category utility helpers.
    - [`seedData.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/seedData.ts): Generates 3 months of realistic mock transaction data, 3 subscriptions, and 1 savings goal for cold-start demonstration.
    - [`autopay.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/autopay.ts): `processAutopaySubscriptions()` and `advanceDueDate(date, frequency)` helper for all subscription frequency types including `3_months` and `6_months`.
    - [`haptics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/haptics.ts): `hapticFeedback` object with `light`, `medium`, `heavy`, `success`, `error` presets. Uses `@capacitor/haptics` on native, falls back to `navigator.vibrate` on web.
    - [`chartConfig.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/chartConfig.ts): Global Chart.js registration and default configuration (font, tooltips, Y-axis compact notation, DPR ≥2.5).
    - [`modalHelper.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/modalHelper.ts): `updateSheetOpenState()` adds/removes `.sheet-open` class on `<body>` for the main content scale-and-dim transition.
    - [`cn.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/cn.ts): `cn(...inputs)` combining `clsx` + `tailwind-merge` for conflict-free dynamic class composition.
  - [`types/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/types): Currently empty — type definitions live in `db/schema.ts`.

---

## 4. Database Architecture (Dexie Schema)

Data persistence relies on **IndexedDB** wrapped in Dexie. The database class is `FloDB` in [`src/db/core.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/db/core.ts), and the database name is `BuckfloDB`. Legacy data is safely migrated from `PocketLedgerDB` via `src/db/migration.ts`.

### Table Schemas & Indexes (Schema v10 — Current)

- **`accounts`**: Stores account records. Seeded on populate/ready with two wallets.
  - _Schema_: `{ id?: number, name: string, type: 'spending' | 'savings', currentBalance: number }`
  - _Indexes_: `++id, type`
- **`monthSetups`**: Defines the target parameters of a month.
  - _Schema_: `{ id?: number, monthYear: string, openingBalance: number, monthlyBudget: number, accountId: number, categoryBudgets?: Record<string, number>, committedExpenses?: CommittedExpenseEntry[] }`
  - `CommittedExpenseEntry`: `{ name, category, amount, dueDay?: number, isPaid: boolean, paidDate?: string, transactionId?: number }`
  - _Indexes_: `++id, monthYear, accountId, [accountId+monthYear]`
- **`transactions`**: Houses logged debits, credits, and transfers.
  - _Schema_: `{ id?: number, date: string, description: string, amount: number, type: 'debit' | 'credit', accountId: number, category?: string, createdAt: number, transferId?: number, isCommitted?: boolean }`
  - `isCommitted: true` marks a transaction as a committed expense (excluded from flexible spend analytics).
  - _Indexes_: `++id, date, accountId, type, [accountId+date]`
- **`savingGoals`**: Tracks individual savings targets.
  - _Schema_: `{ id?: number, name: string, targetAmount: number, currentAllocated: number, deadline?: string }`
  - _Indexes_: `++id, name, targetAmount, currentAllocated, deadline`
- **`subscriptions`**: Tracks recurring subscriptions and bills.
  - _Schema_: `{ id?: number, name: string, amount: number, frequency: 'weekly' | 'monthly' | '3_months' | '6_months' | 'yearly', nextDueDate: string, category: string, status: 'active' | 'cancelled' | 'paused', autoDetected: boolean, notes?: string }`
  - _Indexes_: `++id, name, frequency, status, nextDueDate, [name+amount]`
- **`categories`**: Tracks standard and user-defined transaction categories with brand colours.
  - _Schema_: `{ id?: number, name: string, color: string, icon?: string, isCustom: boolean, createdAt: number }`
  - _Indexes_: `++id, name, isCustom`
- **`presets`**: Dynamic transaction shortcuts based on user habits.
  - _Schema_: `{ id?: number, name: string, amount: number, category: string, accountId: number, isCustom: boolean, usageCount: number, createdAt: number }`
  - _Indexes_: `++id, name, category, accountId, isCustom, usageCount`
- **`profile`**: Singleton table housing user preferences.
  - _Schema_: `{ id?: number, displayName: string, currency: string, currencySymbol: string, theme: 'light' | 'dark' | 'system', createdAt: Date, updatedAt: Date, lastMonthSetupSnapshot?: string, watchCategories?: string[], monthlyIncome?: number | null, savingsNudgeDismissed?: boolean, wizardCompleted?: boolean, notificationsEnabled?: boolean, notificationTime?: string, notificationPermissionAsked?: boolean, notifyAutopay?: boolean, notifyBills?: boolean, notifyBudget?: boolean, lastNotificationDate?: string }`
  - _Indexes_: `id` (non-auto-increment singleton, always `id=1`)
- **`notifications`**: Persistent store for dismissed alerts.
  - _Schema_: `{ id?: number, title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success' | 'danger', date: string, read: boolean, referenceId?: string }`
  - _Indexes_: `++id, type, date, read, referenceId`

### Practical Example: Transaction Logging Flow

1. **User Action:** The user logs a ₹500 coffee debit from the UI on the Spending wallet.
2. **Method Execution:** The system calls `addTransaction()` with `{ date, amount: -500, type: 'debit', accountId: 1 }`.
3. **Database Transaction:** A Dexie database transaction executes:
   - Writes the new transaction record to the `transactions` table.
   - Adjusts the `accounts` table record for the Spending wallet: `currentBalance -= 500`.
4. **Reactivity & Render:** The `useLiveQuery` hook watching the `accounts` table triggers a re-evaluation of the active query, and the React UI dynamically re-renders to reflect the new wallet balance.

### Auto-Population & Seed Logic

On `populate` (first-ever DB creation) and `ready` (every startup, guards via count check):
1. **Spending Wallet** (`type: 'spending'`, balance `0`).
2. **Savings Wallet** (`type: 'savings'`, balance `0`).
3. **Default Categories** (9 preset categories from `DEFAULT_CATEGORIES`).

On `ready`, a migration also runs to convert legacy `categoryBudgets` `MonthSetup` records into the newer `committedExpenses` array format.

### Transactional Integrity Helper Functions

Operations modifying balances utilize transactional helper functions to enforce consistency:

- `addTransaction(tx)`: Adds transaction and adjusts account's `currentBalance` by `+` (credit) or `-` (debit).
- `recordTransferBidirectional(amount, date, fromType, toType, note, category)`: Simultaneously records a debit on the source account and a credit on the target, updating both balances under a single `transferId`.
- `updateTransaction(id, updated)`: Calculates the differential, reverts old balance impact, applies the new modification.
- `deleteTransaction(id)`: Reverts balance impact and deletes. If a transfer, finds the sibling by `transferId` and deletes both.
- `updateSubscription(id, changes)`: Updates a subscription record.

### Database Balance Reconciliation (Self-Healing on Load)

Powered by `useDatabaseSync`, loaded in `AppLayout.tsx` on startup:
- **Savings Wallet**: Sums all historical savings transactions to recalculate the Savings Wallet balance.
- **Spending Wallet**: Recalculates by taking the active `MonthSetup.openingBalance` ± all transactions within the active month.
- Overwrites `currentBalance` only if a mismatch is found.

### Database Upgrades & Version History

| Version | Key Change | Note / Context |
|---------|------------|----------------|
| v1 | Initial schema (accounts, monthSetups, transactions) | Base local-first table setup |
| v2 | Added `savingGoals` | Enabled target tracking |
| v3 | Added `subscriptions` | Enabled recurring bills engine |
| v4 | Added `categories`, seeded defaults | Standardized category coloring |
| v5 | Added `presets`, extended subscriptions index | Allowed quick preset mapping |
| v6 | Added `profile` | Singleton table for persistent configuration |
| v8 | Added `notifications` | Allowed persistent notification logs |
| v9 | Upgraded accounts types to `spending`/`savings`; seeded profile notification fields | Dual-wallet isolation |
| v10 | Fixed `notificationsEnabled` default to `true` for upgrades | Prevents old users from losing notification ability |

### Dexie Querying Limitations & Best Practices

- **Strict Indexing Requirements:** Dexie throws `SchemaError` if you attempt `.where("field")` on a non-indexed field.
- **The Filter Fallback Pattern:** For non-indexed fields, retrieve via a broad indexed query or `.toArray()` first, then apply JavaScript `.filter()`.

### Local Storage & Client State Key Nomenclature

- **Prefix Rule:** All `localStorage` keys must be prefixed with `buckflo_` (e.g. `buckflo_onboarded`, `buckflo_seen_alerts`, `buckflo_skipped_setup_YYYY-MM`). Legacy `flo_` keys have been purged.
- **`last_seen_version`**: Tracks which changelog version the user has acknowledged (no prefix — used only by `ChangelogModal`).

---

## 5. Smart Features & Technical Implementations

> The features below are architectural patterns that power buckflo's core 
> capabilities (analytics, notifications, sync). Each is isolated to a specific 
> hook or utility and can be understood independently.

**buckflo** contains a collection of smart analytical engines inside [`src/hooks/analytics/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/analytics) and [`src/hooks/notifications/`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/hooks/notifications):

> [!NOTE]
> **Data Aggregation Rule (Analytics Isolation):** Across all analytical engines (Insights charts, Week-over-Week, Month-over-Month, Category Budgets, and Burn Rates), the application explicitly isolates two types of debits:
> 1. **Wealth Accumulation**: Debit transactions with category `transfer`, `Transfer`, or `starting-transfer` are ignored. Moving funds to Savings is treated as wealth accumulation.
> 2. **Committed Expenses**: Transactions with `isCommitted: true` are completely blacklisted from flexible spending algorithms. These parked funds are structurally walled off from all ledger math totals.

### Why Committed Expenses ≠ Subscriptions (Architectural Clarity)

**Committed Expenses**: Fixed monthly bills with a due day, linked to a specific month.
- User explicitly marks as paid
- Auto-logs transaction when marked paid
- Stored in `MonthSetup.committedExpenses[]`
- Examples: Rent (15th), Electric bill (10th), Loan payment (25th)

**Subscriptions**: Auto-recurring charges with irregular cadences, independent of months.
- Auto-detected or manually registered
- Auto-logged via autopay engine on app launch
- Stored in `subscriptions` table
- Examples: Netflix (monthly), Gym (weekly), Insurance (6-months)

**Why separate?**
- Committed = *explicit monthly planning* (user decides per month)
- Subscriptions = *discovered recurring patterns* (independent cycle)
- Merging breaks analytics (is a skipped Netflix a "missed bill" alert?)

### 1. Frequent Presets Auto-Detection (`useFrequentPresets`)

Groups historical debit transactions by description+category. Combinations logged **≥2 times** are sorted by frequency and surfaced as one-tap dashboard shortcuts using the most recent amount.

### 2. CSV Data Portability & JSON Data Backup

- **JSON Data Backup**: Full IndexedDB export (`Buckflo_Backup.json`) via `dexie-export-import`. Supports complete migration. A "Wipe All Data" action resets the local database entirely. Both available from Profile page.
- **CSV Import / Export**: Upload external bank sheets or export transaction histories by date range from the transaction feed header.

### 3. Urgency-Based Bill Alerts (`useSubscriptionAlerts` + `useActiveAlerts`)

Surfaces alerts in the Notification Hub for subscriptions due within **7 days** (info/warning/danger based on proximity), with inline **"Skip Cycle"** and **"Pause Autopay"** action buttons on each notification card.

### 4. Smart Surplus Allocation Advisor (`useSmartAllocationPrompt`)

Calculates average daily spend to project remaining spending. If the Spending closing balance exceeds the projected remaining spend by **₹1,000+**, recommends transferring the surplus to Savings via a "Move Now" shortcut.

### 5. Persistent Notification History

When a user dismisses an alert via the `NotificationSheet`, it is inserted into the `notifications` IndexedDB table. Viewable in the "History" tab within the Notification Hub.

### 6. Automated Month Carry-Forward & Budget Cloning

- **Opening Balance**: On the first of a new month, leftover Spending balance is dynamically calculated via `useOpeningBalanceReconstructor` and pre-filled as the default opening balance during New Month Setup.
- **Copy from Last Month**: Instantly maps previous month's category budgets and committed expenses allocations to the new month, reducing friction.

### 7. Goal Deadlines & Smart Pacing

If a deadline is defined, the system auto-calculates the exact monthly allocation required to stay on track (e.g., "Requires ₹5,000/mo") and renders pacing visualizers on the goal card.

### 8. Smart Narrative Insights

The Insights page features an animated "Smart Summary" powered by `RichWordFadeIn`:
- **Current Month**: Processes `useWeekOverWeek` to generate a human-readable narrative comparing spend trajectories.
- **Past Months**: Falls back to `useMonthOverMonth` logic for a retrospective comparison.

### 9. Projected Budget Exhaustion Day (`useBurnRate`)

Compares active budget vs month-to-date spend. If the budget will run out before month-end, projects the exact calendar day of exhaustion (e.g., _"Exhaustion projected on Day 22"_).

### 10. Week-Over-Week & Month-Over-Month Trend Analytics

- **`useWeekOverWeek`**: Last 7 days vs preceding 7 days. Warns for growth ≥15% or optimizes for drops ≤-15%.
- **`useMonthOverMonth`**: Aggregated full-month spend comparisons. Narrative tone adapts based on change direction (>10% cautionary, <-10% congratulatory).
- **`useHistoricalData`**: Reconstructs 6 months of historical net worth and savings balance data by rewinding from current balances.

### 11. Category Budget Alerts (`useCategoryBudgetAlerts`)

Matches current-month flexible category debits against per-category budget allocations. Warns at **80%** and alerts at **100%**. Alert IDs are deduplicated by month+category to prevent notification spam.

### 12. Global Multi-Currency Support

Users choose their preferred currency (₹, $, €, £) during Profile Setup or from Edit Profile. Saved to the `profile` table, applied globally via `formatCurrency()` using `Intl.NumberFormat`.

### 13. Progressive Web App (PWA) Install Prompt

`usePWAInstall` listens for `beforeinstallprompt`. Surfaces a dismissible banner below the global header encouraging users to install buckflo to their home screen.

### 14. Database Self-Healing (Auto-Reconciliation)

`useDatabaseSync` runs a background reconciliation sweep on startup. Corrects wallet balance drift by summarizing the transaction ledger automatically.

### 15. Automatic Bill Payment (Autopay Engine)

`useAutopayTrigger` fires 1 second after onboarding confirmation. Calls `processAutopaySubscriptions()` which:
1. Scans active subscriptions whose `nextDueDate` is today or past.
2. Records a debit transaction on Spending wallet.
3. Advances `nextDueDate` by frequency (supports `weekly`, `monthly`, `3_months`, `6_months`, `yearly`).
4. Shows a toast confirmation (e.g. "Netflix — ₹649 auto-logged today ✓").
All mutations run inside a single Dexie transaction.

### 16. Haptic Feedback System

`hapticFeedback` utility in [`haptics.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/haptics.ts):
- Uses `@capacitor/haptics` on native Android/iOS for true Taptic Engine feedback.
- Falls back to `navigator.vibrate` on web.
- Presets: `light` (10ms), `medium` (30ms), `heavy` (double pulse), `success` (confirm pattern), `error` (rapid triple pulse).

**Used in:**
- `BottomNav.tsx`: Light feedback on tab switch.
- `Dashboard.tsx`: Medium feedback on Quick Preset tap.
- `AddEditTransaction.tsx`: Medium feedback on save.
- `TransactionDetailsCard.tsx`: Heavy feedback on delete confirm.
- `ChangelogModal.tsx`: Light on open, medium on close.
- `UpdatePrompt.tsx`: Success on update tap.

### 17. Full Category Management System

[`ManageCategoriesPage`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/ManageCategoriesPage.tsx) from Profile settings:
- **12 curated preset colors** + native color picker for custom hex.
- **Live Preview**: Real-time badge preview before saving.
- **Safe Deletion**: Queries all transactions referencing the category and warns user of impact count.
- Powered by `useCategories` (Dexie `useLiveQuery`).

### 18. Same-Day Month Comparison (`useMonthComparison`)

Compares spending from Day 1 to **today** this month vs Day 1 to the **same day** last month. Returns `direction` (`up`/`down`/`neutral` with ±5% deadzone), `percentChange`, and absolute amounts.

### 19. Promise-Based Confirmation Dialogs (`useConfirm`)

`await confirm({ title, message, variant })` renders `ConfirmDialog` and resolves `true`/`false`. Supports `danger` variant (red). Used for category deletion, data wipe, goal deletion, and transaction deletion.

### 20. Native Push Notifications & Daily Reminder (`useNotificationScheduler`)

Full notification engine:
- **Smart Catch-Up Alerts** (once per day via `lastNotificationDate`): Autopay warnings (1 day before), committed expense due-date alerts, and budget threshold warnings.
- **Native OS Daily Alarm** (ID `999`): Scheduled via `@capacitor/local-notifications` at the user's configured time. Uses `allowWhileIdle: true` for Doze mode support.
- **Web Fallback**: `setTimeout`-based reminder fires if no transactions logged that day.
- **Deep Linking**: Tapping a notification navigates to the relevant page via the `extra.url` field.
- **Granular Controls**: Separate toggles in `NotificationsPage` for Autopay, Bills, and Budget alerts.

### 21. Android Home Screen Widget (`widgetSync.ts`)

A native Android widget bridge via the custom `WidgetData` Capacitor plugin (`src/lib/widgetSync.ts`):
- **Data Synced**: Spending balance (full, compact, micro formats), budget spent %, logging streak count, recent 6 transactions, 7-day activity heatmap (with day names).
- **Intent Handling**: `checkIntent()` detects if the app was launched from the widget's "Add Transaction" shortcut, navigating directly to `/add?cat=...`.
- **Auto-Sync**: Dexie table hooks on `transactions`, `accounts`, and `profile` trigger a debounced `syncWidgetData()` (1s delay) on any mutation.

### 22. Savings Velocity & Goal ETA (`useSavingsVelocity`)

Calculates average monthly savings rate from historical credit transactions on the Savings account. Provides `calculateETA(target, current)` returning the number of months at current rate to fully fund a goal.

### 23. Recognition Copy (`useRecognitionCopy`)

Generates a short contextual encouragement string shown on the dashboard:
- **Rule 1**: If logging streak is ≥7 days: _"X days logged straight. Nice consistency."_
- **Rule 2**: If MTD spending is less than same period last month: _"₹X less than this time last month."_
- **Rule 3**: If within the first 7 days and under daily budget pace: _"Good start to [Month]."_
- Returns `null` if no condition is met (no copy shown).

### 24. Generative Pixel Art Background (`PixelArtBackground`)

SVG-based generative background component used in `MonthlyCloseSummary`. Supports 6 named patterns (`core`, `portal`, `matrix`, `circuit`, `flow`, `signal`) using a seeded random number generator for consistency across re-renders.

### 25. PWA Service Worker Update Prompt (`UpdatePrompt`)

Uses `vite-plugin-pwa`'s `useRegisterSW` to detect when a new service worker is waiting. Shows a dismissible pill banner at the bottom of the screen with "Update" and dismiss buttons.

### 26. Changelog Auto-Display (`ChangelogModal`)

Auto-displays a "What's New" bottom sheet on app launch when the user has not yet seen the latest version. Stores the acknowledged version in `localStorage` under key `last_seen_version`.

### 27. Self-Hosted OTA Updates (Android Native)

Implemented in `main.tsx`. On native startup, fetches `/version.json` from the Vercel deployment, compares SemVer against current bundle version, and if newer, downloads and hot-swaps the update via `@capgo/capacitor-updater`. Completely bypasses app store review for updates.

### 28. Committed Expenses System

An extension of `MonthSetup`:
- Each month can have a list of `CommittedExpenseEntry` records (fixed bills like Rent, Bills with a `dueDay`).
- **Mark as Paid**: Creates a `isCommitted: true` transaction in IndexedDB, records `paidDate` and `transactionId` on the entry.
- **Undo**: Deletes the linked transaction and resets `isPaid: false`.
- These entries are completely excluded from all flexible spending analytics.
- Notification alerts fire on and 2 days before the `dueDay`.

---

## 6. Zero-to-One & Empty States (Cold Start)

When a brand new user joins, smart features are invisible due to lack of historical data:

- **Seed Data Generator**: During Profile Setup, users can check "Generate sample data". Invokes `src/utils/seedData.ts` which populates 3 months of mock transactions, 3 subscriptions, and 1 partially funded savings goal.
- **Empty State UI**: Dashboard and Insights pages gracefully render placeholders. Smart features organically reveal themselves as data thresholds are crossed (2 identical logs for presets, 7 days for WoW analytics, etc.).

---

## 7. Key Application Flows

### Marketing Landing Page & Onboarding Flow

- [`AppRoutes.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/routes/AppRoutes.tsx) renders the Marketing Landing Page at `/`.
- **PWA/Native Standalone Bypass**: If running in standalone or native mode, navigates directly to `/home` (or `/setup` if no profile).
- Tapping **"Get Started"** navigates to `/setup` (no profile) or `/home` (profile exists).

### Local User Profile Creation & Setup Gate

- If the singleton profile does not exist in IndexedDB, the app gates access and presents the **Profile Setup Page**.
- Enforces alphabet-only string sanitization on name inputs (up to 20 characters).
- Avatar preview uses brand colors: Orange (`#d97757`), Dark Orange (`#c2633e`), Sage Green (`#788c5d`), Warm Cream (`#e8e6dc`), Dark Charcoal (`#141413`).

### Income-Based Month Setup Wizard

- Multi-step [`IncomeWizard.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/setup/IncomeWizard.tsx) (logic in `useIncomeWizard.ts`) for first month setup.
- **Decoupled Income Flow**: Users with irregular income can skip the Income step, routing them directly to Committed Expenses setup without the surplus allocation screen.
- Generates a `MonthSetup` record establishing the budget baseline.

### Monthly Close Summary

- A cinematic full-screen experience with **Bento Box grid layout** and a generative **Pixel Art Background** (`pattern="portal"`).
- Shows total spent, leftover balance, top spending category, and activity record (transaction count × days active) for the closing month.
- Appears at the start of each new month before the income wizard.

### Generative Pixel-Art Profile Banner

- [`PixelBanner`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/components/layout/PixelBanner.tsx) renders a symmetrically-mirrored pattern of geometric shapes unique to each user.
- Uses a DJB2-style string hash and a Mulberry32 deterministic PRNG seeded from name + `createdAt` timestamp.

### Theme System (Light / Dark / System Selector)

- Managed by [`ThemeContext.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/context/ThemeContext.tsx).
- Three modes: Light, Dark, System (`prefers-color-scheme` listener).
- Persistent selections synced with IndexedDB and localStorage. Dynamically adds/removes `.dark` class from `<html>`.
- Controlled via `CustomDropdown.tsx` (upward-opening) on `/profile`.

### Android Native Experience

- **Status Bar**: Transparent, allowing background gradient bleed-through.
- **Safe Area**: `capacitor-plugin-safe-area` reads insets and applies them as CSS variables (`--safe-area-inset-*`).
- **Splash Screen**: Hidden 100ms after React mounts to prevent white flashes.
- **Keyboard**: `@capacitor/keyboard` prevents the keyboard from crushing the webview.
- **Back Button**: Hardware back button closes open modals or navigates history; exits app if no history.
- **Context Menu**: Suppressed globally (except on input fields for paste support) for native feel.

### Legal Pages

- [`PrivacyPolicy.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/PrivacyPolicy.tsx) at `/privacy` and [`TermsConditions.tsx`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/pages/TermsConditions.tsx) at `/terms`.

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

- `.glass-card`: Uses `var(--bg-glass)`, `backdrop-filter: var(--glass-blur)`, `border: var(--glass-border)`.
- `.glass-card-strong`: Heavy glassmorphic surfaces using `var(--bg-glass-strong)`.
- `.sheet-overlay` / `.sheet-panel`: Full-screen bottom-sheet system. Uses `modalHelper.ts` to add `.sheet-open` class to `<body>`, triggering a scale/dim transition on main content behind the overlay.
- `.sheet-handle`: Visual drag handle pill at top of bottom sheets.

### 3. Typography Rules

- Body text: `"Inter", system-ui, sans-serif`.
- Display currency: `.amount-display { font-family: "Instrument Serif", Georgia, serif; }`.
- Font families loaded from Google Fonts.

### 4. Settings Card Groups & Dividers

- Settings sections on `/profile` use grouped cards with `divide-y divide-black/5 dark:divide-white/5` dividers.

### 5. Chart Configuration

- All Chart.js instances share global config from [`chartConfig.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/chartConfig.ts).
- Registers CategoryScale, LinearScale, ArcElement, BarElement, LineElement, PointElement, Filler, Legend, Tooltip.
- Default font: Inter. Tooltip styling: dark background, rounded corners.
- Y-axis compact notation: `₹1.2k`, `₹3.5M`.
- `devicePixelRatio` forced ≥2.5 for crisp rendering.

### 6. Utility: `cn()` Class Merge

- [`cn.ts`](file:///Volumes/Mac%20T7/Projects/pocket_ledger/src/utils/cn.ts): `cn(...inputs)` combining `clsx` + `tailwind-merge`. Used throughout for clean dynamic class composition.

### 7. Page Transition Classes

- `AppRoutes.tsx` wraps each route in `.page-transition-tab` (main tabs) or `.page-transition-sheet` (sub-pages), driving entry animations.

---

## 9. Common Implementation Patterns & Gotchas

### Dexie Querying: Index Everything
If you add a new `.where()` query, it MUST have an index or Dexie will throw SchemaError.
Use the "Filter Fallback Pattern": query via indexed field → `.toArray()` → JS `.filter()` for non-indexed fields.

### Analytics Isolation: "Wealth Accumulation" Rule
All charting/analytics hooks ignore `category === 'transfer'` transactions. 
These are *wealth moves*, not *spending*. Accidentally including them breaks burn rate math.

### Sheet Open State
Always use `updateSheetOpenState()` when opening/closing modals.
This adds `.sheet-open` to `<body>`, triggering the scale-dim transition on main content.
Forgetting this breaks the visual hierarchy.

### Notification Deduplication
Alerts are keyed by `month+category` (budget) or `name+date` (subscriptions).
If you add a new alert type, ensure the `referenceId` is unique per logical alert, not per trigger.

---

## 10. Route Architecture

All routes lazy-loaded. Primary routes:

| Path | Component | Type |
|------|-----------|------|
| `/` | LandingPage | Public |
| `/setup` | ProfileSetupPage | Gate |
| `/home` | Dashboard | Tab |
| `/monthly` | MonthlyView | Tab |
| `/monthly/transactions` | MonthlyTransactionsView | Tab |
| `/insights` | Insights | Tab |
| `/savings` | SavingsView | Tab |
| `/add` | AddEditTransaction | Sheet |
| `/edit/:id` | AddEditTransaction | Sheet |
| `/profile` | ProfilePage | Sub-page |
| `/profile/edit` | EditProfilePage | Sub-page |
| `/profile/about` | AboutPage | Sub-page |
| `/profile/categories` | ManageCategoriesPage | Sub-page |
| `/profile/notifications` | NotificationsPage | Sub-page |
| `/privacy` | PrivacyPolicy | Legal |
| `/terms` | TermsConditions | Legal |

---

## 11. Copywriting & Tone

- **Strict Gender Neutrality:** UI copy, smart analytics, and notifications must maintain a universally neutral and professional tone. Hardcoded gendered titles or colloquialisms are strictly prohibited.
