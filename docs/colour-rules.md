# Colour rules: 60/30/10 pass (24 Oct)

Problem: lime was on everything (today marker, Healthy pill, savings, progress tracks, tip icon, doodles, hero, buttons),
so nothing stood out. Fix: lime keeps one meaning, data keeps its own hues, the base shows through more.

## 60 / 30 / 10
| Share | Role | Tokens |
|---|---|---|
| 60 | Base: screen background, open sections | ink/900 `#1E1E1E` |
| 30 | Surface: cards you tap or that read as one unit, neutral text | ink/800 `#2A2A28`, ink/700 `#3D3D3B`, ink/50 to ink/500 text |
| 10 | Accent: lime, with one meaning | lime/300 `#C5FF73` |

## Lime: two jobs only
1. **Money that is yours to spend**: the Extra money number, the Extra segment of its split bar, "For yourself" on Commitment health.
2. **The primary button** (one per screen).
Plus one tint: the **Healthy** pill is `lime/900` background `#2B420D`, `lime/300` text and a 6 px lime dot (not a solid lime block).
Never lime: icons, the tip icon, empty-state doodles, the today marker, progress tracks of non-status data, legends.
Affordability tracks (car/home tiles) use the verdict colour: comfortable lime, tight amber, unaffordable coral.

## Data keeps hue
| Meaning | Token (dark) | Hex | Token (light) |
|---|---|---|---|
| bucket/needs | ink/400 | `#949491` | ink/500 |
| bucket/wants | amber/400 | `#FFBB33` | amber/500 |
| bucket/savings | **blue/300 (was lime)** | `#7FADFF` | blue/500 |
| health/healthy | lime (tint pill, gauge zone) | | |
| health/caution | amber/400 | | |
| health/high, over | coral/400 | | |
Savings moved off lime so it never reads as the same thing as Extra money. Text on bar segments: ink/900 on all three.

## Screen by screen (what changed)
- Pay-cycle strip: past ink/700, **today ink/50 (white) and its "Today" label ink/50**, days left amber 55%.
- Extra money card: split bar Commitments ink/400, **Savings blue/300**, Extra lime. Pill Healthy = tint.
- Commitments breakdown: Savings dot blue.
- 50/30/20 below the flow (filled state): **open section, no card background** (padding 4 px 0). The empty-state split card stays a card because it is part of the flow spine.
- Tip: **no card**: 1 px ink/700 top border, padding 16 px 0 4 px, sparkle icon ink/400.
- Empty state doodle: ink/300 strokes, so "Add my commitments" is the only lime.
- Every "pill" painted lime (Healthy, Likely eligible, Comfortable) uses the tint style.

## Implementation notes
- Prototype: `--lime-900:#2b420d; --blue:#7fadff;`; tint via `.pill[style*="background:var(--lime)"]` (prototype shortcut).
  In the app, build a `StatusPill` with `tone="healthy" | "caution" | "high" | "neutral"`; only healthy is a tint, caution/high stay solid.
- Use tokens, never hex in components. Bucket colours come from `bucket/*` tokens so a palette change is one edit.

## Acceptance criteria
- [x] Filled dashboard: the only solid lime areas are the Extra money number and the Extra bar segment.
- [x] Empty dashboard: the only lime is the "Add my commitments" button.
- [x] Savings is blue in every chart, legend, breakdown dot and the Commitments screen.
- [x] Healthy pill is a tint with a dot on every screen; Caution and High unchanged.
- [x] Today marker is white; days left are amber.
