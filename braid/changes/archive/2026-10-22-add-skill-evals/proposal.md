## Why

`skill`'s heavy path (evals, baselines, trigger tuning) hands off to Anthropic's `skill-creator` only "if installed", and outside Claude's desktop app and web it rarely is: Codex ships a creator that runs no evals, ZCode and Pi ship none. So in most sessions the heavy path just stops. Separately, Pi became the fourth harness in `add-pi-harness`, but skills that list harnesses one by one (`retro`, `standards`, `skill`) still name three.

## What changes

- `skill`: the heavy path routes. A creator the user names or prefers, when installed (Anthropic's `skill-creator`; Codex's `$skill-creator`, which creates but runs no evals), gets the work, and `skill`'s checks run after it. Otherwise braid's own `evals.md`: output evals against a baseline, and opt-in trigger tuning, for every harness. Written fresh from Anthropic's skill-creator and best-practices guide, Codex's skill-creator, and agentskills.io's eval and description guides (ideas only, no text).
- `skill`, light path: a baseline-first check in "Should it exist?", a gotchas slot in the template, Pi's skill folders, invocation and `disable-model-invocation`.
- `retro`: reads Pi's session store (`$PI_CODING_AGENT_SESSION_DIR`, else `<agent folder>/sessions`), names Pi's user-level file (`<agent folder>/AGENTS.md`) for `all`, and adds Pi to its router table and standing line.
- `standards`: Pi ships no subagents, so picking Pi in Delegation writes no explorer file and its tier line names none; `standards/SKILL.md` names Pi among the harnesses that read AGENTS.md directly.
- Sweep: README's `retro` row, the mods spec's harness count, TESTING.md's retro line.
- The queued `pi-skill-support` proposal is folded into this change and removed.

## Impact

Specs: new `skill`; `retro` (stores, Pi's router row); `standards` (Pi in Delegation); `mods` (four harnesses). Code: `skills/skill/SKILL.md`, new `skills/skill/evals.md`, `skills/retro/retro.cjs` and `SKILL.md`, `skills/standards/SKILL.md` and `delegation.md`, `scripts/check.cjs` (a Pi store in retro's fake home). Docs: `UPSTREAM.md` (two new clean-room rows), README, TESTING.md, CHANGELOG, `braid/map.md`, an ADR. Always-on cost: unchanged (all touched skills are user-only).

## Out of scope

- Vendoring Anthropic's skill-creator: ~250 KB, Python, and its trigger tuning runs only through `claude -p`; braid's own path covers every harness at a fraction of the size (design.md).
- A trigger-tuning script: how a trigger shows in Codex's and Pi's headless output is untested; the agent loops by hand and checks one run first. Script it when a harness's output is confirmed.
- An HTML eval viewer, blind comparison, `.skill` packaging: the results table and the user's review cover the need.
- Pi bench arms in `bench/ab.cjs`: separate work.
