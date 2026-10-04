## 1. Design skill
- [x] 1.1 Clean-room `skills/design/SKILL.md` (≤ 8 KB): KISS/YAGNI for UI, AI-slop tells, pre-ship checks; Codex yaml; UPSTREAM row

- [x] 1.2 `/braid:standards` (AGENTS.md owner) + map/spec/handoff/core touch points

## 2. Harness installs
- [ ] 2.1 Claude Code: run the TESTING.md checklist (core at full, `/braid:braid lite` survives `/compact`, "stop braid", `/braid:spec propose`)
- [ ] 2.2 Codex: install from the marketplace; hooks fire; `$spec` works
- [ ] 2.3 ZCode: install from `.claude-plugin/marketplace.json`; confirm the shared hooks.json loads (route records the evidence so far)

## 3. Release
- [x] 3.1 TESTING.md manual checklist
- [x] 3.2 GitHub Actions: `node scripts/check.cjs` on windows-latest and ubuntu-latest
- [x] 3.3 README: Codex and ZCode install, ZCode skills to toggle off
- [x] 3.4 A/B baseline (bench/results/2026-10-03-sonnet-baseline): checks 15/15 all arms; braid fewest lines incl. tests (306 vs 344 vs 396), DRY 3/6 vs 0/6, cost +18% vs ponytail
- [x] 3.5 CHANGELOG.md; manifests to 1.0.0
- [ ] 3.6 Create public `ZacharyArthur/braid`, push, tag v1.0.0 (ask the user first)
- [ ] 3.7 Verify: `node scripts/check.cjs`, then `/braid:spec archive`
