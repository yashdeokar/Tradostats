# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Active day and swing traders (futures, equities, forex, crypto) executing structured strategies, auditing statistical edge, and tracking execution discipline before, during, and after market sessions.

## Product Purpose
Tradostats is a professional trading journal and execution companion that transforms raw trade logs into actionable behavioral and statistical insights. Success means helping traders eliminate impulsive errors, adhere to proven setups, and compound edge over time with zero friction.

## Positioning
Tradostats unites deep retrospective edge auditing (interactive calendar matrix, playbook setups, tag analytics, multi-dimensional statistical reports) with live intraday execution accountability (the Focus Companion cockpit featuring Daily Rule Checklist / DRC scorecards, live scratchpad, and emotional mindset tracking).

## Operating Context
- **Pre-market**: Checking goals, reviewing playbook setups, setting daily focus rules and mental readiness.
- **In-session**: Fast-paced trading environment where traders need zero-distraction logging, immediate visual feedback on daily limits/goals, and quick access to strategy criteria.
- **Post-market**: Detailed journaling with rich text (Tiptap), screenshot attachments, tag attribution, and multi-variable statistical reviews across time, volume, and instruments.
- **Hardware/Environment**: Multi-monitor setups, desktop trading platforms (TradingView, NinjaTrader, ThinkorSwim), often active in low-light or variable-lighting trading stations.

## Capabilities and Constraints
- **Preserved Architecture**: Next.js 16 (App Router), React 19, Tailwind CSS, Zustand client-side store with persistence and demo data hydration.
- **Preserved Navigation & Flow**: Complete retention of existing routes (`/` Home, `/playbook/*`, `/notebooks/*`, `/reports/*`, `/focus` Companion, `/settings`), modals (Quick Trade, Log Trade, Setup Details, A4 Export, Lightbox, Auth), and data models.
- **Zero Calculation Drift**: Financial calculations (PnL, Win Rate, Profit Factor, Hold Times, Drawdown, Streaks) must remain numerically identical and trustworthy.
- **High-Density Data**: Financial tables, heatmaps, bar charts, Recharts time-series, and compact badge tags require ultra-crisp typographic hierarchy and tabular numbers.

## Brand Commitments
- **Name**: Tradostats ("PRO JOURNAL")
- **Tone of Voice**: Serious, disciplined, analytical, institutional-grade, free of gimmicks or casino-style gamification.
- **Visual Mandate**: Complete replacement of the incumbent heavy "gold & obsidian glow" aesthetic with a contemporary, high-craft, professional visual language while maintaining 100% functional flow fidelity.

## Evidence on Hand
- Full interactive prototype with mock trading records, setups, tags, and notes hydratable on demand (`tradostats/src/lib/demoData.ts`).
- Comprehensive reporting suite across 12 analytical dimensions (`tradostats/src/app/reports/*`).
- Specialized live trading interface (`tradostats/src/components/focus/*`).

## Product Principles
1. **Clarity Over Spectacle**: Market data and trading performance demand instant readability, quiet contrast, and zero visual noise.
2. **Execution Integrity**: In-session tools must prioritize rapid input and cognitive calm; journaling must capture psychological nuance effortlessly.
3. **Institutional Precision**: Typography, numeric alignments, and data density must feel like an elite trading desk terminal, not a speculative toy.
4. **Honest Feedback**: Wins and losses are treated with objective mathematical discipline, celebrating process adherence over emotional P&L spikes.

