# Flo

A beautifully crafted, offline-first personal finance and budgeting tracker designed as a Progressive Web App (PWA).

Flo provides a premium, frictionless experience for tracking your daily expenditures and long-term savings. By prioritizing local-first data storage, it guarantees absolute privacy—your financial data never leaves your device.

## Features

- **Absolute Privacy (Offline-First):** All data is stored locally on your device using IndexedDB. No servers, no accounts, no data harvesting.
- **Dual-Account Architecture:** Seamlessly manage and transfer funds between your day-to-day **Expenditure** account and your long-term **Savings** account.
- **Smart Budget Tracking:**
  - Set opening balances and monthly spending budgets.
  - Automatically calculates your **daily remaining budget** to keep you on track.
  - Visual warnings and UI shifts when spending exceeds your monthly limit.
- **Premium Aesthetics:** A deeply polished user interface featuring glassmorphism, cinematic lighting effects, fluid layout transitions, and high-end typography (`Instrument Serif` and `Inter`).
- **Installable PWA:** Install Pocket Ledger directly to your iOS or Android home screen, or your Desktop, for a fully native app experience.
- **Data Portability:** Easily export your transaction history to CSV format for external analysis in Excel or Google Sheets.

## Tech Stack

Pocket Ledger is built using modern, highly-performant web technologies:

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling & UI:**
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - Extensive custom vanilla CSS (CSS Variables, Glassmorphism, Micro-animations)
  - [Lucide React](https://lucide.dev/) (Icons)
- **Database / State Management:** [Dexie.js](https://dexie.org/) (a robust wrapper for IndexedDB)
- **PWA Integration:** `vite-plugin-pwa`
- **Date Handling:** `date-fns`
- **Notifications:** `react-hot-toast`
