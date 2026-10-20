## 1. Ponytail (based)

- [x] 1.1 Core: `git merge-file skills/braid/core.md` from ponytail's `skills/ponytail/SKILL.md` at the old pin and at HEAD
- [x] 1.2 Debt: merge `skills/ponytail-debt/SKILL.md` the same way; braid's marker pattern stays, run through `git grep --no-index --exclude-standard`
- [x] 1.3 Map: merge `hooks/ponytail-map.js` into `hooks/map.cjs`: regular files only, unsafe paths dropped
- [x] 1.4 Test: `check.cjs` fixture with a symlinked source file and an unsafe folder name; neither reaches the map
- [x] 1.5 Session hook: `fs.writeSync` for output; map child 3 s, map deadline 2.5 s
- [x] 1.6 `hooks/hooks.json` timeouts 15 s; `check.cjs` accepts 1-15 s

## 2. Ideas (derived, clean-room)

- [x] 2.1 `spec` apply: read the current spec text of each REMOVED or MODIFIED requirement
- [x] 2.2 `design`: page or working screen; two tells

## 3. Bookkeeping

- [x] 3.1 UPSTREAM.md: bump every pinned row to the commit reviewed
- [x] 3.2 Re-measure ponytail's worst-case always-on; update `PONYTAIL_ALWAYS_ON` (unchanged: only frontmatter and skill bodies moved)
- [x] 3.3 CHANGELOG entry under Unreleased

## 4. Review

- [x] 4.1 Round 1 (three reviewers): linked parent folders no longer bypass the symlink guard, with a junction fixture that runs on every OS; `SAFE_PATH` takes `\p{M}`; the map deadline counts from the process start (a 0.7-1.5 s slow start lost the whole map, now partial); fixtures for the `NAME` guard and for debt's scan as SKILL.md writes it; ADR 0012 amended for the `SAFE_PATH` line; CHANGELOG tells Codex users to re-trust braid
- [x] 4.2 Round 2: `SAFE_PATH` rejects invisible code points (`\p{DI}`), with a fixture of a variation-selector folder, a Hangul-filler folder and a Devanagari one; the `design` paragraph rewritten in braid's own framing (one-visit page or daily screen, docs on the daily side)
- [x] 4.3 Round 3: the `design` paragraph drops the example lists and wording it shared with taste-skill; `spec` apply names `braid/specs/<domain>/spec.md` instead of OpenSpec's "main spec"; n-gram scans against every design source and the OpenSpec templates find no four-word overlap

## 5. Verify

- [x] 5.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, then `/braid:spec archive`
