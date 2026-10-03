# Upstream

Single source of truth for where vendored and derived skills came from. SHAs live only here.

- **vendored**: verbatim except surgical edits. Sync by merging upstream diffs.
- **derived**: substantially rewritten. Watch upstream for ideas, don't merge.
- **clean-room**: no upstream code; listed for credit only.

Update a row: `gh api repos/<owner>/<repo>/compare/<sha>...HEAD --jq '.files[] | select(.filename | startswith("<path>")) | .patch'`, merge what you want, bump the SHA.

| Skill | Kind | Repo | Path | SHA | License |
|---|---|---|---|---|---|
| `braid` | derived | DietrichGebert/ponytail | skills/ponytail/SKILL.md, hooks/ | 54e00c3e29dec545ccc8183703853e1223f9ab9d | MIT |
| `grilling` | vendored | mattpocock/skills | skills/productivity/grilling | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `grill-me` | vendored | mattpocock/skills | skills/productivity/grill-me | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `grill-with-docs` | vendored | mattpocock/skills | skills/engineering/grill-with-docs | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `domain-modeling` | vendored | mattpocock/skills | skills/engineering/domain-modeling | d81f3a183412e71a5b1e84ca21bc1a35eea03a60 | MIT |
| `adhd` | vendored | ayghri/i-have-adhd | skills/i-have-adhd | 839872f9d1cd634fed642b4589ce7226199cc15f | MIT |
| `humanizer` | vendored | blader/humanizer | SKILL.md, agents/openai.yaml | 225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8 | MIT |
| `security-audit` | vendored | cloudflare/security-audit-skill | skills/security-audit | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 | MIT |
| `systematic-debugging` | vendored | obra/superpowers | skills/systematic-debugging (minus CREATION-LOG, test-*.md) | 8ca22dba9a94f28898bbce59f2537ff4d87c747d | MIT |
| `review` | derived | DietrichGebert/ponytail | skills/ponytail-review | 54e00c3e29dec545ccc8183703853e1223f9ab9d | MIT |
| `audit` | derived | DietrichGebert/ponytail | skills/ponytail-audit | 54e00c3e29dec545ccc8183703853e1223f9ab9d | MIT |
| `debt` | derived | DietrichGebert/ponytail | skills/ponytail-debt | 54e00c3e29dec545ccc8183703853e1223f9ab9d | MIT |
| `map` | clean-room | Graphify-Labs/graphify | - | - | Apache-2.0 (idea only) |
| `spec` | derived | Fission-AI/openspec | docs/concepts.md, src/core/templates/workflows | 2500d6da971336167548b53731a35b2127df35ac | MIT |
| `wayfind` | clean-room | mattpocock/skills | skills/engineering/wayfinder | - | MIT (idea only) |
| `handoff` | clean-room | mattpocock/skills | skills/productivity/handoff | - | MIT (idea only) |
| `xreview` | clean-room | - | - | - | - |
| `design` | clean-room | pbakaus/impeccable, Leonxlnx/taste-skill, nextlevelbuilder/ui-ux-pro-max-skill | - | - | Apache-2.0 / MIT (ideas only) |
