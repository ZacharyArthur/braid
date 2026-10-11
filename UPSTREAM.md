# Upstream

Single source of truth for where vendored and derived skills came from. SHAs live only here.

- **vendored**: verbatim except surgical edits. Sync by merging upstream diffs.
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
- **derived**: read the diff for ideas worth having and write them fresh, in braid's words and at braid's size ([ADR 0008](braid/adr/0008-clean-room-over-porting-products.md)). Never a merge.
- **clean-room**: as derived, but never paste upstream text, not even a sentence. Rows without a path (`map`, `design`) aren't tracked; skim those repos when you choose to.

Every kind: bump the SHA to the commit you reviewed, even when you took nothing, so the next run starts from there. Run `node scripts/check.cjs`, and add a patch entry to `CHANGELOG.md` when a skill changed.

## Sources

| Skill | Kind | Repo | Path | SHA | License |
|---|---|---|---|---|---|
| `braid` | derived | DietrichGebert/ponytail | skills/ponytail/SKILL.md, hooks/ | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | 49dd158d1076134a641b33efb035946536778336 | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 723af7d9afaf43eb871dbcce6129e2bf80de90d5 | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | 225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8 | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging (minus CREATION-LOG, test-*.md) | bb92a77741419a4ab5f06e711a283343f1ada0c3 | MIT |
| `review` | derived | DietrichGebert/ponytail | skills/ponytail-review | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `audit` | derived | DietrichGebert/ponytail | skills/ponytail-audit | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `debt` | derived | DietrichGebert/ponytail | skills/ponytail-debt | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `map` | clean-room | Graphify-Labs/graphify | - | - | Apache-2.0 (idea only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | 9111a7654d7800391459431fff4eaf66e33a3d2e | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | 49dd158d1076134a641b33efb035946536778336 | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | 49dd158d1076134a641b33efb035946536778336 | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable, Leonxlnx/taste-skill, nextlevelbuilder/ui-ux-pro-max-skill | - | - | Apache-2.0 / MIT (ideas only) |
| `standards` | clean-room | - | - | - | - |
| `skill` | clean-room | anthropics/skills | skills/skill-creator | dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 (ideas only) |
| `help` | clean-room | - | - | - | - |
