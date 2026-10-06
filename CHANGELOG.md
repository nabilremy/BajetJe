# Changelog (what changed since the first handoff pack)

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
