# buckflo

A beautifully crafted, offline-first personal finance and budgeting tracker designed as a Progressive Web App (PWA).

buckflo provides a premium, frictionless experience for tracking your daily expenditures and long-term savings. By prioritizing local-first data storage, it guarantees absolute privacy—your financial data never leaves your device.

## Features

- **Absolute Privacy (Offline-First):** All data is stored locally on your device using IndexedDB. No servers, no accounts, no data harvesting.
- **Personalized Profile Setup:** Quick onboarding that creates a local user profile, with alphabet-only name validation and unique, brand-colored deterministic SVG avatars (via `boring-avatars`).
- **Consolidated Profile & Theme Control:** Minimalist profile settings grouped into elegant list rows with dividers. Includes a custom-designed upward-opening theme dropdown selector to choose between Light, Dark, and System modes.
- **Dual-Account Architecture:** Seamlessly manage and transfer funds between your day-to-day **Expenditure** account and your long-term **Savings** account.
- **Database Self-Healing (Auto-Reconciliation):** Ensures 100% balance integrity with automated transaction-based background audits on application load, correcting account desynchronizations instantly.
- **Smart Budget Tracking:**
  - Set opening balances and granular monthly spending budgets per category.
  - Automatically calculates your **daily remaining budget** to keep you on track.
  - Features intelligent month carry-forward flow to auto-reconcile leftover balances.
  - Displays proactive indicators such as month-to-date activity metrics and monthly budget status badges even in unconfigured months.
- **Intelligent Insights & Goals:**
  - Smart week-over-week analytical narrative that compares recent spend data.
  - Tracks saving goals and automatically projects required monthly allocations to stay on schedule with dynamic deadlines.
- **Full Data Ownership & Recovery:**
  - Full IndexedDB JSON Backups allowing complete migrations of configs, setups, and profiles, on top of standard transactional CSV exports.
- **Advanced Interactive Charts:** Rich visualizations using Chart.js, configured with compact currency suffix formatting (e.g., `₹1k`, `₹10k`, `₹1.5M`) on the Y-axes for cleaner layouts while maintaining precise details in tooltips.
- **Enhanced CSV Portability:** Perform transaction history imports and custom exports directly from the main transaction feed header. Export configuration supports custom ranges, specific months, or all-time histories across specific accounts.
- **Installable PWA:** Install Pocket Ledger directly to your iOS or Android home screen, or your Desktop, for a fully native app experience.

## Tech Stack

Pocket Ledger is built using modern, highly-performant web technologies:

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Charts / Visuals:** [Chart.js](https://www.chartjs.org/) and `react-chartjs-2`
- **Styling & UI:**
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - Extensive custom vanilla CSS (CSS Variables, Glassmorphism, Micro-animations)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [Boring Avatars](https://github.com/hihayk/boring-avatars) (Deterministic SVG avatars)
- **Database / State Management:** [Dexie.js](https://dexie.org/) (a robust wrapper for IndexedDB)
- **PWA Integration:** `vite-plugin-pwa`
- **Date Handling:** `date-fns`
- **Notifications:** `react-hot-toast`
