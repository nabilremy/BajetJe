# Screens, behaviour and acceptance criteria (current)

Flow: F0 Splash -> F0b Welcome (first launch only) -> F1 Salary -> F2 My Plan (hub, Simple mode by default; Detailed on demand)
F2 -> F3 Commitments -> F4 Commitment Health ; F2 -> F5 Car ; F2 -> F6 Housing (F6b = full-loan check state).
Returning users with salary + payday open straight on F2. "Delete all my data" returns to F0b.
Screen transition: push 28 px + fade, 280 ms ease-out strong. Back reverses. All copy exists in EN and BM (see voice-and-tone.md).

## F0 · Splash (every launch, 1.6 s, tap to skip)
- Dark mode background ink/900 (same as the app, not lime). Wordmark lime/100 + "Je" lime/300, tagline ink/500,
  privacy line lime/500 with a white doodle shield, pinned near the bottom. Matches Figma node 105:475.
- Sketch B logo: lines appear (scale 0.94 to 1, 420 ms), hatching "colours in" left to right (clip wipe 650 ms from 0.38 s),
  wordmark rises at 0.55 s, tagline "Masuk gaji je, bajet siap." at 0.75 s, "Your salary never leaves this phone" at 0.9 s.
- Reduced motion: static, fades out after 0.8 s.
- Prototype only: "Replay intro (splash + welcome)" link in the My Plan footer re-plays both without wiping data. Do NOT ship it.

## F0b · Welcome (first launch)
- Top bar: logo mark + wordmark, EN | BM switch (right).
- Doodle illustration (brand/doodles/welcome-doodle.svg): characters rise staggered, bob 3 px on 3.2-3.6 s loops,
  thought bubbles pop and float, "?" wiggles, eyes blink ~4.6 s, pie spins in, a lime coin drops into the jar once.
- Headline "Know what your gaji can do." + one line value.
- Disclaimer card always visible: estimates only, not a licensed financial adviser.
- CTA "I understand, let's start" / "Faham, jom mula!" -> F1. Privacy line under it.

## F1 · Salary (required, no skip)
- Segmented Gross / Take-home (sliding thumb). Gross shows auto deductions (EPF 11%, SOCSO, EIS, PCB est.) and live take-home.
- Salary field: real input over rolling digits; new digits rise 0.6 em (180 ms), backspace instant.
- While typing, take-home hint shows "Crunching the numbers..." / "Kira jap..." then rolls changed digits (30 ms stagger) after 450 ms.
- Payday chips: 1st, 7th, 15th, 25th, Last day, Other (1-31). Required. Selected chip pops.
- CTA disabled until salary + payday ("Pick your payday to continue" when only payday missing).
- On tap: button -> Loading (doodle loader spins 900 ms linear, label "Crunching..." / "Kira jap...", taps ignored) and a white
  handwritten note (Caveat Bold 26, doodle arrow) springs up from behind the button to sit fully above it, rotated -6 deg.
  Line = random from the take-home tier pool, never the same twice in a row. Navigate to F2 after 1.3 s (0.5 s reduced motion).

## F2s · My Plan, Simple mode (default)
- For people who just want three numbers. Header + EN|BM switch, then a Simple | Detailed segmented (sliding thumb, remembered).
- Switching Simple <-> Detailed moves like the chart view toggle: the thumb slides (also when using "See the full breakdown"),
  header and switch stay still, everything below fades up 6 px with a 45 ms stagger, bars grow from the left, and the hero
  number rolls in digit by digit. Scroll returns to top. Reduced motion: instant swap.
- Equation card: Take-home (edit -> F1)  −  Commitments  =  Left after commitments.
  - Commitments: if no items are listed, an inline "RM ___" field for the monthly total (updates live); if items exist,
    shows their total with an edit icon -> F3. A typed total is used until the user lists items (then the list wins).
  - Result: big lime "RM x" (rolling digits; coral if negative), "≈ RM y a day for N days", health pill "46% committed · Healthy",
    reaction chip (same tiers as the hub).
- One bar: commitments vs left (%), labels under it. "List them one by one →" (when no items). Tip card: save 20% first
  ("You'd still have about RM z a day"). Secondary button "See the full breakdown" -> Detailed. Legal line.
