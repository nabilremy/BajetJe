# Task: build the Welcome screen (F0b): it is missing

## Paste this into Claude Code
> Read WELCOME_TASK.md in full. The Welcome screen (F0b) was not implemented. First, find where the app decides its first
> screen after the splash and tell me what it does today. Then implement F0b exactly as specified here, using the files in
> welcome-handover/ (assets, reference/WelcomeScreen.tsx, reference/WelcomeDoodle.tsx, reference/welcome.css, i18n/).
> Adapt the reference code to our stack and existing components (Button, Language Switch, Icon, tokens) instead of
> duplicating them. Wire the routing rules below, then run through the acceptance checklist and report each item as pass/fail.
> Do not change any other screen. Never use the em dash character.

## What it is
First-launch screen between the Splash (F0) and Salary (F1). It sets the tone (doodle, friendly), lets people pick EN or BM,
and makes them acknowledge that BajetJe gives estimates, not licensed financial advice.
- Figma: file RiniBhPH0gRrfdBSOrJk0K, node 106:355 (page "Duit · Salary Routine Flow"). Use get_screenshot / get_design_context.
- Prototype: prototype/bajetje-prototype.html (main pack). To see it again after setup: tap "Replay intro (splash + welcome)"
  at the bottom of My Plan (prototype only, do not ship that link).

## Routing (the part most likely missing)
```
on app launch:
  show Splash (1.6 s, tap to skip)
  if state.salary && state.payday        -> My Plan        (returning user)
  else if !state.welcomed                -> Welcome (F0b)  (first launch)
  else                                   -> Salary (F1)
on Welcome "I understand, let's start":
  state.welcomed = true (persist, encrypted on device)
  replace navigation stack (no Back to Welcome)
  -> state.salary && state.payday ? My Plan : Salary
on "Delete all my data" (two taps):
  reset all state (welcomed = false)     -> Welcome
```
`welcomed` is a new persisted boolean, default false. Existing users who already have salary + payday never see it.

## Layout (top to bottom, 390 wide reference, padding 60 / 20 / 34)
1. Top bar (stays still on language change): logo mark 34 px (assets/logo-mark-on-dark.svg) + wordmark "Bajet" lime/100
   "Je" lime/300 (Geist SemiBold 17), spacer, EN | BM Language Switch (right).
2. Doodle (assets/welcome-doodle.svg, max-width 330, centred). Keep its class names; they drive the animation.
3. Headline (Heading/L 28/34) + lede (Body/M, ink/400).
4. Disclaimer card (ink/800, radius 12, padding 14): amber info icon + title (Label/S) + body (Caption, ink/400). Always visible.
5. Spacer, then sticky footer: Primary button "I understand, let's start" (52 px, full width) + privacy line with shield
   icon (Caption, ink/500, centred).
Background ink/900. One lime element only: the primary button (60/30/10 rule).

## Copy
EN and BM in i18n/welcome.en.json and i18n/welcome.ms.json (merge into the app's i18n files, same keys).

## Motion (all in reference/welcome.css)
- Entrance (once): blocks rise 10 px in sequence, 60 ms stagger, 400 ms ease-out strong.
- Doodle (first-time delight, subtle): characters bob 3 px on 3.2 / 3.6 / 3.4 s loops (out of sync), thought bubbles pop
  (spring) then float, the "?" wiggles ±7°, eyes blink every ~4.6 s, the phone pie spins in once, a lime coin drops into
  the jar once, sparkle lines twinkle.
- EN | BM: thumb slides 260 ms; the top bar stays still and everything else fades up 6 px (45 ms stagger) in the new language.
  If your switch re-renders on tap, animate the thumb from the old position (render, set old position with transitions off,
  commit one frame, then set the new position on the next frame).
- CTA: press scale 0.97 (120 ms).
- Reduced motion: no entrance, no loops, thumb jumps.

## Accessibility
- Doodle has role="img" with the translated alt text. Language switch is a group with aria-pressed buttons.
- CTA is the first focusable after the switch; the disclaimer text is real text (not an image).

## Acceptance checklist
- [ ] Fresh install: Splash -> Welcome -> (tap CTA) -> Salary. Back from Salary does not return to Welcome.
- [ ] Returning user with salary + payday: Splash -> My Plan (Welcome never shows).
- [ ] Delete all data -> Welcome.
- [ ] `welcomed` persists across app restarts.
- [ ] EN | BM switches all text on the screen instantly; thumb slides; top bar does not animate; choice persists app-wide.
- [ ] Matches Figma 106:355 (spacing, sizes, colours) within 2 px.
- [ ] All doodle animations run and are subtle; with reduced motion everything is static.
- [ ] Disclaimer wording exactly as in i18n files. No em dash anywhere.
