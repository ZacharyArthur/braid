# Upstream

Single source of truth for where vendored, based and derived skills came from. SHAs live only here.

- **vendored**: verbatim except surgical edits. Sync by merging upstream diffs.
- **based**: upstream's text as the base, braid's edits as renames and whole added blocks ([ADR 0012](braid/adr/0012-ponytail-is-the-base-text.md)). Sync by three-way merge.
- **derived**: substantially rewritten. Watch upstream for ideas, don't merge.
- **clean-room**: no upstream code; listed for credit. Where a row has a SHA, it is the commit last reviewed for ideas, not a copy source.

## Syncing

Before each release, or whenever you want to know what's new upstream:

```bash
node scripts/upstream.cjs
```

For every row with a SHA it prints how far upstream has moved and the files changed under that row's path: `●` something to read, `○` upstream moved but not here, `✓` up to date. Read-only; needs `gh`, signed in. `node scripts/upstream.cjs grilling wayfind` checks just those rows. To read a row's diff:

```bash
gh api repos/<owner>/<repo>/compare/<sha>...HEAD --jq '.files[] | select(.filename | startswith("<path>")) | .patch'
```

Then, by kind:

- **vendored**: copy the row's Path files (minus its exclusions) over the skill folder verbatim and commit that alone (`<skill>: sync upstream <short-sha>`). Re-apply braid's surgical edits in a second commit, so the next diff stays mergeable ([ADR 0003](braid/adr/0003-vendor-verbatim-with-pins.md)). Keep its `LICENSE` current.
- **based**: fetch the row's files at the old pin and at the new commit, and merge each into braid's copy (`skills/ponytail/SKILL.md` → `skills/braid/core.md`, `hooks/ponytail-map.js` → `hooks/map.cjs`, `skills/ponytail-<skill>/SKILL.md` → `skills/<skill>/SKILL.md`; the rest of ponytail's `hooks/` is read for ideas only): `git merge-file <braid-file> <old> <new>`. Upstream's changes land where braid didn't edit; a conflict marks a line braid renamed or wrapped, resolved by hand. Commit as `<skill>: sync upstream <short-sha>`. After a core sync, re-measure ponytail's worst-case always-on cost and update `PONYTAIL_ALWAYS_ON` in `scripts/check.cjs` (how it's measured is in the comment there); the check keeps braid within ~300 tokens of it.
- **derived**: read the diff for ideas worth having and write them fresh, in braid's words and at braid's size ([ADR 0008](braid/adr/0008-clean-room-over-porting-products.md)). Never a merge.
- **clean-room**: as derived, but never paste upstream text, not even a sentence. A skill with several sources gets one row per source.

Every kind: bump the SHA to the commit you reviewed, even when you took nothing, so the next run starts from there. Run `node scripts/check.cjs`, and add a patch entry to `CHANGELOG.md` when a skill changed.

## Sources

| Skill | Kind | Repo | Path | SHA | License |
|---|---|---|---|---|---|
| `braid` | based | DietrichGebert/ponytail | skills/ponytail/SKILL.md, hooks/ | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT |
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 1ecea1993b7fce257ffbd686c070948b5e07eda6 | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | b48c832f0f809c1b5658edbb838c2521b72f2413 | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging | 22f0b463e7a5e579904dd6211a520321035526f7 | MIT |
| `review` | based | DietrichGebert/ponytail | skills/ponytail-review | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT |
| `audit` | based | DietrichGebert/ponytail | skills/ponytail-audit | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT |
| `debt` | based | DietrichGebert/ponytail | skills/ponytail-debt | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT |
| `map` | clean-room | Graphify-Labs/graphify | graphify/skill.md, docs/how-it-works.md | 18cd78f4b8c9698db861aa8d7ad1adbf3c836642 | Apache-2.0 (ideas only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | ea635dd255f8686dcf48626bbcbe0e3fd59b6067 | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | 5863806dd4e15c63174bee4e7515a4256792ecfa | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable | plugin/skills/impeccable/SKILL.md, plugin/skills/impeccable/reference/craft-floor.md | d41d9860b0094dcb68030657da63461212835aaa | Apache-2.0 (ideas only) |
| `design` | clean-room | Leonxlnx/taste-skill | skills/taste-skill | f6b76575f949707b4e3c37cd86cb44b0b98643e8 | MIT (ideas only) |
| `design` | clean-room | nextlevelbuilder/ui-ux-pro-max-skill | .claude/skills/ui-ux-pro-max/SKILL.md | 902bf616a0cc590d3f89f233f0c4e00072e549f0 | MIT (ideas only) |
| `standards` | clean-room | - | - | - | - |
| `skill` | clean-room | anthropics/skills | skills/skill-creator | 1780c5e5a552fd4d1c9d6a7b0cab26b0c2bef064 | Apache-2.0 (ideas only) |
| `skill` | clean-room | openai/codex | codex-rs/skills/src/assets/samples/skill-creator | aea4c6ee4b652d84b416731b11c2b8299d767209 | Apache-2.0 (ideas only) |
| `skill` | clean-room | agentskills/agentskills | docs/skill-creation | 83021e2be457a9b6679148719c1f6074f0ad975e | Apache-2.0 (ideas only) |
| `help` | clean-room | - | - | - | - |
| `retro` | clean-room | - | - | - | - |
