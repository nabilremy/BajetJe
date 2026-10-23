# Commitments card: inline breakdown (build spec)

Status: ready to build. Source of truth: `prototype/bajetje-prototype.html` (`commitCard`, `toggleCBreak`, CSS `.ccard`, `.disc`, `.cbody`).
Figma: flow page 63:2, stage 2. Closed in every Filled-state frame, open in "F2 · State · Commitments breakdown open" (179:1848).

## Why
Users want to glance at what makes up their commitments without entering edit mode. Reading happens on the dashboard,
editing stays in F3 (pencil). Progressive disclosure: the total first, the parts one tap away.

## Anatomy
- Head: overline "Commitments", value `RM {commit}` (JetBrains Mono Medium 20), pencil icon button (-> F3, label "Edit commitments").
- Disclosure button under the value (replaces the helper line): "See breakdown" · "{n} items" + chevron (16 px, ink/300).
  Text button, 13 px, ink/300; count ink/500. Hit area at least 44 px tall (vertical padding, negative margin so the card does not grow).
  `aria-expanded`, `aria-controls="cbody"`. Open label: "Hide breakdown", chevron rotated 180°.
- Body (only when open): 1 px ink/700 top divider, 14 px padding top, groups 14 px apart:
  - Group head: 8 px square dot (radius 2) in bucket colour (needs ink/400, wants amber, savings lime), overline label, group total
    right (mono 13 medium, ink/50).
  - Items: indented 18 px, name Body/S ink/300, amount mono 13 ink/300, sorted by amount high to low. Only items with an amount.
  - Groups: NEEDS, WANTS, SAVINGS YOU SET ASIDE. Skip a group with no items. Savings gets the note
    "Not a commitment. It comes off your extra money." (Caption, ink/500), because Extra money = take-home − commitments − savings.
- Lump-sum users (typed one total, no list): no disclosure. Keep the helper "In total: rent, loans, bills, family..." and the pencil.

## Motion
| Event | Motion |
|---|---|
| Open | card height eases h0 to h1, 300 ms ease-out-strong (overflow hidden only while it runs); rows fade up 6 px, 240 ms, 60 ms delay, 25 ms stagger (cap 8); chevron rotates 0 to 180°, 240 ms |
| Close | card height eases back, 220 ms ease-out-strong; body fades out 120 ms; hide body when done |
| Press | disclosure scale 0.96 + opacity 0.7, 120 ms |
| Interrupt | a tap mid-animation cancels running animations and starts from the current height |
| Reduced motion | open and close instantly, chevron still flips |
The card below (Extra money) and the rest of the page move down with the height ease; the flow spine stretches with it.
The open state is remembered (`cbOpen`).

## Copy
| EN | BM |
|---|---|
| See breakdown | Lihat pecahan |
| Hide breakdown | Sorok pecahan |
| {n} item / {n} items | {n} item |
| Savings you set aside | Simpanan yang diasingkan |
| Not a commitment. It comes off your extra money. | Bukan komitmen. Ia ditolak daripada duit lebih. |

## Acceptance criteria
- [x] Group totals equal the sums of their items; Needs + Wants = the card value.
- [x] Opening and closing never snaps; content below glides.
- [x] Choice survives reload; EN/BM switch keeps the state and translates all strings.
- [x] Lump-sum state shows no disclosure.
- [x] Disclosure has a 44 px hit area and is reachable by keyboard; Enter/Space toggles; screen reader announces expanded/collapsed.
