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
offline app shell). No backend, no analytics, no runtime font or CDN requests (fonts bundled in
`public/fonts`, SIL OFL).

## Layout

```
src/engine/      Pure TS engine ported from the prototype (payroll, cycle, plan, car, home, eligibility)
                 rates.json = versioned rates; engine.test.ts = golden-value tests
src/i18n/        EN + BM catalogue (messages.ts, ICU-style placeholders), formatter, useT() hook
src/brand/       assets.ts generated from brand/ by `node scripts/gen-brand.mjs` (doodle icons, doodles, logo)
src/state/       store.ts (app state, export/import), storage.ts (encrypted IndexedDB), router.ts
src/components/  RollingNumber, SplitCard, BudgetChips, CommitmentRow, EligibilityCheck, shared ui
                 (Segmented, LangSwitch, Toggle, ChoiceChips with pop, Reaction, Gauge, Toast)
src/screens/     F0 Splash, F0b Welcome, F1 Salary, F2 Plan, F3 Commitments, F4 Health, F5 Car, F6 House
src/styles/      Tokens (brand/tokens, Tailwind @theme) + component CSS and motion
brand/           Handover brand kit (logo, doodles, icons, tokens, generators)
prototype/       The reference prototype (source of truth)
docs/            Product, design system, voice and tone, strings, calculation rules, screens, golden values
```

## Privacy

- Plan is encrypted with AES-GCM (256-bit) and stored in IndexedDB. The key is a
  non-extractable WebCrypto key generated on the device.
- "Delete all my data from this phone" (two taps within 3 s) clears the data and the key, then shows Welcome.
- Export / Import backup (hub footer) moves a plan to a new phone as a JSON file.

## Notes from the build (prototype vs docs)

The prototype wins where it disagrees with a doc. Decisions so far:

1. **F4 budget chips**: in `docs/screens.md`, not in the prototype. Decision: follow the prototype (no chips).
2. **SRP age**: docs say 21 to 40; the prototype asks "40 or below" and doesn't check SJKP's 18+. Follows the prototype.
3. **Budget tooltip and formula line with savings-only commitments**: the prototype says "30% wants ÷ days"
   even when a savings amount makes the daily come from "left after bills and savings". Fixed so the maths matches.
4. **Hub greeting**: no name is collected, so it says "Hi, {calling}!" / "Hai, {calling}!" with a calling picked
   at random per launch (Master, Boss/Bos, Geng, Sifu, ...). The prototype says "Hey there!" / "Hai!". Decided.
5. **Hero spacing**: the prototype renders "RM35" (the space collapses inside the rolling digits). Shown as "RM 35".
6. **Export / import**: not in the prototype UI. Two links above the delete link on the hub. Plain JSON (decided).
7. **Fonts**: bundled (decided), not loaded from Google Fonts like the prototype.
8. **Now / After labels**: kept on one line; the prototype wraps "Sekarang RM / 35" in BM.

### BM strings written for this build (not in docs/strings-en-bm.json, please review)
`afford.notYet` Belum lagi · `hub.export` Eksport sandaran · `hub.import` Import sandaran ·
`hub.restored` Pelan dipulihkan dari sandaran · `hub.notBackup` Fail tu bukan sandaran BajetJe. ·
`car.emptyTitle` Tengok kesannya pada bulan awak · `car.emptyBody` · `car.emptyLink` Tambah komitmen → ·
`car.swapAria` · `house.belowLimit` bawah had 30% awak · `house.rateAria` Kadar faedah · `house.na` t/a ·
`elig.netNote` · `elig.income` (the prototype leaves this reason in English) · `gauge.aria` · `hub.stripAria` ·
`commit.fallbackName` komitmen · callings in `CALLINGS`. All in `src/i18n/messages.ts`.

## Polish on top of the prototype

Kept inside the design system (see `docs/DESIGN.md`); copy, numbers and behaviour unchanged.

- Dot removed from the Commitment Health status pill (the pill colour already carries the state).
- Cards get a faint top inner highlight; tooltip and toast use a layered, diffused shadow.
- Headings use balanced wrapping and body copy avoids orphans.
- Swipe rows show the coral backing only while swiping or open, so it no longer fringes row corners.
- "Add to" buttons and quick-add chips use the doodle plus icon. Links keep the text arrow (the doodle set has no arrow).
