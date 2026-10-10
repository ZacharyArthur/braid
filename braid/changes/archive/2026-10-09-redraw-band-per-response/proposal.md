## Why

The `braid-context` band redraws on `session.measure`, which fires once per main-thread turn. During a long turn, context, the 5-hour window and the session cost stay at the previous turn's figures until the turn ends. The 1-second tick only redraws while the cache is warm, so this shows on a conversation's first turn and on any turn that starts with the cache cold.

## What changes

- The band redraws after each main-thread model response (the `turn.step` hook it already has), so context, the 5-hour window and spend move as the turn runs, like a status line. Subagent responses don't redraw it: the figures are the main thread's.
- Figures come from `$.session.usage()` as before (the status line's own). Checked live in Claude Code 2.1.295 with a throwaway probe mod: read after each main-thread `turn.step`, `context.tokens` equalled that response's own input total (129,571 → 129,675 → 129,779 → 130,036 over four steps of one turn). A second probe, at the close, saw cost and the 5-hour window move per response too ($4.2372 → $4.2823, 11% → 12% between two steps).
- Spend waits for the conversation's first main-thread response, as before, but no longer for its first turn to end: until now it was drawn only once the turn's cache figures existed. The cache and hit-rate figures still wait for the turn's end.
- Mod version 0.1.0 → 0.1.1; CHANGELOG entry under Unreleased.

## Impact

Spec `mods`, requirement "Context band": one added sentence and scenario. Code: `mods/braid-context/hooks/register.tsx`, its test, its `types/index.d.ts`, its `plugin.json`; `CHANGELOG.md`. No change to braid itself, its version, budget or the other harnesses.

## Out of scope

- Redrawing per tool call: no figure changes between a response and its tool results.
- Updating the hit rate and cache figures per response: the hit rate is the turn's sum by design, and the cache shows "live" while a turn runs.
- Reading the fill from the response's own `usage` instead of `$.session.usage()`: the latter is current mid-turn (task 1.3).
