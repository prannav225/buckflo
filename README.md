# buckflo

A beautifully crafted, offline-first personal finance and budgeting tracker designed as both a native Android app and a Progressive Web App (PWA).

buckflo provides a premium, frictionless experience for tracking your daily expenditures and long-term savings. By prioritizing local-first data storage, it guarantees absolute privacy — your financial data never leaves your device.

> **Current Version:** `2.3.1`

---

## ✨ Features

### Core Architecture

- **Absolute Privacy (Offline-First):** All data is stored locally on your device using IndexedDB (`BuckfloDB`). No servers, no accounts, no data harvesting.
- **Dual-Wallet Architecture:** Seamlessly manage and transfer funds between your day-to-day **Spending Wallet** and your long-term **Savings Wallet**.
- **Database Self-Healing (Auto-Reconciliation):** Ensures 100% balance integrity with automated transaction-based background audits on startup, correcting wallet desynchronizations instantly.
- **Global Multi-Currency Support:** Users can select their preferred currency (₹, $, €, £) with dynamic, localized formatting applied across the entire application.

### Onboarding & Setup

- **Personalized Profile Setup:** Quick onboarding with alphabet-only name validation and unique, brand-colored deterministic SVG avatars (via `boring-avatars`).
- **Income-Based Onboarding Wizard:** A smarter way to plan your month. Start with your income, subtract fixed committed costs (with optional due-day tracking), and effortlessly assign the leftover to savings or flexible spending.
- **Decoupled Income Flow:** Users with irregular income can skip the income step entirely and go straight to configuring committed expenses.
- **Zero-to-One Onboarding:** Instantly explore the app's full capabilities using the **Seed Data Generator** to safely populate 3 months of realistic transactions, subscriptions, and saving goals.
- **Cinematic Monthly Close Summary:** A full-screen "Month Wrapped" Bento Box grid with a generative Pixel Art background, showing total spent, leftover balance, top category, and activity record.

### Transaction Management

- **Manual Transaction Logging:** Add Debit (expense), Credit (income), or Transfer (between wallets) transactions with category, date, and description.
- **One-Tap Quick Presets:** Frequent debit patterns (logged ≥2 times) are automatically surfaced on the dashboard as one-tap shortcut buttons. Manually create custom presets too.
- **CSV Import / Export:** Bulk-import from bank statements or export transaction histories by date range.
- **Full Data Ownership & Recovery:** Full IndexedDB JSON Backups (via `dexie-export-import`) allowing complete migrations of configs, setups, and profiles. A "Wipe All Data" action resets everything.

### Budget & Committed Expenses

- **Smart Budget Tracking:** Set opening balances and granular monthly spending budgets.
- **Committed Expenses System:** Define fixed monthly bills (Rent, Bills, etc.) with optional due-day assignments. Mark as Paid to log a linked `isCommitted` transaction. Undo to reverse it. Completely excluded from flexible spending analytics.
- **Intelligent Month Carry-Forward:** Auto-reconcile leftover balances and effortlessly clone previous month's category budgets.
- **Real-Time Budget Alerts:** Receive threshold alerts when hitting 80% or 100% of a category budget limit.

### Analytics & Insights

- **Budget Exhaustion Projection (**`useBurnRate`**):** Proactively predicts the exact calendar day you will run out of money based on current expenditure velocity.
- **Narrative Smart Insights:** Dynamically generated, word-by-word animated human-readable summaries of your spending trajectory (current month) or historical retrospective (past months).
- **Week-Over-Week & Month-Over-Month Trends:** Real-time comparison with tone-adaptive narratives (cautionary if spending is up &gt;10%, congratulatory if down &gt;10%).
- **6-Month Historical Net Worth Chart:** Reconstructs your spending + savings balance history over the last 6 months.
- **Same-Day Month Comparison:** Compares spending up to today this month vs the same date last month for a fair, apples-to-apples benchmark.
- **Savings Velocity & Goal ETA:** Calculates your average monthly savings rate and predicts how many months until each goal is fully funded.
- **Recognition Copy:** Short contextual praise shown on the dashboard for streak, spending reduction, and early-month health milestones.

