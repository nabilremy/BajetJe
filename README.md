# BajetJe

Masuk gaji je, bajet siap. Salary planner for Malaysian first-jobbers: salary and payday in,
a full monthly plan out. No tracking, no login, nothing leaves the phone.

## Run

```bash
npm install
npm run dev        # local dev server
npm test           # engine tests against docs/golden-values.json
npm run typecheck
npm run build      # static build in dist/, deploy to any static host
```

Optional: set `VITE_RATES_URL` to a static URL serving a newer `rates.json` (same shape as
`src/engine/rates.json`). Rates only come down; nothing personal goes up.

## Stack

Vite + React + TypeScript + Tailwind v4, Vitest. Installable PWA (hand-written `public/sw.js`,
offline app shell). No backend, no analytics.

## Layout

```
src/engine/      Pure TS engine ported from the prototype (payroll, cycle, plan, car, home, eligibility)
                 rates.json = versioned rates; engine.test.ts = golden-value tests
src/state/       store.ts (app state, export/import), storage.ts (encrypted IndexedDB), router.ts
src/components/  RollingNumber, SplitCard, BudgetChips, CommitmentRow, EligibilityCheck, shared ui
src/screens/     F1 Salary, F2 Plan (hub), F3 Commitments, F4 Health, F5 Car, F6 House
src/styles/      Tokens (Tailwind @theme, mirrors Figma "Duit" variables) + component CSS and motion
prototype/       The reference prototype (source of truth)
docs/            Product, design system, calculation rules, screens, golden values
```

## Privacy

- Plan is encrypted with AES-GCM (256-bit) and stored in IndexedDB. The key is a
  non-extractable WebCrypto key generated on the device.
- "Delete all my data from this phone" (two taps within 3 s) clears the data and the key.
## Notes from the build (prototype vs docs)

The prototype wins where it disagrees with a doc. Decisions so far:

1. **F4 budget chips**: in `docs/screens.md` and Figma, not in the prototype. Decision: follow the prototype (no chips).
2. **SRP age**: docs say 21 to 40; the prototype asks "40 or below" and doesn't check SJKP's 18+. Follows the prototype.
3. **Hub hero and tooltip with savings-only commitments**: the prototype's formula line and tooltip say
   "30% wants ÷ days" even when a savings amount makes the daily come from "left after bills and savings".
   Fixed so the shown maths matches the number.
4. **Hub greeting**: no name is collected, so it says "Hi, {calling}" with a calling picked at random per
   launch (Master, Boss, Geng, Sifu, ...). The prototype says "Hi there".
5. **Export / import**: listed in the `CLAUDE.md` build order but not in the prototype. Built, then removed on request.
6. **Hub hero spacing**: the prototype renders "RM35" (the space collapses inside the rolling digits).
   Fixed to "RM 35" as in Figma and `docs/screens.md`.
7. **Fonts**: loaded from Google Fonts like the prototype.

## Polish on top of the prototype

Kept inside the design system (see `docs/DESIGN.md`); copy, numbers and behaviour unchanged.

- Text arrows and plus signs replaced with line icons from the same icon set.
- Dot removed from the Commitment Health status pill (the pill colour already carries the state).
- Cards get a faint top inner highlight; tooltip and toast use a layered, diffused shadow.
- Headings use balanced wrapping and body copy avoids orphans.
- Swipe rows show the coral backing only while swiping or open, so it no longer fringes row corners.
