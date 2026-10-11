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
| `braid` | based | DietrichGebert/ponytail | skills/ponytail/SKILL.md, hooks/ | 9b58c1ffb790c075ca32e70a89cf1d80588f4abf | MIT |
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 723af7d9afaf43eb871dbcce6129e2bf80de90d5 | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | 225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8 | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging (minus CREATION-LOG, test-*.md) | bb92a77741419a4ab5f06e711a283343f1ada0c3 | MIT |
| `review` | based | DietrichGebert/ponytail | skills/ponytail-review | 9b58c1ffb790c075ca32e70a89cf1d80588f4abf | MIT |
| `audit` | based | DietrichGebert/ponytail | skills/ponytail-audit | 9b58c1ffb790c075ca32e70a89cf1d80588f4abf | MIT |
| `debt` | based | DietrichGebert/ponytail | skills/ponytail-debt | 9b58c1ffb790c075ca32e70a89cf1d80588f4abf | MIT |
| `map` | clean-room | Graphify-Labs/graphify | graphify/skill.md, docs/how-it-works.md | b4e6307bf170f27e0cb888c03f4af9308d531a42 | Apache-2.0 (ideas only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | 9111a7654d7800391459431fff4eaf66e33a3d2e | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | 49dd158d1076134a641b33efb035946536778336 | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | 49dd158d1076134a641b33efb035946536778336 | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable | plugin/skills/impeccable/SKILL.md, plugin/skills/impeccable/reference/craft-floor.md | d631a8827f99414d2b6daba4ef08b7f8701751d7 | Apache-2.0 (ideas only) |
| `design` | clean-room | Leonxlnx/taste-skill | skills/taste-skill | 717446e07a78d4e6d7918b1fde1a263378eebac9 | MIT (ideas only) |
| `design` | clean-room | nextlevelbuilder/ui-ux-pro-max-skill | .claude/skills/ui-ux-pro-max/SKILL.md | 67803eac81607188194aea9842a723b89326d90d | MIT (ideas only) |
| `standards` | clean-room | - | - | - | - |
| `skill` | clean-room | anthropics/skills | skills/skill-creator | dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 (ideas only) |
| `help` | clean-room | - | - | - | - |