### Savings Goals

- **Goal Deadlines & Smart Pacing:** Track saving goals with dynamic deadlines, automatically calculating required monthly allocations and rendering visual pacing indicators.
- **Savings Nudge Sheet:** On first use, prompts an initial allocation of funds from Spending to Savings.

### Notifications & Alerts

- **Smart Push Notifications (**`useNotificationScheduler`**):** Native OS alarms via `@capacitor/local-notifications` for daily reminders. Smart catch-up alerts (Autopay warnings, committed expense due dates, budget limits) fire on app open — limited to once per day.
- **Persistent Notification Hub:** All alerts, budget warnings, and advisor recommendations are securely persisted to a local database. View them in the History tab of the Notification Hub.
- **Granular Notification Controls:** Individual toggles for Autopay, Committed Expense, and Budget alert types.
- **Deep Linking:** Tapping a push notification navigates directly to the relevant screen.
- **Smart Surplus Advisor:** Calculates your average burn rate and recommends moving surplus funds to Savings if a safe ₹1,000 buffer is exceeded.
- **Saving Goals Milestone Alerts:** Notified when a goal reaches 90% or 100% funded.
- **Committed Expense Due Date Alerts:** Alerts on the day of and 2 days before a due bill.

### Subscriptions & Autopay

- **Subscription Tracking:** Define recurring subscriptions supporting `weekly`, `monthly`, `3_months`, `6_months`, and `yearly` billing cycles.
- **Automatic Autopay Engine:** Silently logs debit transactions for due subscriptions on app launch. Advances due date automatically and shows a confirmation toast.
- **One-Tap Skip/Pause:** Notification cards include inline "Skip Cycle" and "Pause Autopay" action buttons.

### Native Android Experience

- **True Native App:** Built with Capacitor 8, delivering a native Android app experience.
- **Self-Hosted OTA Updates:** Completely bypasses paid update services — new bundles stream directly from your own Vercel deployment. No app store review delays.
- **Android Home Screen Widget:** A native widget bridge showing live spending balance, budget percent, logging streak, recent transactions, and a 7-day activity heatmap. Launching from the widget opens the Add Transaction screen with the relevant category pre-filled.
- **Native Haptic Feedback:** Uses the phone's true Taptic Engine via `@capacitor/haptics`.
- **Transparent Native Status Bar:** Background gradient flows seamlessly behind the status bar.
- **Safe Area Awareness:** Reads insets and applies them as CSS custom properties for perfect notch/cutout handling.

### UI & UX

- **Installable PWA:** Install buckflo directly to iOS/Android/Desktop home screen for a fully native app experience.
- **PWA Update Prompt:** A dismissible pill banner appears when a new service worker update is ready.
- **Consolidated Profile & Theme Control:** Light, Dark, and System theme modes with a custom-designed upward-opening dropdown to prevent layout overflow on mobile.
- **Generative Pixel-Art Backgrounds:** Six named patterns (`core`, `portal`, `matrix`, `circuit`, `flow`, `signal`) used in the Monthly Close Summary.
- **Generative Pixel-Art Profile Banner:** A symmetrically-mirrored deterministic mosaic unique to each user, seeded from their name and creation timestamp.
- **Changelog Auto-Display:** "What's New" bottom sheet auto-appears on version update, then is dismissed and not shown again.
- **Promise-Based Confirmation Dialogs:** A branded `useConfirm` system for all destructive actions (delete, wipe, etc.).
- **Full Category Management:** Create, colour-code, and delete custom categories with a live badge preview and safe-deletion impact warnings.

---

## 🛠 Tech Stack

buckflo is built using modern, highly-performant web technologies:

