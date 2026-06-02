# buckflo — Product Requirements Document

## v2.0 Feature Update

---

## CONTEXT & CURRENT STATE

buckflo is an offline-first personal finance PWA built with:

- React 19 + TypeScript + Vite
- Dexie.js (IndexedDB) — database named BuckfloDB, currently at v8
- Tailwind CSS v4 + glassmorphism design system
- Chart.js + react-chartjs-2
- Boring Avatars (pixel variant)
- lucide-react icons
- date-fns, react-hot-toast

Current DB tables: accounts, monthSetups, transactions,
savingGoals, subscriptions, categories, presets, profile,
notifications

Current accounts model: "Expenditure Account" + "Savings Account"
These need to be reframed as wallets — see Feature 1 below.

App philosophy: awareness not enforcement.
buckflo tracks where money goes and surfaces patterns.
It does not push savings or guilt the user.
Tagline: "Track everything. Understand your patterns. Spend better."

---

## FEATURE 1: Accounts → Wallets Rebrand

### Priority: CRITICAL — Do this first, everything else builds on it

### What changes

Rename "Expenditure Account" → "Spending Wallet"
Rename "Savings Account" → "Savings Wallet"

This is NOT just a label change. It's a conceptual reframe:

- Wallets are virtual, mental accounting tools
- They do NOT represent real bank accounts
- A user with one bank account can use just the Spending Wallet
- The Savings Wallet is optional, not mandatory

### Where to update

- database.ts: account type values and seed data
- All component display text across every page
- Dashboard hero card: "SPENDING WALLET" not "EXPENDITURE BALANCE"
- Monthly page labels
- Savings page labels
- Transfer sheet labels
- Add Entry form account selector
- Onboarding slides
- Landing page copy
- All notification messages
- All empty state copy
- README and docs

### Behavioral change

- If Savings Wallet balance is 0 and no transactions exist for it,
  the Savings Wallet card on Dashboard should be visually de-emphasized
  (smaller, muted) rather than equally prominent
- Single-wallet users should feel the app works perfectly for them
  without the Savings Wallet feeling like a gap or failure

### Language guidelines for ALL copy rewrites

REMOVE: any language implying savings = success, spending = failure
REMOVE: "account" when referring to the two wallets
USE: neutral, observational language
USE: "Spending Wallet" and "Savings Wallet" consistently
NEVER: guilt-based alerts, push toward saving more

---

## FEATURE 2: Income-Based Month Setup Wizard

### Priority: HIGH

### Replaces: current New Month Setup form

### Overview

First time only: a guided conversational wizard that helps users
build a realistic monthly plan based on their actual income.
Month 2+: a pre-filled review screen with one-tap confirmation.

---

### MONTH 1 — Full Wizard (shows once, never again)

Gate: check localStorage key `buckflo_wizard_completed`
If not set → show full wizard
If set → show Quick Review (see Month 2+ below)

#### Wizard Step 1: Income

Screen title: "Let's understand your month"
Subtext: "No judgement. Just clarity."

Field: "What's your monthly income?"

- Number input, formatted with currency symbol
- Optional — can skip with "I'd rather not share"
- If skipped, store income as null, skip Step 2 suggestions

#### Wizard Step 2: Fixed Commitments

Screen title: "What's already spoken for?"
Subtext: "These go out every month no matter what."

Dynamic list — user adds rows:
Label (text input) | Amount (number input) | [remove]

Pre-populated suggestions based on common categories:
□ Rent / EMI
□ Internet & Phone  
 □ Insurance
□ Subscriptions
□ Other

Show running total: "Committed so far: ₹23,000"
If income was entered, show: "Remaining: ₹27,000"

User can skip this step entirely.

#### Wizard Step 3: Spending categories

Screen title: "Where does money slip away?"
Subtext: "Pick what feels familiar. We'll track these for you."

Grid of category chips — multi-select:
Food & Dining | Transport | Shopping
Entertainment | Health | Coffee & Drinks
Travel | Personal Care | Other

This pre-selects which categories to highlight in analytics.
Store as profile.watchCategories: string[]
No wrong answer. User can change later in Settings.

#### Wizard Step 4: Plan your month

Screen title: "Your money, your call"

Shows a simple allocation interface:

Monthly income: ₹50,000
Fixed commitments: ₹23,000
─────────────────────────
Available to plan: ₹27,000

Spending Wallet (daily expenses):
[ ₹15,000 ] ← editable input

What do you want with the rest (₹12,000)?
○ Move to Savings Wallet (set it aside)
○ Keep it flexible (add to Spending Wallet)  
 ○ Split it — [₹6,000] to savings, rest to spending

