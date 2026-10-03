---
name: design
description: "Frontend UI under YAGNI > KISS > DRY: native elements first, a few tokens, no generic AI look, and a pre-ship check for contrast, focus, responsive, and empty/error states. Only when the user explicitly invokes it."
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
neutral palette, one accent.

## The ladder, for UI

1. **Native element?** `<button>`, `<dialog>`, `<details>`, `<select>`, `<input type="date|color|range">`, form validation attributes, `popover`. Use it.
2. **CSS does it?** Layout (grid, flex, container queries), state (`:has`, `:focus-visible`, `:invalid`), theming (`prefers-color-scheme`), motion (transitions). CSS over JS.
3. **Component library already installed?** Use its component. Never add a UI dependency for one widget.
4. **Only then:** the smallest custom component.

## Tokens: knowledge with one home

A handful of CSS custom properties, defined once, used everywhere. No raw hex
or pixel values inside components.

- color: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--danger`
- space: one scale (4, 8, 12, 16, 24, 32, 48)
- radius: one or two values; type: one or two families, about five sizes

## Tells of generated UI: avoid by default

- Inter or Roboto everywhere because it's the default, not a choice
- Purple-to-blue gradients, glassmorphism, neon glows
- Cards nested in cards; a rounded icon tile above every heading
- Three identical feature cards under a centered hero
- Gray text on colored backgrounds; color carrying hierarchy that size and weight should
- Heavy drop shadows and pill shapes on everything
- Emoji standing in for icons
- Placeholder copy ("Lorem ipsum", "John Doe", "Acme") and clichés ("seamless", "elevate", "unleash")

Instead: hierarchy from size, weight, and spacing first; one accent color,
used sparingly and for meaning; real copy; layout that follows the content.

## Pre-ship check

Run it on what you built. Report each item as passed or the fix needed.

- Contrast: 4.5:1 body text, 3:1 large text and UI controls
- Keyboard: everything reachable, visible focus, logical order, Escape closes overlays
- Labels: every input labelled; icon-only buttons have an accessible name
- Responsive at 360, 768, 1280 px: no horizontal scroll, touch targets ≥ 44 px
- States: empty, loading, error, and very long text all designed
- Motion respects `prefers-reduced-motion`; dark mode works if the app has one

## Output

Code first, then one line: what was skipped and when to add it. For deeper
design work (critique, motion, brand), suggest the companion plugins
impeccable, taste-skill, or ui-ux-pro-max.
