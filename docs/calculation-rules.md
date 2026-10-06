# Calculation rules (v1)

Source of truth for the engine. The HTML prototype (prototype/bajetje-prototype.html) implements
every rule below and exposes them on window.__bajetje; expected outputs are in docs/golden-values.json; port its functions (`payroll`, `cycle`, `calc`, `carAllIn`, `carLimit`, `home`,
`eligibility`) into typed, unit-tested modules. All outputs are estimates.

## Take-home (gross mode)
- EPF employee: ceil(gross x 11%)
- Wage bracket midpoint: floor((gross - 0.01) / 100) x 100 + 50, max 5,950 (ceiling RM 6,000)
- SOCSO = midpoint x 0.5% ; EIS = midpoint x 0.2%  (RM 3,500 -> 17.25 and 6.90)
- PCB (estimate): chargeable = 12 x gross - min(12 x EPF, 4,000) - 9,000 - min(12 x (SOCSO+EIS), 350)
  Brackets: 0-5k 0%, 5-20k 1%, 20-35k 3%, 35-50k 6%, 50-70k 11%, 70-100k 19%, 100-400k 25%,
  400-600k 26%, 600k-2m 28%, above 30%. Rebate RM 400 if chargeable <= 35,000. Monthly = tax / 12.
- Take-home mode: user enters net directly; no deductions shown.

## Pay cycle
- Payday: day 1-31 or "last". If the day doesn't exist in a month, use the last day.
- Cycle = last payday (inclusive) to next payday (exclusive). days = next - prev.
- On payday itself, a new cycle starts. Must handle year rollover.

## Split and daily budget
- needs = round(net x 50%), wants = round(net x 30%), savings = net - needs - wants
- KL warning when needs < RM 1,930 (EPF Belanjawanku, single, Klang Valley)
- Commitments belong to a bucket: needs, wants or savings
- needsC, wantsC, savC = sums per bucket; fixed commitments = needsC + wantsC
- savingsOut = max(savings target, savC)
- leftForYou = net - fixed commitments - savingsOut
- Daily (no amounts entered) = floor(wants / cycle days)
- Daily (any amount entered) = max(0, floor(leftForYou / cycle days))
- Week = daily x 7 ; budget till payday = daily x days left. Always from the floored daily.
- Bucket over budget is allowed: needs overflow is described as coming out of wants.

## Commitment health
- ratio = fixed commitments (needs + wants) / net: <= 50% Healthy, 50-65% Caution, > 65% High
- debt ratio = commitments tagged Debt / net (shown separately; <= 30% healthy, <= 40% caution)
- Warn, never block entries.

## Car
- Loan = price x (1 - down), down in {0, 10, 20, 30}%, 9 years, ~3% flat
- Instalment = loan x 1.27 / 108
- Insurance and road tax = price x 2.5% / 12 + 20 ; petrol 150 ; servicing 50
- All-in = instalment + insurance + petrol + servicing
- Verdict by all-in / net: <= 20% Comfortable, <= 25% Tight, else Unaffordable
- Safe budget = (net x 20% - 220) / ((1 - down) x 1.27 / 108 + 2.5% / 12); Max uses 25%
- 0% down: warning (most banks lend up to 90%; 100% mainly graduate schemes) + 10% comparison
- Impact: commitments after = commitments - transport (if user swaps) + all-in

## Home
- Instalment budget = net x 30%; 35 years; rate 3.5 / 4 / 4.5%
- Loan = instalment x (1 - (1 + r)^-420) / r, r = rate / 12
- Price = loan / (1 - down), down in {0, 10, 20}%; deposit = price x down
- Deposit timeline months = ceil(deposit / savingsOut)
- 0% down only after eligibility check; price capped at RM 500,000

## First-home full-loan eligibility (indicative)
- Not first home or not Malaysian -> not eligible, stay at 10%
- Skim Rumah Pertamaku: gross <= RM 5,000 (single) and aged 21-40
- SJKP: income <= RM 11,000
- Copy must say: "Indicative only. The bank and scheme make the final decision."

## Car "Jump to" chips
- Comfortable max = floor(safe budget / 1,000) x 1,000 ; Max = floor(25% limit / 1,000) x 1,000

## Hub reactions (thresholds, copy in docs/voice-and-tone.md)
- Daily >= 100 / >= 40 / >= 20 / below. Salary submit note tiers by take-home: >= 5,000 / >= 3,000 / >= 2,000 / below.