| Category              | Technology                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**         | [React 19](https://react.dev/)                                                                                                                                                     |
| **Language**          | [TypeScript \~6.0](https://www.typescriptlang.org/)                                                                                                                                |
| **Build Tool**        | [Vite 8](https://vitejs.dev/)                                                                                                                                                      |
| **Styling**           | [Tailwind CSS v4](https://tailwindcss.com/) + Extensive custom CSS (Variables, Glassmorphism, Micro-animations)                                                                    |
| **Animation**         | [Framer Motion 12](https://www.framer.com/motion/)                                                                                                                                 |
| **Database**          | [Dexie.js v4](https://dexie.org/) (IndexedDB wrapper) + `dexie-react-hooks` + `dexie-export-import`                                                                                |
| **Charts**            | [Chart.js v4](https://www.chartjs.org/) + `react-chartjs-2`                                                                                                                        |
| **Icons**             | [Lucide React v1](https://lucide.dev/)                                                                                                                                             |
| **Avatars**           | [Boring Avatars](https://github.com/hihayk/boring-avatars)                                                                                                                         |
| **Routing**           | [React Router DOM v7](https://reactrouter.com/)                                                                                                                                    |
| **Toasts**            | [react-hot-toast](https://react-hot-toast.com/)                                                                                                                                    |
| **Date Handling**     | [date-fns v4](https://date-fns.org/)                                                                                                                                               |
| **Class Utilities**   | `clsx` + `tailwind-merge`                                                                                                                                                          |
| **Native Mobile**     | [Capacitor v8](https://capacitorjs.com/)                                                                                                                                           |
| **Capacitor Plugins** | `@capacitor/haptics`, `@capacitor/local-notifications`, `@capacitor/status-bar`, `@capacitor/keyboard`, `@capacitor/splash-screen`, `@capacitor/app`, `capacitor-plugin-safe-area` |
| **OTA Updates**       | `@capgo/capacitor-updater`                                                                                                                                                         |
| **PWA**               | `vite-plugin-pwa`                                                                                                                                                                  |
| **Analytics**         | `@vercel/analytics`                                                                                                                                                                |
| **Image Export**      | `html-to-image`                                                                                                                                                                    |

---

## 🏗 Project Structure

```
/
├── android/              # Capacitor Android native project
├── public/               # Static assets (icons, manifests)
├── src/
│   ├── App.tsx           # Root component (providers + widget sync)
│   ├── main.tsx          # Bootstrap (migrations, Capacitor init, React mount)
│   ├── index.css         # Design system (CSS variables, glassmorphism)
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # AppLayout, BottomNav, BrandedAvatar, NotificationSheet
│   │   ├── ui/           # ChangelogModal, UpdatePrompt, PixelArtBackground, etc.
│   │   ├── dashboard/    # DashboardWidgets
│   │   ├── transactions/ # TransactionRow, Sheets, ImportModal, ExportSheet
│   │   ├── savings/      # GoalCards, CreateGoalSheet, SavingsNudgeSheet
│   │   ├── insights/     # BurnVelocityCard, InsightsSubscriptionsTab
│   │   ├── monthly/      # BudgetOverviewCard, CommittedExpensesList
│   │   ├── setup/        # IncomeWizard, MonthlyCloseSummary
│   │   ├── landing/      # Marketing page sections
│   │   └── features/     # OnboardingFlow
│   ├── pages/            # Route-level screen components (all lazy-loaded)
│   ├── hooks/
│   │   ├── analytics/    # useBurnRate, useFrequentPresets, useTrends, etc.
│   │   └── notifications/ # useActiveAlerts, useNotificationHub
│   ├── context/          # ThemeContext, TooltipContext
│   ├── db/               # Dexie schema, core, hooks, queries, migration
│   ├── lib/              # widgetSync.ts (Android Widget bridge)
│   ├── data/             # changelog.ts
│   ├── utils/            # currency, dateUtils, haptics, backup, etc.
│   └── routes/           # AppRoutes.tsx
└── scripts/              # ota-pack.js (build artifact)
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production + OTA pack
npm run build

# Run on Android (requires Android Studio)
npx cap sync android
npx cap open android
```

---

## 📱 Deployment

- **Web / PWA**: Deployed to [Vercel](https://vercel.com/) (see `vercel.json`).
- **Android**: Native APK built via Capacitor + Android Studio. OTA updates served from Vercel (`/version.json` + `/update.zip`).
