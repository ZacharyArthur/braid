## Why

Upstream moved: ponytail 5.3.2 hardens the codebase map against repo-controlled text and symlinks, writes hook output so it can't be lost at exit, gives slow Windows starts more time, and scans debt markers the way git ignores files. The design sources (impeccable 4.7, taste-skill v2) separate pages people read from screens people work in, and OpenSpec found that a removed requirement's delta doesn't say which behavior to remove.

## What changes

- Core and `debt`: three-way merge of ponytail's text (`argument-hint` gains `off`; `debt` scans with `git grep --no-index --exclude-standard`, so every gitignored folder is skipped, in any stack). braid's marker pattern stays.
- Map (`hooks/map.cjs`, based on ponytail's): only regular files are read, never through a symlink or a linked folder (ponytail checks only the file), and paths with characters outside a safe set are dropped before they can reach the context. The safe set is ponytail's widened from ASCII to letters, marks and digits in any script, so folders like `café/` or `हिंदी/` stay in the map, minus invisible code points (variation selectors can hide bytes, Hangul fillers read as spaces), which ASCII had kept out; that edits one ponytail line, which ADR 0012 now allows in `hooks/map.cjs` for security or correctness. The map's deadline counts from the process start, so a slow node start leaves a partial map instead of a killed one.
- Session hook (`hooks/braid.cjs`, ideas only): output written synchronously (`fs.writeSync`), since `process.exit` can drop a pending pipe write on macOS. The map child gets 3 s (was 1.5 s) and the map's own deadline 2.5 s (was 1 s): a contended Windows start takes 1.5–2.3 s and lost the map every time.
- `hooks/hooks.json`: 15 s timeouts (was 5 s), so a cold node start on Windows keeps its output; the hooks still answer in well under a second normally. `check.cjs` accepts up to 15 s. Codex hashes a hook's timeout into its trust record, so Codex users re-trust braid once in `/hooks` (CHANGELOG says so).
- `spec` apply: for a REMOVED or MODIFIED requirement, read its current text in `braid/specs/<domain>/spec.md` too; the delta alone doesn't say what behavior goes.
- `design`: decide first between a page people visit once and a screen they come back to every day; a daily screen stays out of the way with the conventions its users know. Two more tells: invented metrics or chart data, and a color per chart series by default.
- UPSTREAM.md: every pinned row bumped to the commit reviewed. `PONYTAIL_ALWAYS_ON` rechecked: ponytail's injected text and descriptions are unchanged between the pins, so it stays 1678.

## Impact

Specs: `session` (map scenario added), `reports` (debt scenario added). ADR 0012 amended (single-line edits in `hooks/map.cjs`). Code: `hooks/braid.cjs`, `hooks/map.cjs`, `hooks/hooks.json`, `scripts/check.cjs`, `skills/braid/core.md`, `skills/debt/SKILL.md`, `skills/spec/apply.md`, `skills/design/SKILL.md`, `UPSTREAM.md`, `CHANGELOG.md`. Always-on cost: re-measured, no new always-on text.

## Out of scope

- Ponytail's band and board: a new feature, not a sync; weighed separately.
- Ponytail's fixes for other harnesses (Qoder, Cursor, Copilot, OpenCode, Hermes, Pi), Node 12 launchers, bench and docs: braid doesn't have them.
- Ponytail's compaction fix (#1074) and Codex icon fix (#1164): braid keeps the level in per-session state, and ships no Codex icon.
- OpenSpec's glob-path, schema and symlink-containment edits: they belong to its artifact engine, which braid doesn't have.
- graphify's pipeline fixes; taste-skill's scripts and JSON libraries (new tooling); impeccable's native iOS/Android scope (braid's pre-ship check is web only).