If no income entered: just show two inputs
Spending Wallet opening balance: [input]
Savings Wallet opening balance: [input] (optional)

#### Wizard Step 5: Monthly spending budget

Screen title: "Set your spending target"
Subtext: "This is your own goal. Not a rule."

Field: "Monthly spending budget"

- Pre-filled with Spending Wallet amount from Step 4
- User can adjust — budget can differ from wallet balance
- Category budgets toggle: "Break it down by category?"
  If yes: show category budget inputs for their watch categories
  If no: single budget number only

#### Wizard Step 6: Seed data offer

Screen title: "Want to see buckflo in action?"
Subtext: "Generate a few months of sample data to explore
all the smart features before logging real expenses."

[ Generate sample data ] [ Start fresh ]

On complete:

- Save all wizard data to monthSetup and accounts tables
- Set localStorage: buckflo_wizard_completed = true
- Save lastMonthSetupSnapshot to profile table (JSON)
- Navigate to Dashboard

---

### MONTH 2+ — Quick Review Screen

### Triggered: on first open of a new calendar month

Screen title: "New month, [displayName]?"
Show previous month's setup pre-filled:

┌─────────────────────────────────────┐
│ June 2026 │
│ │
│ Spending Wallet ₹15,000 │
│ Savings Wallet ₹12,000 │
│ Monthly Budget ₹15,000 │
│ Fixed commits ₹23,000 │
│ │
│ [ Looks good, start June → ] │
│ [ Something changed ] │
└─────────────────────────────────────┘

"Looks good" → copies lastMonthSetupSnapshot forward,
creates new monthSetup record,
updates account balances,
navigates to Dashboard

"Something changed" → opens a simplified edit form,
all fields pre-filled,
user edits only what's different,
saves as new snapshot

Hidden option at bottom (small muted text):
"Major life change? Start fresh →"
→ opens the full wizard again

### DB changes required

- Add to profile table:
  lastMonthSetupSnapshot: JSON string (full previous month config)
  watchCategories: string[] (from wizard step 3)
  monthlyIncome: number | null
  savingsNudgeDismissed: boolean (default false)
  wizardCompleted: boolean (default false)
- Increment DB version, write migration

---

## FEATURE 3: Savings Wallet Nudge

### Priority: MEDIUM

### Logic

Check on Dashboard load:
IF profile.savingsNudgeDismissed === false
AND Savings Wallet currentBalance === 0
AND no transactions ever logged to Savings Wallet
THEN show nudge card once

### Nudge card UI

Appears between Spending Wallet card and Quick Presets
on the Dashboard. Subtle, not alarming.

Card content:
"You haven't set up a Savings Wallet yet.
Even setting a little aside adds up over time.

[Set it up] [Not right now]"

"Set it up" → opens a simple bottom sheet:
"How much do you want to move to your Savings Wallet?"
[amount input]
[Move now →]
This logs a transfer from Spending → Savings Wallet

"Not right now" → sets profile.savingsNudgeDismissed = true
card never appears again ever

### Rules

- Shows maximum ONCE in the app's lifetime
- Once dismissed (either action), never shows again
- No repeat, no second ask, respect the user's decision

---

## FEATURE 4: Monthly Close Summary Screen

### Priority: MEDIUM

### Trigger

When a new month starts and user opens the Quick Review screen,
BEFORE showing the new month setup — show the previous month's
summary card first.

### Summary screen content

Full screen, clean, minimal. One screen only.

┌─────────────────────────────────────┐
│ │
│ May 2026 — done. │
│ │
│ You logged 47 transactions. │
│ │
│ Most spent on: Food ₹4,200 │
│ Stayed in budget: 23 of 31 days │
│ Spending Wallet left over: ₹1,840 │
│ │
│ [ On to June → ] │
│ │
└─────────────────────────────────────┘

### Rules

- Pure facts, zero judgment
- No "you could have saved more"
- No "well done" or "try harder"
- If user overspent: just show the number, no warning color
- If user underspent: just show the number, no celebration
- The user draws their own conclusions
- Show once per month transition, never again for that month

### Data to calculate

- Transaction count: count all transactions in closing month
- Most spent category: highest sum of debits by category
- Days in budget: days where cumulative spend ≤ daily budget rate
- Leftover: closing Spending Wallet balance

---

## FEATURE 5: Data-Driven Recognition Copy

### Priority: LOW

### Philosophy: specific to user's real data, never generic

### Where to add

Dashboard hero card — one subtle line below daily budget rate:
Conditions and copy:

- Logged 7+ days in a row:
  "[X] days logged straight. Nice consistency."
