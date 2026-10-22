## Why

Pi became braid's fourth harness in `add-pi-harness`, which covered the always-on core, the level commands and `help`'s invocation table. Skills that name the other three harnesses one by one were left as they were, so in Pi they either skip Pi or give steps for the wrong harness.

## What changes

- `retro`: read Pi's session transcripts (under Pi's agent folder, `sessions/`) alongside Claude Code's, Codex's and ZCode's, write `all` rules to Pi's user-level file if Pi has one, and add a Pi column to its router table.
- `standards` (with `delegation.md`): Pi's model tiers and whether it can have an explorer agent at all (Pi has no built-in subagents).
- `skill`: Pi's skill locations and its `disable-model-invocation` support.
- A light sweep of the remaining braid skills for `/braid:<name>`-only invocations or harness lists that leave out Pi.

## Impact

To be scoped when this proposal is planned with `/braid:spec propose pi-skill-support`: likely the `retro` and `standards` specs, `skills/retro/`, `skills/standards/`, `skills/skill/SKILL.md`, and `scripts/check.cjs` (retro's fake-home test).

## Out of scope

- The always-on core, level commands and `help`: done in `add-pi-harness`.
