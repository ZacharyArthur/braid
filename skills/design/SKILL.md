---
name: design
description: "Frontend UI under YAGNI > KISS > DRY: the project's own components, then native elements, a few tokens, no generic AI look, and a pre-ship check for contrast, focus, responsive, and empty/error states. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[what to build or review]"
license: MIT
---

Build interfaces that look chosen, not generated, with as little code as the
platform allows. braid's core rules apply; this adds what they mean for UI.

## First, find the existing design

Read what's already there: a design doc, tokens or theme file, the component
library in use, two or three existing screens. **Follow it.** One obvious way:
never add a second button style, spacing scale, or icon set. Nothing there?
Ask one question (audience and tone), or default to plain: system font stack,
neutral palette, one accent. Before building, say in one line what you take
the page to be, for whom and in what tone, so a wrong read costs one reply.
Part of that read: will people pass through it once, or work in it every
day? A one-visit page may take a strong, unusual look. A daily screen earns
its look by staying out of the way, with the conventions its users already
know, dense tables and plain, repeated layouts. The tells below still apply.
A redesign replaces the old look outright; polishing the look you were asked
to drop is the worst of both.

## The ladder, for UI

1. **A component for it already in this project?** Its own, or from the library its screens use (`<Button>`, `<Dialog>`). Use it the way those screens do: it carries the app's styling, focus handling and tests. A house component beats a native widget.
2. **Native element?** `<button>`, `<dialog>`, `<details>`, `<select>`, `<input type="date|color|range">`, form validation attributes, `popover`. Use it.
3. **CSS does it?** Layout (grid, flex, container queries), state (`:has`, `:focus-visible`, `:invalid`), theming (`prefers-color-scheme`), motion (transitions). CSS over JS.
4. **Only then:** the smallest custom component. Never add a UI dependency for one widget.

## Tokens: knowledge with one home

A handful of CSS custom properties, defined once, used everywhere. No raw hex
or pixel values inside components.

- color: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--danger`
- space: one scale (4, 8, 12, 16, 24, 32, 48)
- radius: one or two values; type: one or two families, about five sizes, body lines ≤ ~70ch

## Tells of generated UI: avoid by default

- Inter or Roboto everywhere because it's the default, not a choice
- Purple-to-blue gradients, glassmorphism, neon glows
- Cards nested in cards; a rounded icon tile above every heading
- Three identical feature cards under a centered hero
- Gray text on colored backgrounds; color carrying hierarchy that size and weight should
- Heavy drop shadows and pill shapes on everything
- Emoji standing in for icons
- A small uppercase label above every heading; section numbers (01, 02, 03) that carry nothing
- Gradient text, a thick colored stripe down one side of each card, monospace worn as a "technical" costume
- A product screenshot faked out of styled divs
- Numbers nobody measured ("10× faster", "99.9% uptime") and charts drawn from invented data
- A different color for every chart series by default, where one hue and the accent would do
- A section that flips light or dark mid-page
- Placeholder copy ("Lorem ipsum", "John Doe", "Acme") and clichés ("seamless", "elevate", "unleash")

Instead: hierarchy from size, weight, and spacing first; one accent color,
used sparingly and for meaning; real copy; layout that follows the content.

## Pre-ship check

Run it on what you built, once: every width in one pass, fix everything it
finds in one batch, confirm once more, stop. Report each item as passed or the
fix needed.

- Contrast: 4.5:1 body text, 3:1 large text and UI controls
- Keyboard: everything reachable, visible focus, logical order, Escape closes overlays
- Labels: every input labelled; icon-only buttons have an accessible name
- Responsive at 360, 768, 1280 px: no horizontal scroll, touch targets ≥ 44 px
- States: empty, loading, error, and very long text all designed
- Copy: buttons say what they do; errors say what went wrong and how to recover
- Numbers in tables line up (`font-variant-numeric: tabular-nums`)
- Motion respects `prefers-reduced-motion`, exits run faster than entrances; dark mode works if the app has one

## Output

Code first, then one line: what was skipped and when to add it. For deeper
design work (critique, motion, brand), suggest the companion plugins
impeccable, taste-skill, or ui-ux-pro-max.
