## 1. Provenance

- [x] 1.1 ADR 0012: ponytail rows are `based` (verbatim import, braid edits in a second commit, three-way merge on sync); narrows "derived" in ADR 0008's sense for these four rows
- [x] 1.2 UPSTREAM.md: `based` kind and its sync steps (`git merge-file` against the pinned upstream file); `braid`, `review`, `audit`, `debt` rows → `based` at `9b58c1ffb790c075ca32e70a89cf1d80588f4abf`
- [x] 1.3 `check.cjs`: accept `based`, require its THIRD-PARTY-NOTICES entry like `derived`, keep the 8 KB cap
- [x] 1.4 GLOSSARY: **Based** joins vendored / derived / clean-room; **Corner cut** gets the new marker and its old forms

## 2. Core

- [x] 2.1 Commit ponytail 5's `skills/ponytail/SKILL.md` body verbatim as `skills/braid/core.md`, alone
- [x] 2.2 braid edits commit: name and commands, the level-row filter the hook needs, precedence sentence, KISS, DRY and "done means verified" blocks, `shortcut(<strand>):` marker
- [x] 2.3 Hook: injects the new core with only the active level's row; `check.cjs` smoke test passes at all three levels
- [x] 2.4 `skills/braid/SKILL.md`: drop the hardware section, update examples and the switching text to the new core
- [x] 2.5 README, `help`, AGENTS.md: the 6-rung ladder, the marker, review's new scope

## 3. Reports

- [x] 3.1 Commit ponytail 5's review, audit and debt bodies verbatim over `skills/{review,audit,debt}/SKILL.md`, alone
- [x] 3.2 braid edits commit: frontmatter (user-only, three ways), strand tags plus `split:` for one-line lean findings, "never flag two copies", review's default target, audit's `braid/map.md` read, debt's marker regex (all three forms, `shortcut:` prose skipped), strand grouping, `braid/DEBT.md`
- [x] 3.3 `xreview`: don't-flag rule names all three marker forms
- [x] 3.4 Replace braid's own `braid(<strand>):` comments in code with `shortcut(<strand>):` (`mods/braid-context`; then the three mod checks)
- [x] 3.5 Exclude the based files from markdownlint, like vendored skills: ponytail's formatting stays so syncs merge clean (added in apply)

## 4. Map

- [x] 4.1 Commit ponytail 5's `hooks/ponytail-map.js` verbatim as `hooks/map.cjs`, alone
- [x] 4.2 braid edits commit: `BRAID_MAP`, time cap on the git listing and file reads, `shortcut(kiss):` header comment; the cap counts bytes; an unreadable folder under the walk (EPERM under AppData, found in apply) no longer applies since braid never walks (review round 4); Biome skips the file like bench fixtures
- [x] 4.3 `hooks/braid.cjs` session event: add the map when `braid/map.md` is absent and `BRAID_MAP` isn't `0`; fail open
- [x] 4.4 `check.cjs`: worst-case budget includes the map at its cap; smoke test against a fixture with and without `braid/map.md` and with `BRAID_MAP=0`
- [x] 4.5 Measure braid's and ponytail's session-start output in this repo at the pin; record both here. Measured (bytes/4, session text plus auto-loading skill descriptions): ponytail ~1,234 (819 + 415), braid ~1,348 (1,134 + 214), +114; allowance set to ~300 at the maintainer's call. Review round 2: compared worst case to worst case, enforced by `check.cjs` (project-state names now clipped by bytes). Review round 3: both at the ultra level, braid with every name, count and sha at its longest: ponytail ~1,678, braid ~1,968. Review round 4: harsher fixture (openspec/ prefix, 4-digit counts, 1,000 commits) reached the limit; names now clip at 32 bytes at the maintainer's call: braid ~1,960

## 5. Bench

- [x] 5.1 Completeness judge: scores each run 0 (stub) to 3 (full task), blind; report column
- [x] 5.2 Three hidden-check tasks from ponytail's set (rename reaching every caller, path traversal, private bulk email), credited in THIRD-PARTY-NOTICES
- [x] 5.3 `node bench/ab.cjs --fake` passes
- [x] 5.4 Real paired run, Claude Code, all arms, on `main` and on this branch the same day (maintainer runs it; costs money). Gate: the branch is no more expensive than `main` and no worse on hidden checks or completeness; results in `bench/results/`. Ran 2026-10-11 with Claude Code (sonnet) and Codex (gpt-6.1-sol), 3 runs per task; `main`'s plugin ran the braid arm on this branch's tasks and judge. Hidden checks equal (27/30 every arm, both agents; `scope-recipients` fails everywhere). Cost +0.7% (Claude) and tokens +3.5% (Codex), completeness 2.97 vs 3.00 and 2.92 vs 2.97 on diffs identical to full-score ones: within noise, passed at the maintainer's call. 7-10% less code than `main`

## 6. Release

- [x] 6.1 CHANGELOG 1.3.0; version bump in all three manifests
- [ ] 6.2 Harness checklist in TESTING.md for Claude Code, Codex, ZCode
- [ ] 6.3 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, `node bench/ab.cjs --fake`, the three mod checks, then `/braid:spec archive`
