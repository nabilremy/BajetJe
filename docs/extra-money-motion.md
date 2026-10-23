# Extra money card: collapse motion and tooltip (build spec)

Status: ready to build. Source of truth: `prototype/bajetje-prototype.html` (function `toggleXSize`, CSS `.xcard`, `.tip`).
Figma: flow page 63:2, stage 2 (see docs/figma-map.md).

## Why this changed
1. The "Healthy" pill used to slide straight from above the number to beside it, flying across the big number. It now **hops**:
   a short drift and fade out, then a soft pop in at its new place. It never crosses the number and still shows direction.
2. The "a week" / "till payday" tooltip was **cut off** because the card had `overflow: hidden` (needed only for the height ease).
   The card now clips only while it is animating, and it sits above the next section so the tooltip floats over it.

## States
| State | Figma | What shows |
|---|---|---|
| Big (default) | 150:1985 | Pill above the number, number 52/60 lime |
| Small | 169:887 | Number 28/34, pill to its right (10 px gap), centred on the number |
| Big + payday tip | 173:979 | Tooltip under the chips, arrow on the tapped chip, floats over the 50/30/20 section |
| Small + payday tip | 173:1312 | Same tooltip, card shorter |
| Collapse step / Expand step | 173:56258 / 173:56439 | Figma-only in-between frames for the pill hop. Do not build as screens. |

## Collapse / expand timeline (one tap, 440 ms total)
All motion is transform and opacity, except the card height ease. Tokens: ease-out-strong `cubic-bezier(0.23, 1, 0.32, 1)`,
spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.

| t | Element | Motion | Duration | Curve |
|---|---|---|---|---|
| 0 | Number | FLIP: translate + scale from the old box to the new box | 380 ms | ease-out-strong |
| 0 | Card | height h0 to h1; `overflow: hidden` only while running | 380 ms | ease-out-strong |
| 0 | Chips row, split bar | FLIP translateY with the card | 380 ms | ease-out-strong |
| 0 | Pill (out) | at OLD place: drift 8 px in travel direction, scale 1 to 0.9, opacity 1 to 0 | 100 ms | ease-out-strong |
| 100 to 180 | Pill | hidden (lets the number pass) | 80 ms | |
| 180 | Pill (in) | at NEW place: from 12 px behind, scale 0.9, opacity 0 to rest | 260 ms | spring |
| 0 | Icon | swap shrink/grow; turn in from rotate(-90deg) scale(0.6) opacity 0 | 240 ms | spring |

Travel direction: collapsing, the pill moves right (drift +8 px, enters from -12 px). Expanding, it moves left (drift -8 px, enters from +12 px).

Rules:
- Close an open tooltip before animating (set `aria-expanded="false"` on both chips).
- Measure every part (First), toggle the class (Last), Invert with transforms, Play. Never animate font-size, top or left.
- Interruptible: a second tap during the animation starts a new FLIP from the current rendered boxes.
- Persist the choice (`xsmall` in storage). On load, render the saved state with no animation.
- Button: `aria-pressed`, label "Make the number smaller" / "Make the number bigger" (BM "Kecilkan nombor" / "Besarkan nombor").
- Reduced motion: no FLIP, no hop, no height ease. Layout switches instantly, icon swaps.

## Tooltip
- Opens on chip tap: scale 0.96 to 1 + fade, 160 ms ease-out-strong, transform-origin at the chip (`--ax` = chip left + 24 px).
- Position: absolute, 10 px under the chips row, full card content width, arrow 12 px rotated square under the tapped chip.
- Must never be clipped: `.xcard { overflow: visible; z-index: 3 }` and `.xcard .tip { z-index: 20 }`. If your card uses
  `overflow: hidden` for radius or animation, render the tooltip in a portal anchored to the chip instead.
- Close: tap the same chip, tap outside, Esc, or collapse/expand the card.
- Copy (EN): title "Your extra money until payday" / "Your extra money for 7 days"; rows "Extra money", "÷ days in this pay cycle",
  "= Daily budget", "× 7 days" or "× days left till payday", total "Weekly budget" / "Budget till payday";
  note "A plan, not your bank balance. Save part of it first if you can: 20% of your take-home is RM x." BM strings are in strings-en-bm.json.

## Acceptance criteria
- [x] Tapping collapse: the pill never overlaps the number in any frame (check frame by frame at 0, 60, 120, 180, 240, 300, 440 ms).
- [x] Pill is invisible between about 100 ms and 180 ms, then settles with a small overshoot, no bounce loop.
- [x] Chips and split bar glide; nothing jumps when the card height changes.
- [x] With the till-payday tooltip open, the whole tooltip including the note line is visible in big and small states.
- [x] Tooltip sits above the 50/30/20 section, not under it.
- [x] Collapsing with a tooltip open closes it first, with no flash.
- [x] Choice survives a reload. Reduced motion: instant switch, no errors.