- This month spend < last month (same period):
  "₹[X] less than this time last month."
- First week of month, under budget:
  "Good start to [Month]."
- Never generic motivational quotes
- Never show if no data to base it on
- Max one recognition line at a time
- Updates based on real-time transaction data

Monthly close summary (see Feature 4):

- Already data-driven by design

Savings Goal at 100%:

- Simple: "Goal reached." with a subtle visual change
- No confetti, no celebration animation
- Just clear acknowledgment

### Rules for all recognition copy

- Always based on user's actual numbers
- Always specific ("₹2,400 less" not "you're doing great")
- Always neutral tone, never cheerleader energy
- Never show if the data doesn't support it

---

## FEATURE 6: Daily Expense Logging Reminder

### Priority: LOW

### Requires: PWA notification permission

### Logic

- Ask for notification permission once, after user has logged
  at least 3 transactions (they've shown intent to use the app)
- Ask only once — if denied, never ask again
  Store in profile: notificationPermissionAsked: boolean

### Notification rules

- Send max ONE notification per day
- Only if zero transactions logged that day
- Default time: 8:00 PM (user's local time)
- User can change preferred time in Settings → Notifications
- User can turn off entirely in Settings → Notifications
- Message: "Hey [displayName], anything to log today?"
- NOT: "Don't forget to track your expenses!" (generic/nagging)

### Settings screen addition

Under Profile → add "Notifications" row
Notification screen:
Daily reminder: [toggle on/off]
Reminder time: [time picker, default 8:00 PM]

Save to profile table:
notificationsEnabled: boolean (default false)
notificationTime: string (default "20:00")

---

## COPY & LANGUAGE REWRITE GUIDELINES

### Apply everywhere across the entire app

### Replace these phrases:

"Expenditure Account" → "Spending Wallet"
"Savings Account" → "Savings Wallet"  
"Expenditure Balance" → "Spending Balance"
"Top Up" → "Move from Savings" (more descriptive)
"Budget exceeded" → "Over your target" (less harsh)
"You've overspent" → "You've spent [X] of [Y]" (neutral)
"Save more" → never use this phrase
"Opening Balance" → "Starting Balance" (friendlier)

### Tone guidelines:

- Observer not advisor
- Data-driven not opinion-driven
- Neutral not judgmental
- Specific not generic
- "You spent ₹4,200 on Food" not "You spent too much on Food"

---

## ONBOARDING REWRITE

### The two-wallet concept needs better explanation

### Current problem

The onboarding assumes users understand why two wallets exist.
Most people don't. This causes confusion on first use.

### New onboarding slide for wallet concept

Replace or augment existing "Two Accounts" slide with:

Visual: two side-by-side wallet illustrations
Left wallet (orange): "Day-to-day spending"
Right wallet (green): "Money set aside"

Copy:
"Most people mix their spending and savings in one account.
It's hard to know what's safe to spend.

buckflo uses two simple wallets.
At the start of each month, you decide how to split your money.
Your Spending Wallet tells you exactly what's available today."

Key message: this is a MENTAL system, not a bank requirement.
Add clarification: "Both wallets are virtual.
You don't need two bank accounts."

---

## DB MIGRATION REQUIREMENTS

Increment BuckfloDB to v9 with these additions to profile table:
lastMonthSetupSnapshot: string (JSON, nullable)
watchCategories: string (JSON array, default '[]')
monthlyIncome: number (nullable)
savingsNudgeDismissed: boolean (default false)
wizardCompleted: boolean (default false)
notificationsEnabled: boolean (default false)
notificationTime: string (default '20:00')
notificationPermissionAsked: boolean (default false)

Write proper migration — existing profile records should get
default values for all new fields without data loss.

---

## IMPLEMENTATION ORDER

Phase 1 (do first — foundation):

1. Accounts → Wallets rebrand across entire codebase
2. Language/copy rewrite per guidelines above
3. DB migration to v9

Phase 2 (core new features): 4. Month 2+ Quick Review screen 5. Monthly close summary screen 6. Income-based wizard (Month 1 full wizard)

Phase 3 (polish): 7. Savings Wallet nudge 8. Data-driven recognition copy 9. Onboarding wallet explanation rewrite 10. Daily notification reminder (last — needs permission flow)

---

## GENERAL RULES

- All new UI supports both light and dark mode via existing
  CSS variables — no hardcoded colors
- Mobile-first, min 44px touch targets
- Match existing design language throughout
- No new npm packages without confirmation
- Toast confirmations on all save actions
- No external API calls — stays 100% offline
- Increment Dexie version properly with migration
- Never break existing transaction, goal, or subscription
  functionality
