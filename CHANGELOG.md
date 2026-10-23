# Changelog (what changed since the first handoff pack)

## Latest: Commitments breakdown (24 Oct)
- Commitments card gets "See breakdown": read-only list by Needs, Wants and Savings set aside, inline on the dashboard.
  Editing stays on the pencil (F3). Spec: docs/commitments-breakdown.md. New icon brand/icons/chev.svg.

## Extra money polish (24 Oct)
- **Pill hop**: on collapse/expand the health pill fades out in place and pops in at its new place (100 ms out, 260 ms spring in),
  instead of sliding across the number. Chips and split bar now glide with the card. Spec: docs/extra-money-motion.md.
- **Tooltip no longer cut off**: card clips only while animating and sits above the next section. Collapsing closes an open tooltip.
- Figma: stage 2 of the flow page rebuilt on V2 with all states, arrows and specs (docs/figma-map.md).

## V2 dashboard (replaces Simple and Detailed)
- One My Plan layout for everyone with clear hierarchy: pay-cycle strip, then a connected money flow
  (Take-home -> Commitments -> **Extra money**), then 50/30/20, afford tiles, tip. Spec: docs/screens.md "F2 · My Plan (V2)".
- Empty state (salary only) shows 50/30/20 and the commitment-health invitation inside the flow.
- **Extra money** card: health pill, big lime number, week / till-payday chips with tooltips, 3-part split bar.
- **Collapse** button makes the number smaller with a FLIP shrink, height ease and icon turn; remembered.
- Removed: Simple | Detailed switch, daily-budget hero, reaction chip on the hub, KL warning card. New icons: brand/icons/shrink.svg, grow.svg.

Newest first. If you built from an earlier pack, apply everything below; TASKS.md turns it into steps.

## Brand and identity
- Product renamed **Duit -> BajetJe** everywhere (title, copy, splash, legal lines, storage keys may stay).
- New logo **Sketch B**: hand-drawn B coloured in with hatching, lime shades only. Files in brand/logo (SVG + PNG app icon sizes).
  Replaces the earlier "split b" and "Si Gaji" logos.
- Brand style is now **doodle**: every icon (22 incl. loader) and illustration is hand-drawn (brand/icons, brand/doodles).
  Replaces all previous line icons and the old commitment-health illustration.
- Handwritten reaction font **Caveat Bold** added (notes only).

## Voice and language
- Voice is **friendly and open** ("Hey there!", "First, how much is your gaji?").
- **EN | BM switch** (Welcome top bar + My Plan header), remembered on device. Full BM santai string set in docs/strings-en-bm.json.
- **Reactions**: daily-budget chip, bucket "Plenty of room!", health chip, "Crunching..." / "Kira jap..." while calculating.
- **Salary submit note**: random line per take-home tier, never repeated twice in a row ("Wow, nak sikit?", "Percaya pada rezeki!"...).

## Screens and flow
- **Simple mode (new default)** on My Plan: Take-home − Commitments = Left after commitments, one bar, one tip, with an inline
  total-commitments field. **Detailed** is the full breakdown. Switch (Simple | Detailed) on both, remembered on device; switching animates like the chart view toggle (thumb slides, content fades up, bars grow, hero digits roll).
- New **F0b Welcome** (first launch): doodle animation, disclaimer card, "I understand, let's start".
- **F1**: payday is required; CTA has a **Loading** state (doodle loader + "Kira jap...") and the white handwritten note above it.
- **F2**: split card is one container for all views with a **View toggle** (Bars/Jars/List) in its header; floating picker removed.
  Budget chips have **tooltips** explaining daily x days and "a plan, not your bank balance". Hub header has the EN|BM switch
  (the "On device" pill was removed). "Delete all my data from this phone" in the footer.
- **F3**: commitments grouped into **Needs / Wants / Savings** with per-bucket meters; over-budget warns, never blocks;
  **swipe-to-delete** + Edit mode + Undo toast. Savings rows count toward the 20% target.
- **F5 Car**: down payment 0/10/20/30% incl. **full loan** note; "Jump to" chips; transport checkbox replaced by a **Toggle**.
- **F6 Housing**: down payment 0/10/20%; **first-home eligibility check** for 0% (SRP / SJKP rules); F6b state.
- **Splash** animates the Sketch B logo (lines, then hatch wipe) on a **dark ink/900 background** (not lime); tagline ink/500, privacy line lime/500.

## Maths
- Pay cycle is payday-to-payday (not calendar month). Daily budget is floored once; week/till-payday derive from it.
- Buckets: fixed commitments = needs + wants; savingsOut = max(20% target, savings rows).
- Golden values regenerated: docs/golden-values.json.

## Motion
- **Every control moves**: sliding thumbs (segmented, EN|BM, view toggle), chip select pop, toggle knob spring, press scale on
  all buttons/tiles/links. Re-renders animate from the previous state (FLIP).