## Reference implementation (vanilla, from the prototype)
```js
function toggleXSize(btn){
  S.xsmall = !S.xsmall; save();
  const card = $('#xcard', screens.plan);
  /* close an open tooltip first so nothing floats over a moving card */
  const tip = $('#tip', screens.plan); if (tip && !tip.hidden){ tip.hidden = true; screens.plan.querySelectorAll('[data-act=tip]').forEach(x=>x.setAttribute('aria-expanded','false')); }
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* FLIP: measure every moving part, switch layout, measure again, play from old to new */
  const parts = { amt: $('#xAmt', card), pill: $('.xhead .pill', card), chips: $('.tipwrap', card), bar: $('.xbar', card) };
  const first = {}; for (const k in parts) if (parts[k]) first[k] = parts[k].getBoundingClientRect();
  const h0 = card.offsetHeight;
  card.classList.toggle('small', S.xsmall);
  const last = {}; for (const k in parts) if (parts[k]) last[k] = parts[k].getBoundingClientRect();
  const h1 = card.offsetHeight;
  btn.setAttribute('aria-pressed', String(S.xsmall)); btn.setAttribute('aria-label', S.xsmall?'Make the number bigger':'Make the number smaller');
  btn.innerHTML = ic(S.xsmall?'grow':'shrink');
  if (reduce || !card.animate) return;
  const E = 'cubic-bezier(0.23, 1, 0.32, 1)', D = 380;
  const dx = k => first[k].left - last[k].left, dy = k => first[k].top - last[k].top;
  /* 1. number: travel + scale from its old box (transform only) */
  const s = first.amt.height / (last.amt.height || 1);
  parts.amt.animate([{ transform:`translate(${dx('amt')}px, ${dy('amt')}px) scale(${s})` }, { transform:'none' }], { duration:D, easing:E });
  /* 2. pill: a short hop, so it never flies across the number. It drifts 8 px the way it is heading and fades out (100 ms),
        then pops in at its new place from 12 px behind with a soft spring settle (260 ms). Total 440 ms. */
  if (parts.pill){ const x = dx('pill'), y = dy('pill'), dir = x < 0 ? 1 : -1;
    parts.pill.animate([
      { transform:`translate(${x}px, ${y}px) scale(1)`, opacity:1, easing:'cubic-bezier(0.23, 1, 0.32, 1)' },
      { transform:`translate(${x + dir*8}px, ${y}px) scale(.9)`, opacity:0, offset:100/440 },
      { transform:`translateX(${-dir*12}px) scale(.9)`, opacity:0, offset:180/440, easing:'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      { transform:'none', opacity:1 }
    ], { duration:440, easing:'linear' }); }
  /* 3. chips and split bar ride up or down with the card instead of jumping */
  ['chips','bar'].forEach(k => parts[k] && parts[k].animate([{ transform:`translateY(${dy(k)}px)` }, { transform:'none' }], { duration:D, easing:E }));
  /* 4. card height eases with the same curve; clip only while it moves so tooltips are never cut */
  card.style.overflow = 'hidden';
  const ha = card.animate([{ height:h0+'px' }, { height:h1+'px' }], { duration:D, easing:E });
  ha.onfinish = ha.oncancel = () => { card.style.overflow = ''; };
  /* 5. icon turns in */
  btn.firstElementChild && btn.firstElementChild.animate([{ transform:'rotate(-90deg) scale(.6)', opacity:0 }, { transform:'none', opacity:1 }], { duration:240, easing:'cubic-bezier(0.34, 1.56, 0.64, 1)' });
}
```
Required CSS:
```css
.xcard{gap:12px;padding:16px;border-radius:16px;overflow:visible;z-index:3}
.xcard .tip{z-index:20}
.xhead{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.xamt{font-size:52px;line-height:60px;font-weight:700;letter-spacing:-.03em;transform-origin:left top;white-space:nowrap}
.xcard.small .xhead{flex-direction:row-reverse;justify-content:flex-end;align-items:center;gap:10px}
.xcard.small .xamt{font-size:28px;line-height:34px;letter-spacing:-.02em}
```
React tip: run the measure/animate in `useLayoutEffect` keyed on `xsmall` with refs to the four parts (number, pill, chips, bar);
Motion's `layout` prop is fine for the number, chips and bar, but the pill must use the explicit hop keyframes above, not `layout`.
