# BajetJe

Salary planner for Malaysian first-jobbers. Salary + payday in, a full monthly plan out:
take-home pay, 50/30/20 split, daily budget, commitment health, safe car and home budget.
No tracking, no login, nothing leaves the phone.

## Source of truth (read in this order)
1. prototype/bajetje-prototype.html  - THE reference. Match its behaviour, copy, numbers and motion exactly.
   Open it in a browser and click through every screen before building. Its engine is exposed on
   `window.__bajetje` (payroll, cycle, calc, carAllIn, carLimit, home, eligibility).
2. @docs/screens.md            - screen-by-screen behaviour and acceptance criteria
3. @docs/calculation-rules.md  - every formula
4. docs/golden-values.json     - expected outputs generated FROM the prototype. Tests must match these.
5. @docs/design-system.md      - tokens, components, motion
6. @docs/product-foundation.md - why: users, principles, scope, metrics
7. Figma (via MCP, see .mcp.json): file RiniBhPH0gRrfdBSOrJk0K, page "Duit · Salary Routine Flow",
   components on the "Duit · ..." pages. Figma still says "Duit" (old name); the product is BajetJe.

If the prototype and a doc disagree, the prototype wins; flag the mismatch to me.

## How to work
- Plan first, then build in this order: (1) engine + tests against golden-values.json, (2) design tokens
  and components, (3) screens in flow order F1 to F6, (4) motion, (5) storage, export/import, wipe.
- Port engine functions from the prototype verbatim into typed modules before refactoring.
- After each screen, compare against the prototype side by side and list any differences.
- Ask before adding dependencies, a backend, analytics, or anything that sends data off the device.

## Product rules (non-negotiable)
1. Answer first: each screen leads with the number the user came for.
2. No expense tracking, ever.
3. Honest over flattering: warn, never block (e.g. needs over 50% is allowed, shown in amber).
4. Show the maths: every derived number has a formula line or tooltip. A plan is not a balance.
5. Malaysian by default: EPF, SOCSO, EIS, PCB, pay cycles, Belanjawanku, SRP / SJKP.
6. Private by design: encrypted on-device storage, no account, no backend database.
7. Calm: one lime accent (60/30/10), UI motion under 300 ms, reduced-motion fallbacks.

## Copy rules
- NEVER use the em dash character anywhere (code, comments, UI copy, docs).
- Plain, kind, honest, lightly Malaysian. Every money output is an estimate:
  "Estimates only. Not financial advice."

## Tech direction (confirm with me before scaffolding)
Mobile-first app. Pure TypeScript engine in src/engine with unit tests. Rates in a versioned JSON
bundled with the app and refreshed from a static URL. Encrypted local storage.
