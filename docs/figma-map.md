# Figma map (file RiniBhPH0gRrfdBSOrJk0K)

Connect via the Figma MCP (.mcp.json), then use get_design_context / get_screenshot on these nodes.

| What | Page (id) | Key nodes |
|---|---|---|
| All screens + flow arrows + spec cards | Duit · Salary Routine Flow (63:2) | F0 Splash, F0b Welcome 106:355, F1 Salary 64:2, F1 Loading, F2 V2 dashboard: empty 150:1724, filled 150:1985, number small 169:887 (old hubs 76:13 / 122:585 superseded), F2 Hub BM, F3 Commitments 65:2, F4 Health 66:2, F5 Car 70:2, F6 Housing 71:13, F6b Full loan 90:350 |
| Logo + brand boards | BajetJe · Brand (105:2) | Logo set 105:55 |
| Doodle kit | BajetJe · Doodles (113:2) | Doodle set |
| Icons | Duit · Icon (86:2) | Icon set 86:72 |
| Button | Duit · Button (86:3) | 86:82 |
| Chip, Budget Chips, Toggle, Reaction Note | Duit · Chip (86:5) | Chip 86:129, Budget Chips 88:179 |
| Status Pill / Segmented / Tooltip / Field | 86:6 / 86:7 / 86:8 / 86:9 | 86:109 / 86:141 / 86:185 / 86:197 |
| Commitment Row / Afford Tile | 86:10 / 86:11 | 86:243 / 86:283 |
| Eligibility Check / View Toggle / Language Switch | 90:2 / 94:75862 / 115:2 | 90:87 / 94:75899 / 115:15 |
| Foundations (colour, type, layout) | Foundations · Colour/Typography/Layout | variables "Duit/Primitives", "Duit/Tokens", "Duit/Product" |

## Flow page "Duit · Salary Routine Flow" (63:2), Section 1: stage 2 rebuilt on the V2 dashboard (24 Oct)
- Stage 2 · YOUR PLAN, left to right: F2 · My Plan · Empty 150:1724 (x 810) + spec, F2 · My Plan · Filled 150:1985 (x 1620),
  State · Number small 169:887, State · Number small + payday tip 173:1312, State · Payday tip open 173:979, Spec · F2 · My Plan · Filled.
- Arrows: F1 "See my 50/30/20" -> Empty; Empty fan-out -> F3 / F5 / F6; F4 "Back to my plan" -> Filled; Filled "Tap collapse" / "Tap expand"
  <-> Number small; Number small "Tap till payday" / "Tap again" <-> Number small + tip; Filled "Tap till payday" -> Payday tip open.
- Commitments breakdown open 179:1848 (x 3820), reached from Filled by "Tap See breakdown"; Filled spec moved to x 4270.
- Every Filled-state frame now has "Commitments card" with Head, Disclosure and a hidden Breakdown layer (Smart Animate fades it).
- Motion detail row (x 3300, y 2216): Collapse step 173:56258, Expand step 173:56439 (Figma only), motion spec card.
- Reference cards (Rules colour / UX laws / motion, digit-roll storyboard) moved right of the flow (x 5000).
- Old F2 hub, F2 BM, F2s Simple frames and their specs moved to the "Archive" page (170:2511).
- Pill layers: "Status Pill · top" / "Status Pill · inline" so Smart Animate fades instead of sliding.
