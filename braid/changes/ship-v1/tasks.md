## 1. Design skill
- [x] 1.1 Clean-room `skills/design/SKILL.md` (≤ 8 KB): KISS/YAGNI for UI, AI-slop tells, pre-ship checks; Codex yaml; UPSTREAM row

## 2. Harness installs
- [ ] 2.1 Claude Code: run the TESTING.md checklist (core at full, `/braid:braid lite` survives `/compact`, "stop braid", `/braid:spec propose`)
- [ ] 2.2 Codex: install from the marketplace; hooks fire; `$spec` works
- [ ] 2.3 ZCode: find the marketplace path; confirm hooks.json is accepted or split it; close both Open items in `braid/routes/v1.md`

## 3. Release
- [x] 3.1 TESTING.md manual checklist
- [x] 3.2 GitHub Actions: `node scripts/check.cjs` on windows-latest and ubuntu-latest
- [ ] 3.3 README: Codex and ZCode install, ZCode skills to toggle off
- [ ] 3.4 A/B: first Sonnet run done (bench/results/2026-10-03-sonnet): braid not yet better than ponytail on DRY; iterate core wording, rerun
- [ ] 3.5 CHANGELOG.md; manifests to 1.0.0
- [ ] 3.6 Create public `ZacharyArthur/braid`, push, tag v1.0.0 (ask the user first)
- [ ] 3.7 Verify: `node scripts/check.cjs`, then `/braid:spec archive`
