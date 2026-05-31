# buckflo

A beautifully crafted, offline-first personal finance and budgeting tracker designed as a Progressive Web App (PWA).

buckflo provides a premium, frictionless experience for tracking your daily expenditures and long-term savings. By prioritizing local-first data storage, it guarantees absolute privacy—your financial data never leaves your device.

## Features

- **Absolute Privacy (Offline-First):** All data is stored locally on your device using IndexedDB (`BuckfloDB`). No servers, no accounts, no data harvesting.
- **Global Multi-Currency Support:** Designed for an international audience, users can select their preferred currency (₹, $, €, £) with dynamic, localized formatting applied across the entire application.
- **Zero-to-One Onboarding:** Effortlessly explore the app's full capabilities from day one using the Seed Data Generator to safely mock months of transactions, subscriptions, and saving goals.
- **Personalized Profile Setup:** Quick onboarding that creates a local user profile, with alphabet-only name validation and unique, brand-colored deterministic SVG avatars (via `boring-avatars`).
- **Consolidated Profile & Theme Control:** Minimalist profile settings grouped into elegant list rows with dividers. Includes a custom-designed upward-opening theme dropdown selector to choose between Light, Dark, and System modes.
- **Dual-Account Architecture:** Seamlessly manage and transfer funds between your day-to-day **Expenditure** account and your long-term **Savings** account.
- **Database Self-Healing (Auto-Reconciliation):** Ensures 100% balance integrity with automated transaction-based background audits on application load, correcting account desynchronizations instantly.
- **Intelligent Analytics & Smart Notifications:**
  - **Smart Surplus Advisor:** Calculates your average burn rate and recommends moving surplus funds to Savings if a safe buffer is exceeded.
  - **Narrative Insights:** View a dynamically generated, word-by-word animated human-readable summary of your current spending trajectory or historical retrospective month-over-month performance.
  - **Subscription Tracking & Auto-Pay:** Automatically detects recurring bills, surfaces due date warnings in the Notification Hub, and allows one-tap actions to advance or pause autopay schedules.
  - **Persistent Notification Hub:** All alerts, budget warnings, and advisor recommendations are securely persisted to a local database for historical recall in the History tab.
  - **Budget Exhaustion Projection:** Proactively predicts the exact calendar day you will run out of money based on current expenditure velocity.
- **Smart Budget Tracking:**
  - Set opening balances and granular monthly spending budgets per category.
  - Intelligent month carry-forward flow to auto-reconcile leftover balances and effortlessly clone previous category budgets.
  - Receive real-time threshold alerts when hitting 80% or 100% of a category limit.
- **Goal Deadlines & Smart Pacing:** Track saving goals with dynamic deadlines, automatically calculating required monthly allocations and rendering visual pacing indicators.
- **Full Data Ownership & Recovery:** Full IndexedDB JSON Backups allowing complete migrations of configs, setups, and profiles, alongside standard transactional CSV imports and exports.
- **Installable PWA:** Install buckflo directly to your iOS or Android home screen, or your Desktop, for a fully native app experience featuring a custom contextual install banner.

## Tech Stack

buckflo is built using modern, highly-performant web technologies:

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
