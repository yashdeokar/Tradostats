---
name: Tradostats Actuarial Ledger
description: The Double-Entry Actuarial Ledger — rigorous financial accountability for active equity and futures day traders.
colors:
  primary: "#d4c5a0"
  primary-dark: "#b5a278"
  neutral-bg: "#0c0e12"
  neutral-subtle: "#11141a"
  neutral-card: "#151821"
  neutral-card-alt: "#1a1e29"
  neutral-input: "#12151d"
  neutral-border: "#232733"
  neutral-border-light: "#2d3242"
  credit: "#10b981"
  debit: "#ef4444"
  warning: "#eab308"
  text-primary: "#f0ede6"
  text-secondary: "#9aa0a6"
  text-muted: "#6b7280"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  serif:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "3px"
  md: "4px"
  lg: "6px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Tradostats Design System: The Double-Entry Actuarial Ledger

## Overview

Tradostats embodies **The Double-Entry Actuarial Ledger** visual tradition. Drawing from Venetian and Dutch accounting discipline, every metric, session, and execution is framed not as gamified scorekeeping or luxury tech spectacle, but as a sober mathematical audit.

- **Primary Persona**: The Systematic Prop & Retail Futures Trader executing Nasdaq and E-mini sessions who requires surgical clarity and zero eye fatigue.
- **Tone**: Quietly authoritative, mathematical, restrained, and unvarnished.
- **Core Visual Metaphor**: The master actuarial balance book — deep ink-charcoal surfaces, crisp vellum rule-lines, double-underlined accounting balances, and high-precision tabular figures.

---

## Colors

The palette is anchored in an ink-stained audit room:
- **Canvas / Background** (`#0c0e12`): Matte deep ink-charcoal. Absorbs glare during multi-hour market monitoring.
- **Tonal Layers**:
  - `Subtle / Surface`: `#11141a`
  - `Card / Ledger Block`: `#151821`
  - `Elevated / Inset Input`: `#12151d`
  - `Active Selection`: `#1a1e29`
- **Hairline Rules**:
  - `Primary Border`: `#232733`
  - `Light Border`: `#2d3242`
  - `Hover Border`: `#3b4256`
- **Accents**:
  - **Vellum / Parchment** (`#d4c5a0`): Used for primary ledger headers, audited badges, active navigation indicators, and key structural anchors.
  - **Credit Emerald** (`#10b981`): True accounting green for realized gains, positive expectation, and compliant executions.
  - **Debit Crimson** (`#ef4444`): Crisp accounting red for losses, drawdown limits, and rule infractions.
  - **Warning Amber** (`#eab308`): Cautionary notes, slippage alerts, and pending checks.
- **Text**:
  - `Primary Text`: `#f0ede6` (warm chalk)
  - `Secondary Text`: `#9aa0a6` (slate gray)
  - `Muted / Label Text`: `#6b7280` (ash gray)

---

## Typography

Typographic hierarchy enforces strict legibility and numeric alignment:
- **Primary Interface Font**: `Outfit, system-ui, -apple-system, sans-serif`
  - Crisp geometry with modern humanist proportions for headings, controls, and narrative notes.
- **Editorial Accent Font**: `Cormorant Garamond, 'Playfair Display', Georgia, serif`
  - Expressive italic serif for high-contrast editorial pairing in headline treatments (e.g. "Institutional Precision *for* Every Session").
- **Tabular & Numerals Font**: `'JetBrains Mono', 'SF Mono', monospace`
  - Applied strictly to dollar values, tick sizes, win rates, execution timestamps, and risk ratios.
  - Always rendered with `font-variant-numeric: tabular-nums` to guarantee vertical column alignment across rows and trade ticket tables.
- **Scale**:
  - Display / Balance Total: 28px – 34px (bold tabular numbers)
  - Title / Section Header: 16px – 20px (semi-bold)
  - Subhead / Metric Header: 12px (all-caps, tracking 0.08em)
  - Body Text: 13px – 14px (regular, line-height 1.5)
  - Caption / Micro Badge: 12px (compact tabular)

---

## Layout

- **Sidebar Navigation**: Fixed 224px left rail (`--bg-subtle`), cleanly separating primary application modules: Home / Calendar, Playbook, Reports, Notebooks, and Settings.
- **Focus Companion (Dockable Sidecar)**: Compact 420px vertical utility optimized for side-by-side docking next to TradingView, Sierra Chart, or NinjaTrader charts.
- **Grid Systems**:
  - Calendar Matrix: Strict 5-day / 7-day monthly accounting grid with week-ending subtotal summaries.
  - Metric Summary Strips: Multi-column responsive cards with consistent 16px gutter spacing and uniform height anchors.

---

## Elevation & Depth

- **Spatial Glassmorphism & Atmospheric Lighting**:
  - Floating frosted glass planes with `backdrop-filter: blur(16px)`, `background: rgba(255, 255, 255, 0.035)`, and hairline borders (`1px solid rgba(255, 255, 255, 0.12)`).
  - Ambient top lighting line (`ambient-light-beam`) providing high-end spatial illumination across the canvas.
  - Directional elevation: `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)`.
  - Floating telemetry pills with hairline leader lines pointing down to balance anchors and risk shields.
- **No Neon Halos or Glows**: Glowing borders, ambient multi-color box-shadow halos, and gradient text fills are strictly prohibited; directional elevation is used throughout.
- **Double-Entry Micro Rules**:
  - `.ledger-double-rule`: Classical accounting balance mark consisting of a 1px solid rule followed by a 1px hairline double-underline, signaling finalized tally.

---

## Shapes

- **Restrained Radii**: Cards, dialogs, inputs, and button surfaces utilize compact 4px to 6px radii (`var(--radius-sm)`: 3px, `var(--radius-md)`: 4px, `var(--radius-card)`: 6px).
- **No Pill Overuse**: Pill shapes (`9999px`) are reserved exclusively for circular counters or specific emotional mindset chips. All action buttons, filters, and cards maintain rectangular discipline.

---

## Components

- **Main Navigation Rail**: Minimal icon + label hierarchy with a subtle 2px vellum indicator on active routes.
- **Audited Ledger Badges**: Quiet uppercase badges framed by 1px hairline borders and subtle 8% vellum tint.
- **Executive Telemetry Strip**: High-density metric display featuring Account Balance, Net P&L, Win Rate, Profit Factor, and Average R:R with tabular figures.
- **Monthly Calendar Grid**: Clean tabular cells with credit/debit indicators, day win rates, and right-aligned week balance tallies.
- **Session Ledger Sidebar**: Chronological trade tickets displaying entry/exit times, contract volume, setup badges, and net P&L.
- **Focus Companion Notepad**: Integrated distraction-free trade journal with real-time timestamp insertion, daily risk scorecard, and allowed setup quick references.

---

## Do's and Don'ts

### Do:
- Use `tabular-nums` for all dollar figures, win rates, and timestamps.
- Use hairline borders (`1px solid #232733`) to compartmentalize data tables and cards.
- Anchor totals and net balances with the `.ledger-double-rule` accounting underline.
- Reserve Lucide icons for semantic utility, avoiding decorative emojis.
- Preserve 100% of underlying analytical calculations, state management, and user data models.

### Don't:
- Never apply neon glow drop shadows (`0 0 15px rgba(...)`) to buttons, metrics, or cards.
- Never use multi-stop gradient fills across text headings or buttons.
- Never use floating emojis as primary navigation icons or status badges.
- Never place gratuitous eyebrow kickers above primary screen titles.
- Never sacrifice data density or horizontal scanability for decorative negative space.

