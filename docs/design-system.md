# Design system

Figma file: RiniBhPH0gRrfdBSOrJk0K (page "Duit · Salary Routine Flow" holds all screens).
Product was renamed BajetJe; Figma still uses "Duit" in page and component names.

## Tokens (Figma variables, collection "Duit")
- ink 50 #f7f7f6 · 300 #bcbcb9 · 400 #949491 · 500 #6f6f6c · 600 #545451 · 700 #3d3d3b
  · 800 #2a2a28 · 900 #1e1e1e · 950 #141414
- lime 300 #c5ff73 (the only accent) · amber 400 #ffbb33 (Wants, Caution) · coral 400 #ff775c (High, Debt)
- Radius: 8 / 12 / 14 / full. Spacing: 2, 4, 8, 12, 16, 24, 32, 48, 64
- Type: Geist (UI), JetBrains Mono (every number). Text styles: Heading, Body, Label, Numeric, Caption, Overline

## Colour rule: 60 / 30 / 10
60 base (ink 900) · 30 surface (ink 800/700 + neutral text) · 10 accent (lime).
Lime only for: one hero number per screen, the primary button, "you are here" markers.
Amber/coral only for status. No blue.

## Components (one Figma page each, all with variants)
Icon (15 glyphs) · Button (Primary/Secondary x Default/Disabled) · Icon Button (Filled/Ghost)
· Chip (Filter/Stat x Default/Selected) · Budget Chips (None/Week/Payday, interactive tooltip)
· Status Pill (Healthy/Caution/High/Debt/Neutral) · Segmented (First/Second) · Tooltip (Arrow Start/End)
· Field (Default/Focused) · Commitment Row (Type Default/Debt/Custom x State Default/Edit/Swiped) · Afford Tile (Default/Pressed)
· View Toggle (Bars/Jars/List, sliding thumb)
· Eligibility Check (Pending/Eligible/Not eligible) · Verdict Card (Comfortable/Tight/Unaffordable)

## Motion
- Ease-out strong: cubic-bezier(0.23, 1, 0.32, 1); springs only for status pills (bounce 0.2-0.25)
- Durations: press 120 ms (scale 0.97) · value update 180 ms · reveal 300-450 ms · gauge sweep 650 ms · stagger 60 ms
- Typed digits rise 0.6 em in a clipped line (see reference/RollingNumber.tsx); backspace is instant
- View toggle: thumb slides 240 ms; split body height 260 ms; new view fades up 6 px
- Swipe to delete: 84 px reveal, rubber-band past the edge, collapse 220 ms, Undo toast 4 s
- Never animate frequent actions (tabs, scroll, segmented, back nav). Reduced motion = fades only.
