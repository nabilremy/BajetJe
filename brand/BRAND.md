# BajetJe brand kit

## Personality
A calm, honest older sibling who's good with money, with a doodler's sense of humour. Friendly and open, never preachy.

## Logo: Sketch B
- Hand-drawn B (pressure strokes, wobble, faint second pass) coloured in with diagonal hatching. Lime shades only.
- Files (logo/): app icon dark / light / small, mark on dark / on light, horizontal (dark, light), stacked (dark).
  PNG app icons in logo/png: 1024 down to 60; small icon 58 down to 16 (use below 48 px).
- Dark: lime/100 lines + lime/500 hatch on lime/900. Light: lime/900 lines on lime/300. Wordmark: Geist SemiBold "Bajet" lime/100 + "Je" lime/300.
- Splash: logo on ink/900 (dark mode), never on a lime background.
- Clear space: the width of one hatch gap around the mark. Do not recolour outside the lime scale, stretch, or add effects.
- Wordmark SVGs use live Geist text: outline before print or store artwork.

## Colour (tokens/tokens.css)
- ink 0-950 neutrals; lime 50-900 brand + primary; amber (wants, caution); coral (high, debt).
- UI rule 60/30/10: ink/900 base, ink/800-700 surfaces, lime/300 accent.

## Doodles
- icons/: 24 UI icons on a 24 grid (fill currentColor), including loader (spinning), sparkle (reactions), and
  save + reset (Commitments list tools, added in code from generators/icons.js; not yet in Figma).
- doodles/: welcome-doodle, commitment-health-empty, note-arrow, and the kit (coins, rm-note, jar, tingkat, payday, car, house,
  gauge, receipt, idea, sparkle, swirl, arrow, banner, speech, thinking).
- Rules: white ink on dark, one lime accent or hatch per drawing. New doodles must come from generators/engine.js so the hand matches.

## Type
Geist (UI), JetBrains Mono (numbers), Caveat (handwritten notes). See fonts.md.

## Voice
See ../docs/voice-and-tone.md. EN + BM santai. Playful reactions, calm serious moments.

## Generators (Node, no dependencies)
- generators/engine.js: the doodle hand (wobbly tapered ribbons, hatching). icons.js, kit.js, illus.js, load.js use it.
- generators/sketch-b-logo.js: the logo. Run `node -e "console.log(require('./sketch-b-logo.js').sketch('dark','',{id:'b'}))"`.