- Figma: F2s 122:585. BM strings included.

## F2 · My Plan, Detailed mode
- Same Simple | Detailed switch under the header (Detailed selected).
- Header: "Hey there!" + "Pay cycle {start} to {end} · N days to payday"; EN | BM switch right.
- Take-home card with Edit (chip) -> F1.
- Hero "RM {daily} a day" (lime) + reaction chip with doodle sparkle (tiers in voice-and-tone.md), formula line, pay-cycle month strip.
- Budget chips "RM x a week" / "RM y budget till payday" with info tooltips (breakdown + "A plan, not your bank balance").
- 50/30/20 split: one container for all views; header = title + info + View toggle (Bars / Jars / List, sliding thumb).
  Switching: body height eases 260 ms, new view fades up 6 px, bars/jars grow in (50 ms stagger). Choice remembered.
- KL warning (amber) when needs < RM 1,930.
- Commitment health card: empty = doodle illustration (receipts -> gauge with "?" -> jar) + primary "Add my commitments";
  filled = % + verdict pill + gauge + "RM x left in your needs budget" / "Needs over by RM x".
- Afford tiles Car / Home (press state). Footer legal + "Delete all my data from this phone" (two taps within 3 s).
- Reveal animation once per session.

## F3 · Commitments
- Sections Needs 50% / Wants 30% / Savings 20%: used / budget, meter, note, rows, "+ Add to x", quick-add chips.
- Notes: "RM x left in needs" (+ "Plenty of room!" when under half used); over budget amber "Over by RM x. This comes out of
  your wants. You can still add more."; savings "RM x more goes to savings automatically to reach 20%." / on track.
- Rows: doodle icon, name, category, Debt tag, inline amount. Swipe left reveals 84 px coral Delete (vertical drags scroll);
  Edit mode shows red minus. Row collapses 220 ms, Undo toast 4 s.
- "Fill with an example". Sticky footer: fixed commitments (needs + wants), % of take-home, meter with 50% line, CTA.

## F4 · Commitment Health
- Hero % in verdict colour + verdict pill (spring 0.9 to 1) + reaction chip ("Nice, you're in good shape!" / "Mantap, sihat ni!" etc.).
- Breakdown (top 4 + Others, debt coral), gauge with zones (marker sweeps 650 ms), debt-only ratio.
- After commitments and savings: "RM x a day", budget chips. Salary waterfall. "Back to my plan".

## F5 · Car
- Safe budget hero; Down payment chips 0 (Full loan) / 10 / 20 / 30%; full-loan amber note with 10% comparison.
- Price zones, "Jump to" chips (Comfortable max, Max), slider, verdict card, true monthly cost breakdown, upfront cash.
- "If you buy it": commitments now vs after, daily now vs after, Toggle "Stop paying RM x for transport" (knob springs).

## F6 · Housing (+ F6b full-loan check)
- Rent / mortgage budget = 30% of take-home; current rent gauge; Rent / Buy segmented (sliding thumb).
- Buy: max price, loan, instalment, deposit; rate chips; down payment 0 / 10 / 20%.
- Full loan (0%) opens Eligibility Check (first home, Malaysian, aged 40 or below; income from salary).
  Eligible -> 0% maths, price cap RM 500k, timeline hidden, conditions note. Not eligible -> stays 10% with reason.

## Every control moves (global rule)
Implementation note for sliding thumbs when a tap re-renders the screen (Simple|Detailed, EN|BM, Gross|Take-home, Rent|Buy, toggle):
render the new state, then place the thumb at the OLD position with transitions disabled, commit one frame, re-enable
transitions and set the NEW position on the next frame (double requestAnimationFrame). Without the committed frame the thumb
snaps. On EN|BM change the header and switch stay still while the rest of the screen fades up (same as Simple|Detailed).
Buttons press 0.97 (120 ms); segmented + EN/BM thumbs slide from the old option (260 ms ease-out strong, FLIP across re-renders);
chips press 0.94 and the newly selected one pops (spring 340 ms); toggle knob springs; tiles / icon buttons / links press-scale.
Reduced motion: no pops, thumbs jump, press feedback stays.
