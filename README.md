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
npx cap sync android  # copy the build into the Android app (Capacitor), then open android/ in Android Studio
```

Optional: set `VITE_RATES_URL` to a static URL serving a newer `rates.json` (same shape as
`src/engine/rates.json`). Rates only come down; nothing personal goes up.

## Stack

Vite + React + TypeScript + Tailwind v4, Vitest. Android app via Capacitor (`android/`). Installable PWA on the web (hand-written `public/sw.js`,
offline app shell). No backend, no analytics, no runtime font or CDN requests (fonts bundled in
`public/fonts`, SIL OFL).

## Layout

```
src/engine/      Pure TS engine ported from the prototype (payroll, cycle, plan, car, home, eligibility)
                 rates.json = versioned rates; engine.test.ts = golden-value tests
src/i18n/        EN + BM catalogue (messages.ts, ICU-style placeholders), formatter, useT() hook
src/brand/       assets.ts generated from brand/ by `node scripts/gen-brand.mjs` (doodle icons, doodles, logo)
src/state/       store.ts (app state), storage.ts (encrypted IndexedDB), router.ts
src/components/  RollingNumber, SplitCard, BudgetChips, CommitmentRow, EligibilityCheck, shared ui
                 (Segmented, LangSwitch, Toggle, ChoiceChips with pop, Reaction, Gauge, Toast)
src/screens/     F0 Splash, F0b Welcome, F1 Salary, F2 Plan (Simple.tsx = F2s, Detailed in Plan.tsx),
                 F3 Commitments, F4 Health, F5 Car, F6 House
src/styles/      Tokens (brand/tokens, Tailwind @theme) + component CSS and motion
brand/           Handover brand kit (logo, doodles, icons, tokens, generators)
prototype/       The reference prototype (source of truth)
docs/            Product, design system, voice and tone, strings, calculation rules, screens, golden values
```

## Privacy

- Plan is encrypted with AES-GCM (256-bit) and stored in IndexedDB. The key is a
  non-extractable WebCrypto key generated on the device.
- "Delete all my data from this phone" (two taps within 3 s) clears the data and the key, then shows Welcome.

## Notes from the build (prototype vs docs)

The prototype wins where it disagrees with a doc. Decisions so far:

1. **F4 budget chips**: in `docs/screens.md`, not in the prototype. Decision: follow the prototype (no chips).
2. **SRP age**: docs say 21 to 40; the prototype asks "40 or below" and doesn't check SJKP's 18+. Follows the prototype.
3. **Budget tooltip and formula line with savings-only commitments**: the prototype says "30% wants ÷ days"
   even when a savings amount makes the daily come from "left after bills and savings". Fixed so the maths matches.
4. **Hub greeting**: no name is collected, so it says "Hi, {calling}!" / "Hai, {calling}!" with a calling picked
   at random per launch (Master, Boss/Bos, Geng, Sifu, ...). The prototype says "Hey there!" / "Hai!". Decided.
5. **Hero spacing**: the prototype renders "RM35" (the space collapses inside the rolling digits). Shown as "RM 35".
6. **Export / import**: listed in the old `CLAUDE.md` build order but not in the prototype. Built, then removed on request.
7. **Fonts**: bundled (decided), not loaded from Google Fonts like the prototype.
8. **Now / After labels**: kept on one line; the prototype wraps "Sekarang RM / 35" in BM.

9. **Welcome (F0b) vs Figma 106:355**: `docs/WELCOME_TASK.md` says headline 28/34 and lede 15/22; the prototype and
   Figma use 24/30 and 13/20, so those are used. Figma also draws the doodle 350 wide, the info icon white and the privacy
   line left aligned; the prototype and the task doc both say doodle max 330, amber icon, centred privacy, so those stay.

10. **Simple mode (F2s)**: the default hub view, as in the prototype. Like the prototype, "Delete all my data" is only
    in Detailed, and the prototype's "Replay intro" link is not shipped (screens.md says so).
11. **Rolling digits**: a re-render during a roll used to strip the animation (the prototype redraws by hand, so it never
    hit this). RollingNumber now compares against the previous value, so rolls always finish.

12. **Extra money (product decision)**: the prototype deducts a 20% savings target before "for yourself", so Health could
    show RM 0 while Simple showed RM 1,000+. Now every screen uses one number: take-home minus everything listed
    (needs, wants, savings entered). Unfilled savings stay in extra money; the 20% is a tip. Daily = extra / days, secondary.
    Golden values still pass for every field; only `daily` follows the new rule (`docs/calculation-rules.md`).
13. **Renaming defaults**: every commitment name is editable ("Room rent" -> "House rent"). A renamed default keeps its
    icon and category and is no longer auto-translated.
14. **Health layout (product decision)**: answer first. Extra money is the lime hero, then one card with commitment
    health (%, verdict, gauge) and total commitments. Breakdown, debt-only ratio and the salary waterfall sit behind a
    tap-to-expand "Where your salary goes" row (height eases 260 ms, chevron turns; closed content is inert).

### BM strings written for this build (not in docs/strings-en-bm.json, please review)
`afford.notYet` Belum lagi ·
`car.emptyTitle` Tengok kesannya pada bulan awak · `car.emptyBody` · `car.emptyLink` Tambah komitmen → ·
`car.swapAria` · `house.belowLimit` bawah had 30% awak · `house.rateAria` Kadar faedah · `house.na` t/a ·
`elig.netNote` · `elig.income` (the prototype leaves this reason in English) · `gauge.aria` · `hub.stripAria` ·
`commit.fallbackName` komitmen · `health.whereHint` · `health.total` · `health.ofTakeHome` · `health.manageLink` · callings in `CALLINGS`. All in `src/i18n/messages.ts`.

## Polish on top of the prototype

Kept inside the design system (see `docs/DESIGN.md`); copy, numbers and behaviour unchanged.

- Dot removed from the Commitment Health status pill (the pill colour already carries the state).
- Cards get a faint top inner highlight; tooltip and toast use a layered, diffused shadow.
- Headings use balanced wrapping and body copy avoids orphans.
- Swipe rows show the coral backing only while swiping or open, so it no longer fringes row corners.
- "Add to" buttons and quick-add chips use the doodle plus icon. Links keep the text arrow (the doodle set has no arrow).
