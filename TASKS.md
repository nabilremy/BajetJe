# Tasks for Claude Code (in order)

Read CLAUDE.md first. Work one task at a time; after each, compare with prototype/bajetje-prototype.html and list differences.
If the project is new, do all tasks. If you already built from an earlier pack, also do the "Migration" items marked (M).

## 0. Setup
- [ ] Propose stack + folder structure (mobile-first, TypeScript). Wait for approval before scaffolding.
- [ ] Import brand/tokens/tokens.css (or map tokens.json into the chosen styling system). Load Geist, JetBrains Mono, Caveat.

## 1. Engine (no UI)
- [ ] Port payroll, cycle, calc (with buckets), carAllIn, carLimit (with down payment), home (with down payment + 500k cap),
      eligibility from the prototype (window.__bajetje) into src/engine with types.
- [ ] Unit tests from docs/golden-values.json + pay-cycle edge cases. All green. (M: buckets, savingsOut, floor-once daily, down payments)

## 2. Brand assets
- [ ] App icon from brand/logo/png (all sizes) + small icon for <48 px; splash uses the Sketch B SVG. (M: replace old logo)
- [ ] Icon component that renders brand/icons/*.svg with currentColor. (M: replace every line icon)
- [ ] Doodle illustrations from brand/doodles (welcome, commitment-health-empty, kit). (M: replace old illustration)

## 3. Components
- [ ] Button (Primary/Secondary, Pressed, Disabled, Loading with spinning doodle loader), Chip, Status Pill, Segmented (sliding
      thumb), Language Switch, View Toggle, Toggle, Tooltip, Field (rolling digits), Commitment Row (swipe/edit), Afford Tile,
      Eligibility Check, Reaction Note. Specs: docs/design-system.md + Figma (docs/figma-map.md).
- [ ] Every control moves (docs/screens.md "Every control moves"), including FLIP when a control re-renders the screen.

## 4. i18n
- [ ] EN + BM using proper keys with ICU placeholders, seeded from docs/strings-en-bm.json. Switch persists on device.
- [ ] Reactions and salary-note pools exactly as docs/voice-and-tone.md (random per tier, no immediate repeat). (M)

## 5. Screens (match docs/screens.md and the prototype exactly)
- [ ] F0 Splash -> F0b Welcome (M: new) -> F1 Salary (M: loading CTA + note) -> F2 Hub (M: view toggle in card, tooltips, EN|BM,
      reaction chip, delete-all) -> F3 Commitments (M: buckets, swipe delete, undo) -> F4 Health (M: reaction chip)
      -> F5 Car (M: down payment, jump-to, toggle) -> F6 Housing (M: down payment, eligibility check).

## 6. Storage and privacy
- [ ] Encrypted on-device storage of state (salary, payday, commitments, lang, view, car/home choices). No network calls with user data.
- [ ] Delete-all (two taps), export/import file.

## 7. QA
- [ ] Reduced motion pass, screen reader labels (EN + BM), dynamic type, small screens (320 px wide), no em dash anywhere.
