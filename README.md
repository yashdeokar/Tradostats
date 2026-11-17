# Tradostats — Professional Trading Journal & Execution Terminal

> **The Double-Entry Actuarial Ledger** — Rigorous financial accountability, spatial telemetry, and intraday execution companion for active futures and equity traders.

---

## 🌟 Overview

**Tradostats** transforms raw trading logs into behavioral and statistical alpha. Built for systematic day traders executing index futures (ES, NQ, YM, RTY) and equities, Tradostats pairs deep retrospective edge auditing with a distraction-free, real-time live trading companion.

Designed from the ground up with **The Double-Entry Actuarial Ledger** design system — combining mathematical discipline, vellum hair-line rules, spatial glassmorphism depth, and high-precision tabular figures.

---

## 🚀 Key Modules & Capabilities

### 1. 🌌 Celestial Cinema Landing Page (`/landing`)
- **Celestial Interactive Canvas**: 85 stars with 3D gravitational parallax that reacts to cursor movement, dynamic constellation lines that bridge stars in proximity to the pointer, and ambient nebula starlight glow.
- **Editorial Typography Intro**: Staggered word unmasking with optical blur clearing, contrasting bold geometric sans (*Outfit 800*) with expressive italic serif (*Cormorant Garamond*).
- **Holographic 3D Cockpit**: Central preview card with real-time cursor-following 3D spring tilt (`perspective: 1200px`) and specular radial glass glare.
- **Interactive Bento Showcase**:
  - *Module 01: Live Trade Simulator* (reactive contracts slider, dynamic expectancy, R:R morphing)
  - *Module 02: Spatial Focus Sidecar Preview* (interactive dock toggles: left, right, floating)
  - *Module 03: Behavioral Attribution Heatmap* (dynamic mood tinting: FOMO, Patient, Revenge, Disciplined)
- **Scroll-Linked Telemetry**: Hairline cosmic reading progress bar and kinetic number counters.

### 2. ⚡ FLIP Physics Task Board (`/playbook/goals`)
- **Effortless-to-Follow State Transitions**: Moves tasks between **In Progress** and **Done** using **FLIP (First, Last, Invert, Play)** spatial continuity.
- **Visual Gaze Anchors**: Dashed origin ghost placeholder (`ghost-pulse`) and dynamic SVG trajectory guide beam.
- **Sibling Layout Interpolation**: Sibling cards slide smoothly to close voids without abrupt layout jumps.
- **Slow-Motion Inspection**: Toggle between Normal (380ms) and Slow-Mo (950ms) to inspect every frame of the trajectory.
- **Integrated Daily Checklist**: Real-time adherence tracking in the Focus Companion cockpit (`/focus`).

### 3. 🎯 Focus Companion Cockpit (`/focus`)
- **Distraction-Free Trading Notepad**: Compact 400px sidecar designed to dock beside TradingView, Sierra Chart, or NinjaTrader.
- **Daily Report Card (DRC) Scorecard**: Session grading (A+ to F), process adherence tracking, and emotional state tags.
- **Sub-Second Quick Trade Logger**: Instant trade entry with zero terminal lag.
- **Live Markdown Journal**: Markdown editor with auto-timestamps, screenshots, and A4 daily journal PDF export.

### 4. 📊 Spatial Executive Dashboard (`/`)
- **Interactive Monthly Calendar Grid**: Audited ledger tiles displaying daily net P&L, day win rates, and weekly balance tallies.
- **Executive Telemetry Strip**: Account Balance, Net P&L, Win Rate, Profit Factor, and Average R:R in tabular monospace.
- **Session Ledger Sidebar**: Chronological trade tickets with execution timestamps, contract size, and setup tags.

### 5. 📈 Multi-Dimensional Statistical Auditing (`/reports/*`)
- Comprehensive reports across 12 analytical dimensions:
  - Overview & Equity Curve
  - Performance by Day of Week & Time of Day
  - Instrument Breakdown (ES, NQ, CL, GC, BTC)
  - Playbook Setup Attribution
  - Win/Loss Expectancy Matrix
  - Trade Duration & Hold Times Analysis
  - Monte Carlo Trade Simulator

---

## 📚 Architectural & Design Documentation

The repository includes complete architectural and design system specifications:

| Document | Description |
|---|---|
| [`PRODUCT.md`](./PRODUCT.md) | Product purpose, user personas, operating context, capabilities, and execution principles. |
| [`DESIGN.md`](./DESIGN.md) | The Double-Entry Actuarial Ledger design system: palette tokens, typography ramp, spatial glassmorphism, and craft floor rules. |
| [`tradostats/PRODUCT.md`](./tradostats/PRODUCT.md) | Application-level product requirements and feature boundaries. |
| [`tradostats/DESIGN.md`](./tradostats/DESIGN.md) | Component-level token schema, rules, and layout constraints. |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack/Webpack)
- **UI Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Actuarial Design Tokens
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with client-side localStorage persistence
- **Typography**: Outfit, Cormorant Garamond, JetBrains Mono
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)
- **Visual Testing**: Impeccable Design Quality Detector

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or pnpm

### Installation

1. Navigate to the application directory:
   ```bash
   cd tradostats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and explore:
   - **Landing Page**: [http://localhost:3000/landing](http://localhost:3000/landing)
   - **Execution Board**: [http://localhost:3000/playbook/goals](http://localhost:3000/playbook/goals)
   - **Focus Companion**: [http://localhost:3000/focus](http://localhost:3000/focus)
   - **Main Terminal**: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Privacy & Performance Commitments

- **100% Client-Side Privacy**: All trade logs, journal notes, and risk parameters remain entirely in your local browser storage.
- **Zero Third-Party Telemetry**: No trackers, cookies, or external analytics in the core trading flow.
- **Accessibility & Motion**: Full `@media (prefers-reduced-motion: reduce)` support and WCAG AA contrast compliance (≥4.5:1).

---

## 📄 License

Apache-2.0 License. Built with precision for traders.
