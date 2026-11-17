---
name: Tradostats
description: Distraction-free live trading journal and execution companion
colors:
  primary: "#C5A059"
  primary-hover: "#DDA743"
  surface-canvas: "#070709"
  surface-card: "#0f0f14"
  surface-elevated: "#15151c"
  surface-border: "#1f2128"
  surface-border-subtle: "#16171d"
  text-primary: "#f4f4f6"
  text-secondary: "#9e9eb0"
  text-muted: "#858895"
  win-green: "#00E699"
  loss-red: "#FF3B57"
  accent-cyan: "#38bdf8"
  tag-emerald: "#10B981"
  tag-blue: "#3B82F6"
  tag-purple: "#8B5CF6"
  tag-amber: "#F59E0B"
  tag-ruby: "#EF4444"
  tag-pink: "#EC4899"
  grade-b: "#EAB308"
  grade-d: "#F97316"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-canvas}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: Tradostats

## Overview

**Creative North Star: "The Obsidian Pit Terminal"**

Tradostats is an austere, high-density financial workspace engineered for live market execution. Built around deep obsidian voids (`#070709`), razor-sharp champagne gold accents (`#C5A059`), and crisp terminal monospace data readouts, it completely rejects the bubbly, neon-washed tropes of generic AI software.

The interface prioritizes cognitive clarity above all else. During volatile market hours, traders cannot afford visual noise, unnecessary animations, or ambiguous contrast. Surfaces remain matte and structural; depth is created through crisp 1px borders and tonal layering rather than diffuse glowing halos. Typography separates fluid analytical thoughts from rigid numeric metrics, using tabular monospace figures for all prices, quantities, dates, and grades.

**Key Characteristics:**
- **Mathematical Restraint:** Every pixel serves a functional role. Zero purely decorative widgets or soft glow halos.
- **Obsidian Dark Void:** High-contrast dark mode calibrated for low ambient light multi-monitor trading desks.
- **Tabular Monospace Precision:** Strict tabular alignment for prices, percentages, timestamps, and scorecard ratings.
- **Sidecar Density:** Fluid vertical responsiveness that feels native and uncompromised at narrow 380px widths.

## Colors

The palette balances absolute obsidian canvas depth with high-contrast neutral text and restrained semantic market signals.

### Primary
- **Champagne Gold** (`#C5A059`): Reserved for active states, primary brand actions, and selected date indicators. Used sparingly (<10% of any viewport) to preserve authority.
- **Gold Hover** (`#DDA743`): Subtle lift for interactive gold elements on hover.

### Secondary
- **Terminal Emerald** (`#00E699`): Semantic win indicators, positive PnL readouts, and completed checklist items.
- **Terminal Ruby** (`#FF3B57`): Semantic loss indicators, negative PnL readouts, and violated trading rules.
- **Signal Cyan** (`#38BDF8`): Neutral informational callouts, link anchors, and pre-market market profile notes.

### Neutral
- **Obsidian Canvas** (`#070709`): Main viewport background; pitch black with subtle blue-gray undertone to eliminate OLED smearing while maintaining infinite depth.
- **Surface Card** (`#0F0F14`): Container panels, header bars, and modal surfaces.
- **Surface Elevated** (`#15151C`): Floating menus, dropdowns, and hover states.
- **Border Structural** (`#1F2128`): Crisp 1px structural dividing lines.
- **Text Primary** (`#F4F4F6`): High-legibility foreground for headings, key values, and journal content (>14:1 contrast).
- **Text Secondary** (`#9E9EB0`): Descriptive copy, secondary metrics, and active labels (6.2:1 contrast, exceeds WCAG AA).
- **Text Muted** (`#858895`): Minor metadata and timestamps (4.8:1 contrast, strictly above the 4.5:1 floor).

### Named Rules
**The Rarity of Gold Rule.** The primary champagne gold accent is applied strictly to primary actions and focus anchors. If more than 8% of the surface pixels are gold, the screen has lost conviction.
**The No-Halo Rule.** Colored zero-offset blur halos are banned. Positive PnL and gold badges earn distinction through crisp 1px borders and typography, never diffuse colored halos.

## Typography

