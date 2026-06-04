# buckflo — Brand Guidelines & Design System

> **Version**: 2.0 · **Last Audited**: June 2026
> A comprehensive, platform-agnostic design system reference for the **buckflo** personal expense tracker. All specifications use universal values (pixels, hex, percentages, milliseconds). Implement in **any** technology — web, Flutter, SwiftUI, Jetpack Compose, or otherwise.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing, Radii & Borders](#4-spacing-radii--borders)
5. [Glassmorphism Surface System](#5-glassmorphism-surface-system)
6. [Component Library](#6-component-library)
7. [Animation & Motion](#7-animation--motion)
8. [Theming Architecture](#8-theming-architecture)
9. [Page Layout & Navigation](#9-page-layout--navigation)
10. [Charts & Data Visualization](#10-charts--data-visualization)
11. [Iconography](#11-iconography)
12. [Copy, Voice & Tone](#12-copy-voice--tone)
13. [Accessibility](#13-accessibility)
14. [Engineering Philosophy](#14-engineering-philosophy)

---

## 1. Brand Identity

### 1.1 Name & Wordmark

| Property         | Value                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| **Product Name** | `buckflo` (always lowercase, never "Buckflo" or "FLO")                                                  |
| **Tagline**      | "Track everything. Understand your patterns. Spend better."                                             |
| **Description**  | "Personal expense tracker — log daily transactions, track your budget, and manage two wallets offline." |

The **buckflo** wordmark is purely typographic — there is no separate icon or symbol logo. The name is rendered in the **display serif typeface** (see §3) in italic. Inside the app, it appears in the brand accent colour.

**Wordmark Specifications:**

| Property                   | Value                                          |
| -------------------------- | ---------------------------------------------- |
| Font                       | Display serif (Instrument Serif or equivalent) |
| Style                      | Italic                                         |
| Size                       | 24px                                           |
| Colour (light backgrounds) | Accent Dark (`#c2633e`)                        |
| Colour (dark backgrounds)  | Accent (`#d97757`)                             |
| Letter-spacing             | Wide (+2% of font size)                        |
| Line-height                | 1.0× (equal to font size)                      |

### 1.2 App Icons

| Asset    | Sizes                | Usage                                   |
| -------- | -------------------- | --------------------------------------- |
| App Icon | 192×192px, 512×512px | Home screen, app launcher, PWA manifest |
| Favicon  | Native size          | Browser tab icon                        |

Both icons use the file prefix `flo_`.

### 1.3 App Manifest / Theme Colours

| Property          | Value                     |
| ----------------- | ------------------------- |
| Theme colour      | `#d97757` (Accent orange) |
| Background colour | `#0d0c0b` (Near black)    |
| Display mode      | Standalone                |
| Orientation       | Portrait                  |

### 1.4 Branded Avatar System

User profile avatars are **generated deterministically** from the user's display name — not uploaded photos. They use a "beam" style (abstract geometric shapes) rendered with the following 5-colour palette:

| Swatch | Hex       | Name        |
| ------ | --------- | ----------- |
| 1      | `#d97757` | Accent      |
| 2      | `#c2633e` | Accent Dark |
| 3      | `#788c5d` | Sage Green  |
| 4      | `#e8e6dc` | Warm Bone   |
| 5      | `#141413` | Near-Black  |

Avatar containers are always **circular**, with a subtle border (see §4.3 for border specs).

### 1.5 Pixel Banner (Generative Art Identity)

A signature brand element — a **symmetrically-mirrored pixel-art mosaic** generated from a seeded pseudo-random number generator. Each user gets a unique pattern based on their name + account creation date.

**Specifications:**

| Property               | Value                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Grid cell size         | 12×12px                                                                                                                        |
| Canvas proportions     | 2:1 (e.g. 600×300)                                                                                                             |
| Symmetry               | Left–right mirror along vertical center                                                                                        |
| Fill colour            | Accent (`#d97757`)                                                                                                             |
| Opacity model          | Position-weighted: strongest at center, fading horizontally to edges; full opacity at top, fading vertically downward          |
| Shape templates        | Cross, L-shape, T-shape, Diamond, Zigzag, Domino, Square block, Staircase, Corner, Arrow, Single dot, Tetromino, Hook, U-shape |
| Density                | 55–70 shapes per canvas                                                                                                        |
| Corner radius per cell | 1px                                                                                                                            |

**Usage:**

- Profile page header — seeded with user data (`displayName + createdAt timestamp`)
- Landing page ambient background — seeded with static strings

---

## 2. Color System

### 2.1 Brand Accent Colours (Theme-Independent)

These colours **never change** between light and dark modes:

| Token Name      | Hex       | RGB            | Usage                                                        |
| --------------- | --------- | -------------- | ------------------------------------------------------------ |
| **Accent**      | `#d97757` | `217, 119, 87` | Primary brand colour, CTAs, active navigation, active chips  |
| **Accent Dark** | `#c2633e` | `194, 99, 62`  | Pressed/active accent state, wordmark on light backgrounds   |
| **Debit**       | `#e05545` | `224, 85, 69`  | Expense amounts, danger/error semantics, destructive actions |
| **Credit**      | `#5a9e6f` | `90, 158, 111` | Income amounts, savings, success states, goal completion     |

### 2.2 Light Mode Palette

| Token Name         | Hex / RGBA                  | Usage                                  |
| ------------------ | --------------------------- | -------------------------------------- |
| **Background**     | `#f8f8f6`                   | Page body, primary background          |
| **Glass**          | `rgba(255, 255, 255, 0.90)` | Translucent card surfaces              |
| **Glass Strong**   | `rgba(255, 255, 255, 0.96)` | Elevated surfaces (sheets, header bar) |
| **Surface**        | `#ffffff`                   | Opaque card backgrounds, dialog panels |
| **Text Primary**   | `#1f1f1e`                   | Headings, body text, primary labels    |
| **Text Secondary** | `#6b6b69`                   | Supporting descriptions, sub-labels    |
| **Text Muted**     | `#9d9d99`                   | Placeholders, captions, disabled text  |
| **Border**         | `rgba(0, 0, 0, 0.09)`       | Dividers, card outlines                |

### 2.3 Dark Mode Palette

| Token Name         | Hex / RGBA                  | Usage                         |
| ------------------ | --------------------------- | ----------------------------- |
| **Background**     | `#1f1f1e`                   | Page body, primary background |
| **Glass**          | `rgba(40, 40, 38, 0.45)`    | Translucent card surfaces     |
| **Glass Strong**   | `rgba(35, 35, 33, 0.88)`    | Elevated surfaces             |
| **Surface**        | `#2d2d2c`                   | Opaque card backgrounds       |
| **Text Primary**   | `#f5f5f3`                   | Headings, body text           |
| **Text Secondary** | `#9d9d99`                   | Supporting text               |
| **Text Muted**     | `#6b6b69`                   | Placeholders, captions        |
| **Border**         | `rgba(255, 255, 255, 0.06)` | Dividers, card outlines       |

> [!IMPORTANT]
> Notice that **Text Secondary** and **Text Muted** swap values between light and dark mode. This ensures consistent perceived contrast.

### 2.4 Semantic Colour Rules

| Context                                                | Which Colour                                    |
| ------------------------------------------------------ | ----------------------------------------------- |
| Primary CTA buttons, active state indicators           | Accent                                          |
| Pressed / active CTA                                   | Accent Dark                                     |
| Expense amounts, budget warnings, destructive confirms | Debit                                           |
| Income amounts, savings balances, success indicators   | Credit                                          |
| Advisor / AI-powered features                          | `#9b5de5` (Purple — special use, not tokenized) |
| Toast success icon                                     | `#788c5d` (Sage)                                |
| Toast error icon                                       | `#c0392b` (Crimson)                             |

### 2.5 Hero Card Gradients

Hero cards use **three-stop linear gradients** at a 145° angle:

| Variant               | Stop 1 (0%) | Stop 2 (55%) | Stop 3 (100%) | Shadow Colour       |
| --------------------- | ----------- | ------------ | ------------- | ------------------- |
| **Orange** (default)  | `#d97757`   | `#c05c38`    | `#9a4726`     | `rgba(175, 70, 35)` |
| **Green** (savings)   | `#788c5d`   | `#60704a`    | `#485438`     | `rgba(96, 112, 74)` |
| **Red** (over budget) | `#d33c30`   | `#b82d23`    | `#911c13`     | `rgba(184, 45, 35)` |

**Hero card shadow formula:**

- Outer shadow 1: `offset-y: 8px`, `blur: 24px`, shadow colour at `16–18%` opacity
- Outer shadow 2: `offset-y: 2px`, `blur: 6px`, shadow colour at `10–12%` opacity

Each hero card includes **two decorative glass orbs** for depth:

| Orb   | Size             | Position                    | Fill                |
| ----- | ---------------- | --------------------------- | ------------------- |
| Large | 220×220px circle | Top: -70px, Right: -50px    | White at 7% opacity |
| Small | 180×180px circle | Bottom: -90px, Right: +10px | White at 5% opacity |

### 2.6 Notification Type Colours

| Type    | Icon Background (12% opacity of colour) | Icon Colour        |
| ------- | --------------------------------------- | ------------------ |
| Danger  | `rgba(217, 119, 87, 0.08)`              | Debit (`#e05545`)  |
| Warning | `rgba(217, 119, 87, 0.08)`              | Accent (`#d97757`) |
| Info    | `rgba(74, 134, 232, 0.08)`              | `#4a86e8`          |
| Success | `rgba(90, 158, 111, 0.08)`              | Credit (`#5a9e6f`) |

---

## 3. Typography

### 3.1 Font Families

| Role                                               | Primary Font     | Fallback Stack                 | Source       |
| -------------------------------------------------- | ---------------- | ------------------------------ | ------------ |
| **UI** (body, labels, buttons, inputs)             | Inter            | System sans-serif → sans-serif | Google Fonts |
| **Display** (monetary amounts, headings, wordmark) | Instrument Serif | Georgia → serif                | Google Fonts |

**Inter weights used:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
**Instrument Serif weights used:** 400 (Regular), in both normal and italic styles

### 3.2 Type Scale

All sizes in pixels. "Tracking" = letter-spacing relative to font size.

#### Display Typography (Instrument Serif)

| Element               | Size            | Weight | Style  | Tracking    | Line-height |
| --------------------- | --------------- | ------ | ------ | ----------- | ----------- |
| Hero balance amount   | 36–48px (fluid) | 400    | Normal | -3%         | 1.0×        |
| Card amount (large)   | 28px            | 400    | Normal | -3%         | 1.0×        |
| Savings card amount   | 21px            | 400    | Normal | Tight (-1%) | 1.0×        |
| Transaction amount    | 17px            | 400    | Normal | Tight (-1%) | 1.1×        |
| Profile name          | 30px            | 300    | Italic | Normal      | 1.15×       |
| User greeting         | 30px            | 400    | Italic | Wide (+2%)  | 1.15×       |
| Landing page hero     | 48–72px (fluid) | 300    | Normal | Tight (-1%) | 1.05×       |
| Landing stats numbers | 48px            | 300    | Normal | Normal      | 1.0×        |

#### UI Typography (Inter)

| Element                   | Size   | Weight     | Tracking    | Line-height |
| ------------------------- | ------ | ---------- | ----------- | ----------- |
| Headings (H1–H4)          | Varies | 700 (Bold) | -3%         | 1.15×       |
| Sub-header title          | 20px   | 700        | -3%         | 1.15×       |
| Sheet / dialog title      | 20px   | 700        | Tight (-1%) | 1.15×       |
| Body text                 | 16px   | 400        | Normal      | 1.5×        |
| Description / row title   | 15px   | 500        | Normal      | 1.4×        |
| Button text               | 15px   | 600        | -1%         | 1.0×        |
| Label / caption           | 13px   | 500        | +1%         | 1.4×        |
| Small text / timestamp    | 12px   | 400        | Normal      | 1.4×        |
| Section label (uppercase) | 11px   | 600        | +6%         | 1.0×        |
| Pill badge text           | 11px   | 500        | +2%         | 1.0×        |
| Navigation label          | 10px   | 500        | +3%         | 1.0×        |
| Category badge            | 10px   | 500        | Normal      | 1.4×        |
| Micro-text (smallest)     | 9px    | 700        | Wide (+5%)  | 1.0×        |

### 3.3 Typography Rules

1. **All monetary amounts** use the Display font (Instrument Serif). Never use the UI font for money.
2. **All UI text** uses the UI font (Inter). This includes buttons, labels, descriptions, and form inputs.
3. **Headings** (H1–H4): Always Bold (700), tight tracking (-3%), line-height 1.15×, zero margin.
4. **Section labels**: Always UPPERCASE, 11px, SemiBold (600), wide tracking (+6%), Text Muted colour.
5. **Font rendering**: Enable subpixel antialiasing globally (platform equivalent of "antialiased" rendering).

---

## 4. Spacing, Radii & Borders

### 4.1 Border Radius Scale

| Token      | Value                      | Usage                                                    |
| ---------- | -------------------------- | -------------------------------------------------------- |
| **Small**  | 10px                       | Month picker buttons, small interactive elements         |
| **Medium** | 14px                       | Input fields, transaction row icons, toast notifications |
| **Large**  | 18px                       | Notification cards, feature card elements                |
| **XL**     | 22px                       | Standard glass cards, savings goal cards, confirm dialog |
| **2XL**    | 28px                       | Hero cards, scaled main content when sheet is open       |
| **Pill**   | 999px (or "fully rounded") | Buttons, nav pill, chips, badges, pill indicators        |

### 4.2 Spacing System

All spacing based on a **4px grid**.

| Context                            | Value                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| Page horizontal padding            | 16px                                                    |
| Page top padding                   | 16px + platform safe area top                           |
| Page bottom padding                | 90px + platform safe area bottom (clears bottom nav)    |
| Maximum content width              | 720px, horizontally centered                            |
| Card inner padding                 | 14–24px (varies by card type)                           |
| Section gap (label → content)      | 6–8px                                                   |
| Section gap (section → section)    | 24–32px                                                 |
| Form group bottom margin           | 16px                                                    |
| Form row gap (side-by-side fields) | 12px                                                    |
| Transaction row internal gap       | 14px                                                    |
| Chip / tag row gap                 | 10px                                                    |
| Button icon-to-text gap            | 8px                                                     |
| Small icon-to-text gap             | 6px                                                     |
| Sheet panel internal padding       | Top: 16px, Sides: 24px, Bottom: 24px + safe area bottom |

### 4.3 Border Specifications

| Context                               | Thickness  | Colour                                 |
| ------------------------------------- | ---------- | -------------------------------------- |
| Card borders (light mode)             | 1px        | Black at 8% opacity                    |
| Card borders (dark mode)              | 1px        | White at 6% opacity                    |
| Input field borders                   | 1.5px      | Border token (see §2)                  |
| Input field focus border              | 1.5px      | Accent (`#d97757`)                     |
| Dividers within grouped cards (light) | 1px        | Black at 5% opacity                    |
| Dividers within grouped cards (dark)  | 1px        | White at 5% opacity                    |
| Section dividers                      | 1px        | Border token                           |
| Hero card progress bar track          | 0px (none) | White at 22% opacity (background fill) |
| Cancel button border                  | 1.5px      | Border token                           |

### 4.4 Divider

- Height: 1px
- Colour: Border token
- Vertical margin: 20px above and below

---

## 5. Glassmorphism Surface System

The entire UI is built on a **layered translucent surface** model. Every card, sheet, and elevated element uses blur + translucent backgrounds.

### 5.1 Glass Tokens

| Token                               | Light Mode                  | Dark Mode                      |
| ----------------------------------- | --------------------------- | ------------------------------ |
| **Glass Background**                | White at 90% opacity        | `rgb(40,40,38)` at 45% opacity |
| **Glass Strong Background**         | White at 96% opacity        | `rgb(35,35,33)` at 88% opacity |
| **Glass Blur**                      | 24px blur + 180% saturation | Same                           |
| **Sheet Blur** (bottom sheets only) | 40px blur + 200% saturation | Same                           |

### 5.2 Glass Shadow System

#### Standard Glass Shadow

**Light mode:**
| Layer | Offset-X | Offset-Y | Blur | Spread | Colour |
|---|---|---|---|---|---|
| Outer 1 | 0 | 6px | 20px | 0 | Black at 3% |
| Outer 2 | 0 | 1px | 3px | 0 | Black at 1% |
| Inner highlight | inset 0 | 1px | 0 | 0 | White at 90% |

**Dark mode:**
| Layer | Offset-X | Offset-Y | Blur | Spread | Colour |
|---|---|---|---|---|---|
| Outer | 0 | 4px | 20px | 0 | Black at 30% |
| Inner highlight | inset 0 | 1px | 0 | 0 | White at 5% |

#### Elevated Glass Shadow (for sheets, dialogs)

**Light mode:**
| Layer | Offset-X | Offset-Y | Blur | Spread | Colour |
|---|---|---|---|---|---|
| Outer 1 | 0 | 16px | 36px | 0 | Black at 6% |
| Outer 2 | 0 | 4px | 12px | 0 | Black at 2% |
| Inner highlight | inset 0 | 1px | 0 | 0 | White at 95% |

**Dark mode:**
| Layer | Offset-X | Offset-Y | Blur | Spread | Colour |
|---|---|---|---|---|---|
| Outer | 0 | 16px | 48px | 0 | Black at 50% |
| Inner highlight | inset 0 | 1px | 0 | 0 | White at 6% |

### 5.3 Surface Hierarchy

| Level       | Background                | Blur            | Shadow         | Border          | Usage                                |
| ----------- | ------------------------- | --------------- | -------------- | --------------- | ------------------------------------ |
| **Level 0** | Background token (opaque) | None            | None           | None            | Page body                            |
| **Level 1** | Glass Background          | Standard (24px) | Standard Glass | Standard border | Content cards, list containers       |
| **Level 2** | Glass Strong Background   | Strong (40px)   | Elevated Glass | Standard border | Header bar items, sheets, dialogs    |
| **Level 3** | Surface token (opaque)    | None            | Elevated Glass | Standard border | Confirm dialogs, toast notifications |

---

## 6. Component Library

### 6.1 Buttons

#### Primary Button

| Property           | Value                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Background         | Accent (`#d97757`)                                                  |
| Text colour        | White (`#ffffff`)                                                   |
| Border             | None                                                                |
| Corner radius      | Pill (fully rounded)                                                |
| Padding            | 14px vertical, 28px horizontal                                      |
| Font               | UI font, 15px, SemiBold (600)                                       |
| Letter-spacing     | -1%                                                                 |
| Shadow             | Offset-Y: 4px, Blur: 16px, Colour: Accent at 35% opacity            |
| **Pressed state**  | Scale to 96%, shadow reduces (Blur: 8px, opacity: 25%)              |
| **Disabled state** | Opacity: 45%, no shadow, no scale effect, show "not allowed" cursor |
| **Transition**     | 150ms, spring easing for transform                                  |

#### Secondary Button

| Property          | Value                                |
| ----------------- | ------------------------------------ |
| Background        | Glass Background token (translucent) |
| Backdrop blur     | Standard glass blur                  |
| Text colour       | Text Primary                         |
| Border            | Glass border (1px)                   |
| Corner radius     | Pill                                 |
| Font              | UI font, 15px, Medium (500)          |
| Shadow            | Standard Glass Shadow                |
| **Pressed state** | Scale to 97%                         |

#### Ghost Button

| Property        | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Background      | Transparent                                               |
| Text colour     | Text Muted                                                |
| Border          | None                                                      |
| Corner radius   | Small (10px)                                              |
| Padding         | 8px vertical, 12px horizontal                             |
| Font            | UI font, 14px, Medium (500)                               |
| **Hover state** | Text colour shifts toward primary, subtle background tint |

#### Floating Action Button (FAB)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Background                | Accent (`#d97757`)                               |
| Icon colour               | White                                            |
| Size                      | 40×40px                                          |
| Corner radius             | Circular (50%)                                   |
| Shadow                    | Offset-Y: 4px, Blur: 14px, Accent at 35% opacity |
| **Pressed state**         | Scale to 90%                                     |
| **Active (current page)** | Background changes to Accent Dark (`#c2633e`)    |

---

### 6.2 Input Field

| Property           | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Width              | Full width of parent container                                                  |
| Border             | 1.5px solid, Border token colour                                                |
| Corner radius      | Medium (14px)                                                                   |
| Padding            | 13px vertical, 16px horizontal                                                  |
| Background         | Glass Background token                                                          |
| Backdrop blur      | 12px                                                                            |
| Text colour        | Text Primary                                                                    |
| Font               | UI font, 16px, Regular (400)                                                    |
| Shadow             | Offset-Y: 1px, Blur: 4px, Black at 4% opacity                                   |
| **Focus state**    | Border colour → Accent, additional glow ring: 3px spread, Accent at 14% opacity |
| **Placeholder**    | Text Muted colour                                                               |
| **Disabled state** | Opacity: 60%, background → Border token colour, border style → dashed           |

---

### 6.3 Label

| Property       | Value                            |
| -------------- | -------------------------------- |
| Font           | UI font, 13px, Medium (500)      |
| Colour         | Text Muted                       |
| Letter-spacing | +1%                              |
| Bottom margin  | 6px (gap to the field it labels) |

---

### 6.4 Chip (Filter / Toggle Tag)

#### Base State

| Property      | Value                         |
| ------------- | ----------------------------- |
| Padding       | 8px vertical, 16px horizontal |
| Corner radius | Pill                          |
| Border        | 1px solid, Border token       |
| Background    | Glass Background              |
| Text colour   | Text Secondary                |
| Font          | UI font, 13px, Medium (500)   |
| Transition    | All properties, 150ms ease    |

#### Active Variant — Accent

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Background    | Accent (`#d97757`)                               |
| Border colour | Accent                                           |
| Text colour   | White                                            |
| Shadow        | Offset-Y: 4px, Blur: 12px, Accent at 25% opacity |

#### Active Variant — Green

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Background    | Credit (`#5a9e6f`)                               |
| Border colour | Credit                                           |
| Text colour   | White                                            |
| Shadow        | Offset-Y: 4px, Blur: 12px, Credit at 25% opacity |

---

### 6.5 Pill Badge

| Property       | Value                         |
| -------------- | ----------------------------- |
| Corner radius  | Pill                          |
| Padding        | 3px vertical, 10px horizontal |
| Font           | UI font, 11px, Medium (500)   |
| Letter-spacing | +2%                           |
| No wrapping    | Single-line only              |

Background and text colours vary by context (e.g., "Current" month badge uses Accent at 12% opacity background with Accent text; savings variant uses Credit at 14% opacity).

---

### 6.6 Bottom Sheet

The primary modal pattern. Slides up from the screen bottom.

#### Overlay (Backdrop)

| Property        | Value                            |
| --------------- | -------------------------------- |
| Position        | Full-screen fixed overlay        |
| Background      | `rgb(10, 9, 8)` at 40% opacity   |
| Blur            | 12px                             |
| Z-index         | 200                              |
| Alignment       | Content aligned to bottom-center |
| Entry animation | Fade in, 200ms, ease             |

#### Panel

| Property             | Value                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| Width                | 100% of screen, max 520px                                                |
| Background           | Glass Strong Background                                                  |
| Blur                 | 40px, saturation boost 200%                                              |
| Border               | Glass border on top and sides only (no bottom border)                    |
| Top corner radius    | Large+ (use 24px or equivalent to `--r-3xl`)                             |
| Bottom corner radius | 0 (flush with screen bottom)                                             |
| Padding              | 16px top, 24px sides, 24px + safe area bottom                            |
| Shadow               | Offset-Y: -8px, Blur: 32px, Black at 24% opacity                         |
| Maximum height       | 88% of viewport height                                                   |
| Scroll behaviour     | Vertical scroll if content overflows, contained (no body scroll leakage) |
| Entry animation      | Slide up from off-screen (translateY 100% → 0%), 320ms, smooth easing    |

#### Drag Handle

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| Width               | 36px                                      |
| Height              | 5px                                       |
| Corner radius       | Pill                                      |
| Colour (light mode) | Black at 15% opacity                      |
| Colour (dark mode)  | White at 15% opacity                      |
| Position            | Centered horizontally, 16px bottom margin |

#### Background Scale-Back Effect

When any sheet or modal opens, the main content behind it should:

| Property       | Light Mode                               | Dark Mode           |
| -------------- | ---------------------------------------- | ------------------- |
| Scale          | 96% (shrink toward center-top)           | Same                |
| Translate      | 8px downward                             | Same                |
| Brightness     | 85%                                      | 55%                 |
| Saturation     | 90%                                      | 85%                 |
| Contrast       | Normal                                   | 102% (slight boost) |
| Pointer events | Disabled (non-interactive)               | Same                |
| Corner radius  | 2XL (28px) on top corners only           | Same                |
| Shadow         | Offset-Y: 12px, Blur: 32px, Black at 12% | Black at 50%        |
| Transition     | 350ms, smooth easing                     | Same                |

> [!TIP]
> This iOS-inspired scale-back effect is a **signature interaction** of buckflo. The main content visually "recedes" behind the sheet, creating a physical depth illusion. All navigation elements (header, bottom nav) should also hide or become non-interactive.

---

### 6.7 Confirm Dialog

A **centered modal** (not a bottom sheet). Used for destructive or important confirmations.

#### Overlay

| Property        | Value                                       |
| --------------- | ------------------------------------------- |
| Background      | `#0a0908` at 55% opacity                    |
| Blur            | 10px                                        |
| Z-index         | 500                                         |
| Alignment       | Centered both axes, 24px horizontal padding |
| Entry animation | Fade in, 300ms                              |

#### Panel

| Property        | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Max width       | 340px                                                                      |
| Background      | Surface token (opaque)                                                     |
| Border          | Standard card border                                                       |
| Corner radius   | XL (22px)                                                                  |
| Shadow          | Elevated Glass Shadow                                                      |
| Padding         | 24px                                                                       |
| Entry animation | Pop in (see §7 — scale 90%→100% + translateY 10px→0), 400ms, spring easing |

#### Layout

```
┌──────────────────────────────────────────┐
│ [Icon Box]  Title (16px, Bold)           │
│             Description (14px, Secondary)│
│                                          │
│  ┌──────────────┐ ┌──────────────┐       │
│  │    Cancel     │ │   Confirm    │       │
│  └──────────────┘ └──────────────┘       │
└──────────────────────────────────────────┘
```

**Icon box:** 40×40px, Medium radius (14px), background at 10% opacity of the semantic colour.

| Variant | Icon             | Icon Colour        | Confirm Button Background |
| ------- | ---------------- | ------------------ | ------------------------- |
| Danger  | Trash icon       | Debit (`#e05545`)  | Debit                     |
| Default | Warning triangle | Accent (`#d97757`) | Accent                    |

**Cancel button:** Pill radius, 1.5px border (Border token), transparent background, 15px SemiBold, Text Secondary colour.

**Confirm button:** Pill radius, no border, filled with semantic colour, white text, 15px SemiBold.

Both buttons: flex: equal width, 12px vertical padding, 16px horizontal padding, 10px gap between them.

---

### 6.8 Segmented Control

An iOS-style pill toggle for switching between two or more options.

#### Container

| Property             | Value                     |
| -------------------- | ------------------------- |
| Background (light)   | Black at 5% opacity       |
| Background (dark)    | Black at 40% opacity      |
| Border (light)       | 1px, Black at 5% opacity  |
| Border (dark)        | 1px, White at 10% opacity |
| Corner radius        | Pill                      |
| Padding              | 4px                       |
| Gap between segments | 4px                       |

#### Segment (Inactive)

| Property       | Value                                |
| -------------- | ------------------------------------ |
| Background     | Transparent                          |
| Text colour    | Neutral grey (500)                   |
| Font           | UI font, 11px, Bold (700), UPPERCASE |
| Letter-spacing | Wide (+5%)                           |
| Corner radius  | Pill                                 |
| Padding        | 6px vertical                         |

#### Segment (Active) — Context-Aware Colours

| Context keywords            | Background                         | Text                             |
| --------------------------- | ---------------------------------- | -------------------------------- |
| Expense, Expenditure, Debit | Accent (`#d97757`)                 | White                            |
| Income, Savings, Credit     | Credit (`#5a9e6f`)                 | White                            |
| Neutral / other             | White (light) / Neutral-700 (dark) | Dark text (light) / White (dark) |

Active segments have a subtle shadow: Offset-Y: 1px, Blur: 3px, segment colour at 30% opacity.

---

### 6.9 Custom Dropdown

A pop-up menu that opens **upward** from a trigger button. Not a native platform select.

#### Trigger

| Property           | Value                                    |
| ------------------ | ---------------------------------------- |
| Background (light) | Black at 5% opacity                      |
| Background (dark)  | White at 5% opacity                      |
| Border             | 1px, Black/White at 8% opacity           |
| Corner radius      | 8px                                      |
| Padding            | 6px vertical, 12px horizontal            |
| Font               | UI font, 12px, SemiBold (600)            |
| Chevron icon       | 14px, Text Muted, rotates 180° when open |

#### Menu Panel

| Property           | Value                                          |
| ------------------ | ---------------------------------------------- |
| Position           | Anchored above trigger, 8px gap, right-aligned |
| Width              | 144px                                          |
| Background (light) | `#e2e2df`                                      |
| Background (dark)  | `#2d2d2c`                                      |
| Corner radius      | 16px                                           |
| Padding            | 6px                                            |
| Shadow             | Strong elevated shadow                         |
| Entry animation    | Pop in, 400ms, spring easing                   |

#### Menu Item (Active)

| Property                | Value                       |
| ----------------------- | --------------------------- |
| Background              | Accent (`#d97757`)          |
| Text                    | White                       |
| Corner radius           | 12px                        |
| Includes checkmark icon | Yes (12px, stroke-width: 3) |

---

### 6.10 Tooltip

A floating info bubble attached to a trigger icon (help/info circle).

| Property      | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Background    | `#2a2927` (dark warm grey — always dark)                  |
| Border        | 1px, Accent at 40% opacity                                |
| Corner radius | 8px                                                       |
| Max width     | 240px                                                     |
| Padding       | 12px                                                      |
| Text colour   | `#f5f5f3` (always light)                                  |
| Font          | UI font, 12px                                             |
| Shadow        | Strong, Black at 20% opacity                              |
| Pointer arrow | 6px CSS triangle pointing toward trigger                  |
| Auto-dismiss  | After 4 seconds                                           |
| Exclusivity   | Only one tooltip visible at a time                        |
| Position      | Below trigger by default, flips above if not enough space |

---

### 6.11 Transaction Row

A tappable list item showing a single financial transaction.

```
┌───────────────────────────────────────────────────────┐
│ [Icon 40px]   Description (15px medium)    ₹ Amount   │
│               Date · Category badge        Balance?   │
└───────────────────────────────────────────────────────┘
```

| Element                        | Specification                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Icon container**             | 40×40px, corner radius: Medium (14px), background: category colour at 12% opacity                                           |
| **Icon**                       | Arrow-down-left (debit) or Arrow-up-right (credit), 17px, stroke-width: 2, colour: category colour                          |
| **Description**                | UI font, 15px, Medium (500), Text Primary, truncate with ellipsis                                                           |
| **Date**                       | UI font, 12px, Regular, Text Secondary                                                                                      |
| **Category badge**             | Pill radius, padding: 2px vertical / 8px horizontal, 10px Medium, background: category colour at 12%, text: category colour |
| **Amount**                     | Display font, 17px, Regular, Text Primary. Credit amounts prefixed with `+`                                                 |
| **Running balance** (optional) | UI font, 11px, Text Muted                                                                                                   |
| **Row gap**                    | 14px between icon and text block                                                                                            |
| **Vertical padding**           | 12px                                                                                                                        |
| **Press interaction**          | Scale to 98%, opacity to 70%, 150ms ease-out                                                                                |

---

### 6.12 Notification Card

```
┌──────────────────────────────────────────────────────┐
│ [Type Icon 34px]  Title (14px SemiBold)       [✓]    │
│                   Description (13px Secondary)        │
│                   [Action Pill] [Action Pill]         │
└──────────────────────────────────────────────────────┘
```

| Element            | Specification                                                                         |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Container**      | Glass Background, standard border, Large radius (18px), standard shadow, 14px padding |
| **Icon container** | 34×34px, 8px radius, coloured per notification type (see §2.6)                        |
| **Dismiss button** | 20×20px, transparent, check icon (14px), top-right corner                             |
| **Action buttons** | Pill radius, Surface background, Border token border, 12px SemiBold, Text Secondary   |

---

### 6.13 Empty State

| Property    | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| Layout      | Centered column                                                   |
| Padding     | 40px vertical, 24px horizontal                                    |
| Icon        | 28–32px, Text Secondary colour at 35% opacity, 12px bottom margin |
| Title       | 15px, SemiBold (600), Text Primary                                |
| Description | 13px, Text Muted                                                  |

---

### 6.14 Month Picker

Two variants available:

#### Standard

A horizontal row: `[◀ Button] Month Year [▶ Button]`

| Element                    | Specification                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Arrow buttons              | 36×36px, glass background + border, Small radius (10px), standard shadow, icon: 18px |
| Month label                | UI font, 16px, SemiBold (600), tracking: -2%, centered                               |
| Gap                        | 8px between elements                                                                 |
| Next-button disabled state | Opacity: 30% (cannot go past current month)                                          |
| Press interaction          | Scale to 91%                                                                         |

#### Compact

An inline glass pill: `[◀ Month Year ▶]`

| Element                     | Specification                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Container                   | Glass background + blur, pill radius, 2px padding, standard shadow, card border                                                         |
| Arrow buttons               | 26×26px, transparent, circle, 14px icons                                                                                                |
| Month label                 | 13px, SemiBold, Text Primary                                                                                                            |
| "Now" badge (current month) | Pill, 9px Bold, uppercase, wide tracking. Orange variant: Accent at 12% bg / Accent text. Green variant: Credit at 14% bg / Credit text |

---

### 6.15 Savings Goal Card

A vertical card with an **SVG progress ring**.

```
┌──────────────────┐
│   ╭───────────╮  │
│   │   72%     │  │
│   ╰───────────╯  │
│   Goal Name       │
│   ₹12,000         │
│   of ₹50,000      │
│   📅 31 Dec 2026  │
└──────────────────┘
```

| Element              | Specification                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| **Container**        | Glass Background, card border, XL radius (22px), 18px horizontal / 14px vertical padding             |
| **Progress ring**    | 60×60px SVG, stroke-width: 3px. Track: Border token. Fill: Accent (in progress) / Credit (completed) |
| **Percentage**       | Centered inside ring, UI font, 12px, Bold                                                            |
| **Goal name**        | 13px, SemiBold, Text Primary, max 2 lines, 32px height                                               |
| **Allocated amount** | 12px, Medium, Text Secondary                                                                         |
| **Target amount**    | 11px, Text Muted                                                                                     |
| **Deadline**         | 11px, Text Muted, with calendar icon (10px)                                                          |
| **Completed state**  | Border colour changes to Credit at 30% opacity, subtle green gradient tint on background             |

---

### 6.16 Preset Chip (Quick Action)

| Property          | Value                                   |
| ----------------- | --------------------------------------- |
| Padding           | 12px vertical, 16px horizontal          |
| Corner radius     | 12px                                    |
| Background        | Glass Strong Background                 |
| Border            | 1px, White at 8% opacity                |
| Min width         | 110px                                   |
| Description       | 12px, SemiBold, Text Primary, truncated |
| Amount            | 13px, Bold, Accent colour               |
| Press interaction | Scale to 98%, slight translateY         |

**Create preset chip (special variant):**

- Dashed border, transparent background
- Plus icon + "Create" text in Accent colour
- Min width: 90px

---

### 6.17 Settings Row (iOS-style grouped list)

Rows are grouped inside glass card containers, separated by thin dividers.

| Property         | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Padding          | 16px all sides                                                       |
| Layout           | Horizontal: [Icon] [Title + Subtitle] [Trailing element]             |
| Icon             | 20px, stroke-width: 1.5, Text Secondary colour                       |
| Icon-to-text gap | 14px                                                                 |
| Title            | 15px, Medium (500), Text Primary                                     |
| Subtitle         | 12px, Regular, Text Muted, 2px top margin                            |
| Trailing element | ChevronRight (16px, Text Muted) or custom control (dropdown, toggle) |
| Hover state      | Background tint: Black at 2% (light) / White at 2% (dark)            |
| Press state      | Opacity: 80%                                                         |
| Row dividers     | 1px, Black at 5% (light) / White at 5% (dark)                        |

---

### 6.18 FAQ Accordion

| Property         | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| Container border | 1px bottom, card border colour                            |
| Vertical padding | 20px                                                      |
| Question font    | 14px, SemiBold, Text Primary                              |
| Question hover   | Text colour → Accent                                      |
| Chevron          | 16px, Text Muted, rotates 90° clockwise when expanded     |
| Answer font      | 12px, Regular, Text Secondary, relaxed line-height (1.6×) |
| Expand animation | Max-height + opacity transition, 300ms                    |

---

### 6.19 Feature Card (Marketing Grid)

Apple-style grid layout for feature showcases.

| Property       | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Padding        | 32px                                                                           |
| Layout         | Vertical column, left-aligned                                                  |
| Icon container | 32×32px, 8px radius, neutral background (light grey at 50% / dark grey at 30%) |
| Title          | 16px, Bold, Text Primary, tight tracking                                       |
| Description    | 12px, Regular, Text Secondary, relaxed line-height                             |
| Hover state    | Background tint: neutral at 2% opacity                                         |
| Transition     | 300ms                                                                          |
| Grid borders   | Shared right + bottom borders between cells (card border colour)               |

---

### 6.20 Toast / Snackbar

| Property            | Value                   |
| ------------------- | ----------------------- |
| Position            | Top-center of screen    |
| Duration            | 3000ms                  |
| Background          | Surface token           |
| Text                | Text Primary            |
| Border              | 1px, card border colour |
| Corner radius       | Medium (14px)           |
| Shadow              | Elevated Glass Shadow   |
| Blur                | 8px                     |
| Font                | UI font, 14px           |
| Success icon colour | `#788c5d`               |
| Error icon colour   | `#c0392b`               |

---

### 6.21 Profile Header Band

A seamless translucent gradient — not a bounded card. Bleeds to full screen width.

| Property          | Light Mode                                                                                    | Dark Mode                                                              |
| ----------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Background        | Vertical gradient: transparent → `rgba(242,237,228, 0.65)` at 15% → same at 85% → transparent | transparent → `rgba(37,37,36, 0.7)` at 15% → same at 85% → transparent |
| Padding           | 24px top, 28px bottom                                                                         |
| Width             | Full bleed (extends beyond content padding)                                                   |
| Content alignment | Centered column                                                                               |

Contains the **PixelBanner** SVG behind the avatar, with the avatar overlaid at z-index 10.

---

## 7. Animation & Motion

### 7.1 Easing Curves

| Name              | Bezier Values                    | Character              | Usage                                             |
| ----------------- | -------------------------------- | ---------------------- | ------------------------------------------------- |
| **Spring**        | `(0.34, 1.56, 0.64, 1)`          | Bouncy overshoot       | Button press, pop-in dialogs, navigation items    |
| **Smooth**        | `(0.16, 1, 0.3, 1)`              | Decelerate smoothly    | Sheet slides, page transitions, scale-back effect |
| **Ease-out**      | `(0.22, 1, 0.36, 1)`             | Quick start, soft land | Tab fades, page reveals, card transitions         |
| **Standard ease** | `ease` or `(0.25, 0.1, 0.25, 1)` | General purpose        | Overlay fades                                     |

### 7.2 Animation Library

| Animation Name     | Duration | Easing      | Start State                                   | End State                                                      |
| ------------------ | -------- | ----------- | --------------------------------------------- | -------------------------------------------------------------- |
| **Fade In**        | 200ms    | Ease        | Opacity: 0                                    | Opacity: 1                                                     |
| **Fade Out**       | 300ms    | Ease-in     | Opacity: 1, Scale: 100%                       | Opacity: 0, Scale: 98%                                         |
| **Slide Up**       | 320ms    | Smooth      | TranslateY: 100% (off-screen)                 | TranslateY: 0                                                  |
| **Fade In Up**     | 300ms    | —           | Opacity: 0, TranslateY: 18px                  | Opacity: 1, TranslateY: 0                                      |
| **Pop In**         | 400ms    | Spring      | Opacity: 0, Scale: 90%, TranslateY: 10px      | Opacity: 1, Scale: 100%, TranslateY: 0                         |
| **Slide Down**     | 220ms    | Smooth      | Opacity: 0, TranslateY: -8px                  | Opacity: 1, TranslateY: 0                                      |
| **Tab Fade In**    | 300ms    | Ease-out    | Opacity: 0, TranslateY: 8px                   | Opacity: 1, TranslateY: 0                                      |
| **Sheet Slide Up** | 350ms    | Ease-out    | Opacity: 0, TranslateY: 20px                  | Opacity: 1, TranslateY: 0                                      |
| **Pulse Glow**     | 2000ms ∞ | —           | Scale: 95%, glow ring visible (Accent at 70%) | Scale: 100%, glow ring fades → Scale: 95%, glow ring invisible |
| **Pulse Slow**     | 3000ms ∞ | Ease-in-out | Opacity: 100%, Scale: 100%                    | Opacity: 80%, Scale: 98% → back                                |
| **Progress Fill**  | Variable | —           | Width: 0%                                     | Width: 100%                                                    |
| **Loading Bar**    | 1500ms ∞ | Linear      | TranslateX: -100%                             | TranslateX: 200%                                               |

### 7.3 Stagger Delays

When multiple elements animate in sequence (e.g., dashboard cards), apply incremental delays:

| Delay Class | Value  |
| ----------- | ------ |
| 1st item    | +70ms  |
| 2nd item    | +140ms |
| 3rd item    | +210ms |
| 4th item    | +280ms |

### 7.4 Interaction Micro-Animations

| Interaction                      | Effect                       | Duration             |
| -------------------------------- | ---------------------------- | -------------------- |
| Button press (primary)           | Scale to 96%                 | 150ms, spring easing |
| Button press (secondary)         | Scale to 97%                 | 120ms                |
| FAB press                        | Scale to 90%                 | 200ms                |
| Card tap                         | Scale to 98%, opacity to 70% | 150ms, ease-out      |
| Header items hover               | TranslateY: -2px (float up)  | 200ms, ease-out      |
| Navigation item transition       | All properties               | 220ms, spring easing |
| Chevron rotation (FAQ, dropdown) | Rotate 90° or 180°           | 200ms                |
| Month picker button press        | Scale to 91%                 | 120ms                |
| Profile avatar hover             | Scale to 105%                | 200ms                |
| Profile avatar press             | Scale to 95%                 | 200ms                |

---

## 8. Theming Architecture

### 8.1 Three-Mode System

buckflo supports three theme modes:

| Mode       | Behaviour                                                                               |
| ---------- | --------------------------------------------------------------------------------------- |
| **Light**  | Forces light palette regardless of system setting                                       |
| **Dark**   | Forces dark palette regardless of system setting                                        |
| **System** | Follows the device / OS colour scheme preference, updates reactively if user changes it |

### 8.2 Theme Persistence

1. Theme preference is stored in **local persistent storage** (key: `theme`, values: `"light"`, `"dark"`, `"system"`).
2. Theme is also stored in the **user profile database record** and synced on load.
3. On app launch (before UI renders), read stored preference and apply immediately to prevent flash-of-wrong-theme (FOWT).

### 8.3 Implementation Strategy

1. Apply a theme class to the root/document element (`dark` or `light`).
2. All theme-dependent values are expressed as named tokens/variables that resolve differently per theme.
3. Support BOTH the system media query AND the explicit class — the explicit class always takes priority.
4. Update the platform status-bar / chrome colour dynamically: Light = `#f8f8f6`, Dark = `#1f1f1e`.

### 8.4 FOWT Prevention

Before any UI framework renders, inline a synchronous script/check that:

1. Reads theme from local storage.
2. Falls back to system preference.
3. Applies the correct background colour to the root element immediately.

---

## 9. Page Layout & Navigation

### 9.1 App Shell Structure

```
┌─────────────────────────────────────────────────┐
│ [Header Scrim — gradient fade to transparent]    │  ← Fixed at top
├─────────────────────────────────────────────────┤
│ [Sticky Header Bar]                              │
│   [buckflo wordmark pill]       [🔔 Bell] [Avatar]  │
├─────────────────────────────────────────────────┤
│                                                  │
│          Scrollable content area                 │
│          Max width: 720px, centred               │
│          Safe-area padded                        │
│                                                  │
├─────────────────────────────────────────────────┤
│ [Bottom Nav Scrim — gradient fade upward]        │  ← Fixed at bottom
│ ┌───────────────────────────────────────────┐    │
│ │   🏠    📅    ➕    📊    🕐              │    │  ← Floating glass pill
│ └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 9.2 Header Bar

| Property       | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| Position       | Sticky, pinned 12px below safe area top                        |
| Z-index        | 100                                                            |
| Layout         | Row: [Wordmark pill] ←spacer→ [Bell button] [Avatar button]    |
| Background     | Transparent (items have their own glass backgrounds)           |
| Pointer events | Container is non-interactive, individual items are interactive |

**Wordmark pill:** Glass Strong background, blur, card border, pill radius, 20px horizontal padding, 6px vertical padding, standard glass shadow.

**Action buttons:** 36×36px circles, Glass Strong background + blur, card border, standard shadow.

**Notification indicator:** 6×6px circle, Debit colour, pulse-glow animation (2s infinite), positioned at top-right of bell button.

### 9.3 Header Scrim

A gradient overlay that fades the content behind the sticky header:

| Property       | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Position       | Fixed at top                                                            |
| Height         | 84px + safe area top                                                    |
| Gradient       | From Background (100% opacity) → Background (30% opacity) → Transparent |
| Z-index        | 99                                                                      |
| Pointer events | None (pass-through)                                                     |

### 9.4 Bottom Navigation

| Property       | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Position       | Fixed at screen bottom                                                   |
| Scrim height   | 110px + safe area bottom                                                 |
| Scrim gradient | From Background (100%) at bottom → Background (15%) → Transparent at top |
| Z-index        | 100                                                                      |

**Navigation Pill:**

| Property      | Value                            |
| ------------- | -------------------------------- |
| Layout        | Horizontal row, 5 items, 2px gap |
| Background    | Glass Strong                     |
| Blur          | 32px, saturation: 200%           |
| Border        | Card border (8% / 6%)            |
| Corner radius | Pill                             |
| Padding       | 6px vertical, 8px horizontal     |
| Shadow        | Elevated Glass Shadow            |

**5 Navigation Items:**

| Position | Label     | Icon               | Type                      |
| -------- | --------- | ------------------ | ------------------------- |
| 1        | Home      | House icon         | Standard                  |
| 2        | Monthly   | Calendar icon      | Standard                  |
| 3        | Add entry | Plus icon          | **FAB (center, special)** |
| 4        | Insights  | Bar chart icon     | Standard                  |
| 5        | History   | Clock/history icon | Standard                  |

**Standard nav item:** Column layout (icon above label), 10px font, Medium weight, Text Muted colour. Active state: Accent colour.

**Center FAB:** 40×40px circle, Accent background, white icon, elevated shadow. Always visually distinct from the other items.

### 9.5 Page Transitions

| Transition Type | Animation              | Usage                                               |
| --------------- | ---------------------- | --------------------------------------------------- |
| Tab switch      | Tab Fade In (300ms)    | Switching between main navigation tabs              |
| Sub-page push   | Sheet Slide Up (350ms) | Navigating to detail pages (Add, Profile sub-pages) |

### 9.6 Z-Index Scale

| Layer                    | Z-index |
| ------------------------ | ------- |
| Header scrim             | 99      |
| Sticky header            | 100     |
| Bottom navigation        | 100     |
| Mobile dropdown backdrop | 190     |
| Sheet overlay            | 200     |
| Dropdown menu            | 200     |
| Confirm dialog           | 500     |
| Tooltip                  | 9999    |

---

## 10. Charts & Data Visualization

### 10.1 Chart Typography

| Property            | Value                         |
| ------------------- | ----------------------------- |
| Font family         | UI font (Inter or equivalent) |
| Default text colour | `rgba(150, 150, 150, 0.8)`    |
| Grid line colour    | `rgba(150, 150, 150, 0.1)`    |
| Tick label size     | 10px                          |
| Legend              | Hidden by default             |

### 10.2 Chart Tooltip

| Property                | Value                    |
| ----------------------- | ------------------------ |
| Background              | `rgba(30, 29, 27, 0.95)` |
| Title colour            | White at 90% opacity     |
| Body colour             | White at 90% opacity     |
| Border                  | 1px, White at 8% opacity |
| Corner radius           | 8px                      |
| Padding                 | 10px                     |
| Display colour swatches | No                       |

### 10.3 Axis Styling

| Property             | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| Grid lines           | Hidden                                                      |
| Axis lines / borders | Hidden                                                      |
| Y-axis labels        | Currency symbol + compact notation (e.g., `₹1.2k`, `₹2.5M`) |
| Rendering            | Minimum 2.5× pixel density ratio for sharp rendering        |

### 10.4 Currency Formatting

| Locale        | Format         | Example        |
| ------------- | -------------- | -------------- |
| India (en-IN) | `₹X,XX,XXX.XX` | `₹1,23,456.78` |

- Use Indian numbering system (lakhs/crores grouping)
- Default 2 decimal places
- Compact format for chart axes: `₹1.2k`, `₹4.5M`

---

## 11. Iconography

### 11.1 Icon System

Use a **consistent stroke icon library** across the entire app. The reference implementation uses Lucide icons (open source, MIT). Any equivalent stroke-based icon set (SF Symbols, Material Symbols Outlined, Phosphor, etc.) is acceptable as long as visual weight and style are consistent.

### 11.2 Size Scale

| Context                         | Size    | Stroke Width  |
| ------------------------------- | ------- | ------------- |
| Bottom navigation               | 20px    | 1.8           |
| Card / in-content               | 18px    | 2.0 (default) |
| Settings list row               | 20px    | 1.5           |
| Small inline (timestamps, meta) | 14px    | 2.0           |
| CTA button icon                 | 16px    | 2.5           |
| Empty state (large)             | 28–32px | 2.0           |
| Notification icons              | 18px    | 2.0           |
| Chevron indicators              | 16px    | 2.0           |
| Micro icons (pill badges)       | 10–12px | 2.0           |

### 11.3 Icon Mapping

| Function               | Icon Description   |
| ---------------------- | ------------------ |
| Home tab               | House              |
| Calendar / Monthly tab | Calendar           |
| Add entry (FAB)        | Plus               |
| Insights tab           | Bar chart          |
| History tab            | Clock / History    |
| Notifications          | Bell               |
| Savings                | Piggy bank         |
| Expenditure            | Wallet             |
| Navigate forward       | Chevron right      |
| Navigate back          | Chevron left       |
| Close / Dismiss        | X mark             |
| Confirm / Mark done    | Checkmark          |
| Debit transaction      | Arrow down-left    |
| Credit transaction     | Arrow up-right     |
| Budget trend down      | Trending down      |
| Budget trend up        | Trending up        |
| Danger confirm         | Trash / Delete     |
| Default confirm        | Warning triangle   |
| Help / Info tooltip    | Help circle (?)    |
| Edit profile           | Pencil             |
| Export / Download      | Arrow down to line |
| Import / Upload        | Arrow up from line |
| Light theme            | Sun                |
| Dark theme             | Moon               |
| Security / Privacy     | Shield             |
| Smart features         | Sparkles / Stars   |
| Advisor                | Lightbulb          |
| Quick presets          | Lightning bolt     |
| Categories             | Palette            |
| Settings / Appearance  | Sliders            |
| About / Info           | Info circle        |

---

## 12. Copy, Voice & Tone

### 12.1 Brand Voice

buckflo's copy is **precise, premium, and subtly formal** — inspired by a sophisticated personal assistant:

- Uses measured, confident language
- **Observer not advisor**: Provide facts, not opinions.
- **Data-driven not opinion-driven**: Let the numbers speak for themselves.
- **Neutral not judgmental**: Never use guilt-based alerts or push toward saving more.
- **Specific not generic**: Base messages on actual user data (e.g., "You spent ₹4,200 on Food" not "You spent too much on Food").
- Financial terminology is exact and clear
- Avoids casual slang, emoji in UI labels, or playful phrasing
- Empty states and success messages are reassuring and confident
- Can use terms like "Sir" in appropriate assistant-style messages

### 12.2 Copy Patterns

| Context                 | Pattern                               | Example                                                                                            |
| ----------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| User greeting           | Display font, italic, first name only | "Hey Pranav"                                                                                       |
| Empty state title       | Short, authoritative                  | "All Systems Nominal"                                                                              |
| Empty state description | Calm, reassuring                      | "You are operating perfectly within your budget parameters, Sir."                                  |
| Section labels          | ALL CAPS, short, descriptive          | "ACCOUNTS", "CUSTOMIZATION", "DATA"                                                                |
| CTA buttons             | Action-first, 2–3 words               | "Get Started", "Set Up Now", "Transfer"                                                            |
| Destructive dialog      | Clear title + clear consequence       | Title: "Delete Transaction?" / Message: "This action cannot be undone."                            |
| Privacy footer          | Simple, direct                        | "All your data lives on this device. Nothing is ever sent to a server."                            |
| Landing tagline         | Poetic, concise                       | "Track everything. Understand your patterns. Spend better."                                        |
| Feature descriptions    | Technical but accessible              | "Predicts budget exhaustion days and calculates dynamic daily limits…"                             |
| Stewardship notes       | Formal, advisory                      | "buckflo is custom-tailored for mobile dimensions to act as a distraction-free digital companion." |

### 12.3 Section Header Pattern

Every content section follows this structure:

1. **Eyebrow label** — UPPERCASE, smallest text (11px), SemiBold, Text Muted, wide tracking
2. **Section title** — Display font or Bold UI font, large (24–36px), Text Primary, tight tracking

Example:

```
ENGINEERED FOR CLARITY          ← eyebrow (11px, muted, uppercase, +6% tracking)
Advanced Analytical Features    ← title (30px, bold, display font)
```

### 12.4 Number & Currency Formatting

| Context                  | Format                                    |
| ------------------------ | ----------------------------------------- |
| Monetary amounts         | Indian Rupee format: `₹1,23,456.78`       |
| Percentages              | Rounded integer: `72%`                    |
| Date display             | Human-readable: "12 May", "May 2026"      |
| Comparison indicators    | Arrow + percentage: "↑ 12% vs last month" |
| Compact numbers (charts) | SI suffixes: `₹1.2k`, `₹4.5M`             |

---

## 13. Accessibility

### 13.1 Interactive Elements

1. Every interactive element must have a **unique identifier** (for testing and automation).
2. Every button, icon-button, and interactive element must have an **accessibility label** describing its action.
3. Focusable elements must show a visible **focus indicator** — typically a 2px ring in the Accent colour.
4. Keyboard navigation: Escape key closes all modals/sheets. Enter/Space activates buttons and clickable rows.

### 13.2 Colour Contrast

- Text Primary on Background: exceeds 4.5:1 ratio in both themes.
- Accent colours on white/dark backgrounds: designed for sufficient contrast.
- Never rely on colour alone to convey meaning — always pair with icons or labels.

### 13.3 Touch Targets

| Minimum size     | 36×36px                                 |
| ---------------- | --------------------------------------- |
| Recommended size | 44×44px                                 |
| Tap highlight    | Suppressed (no default blue/grey flash) |

### 13.4 Motion Sensitivity

- Respect the platform "reduce motion" preference.
- When reduced motion is active, replace animations with instant state changes or simple opacity fades.

---

## 14. Engineering Philosophy

### 14.1 Core Principles

| Principle                | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Offline-first**        | All data stored locally on-device (IndexedDB or equivalent). No server, no cloud sync. |
| **Privacy by design**    | Zero tracking pixels, zero analytics collection, zero data transmission.               |
| **Mobile-first**         | Designed for portrait phone screens. Desktop is functional but secondary.              |
| **Progressive Web App**  | Installable as a standalone app from the browser. Works offline.                       |
| **Component-driven**     | UI built from reusable, composable components.                                         |
| **Token-driven theming** | All visual properties reference named tokens, never hard-coded inline values.          |

### 14.2 Technology (Reference Implementation)

The reference buckflo app uses the following stack. Other implementations may use any equivalent:

| Layer        | Reference Technology            | Equivalents                                     |
| ------------ | ------------------------------- | ----------------------------------------------- |
| UI Framework | React 19                        | Flutter, SwiftUI, Jetpack Compose, Vue, Angular |
| Language     | TypeScript                      | Dart, Swift, Kotlin, JavaScript                 |
| Build        | Vite                            | Webpack, Xcode, Gradle                          |
| Styling      | Tailwind CSS v4 + CSS variables | Any token-based styling system                  |
| Routing      | React Router                    | Navigator (Flutter), NavigationStack (SwiftUI)  |
| Database     | Dexie (IndexedDB)               | Hive, SQLite, Core Data, Room                   |
| Charts       | Chart.js                        | fl_chart, Swift Charts, MPAndroidChart          |
| Icons        | Lucide                          | SF Symbols, Material Icons, Phosphor            |
| Toasts       | react-hot-toast                 | SnackBar, native toast systems                  |
| Avatars      | boring-avatars                  | Any deterministic avatar generator              |
| Dates        | date-fns                        | intl, java.time, Foundation.Date                |
| PWA          | vite-plugin-pwa                 | Platform-native install                         |

### 14.3 Architecture Patterns

| Pattern                       | Description                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Local-first state**         | No global state store. Local component state + reactive database queries.                                            |
| **Context for cross-cutting** | Only Theme and Tooltip state are shared globally via context/provider.                                               |
| **Modal management**          | A central utility tracks active overlay count and toggles the background scale-back effect.                          |
| **Safe area respect**         | All edge-flush UI (headers, bottom nav, sheets) must account for device safe area insets (notches, home indicators). |
| **Touch optimization**        | Suppress default tap highlights. Allow only pan gestures on body.                                                    |
| **Viewport locking**          | No user scaling (max-scale: 1.0). Cover the full viewport including notch areas.                                     |

### 14.4 File Organisation (Recommended)

```
src/
├── app/entry                      # Root entry + providers
├── config/theme                   # Theme tokens + switching logic
├── components/
│   ├── ui/                        # Generic reusable (buttons, inputs, controls)
│   ├── layout/                    # App shell (navigation, header, sheets)
│   ├── landing/                   # Marketing / onboarding
│   ├── transactions/              # Transaction CRUD components
│   ├── savings/                   # Savings goal components
│   ├── insights/                  # Analytics components
│   └── monthly/                   # Monthly budget components
├── pages/                         # Page-level compositions (route targets)
├── hooks/ (or services/)          # Business logic, computed state
├── data/ (or db/)                 # Database schema, queries, migrations
├── routes/                        # Navigation / routing config
└── utils/                         # Pure utility functions (formatting, dates)
```

---

> [!NOTE]
> This document is a living reference. All specifications are expressed in platform-agnostic terms. When implementing in a specific technology, map the tokens and values described here to the equivalent constructs in your framework (e.g., CSS variables, Flutter `ThemeData`, SwiftUI `Color` extensions, Compose `MaterialTheme` overrides, etc.).
