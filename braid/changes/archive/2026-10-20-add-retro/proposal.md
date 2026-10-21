## Why

Agents repeat the same command failures across sessions (wrong-shell syntax, a missing tool, a wrong flag or path), and nothing turns them into rules. The harnesses already ship usage, cost, config and memory tools, but each user has to know they exist, and none writes rules every harness reads.

## What changes

- New user-only skill `retro` (`/braid:retro`, `$retro` in Codex), marked user-only three ways.
- A stdlib script reads every transcript store on the machine for the current project (the git toplevel, or the working directory outside git): Claude Code's JSONL, Codex's JSONL rollouts, and ZCode's SQLite store through `node:sqlite` when the running Node has it (≥ 22.13, where it needs no flag), else one line that ZCode needs it. Absent stores are skipped.
- Window: the 30 most recent sessions across all stores within 30 days, both defaults, any value accepted (`retro 50 60d`), no maximum.
- The script prints only failure signatures, counts, session dates and one error snippet (≤ 200 characters) each. No prompt or model text from transcripts, nothing written to disk beyond the `-wal`/`-shm` files SQLite may add beside ZCode's store. A locked or broken ZCode store skips ZCode only.
- A signature in at least 2 sessions is a candidate. The model drops failures the work itself expected (failing tests, build errors in the code being edited) and ones AGENTS.md already covers.
- Rules go to the project's AGENTS.md (`Commands` / `Don't`), harness-specific ones tagged (`(Codex)`), as one numbered diff: accept all, drop by number, or cancel. Never harness memory.
- `retro all` drops the project filter; rules go to the user-level file of each harness they apply to (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.zcode/AGENTS.md`), in the same diff.
- `retro insights` (Claude Code only) also reads the `/insights` output (per-session friction in `usage-data/facets/`, filtered by project through `usage-data/session-meta/`, and the suggested rules in `report.html`), through the same filter and diff. No report, or one older than the window → "run `/insights` first", then the transcript pass continues.
- A router closes the run: only the vendor tools the findings call for (for example `fewer-permission-prompts` on recurring permission denials, `update-config` or `/debug-config` on config errors, the `zcode-guide` diagnosing skills on MCP or hook failures), plus one standing line for cost and cross-project analysis (Claude Code `/insights`, `/usage`, `explain-usage`; Codex `/status`, `/usage`; ZCode: none shipped). Skills are called after a yes; built-in commands are named for the user to run; a missing tool gets one line. Rows carry a "verified 2026-10" line.
- ADR 0015: route to vendor tools, don't rebuild them; `node:sqlite` is optional.
- CI also runs `node scripts/check.cjs` in the Node 22 lint job, so the ZCode fixture runs somewhere.

## Impact

New spec domain `retro`. Code: new `skills/retro/{SKILL.md,agents/openai.yaml,retro.cjs}`, a fake-home check in `scripts/check.cjs` that writes all three stores to a temp folder (no fixture files), `.github/workflows/check.yml`, `biome.json`, `TESTING.md`, `braid/adr/0015-*`, `braid/GLOSSARY.md`, `UPSTREAM.md` (clean-room, no source), README's and `help`'s rows, `braid/map.md`, CHANGELOG.md. No hook change, no always-on cost: `retro` stays user-only.

## Out of scope

- Token or cost figures: the vendor tools see billing and plan limits the transcripts don't
- A separate orchestrator skill: the router is a table, so it lives in `retro` until it outgrows one
- Older Codex formats beyond the `exit_code` fallback: no local sample to test against
- Parsing ZCode's `turn_usage` / `model_usage` tables: the token-stats work above
- Tracking router rows in `upstream.cjs` or `check.cjs`: the run-time existence check and the date are enough