**Display & Body Font:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`  
**Data & Metric Font:** `'JetBrains Mono', monospace`

**Character:** Ultra-clean neutral grotesque for effortless scanning and long-form markdown writing, paired with rigid monospace engineering precision for financial data and grades.

### Hierarchy
- **Display** (Bold 700, 2rem / 32px, line-height 1.2, letter-spacing -0.02em): Top-level page titles and major metric sums.
- **Headline** (SemiBold 600, 1.25rem / 20px, line-height 1.3, letter-spacing -0.01em): Section titles, modal headers, and calendar month navigation.
- **Title** (Medium 500, 1rem / 16px, line-height 1.4): Card headings and markdown subsection headers.
- **Body** (Regular 400, 0.875rem / 14px, line-height 1.55, max line length 72ch): Long-form journal writing, scenario descriptions, and trade notes.
- **Label / Metric** (SemiBold 600, 0.6875rem / 11px, letter-spacing 0.04em, uppercase mono): Badges, timecodes, table columns, keyboard shortcuts, and DRC grade tags.

### Named Rules
**The 11px Floor Rule.** No functional text, button label, badge, or table cell may be styled below 11px (0.6875rem).
**The Tabular Numerals Rule.** All numbers, prices, timestamps, and metrics must render with `font-feature-settings: 'tnum' 1` or in `'JetBrains Mono'` to prevent jitter during real-time updates.

## Layout

The spatial model is architected around dual display and docked sidecar use:
- **Full Canvas Mode (Desktop):** Fluid responsive layout with a fixed 240px collateral navigation sidebar and a spacious central calendar/journal grid.
- **Sidecar Mode (380px–460px):** Ultra-compact vertical dock optimized for tiling beside TradingView. All primary actions (date navigation, DRC grade, time inserter, A4 export) reside in a sticky, non-wrapping header toolbar.
- **Spacing Rhythm:** Rigid 4px/8px incremental grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`). Generous vertical separation above headings with tight grouping between related labels and values.

## Elevation & Depth

Tradostats is flat-by-default with structural 1px borders. Depth is achieved via tonal surface elevation (`#070709` → `#0F0F14` → `#15151C`) rather than exaggerated drop shadows.

### Shadow Vocabulary
- **Elevated Dropdown / Tooltip** (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)`): Grounded contextual menus and popovers.
- **Modal Overlay** (`box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px #1f2128`): High-conviction focus containers.

### Named Rules
**The Tonal Layering Rule.** Surfaces express depth through background stepping (`surface-canvas` to `surface-card` to `surface-elevated`), bounded by crisp 1px borders. Never use soft colored shadows to indicate containment.

## Shapes

- **Corner Radius:** Tight, precise corners (`4px` for buttons, inputs, and chips; `6px` for cards and panels; `8px` for modal dialogs).
- **Borders:** Consistent 1px solid `#1F2128`. Zero thick borders (`border-left: 3px`) on cards or callouts.

## Components

### Buttons
- **Shape:** 4px radius (`rounded-sm`).
- **Primary:** Background `#C5A059`, text `#070709`, font-weight 600, padding `6px 14px`. Hover: `#DDA743`. Focus: visible 1px gold outline offset 2px.
- **Ghost / Tool:** Background `transparent`, border `1px solid #1F2128`, text `#9E9EB0`, padding `6px 10px`. Hover: background `#15151C`, text `#F4F4F6`.

### Cards & Panels
- **Container:** Background `#0F0F14`, border `1px solid #1F2128`, radius `6px`.
- **Dividers:** Interior partitions use `border-b border-[#1F2128]` rather than nesting a card inside a card.

### Inputs & Selects
- **Style:** Background `#070709`, border `1px solid #1F2128`, radius `4px`, padding `6px 10px`, text `#F4F4F6`, font-size 13px (min 11px).
- **Focus:** Border color `#C5A059`, outline none.

### DRC Grade Selector
- **Pill:** Monospace grade readout (A+, A, A-, B+, B, B-, C, D, F) with semantic color coding (Green for A/B, Amber for C, Ruby for D/F), enclosed in a 1px border.

## Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 text contrast ratio across all secondary and muted copy.
- **Do** use `font-feature-settings: 'tnum' 1` and `'JetBrains Mono'` for prices, PnL amounts, timecodes, and DRC grades.
- **Do** style browser primitives: custom dark scrollbars (`scrollbar-width: thin`), `::selection` with gold background, and `caret-color: #C5A059`.
- **Do** ensure every interactive element functions seamlessly at 380px viewport width.

### Don't:
- **Don't** use multi-color gradient text or glowing box-shadow halos (`box-shadow: 0 0 15px ...`).
- **Don't** use kicker/eyebrow labels above headings. Let the heading carry its own weight.
- **Don't** nest cards inside cards. Use flat horizontal dividers and whitespace.
- **Don't** use font sizes below 11px for interactive or functional text.
- **Don't** add gratuitous entrance animations that delay access to trading notes during fast market action.
