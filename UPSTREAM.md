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
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 839872f9d1cd634fed642b4589ce7226199cc15f | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | 225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8 | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging (minus CREATION-LOG, test-*.md) | 8ca22dba9a94f28898bbce59f2537ff4d87c747d | MIT |
| `review` | derived | DietrichGebert/ponytail | skills/ponytail-review | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `audit` | derived | DietrichGebert/ponytail | skills/ponytail-audit | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `debt` | derived | DietrichGebert/ponytail | skills/ponytail-debt | 552acd5efd0aeae2583a12efe39373d2f076f25e | MIT |
| `map` | clean-room | Graphify-Labs/graphify | - | - | Apache-2.0 (idea only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | 73583067dd6d5e774a2567741e37b2ccc3334395 | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable, Leonxlnx/taste-skill, nextlevelbuilder/ui-ux-pro-max-skill | - | - | Apache-2.0 / MIT (ideas only) |
| `standards` | clean-room | - | - | - | - |
| `skill` | clean-room | anthropics/skills | skills/skill-creator | 683bc88e56f3e09ba94f7055977f3d3aa499f202 | Apache-2.0 (ideas only) |
| `help` | clean-room | - | - | - | - |
