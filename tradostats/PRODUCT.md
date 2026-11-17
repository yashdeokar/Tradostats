# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Active day traders, futures scalpers (ES, NQ, CL), options flow traders, and prop-firm funded traders managing risk in high-volatility live market conditions.

## Product Purpose
Tradostats is a dedicated trading journal and real-time execution companion engineered to cultivate institutional-grade execution discipline. It provides instant access to pre-market checklists, live scenario execution notes, calendar PnL analytics, and end-of-day Daily Report Cards (DRC) without cognitive friction.

## Positioning
Unlike bloated, generic trade analytics suites with sluggish dashboard widgets, Tradostats pairs an ultra-responsive, distraction-free markdown notepad designed specifically to dock alongside live charting platforms (TradingView, Thinkorswim, NinjaTrader) in a compact 380px–460px vertical format, with calendar PnL heatmaps and high-resolution A4 image exports for accountability.

## Operating Context
- Live market hours (NYSE/CME market session 09:30–16:00 EST).
- Secondary monitor or compact docked sidecar window (380px–460px width).
- Dual-focus workflow: fast glance while monitoring live order flow and depth of market.
- Keyboard-first interaction, sub-second clipboard chart image pasting (`Ctrl+V`), and rapid timestamp logging.
- Pre-market ritual preparation and post-market Daily Report Card grading.

## Capabilities and Constraints
- Sub-second local autosave with offline resiliency: zero data loss during connectivity drops.
- Clipboard image paste directly into the journal with click-to-zoom lightbox viewer.
- Daily Report Card (DRC) system with letter grades (A+ to F), rule adherence tracking, and emotional mindset evaluation.
- Structured pre-market and execution markdown template auto-populated on empty dates.
- High-fidelity A4 PNG export in both Obsidian Dark and Print Light modes.
- Calendar-based PnL analytics with cumulative win rates, trade count, and profit factor.
- Full WCAG AA accessibility, zero tracking/telemetry leakage, and zero lag.

## Brand Commitments
Minimalist Obsidian-inspired aesthetic, high information density, dark terminal palette (Obsidian `#070709`, card `#0f0f14`, champagne gold `#C5A059`, emerald win `#00E699`, ruby loss `#FF3B57`), authentic monospace data typography (JetBrains Mono).

## Evidence on Hand
Working live Focus companion at `/focus`, home calendar at `/`, working trade store (`src/lib/store.ts`), full daily template in `src/lib/dailyTemplate.ts`, and local storage persistence.

## Product Principles
1. **Zero Distraction in the Heat of the Market**: Fast, quiet, calm dark canvas, no intrusive modals, no lagging animations.
2. **Authentic Terminal Precision**: Numbers, dates, and prices use tabular monospace figures with unambiguous contrast.
3. **Discipline over Vanity**: Highlighting process adherence, emotional state, and execution quality over raw PnL bragging.
4. **Resilient Under Live Stress**: Never drop a note, lose a pasted screenshot, or fail silently during live market volatility.

## Accessibility & Inclusion
Full WCAG AA compliance (contrast >= 4.5:1, non-skipping heading hierarchy, minimum 11px functional text, keyboard navigation, clear aria-labels).
