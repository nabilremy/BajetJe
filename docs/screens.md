# Screens and acceptance criteria

Flow: F1 Salary -> F2 My Plan (hub) -> F3 Commitments -> F4 Commitment Health; F2 -> F5 Car; F2 -> F6 Housing.
Back navigation returns to the previous screen. Screen transition: push 28 px + fade, 280 ms ease-out strong.

## F1 · Salary (required, no skip)
- Segmented: Gross salary / Take-home. Gross shows auto deductions (EPF 11%, SOCSO, EIS, PCB est.) and live take-home.
- Salary field: real input over a rolling-digit display. New digits rise 0.6 em, 180 ms; backspace instant.
- Take-home rolls only changed digits, 30 ms stagger, after a 200 ms typing pause.
- Payday chips: 1st, 7th, 15th, 25th, Last day, Other (1-31 picker). Required.
- CTA "See my 50/30/20" disabled until salary and payday; label "Pick your payday to continue" when only payday is missing.
- "Try RM 3,500" chip when empty. Copy: "It stays on this phone and is never uploaded."

## F2 · My Plan (hub)
- Header: "Pay cycle {prev} to {next-1} · N days to payday". Privacy pill "On device".
- Take-home card with Edit (to F1).
- Hero: "RM {daily} a day" (lime). Formula line under it. Month strip = pay cycle bars, today highlighted.
- Budget chips: "RM x a week" and "RM y budget till payday", each with an info tooltip showing
  source ÷ cycle days = daily × days = total, and "A plan, not your bank balance".
- 50/30/20 split: ONE container for all views. Header = title + info icon + 3-icon view toggle (Bars, Jars, List).
  Toggle thumb slides 240 ms; body height eases 260 ms; new view fades up 6 px, bars/jars grow in, 50 ms stagger.
- KL warning (amber) when needs < RM 1,930, link to commitments.
- Commitment health card: empty state (illustration + "Add my commitments" primary) or filled state
  (% , verdict pill, gauge, "RM x left in your needs budget" or "Needs over by RM x").
- Afford tiles: Car (comfortable up to) and Home (rent up to).
- Footer: legal line + "Delete all my data from this phone" (two taps within 3 s).
- Hub reveal animation once per session.

## F3 · Commitments
- Three sections: Needs 50%, Wants 30%, Savings 20%. Each: used / budget, meter, note, rows, "+ Add to x", quick-add chips.
- Notes: "RM x left in needs"; over budget (amber): "Over by RM x. This comes out of your wants. You can still add more."
  Savings: "RM x more goes to savings automatically to reach 20%." or "On track".
- Rows: icon, name, category, Debt tag, inline amount input (digits only, formatted).
- Delete: swipe left reveals 84 px coral Delete (vertical drags still scroll). Edit mode shows red minus that reveals Delete.
  Row collapses 220 ms, Undo toast for 4 s.
- "Fill with an example" fills presets. Sticky footer: Fixed commitments (needs + wants), % of take-home, meter with 50% line,
  CTA "Check my commitment health" (enabled when any amount > 0).

## F4 · Commitment Health
- Hero: ratio % in verdict colour + verdict pill (springs 0.9 to 1). Copy depends on Healthy / Caution / High.
- Breakdown (top 4 + Others, debt in coral), gauge with zones (marker sweeps 650 ms), debt-only ratio.
- After commitments and savings: "RM x a day", budget chips with tooltips. Salary waterfall. "Back to my plan".

## F5 · Car
- Hero: safe budget (all-in <= 20% of take-home). Down payment chips 0 (Full loan), 10, 20, 30%.
- Full loan shows amber note (most banks lend up to 90%; graduate schemes) with the 10% comparison.
- Price zones (Comfortable / Tight / Stretch too far), "Jump to" chips: Comfortable max, Max (top of Tight).
- Price slider + verdict card (Comfortable / Tight / Unaffordable) with true monthly cost breakdown and upfront cash.
- "If you buy it": commitments now vs after, daily now vs after, toggle "Stop paying RM x for transport".

## F6 · Housing
- Hero: rent / mortgage budget = 30% of take-home. Current rent gauge (0-30 healthy, 30-40 caution, >40 high).
- Rent / Buy segmented. Buy: max price, loan, instalment, deposit; rate chips 3.5 / 4 / 4.5%; down payment 0 / 10 / 20%.
- Full loan (0%) opens the eligibility check (first home, Malaysian, aged 40 or below; income from salary).
  Eligible -> 0% maths, price cap RM 500k, deposit timeline hidden, conditions note. Not eligible -> stays 10% with reason.
- Deposit timeline (years) from savings; "If you buy at this price" impact.
