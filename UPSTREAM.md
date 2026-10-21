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
| `braid` | based | DietrichGebert/ponytail | skills/ponytail/SKILL.md, hooks/ | 09c434ab73ca43761c5d8b0c5d341926c2fba710 | MIT |
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 1ecea1993b7fce257ffbd686c070948b5e07eda6 | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | 8c307f367c91bd974002f10f2be2965d642c13df | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging (minus CREATION-LOG, test-*.md) | bb92a77741419a4ab5f06e711a283343f1ada0c3 | MIT |
| `review` | based | DietrichGebert/ponytail | skills/ponytail-review | 09c434ab73ca43761c5d8b0c5d341926c2fba710 | MIT |
| `audit` | based | DietrichGebert/ponytail | skills/ponytail-audit | 09c434ab73ca43761c5d8b0c5d341926c2fba710 | MIT |
| `debt` | based | DietrichGebert/ponytail | skills/ponytail-debt | 09c434ab73ca43761c5d8b0c5d341926c2fba710 | MIT |
| `map` | clean-room | Graphify-Labs/graphify | graphify/skill.md, docs/how-it-works.md | 86c57be8204673c2a1b9849a3292a7dd3ab373d8 | Apache-2.0 (ideas only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | c794978f4f8845ce59693373c9dd882ee776588c | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable | plugin/skills/impeccable/SKILL.md, plugin/skills/impeccable/reference/craft-floor.md | 46b822f7dda9f7dba799a9c7776fdc19b3a93559 | Apache-2.0 (ideas only) |
| `design` | clean-room | Leonxlnx/taste-skill | skills/taste-skill | 63aba5f43b5056758b15bbe7d683da8c86a7a7ad | MIT (ideas only) |
| `design` | clean-room | nextlevelbuilder/ui-ux-pro-max-skill | .claude/skills/ui-ux-pro-max/SKILL.md | 56ea9cf174ed86786187daa9de0e6247cb0747e4 | MIT (ideas only) |
| `standards` | clean-room | - | - | - | - |
| `skill` | clean-room | anthropics/skills | skills/skill-creator | dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 (ideas only) |
| `help` | clean-room | - | - | - | - |
