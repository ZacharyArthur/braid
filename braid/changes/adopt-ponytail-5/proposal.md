## Why

braid started from ponytail, but its ponytail rows are "derived": every release is re-read and hand-ported, and ponytail 5 rewrote its core, review and audit. Since v5, ponytail's always-on cost is below braid's (~1.3k tokens with its map, ~1.9k for braid), against braid's first priority in AGENTS.md. Tracking ponytail's text as the base makes each release a merge, not a rewrite.

## What changes

- New upstream kind **based**: upstream text is the base, imported verbatim in its own commit; braid's edits are renames plus whole blocks between upstream's sections, in a second commit. A sync is a three-way merge (`git merge-file`). The `braid`, `review`, `audit` and `debt` rows become `based`, pinned at ponytail `9b58c1f` (v5.1.0 plus README-only commits). ADR 0012.
- Core = ponytail 5's rules (persona, "before you write", the 6-rung ladder, the rule bullets, "never cut", levels, the closing line on what was skipped or not checked and any risk), plus braid blocks: the YAGNI > KISS > DRY precedence sentence, a KISS block (flat over nested, explicit over magic), the DRY block unchanged, and "done means verified". Dropped: persistence, output and boundaries sections, "never stall", the `<input type="date">` example, the hardware section of the `braid` skill (now in "never cut").
- Corner-cut marker becomes `shortcut(<strand>): <ceiling>, <upgrade path>`: ponytail's neutral word, braid's strand kept. `debt`, `review`, `audit` and `xreview` still recognize `braid(<strand>):` and plain `shortcut:`.
- `review` and `audit` become ponytail 5's quality reports (correct, safe, holds under load, tested, fast, lean; numbered findings in must / should / nice groups; verdict, lean and not-checked lines). Their lean findings use braid's strand tags plus `split:`, one line each, and keep "never flag two copies". `review` keeps braid's default target (uncommitted plus branch vs base). `xreview` stays the cold second opinion.
- `debt` = ponytail 5's ledger with braid's marker regex, grouping by strand, and `braid/DEBT.md`.
- Session hook gains ponytail's codebase map (vendored from `hooks/ponytail-map.js`): top-level names per folder within a character cap, only when the repo has no `braid/map.md`; `BRAID_MAP=0` turns it off; time-capped so the hook never blocks. In all three harnesses.
- Bench: the ponytail arm follows the new pin (it reads UPSTREAM.md); a completeness judge (stub vs full); three hidden-check tasks from ponytail's set (a rename that must reach every caller, path traversal, one email to many subscribers without exposing addresses). The ship gate is a real paired run.
- Release 1.3.0: new behavior, nothing renamed or removed.

## Impact

Spec domains `rules`, `reports`, `session` (new). Code: `skills/braid/core.md`, `skills/braid/SKILL.md`, `skills/{review,audit,debt,xreview,help}/SKILL.md`, `hooks/braid.cjs`, new `hooks/map.cjs`, `scripts/check.cjs` (kind `based`, map in the worst-case budget, map smoke test), `bench/ab.cjs`, `bench/tasks/`, UPSTREAM.md, AGENTS.md, README.md, `braid/GLOSSARY.md`, CHANGELOG.md, the three manifests, the corner-cut comment in `mods/braid-context` (mod checks run).

## Out of scope

- Ponytail's rule copies for other agents, `ponytail-gain`, `ponytail-help`: braid ships three harnesses and its own `help`; a gain skill waits for braid's own published numbers
- "normal mode" as an off phrase: "stop braid" is enough
- Plain `shortcut:` as the marker braid writes: recognized, not emitted, since `debt` groups by strand
- Ponytail's FastAPI feature tickets in the bench: heavy for what they add
- Automating the three-way merge in `scripts/upstream.cjs`: documented `git merge-file` until syncs get frequent
- Re-wording ponytail's text in braid's voice: that's the cost this change removes
