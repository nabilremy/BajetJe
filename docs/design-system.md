# Design system

Tokens: brand/tokens/tokens.json (all values) and brand/tokens/tokens.css (Tailwind v4 @theme + semantic CSS vars).
Figma file RiniBhPH0gRrfdBSOrJk0K is the visual source of truth (page map in docs/figma-map.md). Figma still uses "Duit" in
page and component names; the product is BajetJe.

## Colour: 60 / 30 / 10
- 60 base: ink/900 background. 30 surface: ink/800 and ink/700 plus neutral text. 10 accent: lime/300.
- Lime only for: one hero number per screen, the primary button, "you are here" markers, healthy status.
- Amber and coral only for status (Wants, Caution, High, Debt). No blue in the UI.
- Brand (logo, splash) uses lime shades only: lime/900 tile, lime/100 lines, lime/500 hatching.

## Type
Geist (UI), JetBrains Mono (every number), Caveat Bold (handwritten reaction notes only). Text styles in tokens.json.

## Components (Figma, all with variants)
Logo (Layout x Theme) · Icon (22 doodle glyphs incl. loader) · Button (Primary/Secondary x Default/Pressed/Disabled, Primary Loading)
· Icon Button · Chip (Filter/Stat x Default/Selected) · Budget Chips (interactive tooltips) · Status Pill · Segmented (sliding thumb)
· Language Switch (EN/BM) · View Toggle (Bars/Jars/List) · Toggle (On/Off) · Tooltip · Field · Commitment Row (Default/Debt/Custom x
Default/Edit/Swiped) · Afford Tile · Eligibility Check · Verdict Card · Reaction Note · Doodle (16 brand doodles).

## Doodle style
All icons and illustrations are hand-drawn by brand/generators/engine.js: tapered pressure strokes, natural wobble, optional faint
second pass, diagonal hatching for fills. White ink on dark, at most one lime accent per drawing. Regenerate, never hand-trace.

## Motion
- Easing: ease-out strong cubic-bezier(0.23, 1, 0.32, 1); spring cubic-bezier(0.34, 1.56, 0.64, 1) (status pills, chip pops, notes).
- Durations: press 120, colour 180, digit-in 180, tooltip 160, thumb/toggle 260, reveal 400, note-up 520, gauge sweep 650, stagger 60, loader turn 900 (ms).
- Every control moves (see screens.md). Never animate frequent actions beyond press feedback. Reduced motion: no pops/slides/loops.
- Reference: reference/RollingNumber.tsx (digit roll) and the prototype CSS.
