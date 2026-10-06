# Voice and tone

BajetJe sounds like a friendly, open older sibling who's good with money: warm, honest, never preachy.

## Principles
1. Friendly and open: talk like a person, use "you" / "awak", contractions, short sentences.
2. Honest, never shaming: say when something is tight, then say what helps ("Let's fix this together").
3. Celebrate small wins: a quick reaction when things look good ("Uish, kaya gila!").
4. Numbers stay exact; the personality lives around them, never inside them.
5. Serious moments stay calm and clear: disclaimers, loans, eligibility. No slang there.

## Languages
- English (default) and Bahasa Melayu santai (casual Malaysian Malay). Switch: Welcome screen and My Plan header (EN | BM).
- BM uses "awak", everyday words (gaji, bajet, jap, je, ni) and keeps common English loanwords people actually use
  (shopping, e-hailing, streaming, upgrade). Formal BM terms only where they're the norm (KWSP, PERKESO, LHDN, cukai).
- Glossary: Needs = Keperluan, Wants = Kehendak, Savings = Simpanan, Take-home = Gaji bersih, Gross = Gaji kasar,
  Commitments = Komitmen, Payday = Hari gaji, Down payment = Bayaran pendahuluan, Healthy / Caution / High = Sihat / Hati-hati / Tinggi.

## Reactions (micro-copy with personality)
| Moment | EN | BM |
|---|---|---|
| Take-home recalculating | Crunching the numbers... | Kira jap... |
| Daily budget >= RM 100 | Whoa, living large! | Uish, kaya gila! |
| Daily budget RM 40-99 | Plenty to go around! | Banyak lagi ni! |
| Daily budget RM 20-39 | Nice and steady. | Ok la tu, steady. |
| Daily budget < RM 20 | Tight, but doable. | Ketat sikit, boleh punya! |
| Bucket under 50% used | ...Plenty of room! | ...Banyak lagi ni! |
| Health: Healthy | Nice, you're in good shape! | Mantap, sihat ni! |
| Health: Caution | Okay, but watch it. | Boleh lagi, tapi jaga-jaga. |
| Health: High | Let's fix this together. | Jom betulkan sama-sama. |
| Start button | I understand, let's start | Faham, jom mula! |

Reactions appear as a small chip with a doodle sparkle, pop in once (spring), and never on legal or loan copy.

## Implementation
- Full EN to BM string set: docs/strings-en-bm.json (exact strings + patterns with placeholders). The prototype translates the rendered
  DOM for speed; production should use proper i18n keys with ICU placeholders, e.g. "pay_cycle": "Pay cycle {start} to {end} · {days} days to payday".
- Never use the em dash in either language.

## Salary submit notes (random per tier, never repeated twice in a row)
| Take-home | BM | EN |
|---|---|---|
| RM 5,000+ | Uish, kaya gila! · Wow, nak sikit? · Belanja kopi boleh? · Bos besar ni! | Whoa, nice one! · Can I borrow some? · Treat me to kopi? · Big money! |
| RM 3,000+ | Banyak tu! · Wow, nak sikit? · Mantap! · Ada potensi ni! | That's a lot! · Ooh, share some? · Looking good! · Nice! |
| RM 2,000+ | Ok la tu! · Percaya pada rezeki! · Sikit-sikit lama-lama jadi bukit! · Boleh punya! | Not bad! · Every ringgit counts! · Slow and steady! · We can work with this! |
| Below | Percaya pada rezeki! · Takpe, kita plan sama-sama! · Rezeki ada je! · Langkah pertama dah! | Let's make it work! · Rezeki is on the way! · Small start, big plans! · First step done! |
Teasing lines ("nak sikit?", "belanja kopi?") only appear for higher salaries, so lower earners only ever get encouragement.
