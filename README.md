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
- Export / Import backup (hub footer) moves a plan to a new phone as a JSON file.

## Notes from the build (prototype vs docs)

The prototype wins where it disagrees with a doc. Flagged:

1. **F4 budget chips**: `docs/screens.md` and Figma show "a week / till payday" chips on Commitment
   Health; the prototype doesn't. Built to the prototype (no chips).
2. **SRP age**: `docs/calculation-rules.md` says aged 21 to 40; the prototype only asks "40 or below".
   SJKP's 18+ isn't checked either. Built to the prototype.
3. **Hub hero and tooltip with savings-only commitments**: the prototype's formula line and tooltip
   say "30% wants ÷ days" whenever needs + wants are 0, even when a savings amount makes the daily
   come from "left after bills and savings". Fixed so the shown maths matches the number.
4. **Hub greeting**: Figma says "Hi, Nabil"; the prototype says "Hi there" (no name is collected).
   Built to the prototype.
5. **Export / import**: in `CLAUDE.md` build order but not in the prototype UI. Added as two small
   links above the delete link on the hub. Backup file is plain JSON.
6. **Fonts**: loaded from Google Fonts like the prototype (self-hosting was not approved as a dependency).
