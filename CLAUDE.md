# BajetJe

Salary planner for Malaysian first-jobbers. Salary + payday in, a full monthly plan out: take-home pay, 50/30/20 split,
daily budget, commitment health, safe car and home budget. No tracking, no login, nothing leaves the phone.

## Read first
1. TASKS.md      - what to build / change, in order
2. CHANGELOG.md  - everything that changed since earlier packs (apply all if you built from an old pack)
3. prototype/bajetje-prototype.html - THE reference for behaviour, copy (EN + BM), numbers and motion. Open it in a browser.
   Its engine is exposed on window.__bajetje. If a doc and the prototype disagree, the prototype wins: flag it to me.
4. @docs/screens.md            - every screen, state and motion as acceptance criteria
5. @docs/calculation-rules.md  - every formula; tests must match docs/golden-values.json
6. @docs/design-system.md      - colour (60/30/10), type, components, doodle style, motion
7. @docs/voice-and-tone.md     - friendly, open voice; EN + BM santai; reactions; strings in docs/strings-en-bm.json
8. docs/figma-map.md           - Figma page/node map (connect Figma MCP via .mcp.json, then /mcp to authenticate)
9. brand/                      - BRAND.md, logo, icons, doodles, tokens, generators, fonts.md

## Non-negotiables
- No expense tracking. Warn, never block. Show the maths. Malaysian rules. All data on device (encrypted), no account.
- One lime accent per screen; amber/coral only for status. Doodle style for every icon and illustration (use brand assets or
  brand/generators, never generic icon sets).
- Every control moves (press, slide, pop); respect reduced motion.
- Two languages (EN, BM santai) with proper i18n keys.
- NEVER use the em dash character anywhere: code, comments, UI copy, docs, commit messages.
- Every money output is an estimate; keep the disclaimers.

## How to work
- Plan first, get approval, then build in TASKS.md order. One screen per session. After each screen, compare with the prototype
  side by side and list differences. Ask before adding dependencies, a backend, analytics, or anything that sends data off device.
