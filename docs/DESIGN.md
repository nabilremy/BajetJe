# Design System: BajetJe

Semantic design brief for generating new BajetJe screens (Stitch or any design agent).
Tokens and motion values are the same as `docs/design-system.md` and `src/styles/index.css`.
The prototype stays the source of truth; this file explains its taste so new screens fit.

## 1. Visual Theme & Atmosphere
A calm, honest older sibling who is good with money, rendered as a quiet dark instrument.
Warm charcoal surfaces, one lime signal, monospaced numbers that read like a payslip.
Every screen opens with the one number the person came for, then shows the maths beneath it.

- Density: 5 "Daily App Balanced". One column, 20px side gutters, 24px between blocks.
- Variance: 3 "Predictable Symmetric". A phone tool used on payday, not a gallery. Consistency wins.
- Motion: 4 "Fluid CSS". Short, purposeful, under 300ms for UI; never on frequent actions.

## 2. Color Palette & Roles (60 / 30 / 10)
- **Charcoal Base** (#1E1E1E, ink 900) - 60%: screen background
- **Night Edge** (#141414, ink 950) - Outside the app frame
- **Graphite Surface** (#2A2A28, ink 800) - 30%: cards, fields, chips
- **Raised Graphite** (#3D3D3B, ink 700) - Pressed chips, tooltips, tracks, toasts
- **Paper Ink** (#F7F7F6, ink 50) - Primary text, selected chip fill, gauge marker
- **Soft Ink** (#949491, ink 400) - Body copy; **Quiet Ink** (#6F6F6C, ink 500) - Captions, overlines
- **Payday Lime** (#C5FF73) - 10%, the only accent: one hero number per screen, the primary button, "today" and Healthy
- **Caution Amber** (#FFBB33) - Status only: Wants, Caution, over-budget notes
- **Alarm Coral** (#FF775C) - Status only: High, Debt, Delete

Rules: no blue, no purple, no gradients on text, no glows, no pure black.
Amber and coral never decorate; they always mean a state.

## 3. Typography Rules
- **UI:** Geist 400 / 500 / 600. Headings 24/30, 20/26, 17/24, tracking -0.01em, balanced wrapping.
- **Numbers:** JetBrains Mono, tabular figures, for every amount, percent and day count.
  Hero 64/72 bold at -0.03em; secondary hero 48/56.
- **Body:** 13/20 in Soft Ink, pretty wrapping (no orphans). Captions 12/16. Overline 11px, 600, 0.06em caps,
  used only as the label of the number below it.
- **Banned:** Inter, Roboto, system serif, any second display face.

## 4. Component Stylings
- **Primary button:** Payday Lime fill, ink 900 label, 52px tall, radius 14, press scales to 0.97 in 120ms.
  Disabled is 35% opacity and says why ("Pick your payday to continue").
- **Quiet button:** Raised Graphite fill, pill for inline actions such as Edit.
- **Cards:** Graphite Surface, radius 14, padding 18, a 1px top inner highlight (white at 3.5%) instead of a border.
- **Chips:** pill, Graphite Surface; selected = Paper Ink fill with ink 900 text. Budget chips open a tooltip with the formula.
- **Status pill:** filled with the status colour, ink 900 text, one word (Healthy, Caution, High, Comfortable, Tight, Unaffordable).
- **Field:** 64px, radius 12, 1px inner ink 700 line, focus becomes a 1.5px lime inner line. Real input over rolling digits.
- **Commitment row:** icon tile, name, category, Debt tag, inline amount. Swipe left reveals an 84px coral Delete.
- **Gauges:** three zones at 40% opacity (lime, amber, coral) with a Paper Ink marker.
- **Tooltip and toast:** Raised Graphite, radius 12, layered diffused shadow plus a top hairline.
- **Icons:** one 24px line set, 1.5 stroke, round caps. No glyph arrows, emoji or decorative dots.
- **Empty states:** a quiet illustration, one sentence on what to add, one primary action.

## 5. Layout Principles
- Single column inside a 400px phone column; full bleed under 520px with safe-area padding.
- Order on every screen: label, hero number, formula line, detail, next action.
- Sticky footers fade from transparent to Charcoal Base over 22% so content scrolls under them.
- Touch targets at least 44px; stacked text links need at least 24px between them.
- Every derived number has a formula line or a tooltip. Legal line closes each screen.

## 6. Motion & Interaction
- Easing: ease-out strong `cubic-bezier(0.23, 1, 0.32, 1)`. Springs only for status pills (scale 0.9 to 1).
- Durations: press 120ms, value update 180ms, reveal 300 to 450ms, gauge sweep 650ms, stagger 50 to 60ms.
- Screen push: 28px slide plus fade, 280ms. Hub reveal plays once per session.
- Digits: typed digits rise 0.6em in a clipped line; backspace is instant; totals roll only changed digits.
- Never animate tabs, segmented controls, scrolling or back navigation.
- Reduced motion: fades only. Animate transform and opacity, plus the one measured height ease on the split card.

## 7. Anti-Patterns (Banned)
- Expense tracking, streaks, badges, confetti or anything gamified
- Blocking the user ("you can't add this"); warn in amber instead
- A second accent colour, blue links, purple or neon glows, gradient text
- Emoji, Unicode arrows as icons, decorative coloured dots
- Invented numbers: every figure comes from the engine and is labelled an estimate
- AI filler copy ("Elevate", "Seamless", "Unleash"), "Scroll to explore", bouncing chevrons
- Em dashes anywhere
- Cards inside cards for decoration, hard black drop shadows, generic 1px grey borders
