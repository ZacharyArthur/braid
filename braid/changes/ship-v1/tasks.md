## 1. Design skill
- [x] 1.1 Clean-room `skills/design/SKILL.md` (≤ 8 KB): KISS/YAGNI for UI, AI-slop tells, pre-ship checks; Codex yaml; UPSTREAM row

- [x] 1.2 `/braid:standards` (AGENTS.md owner) + map/spec/handoff/core touch points

## 2. Harness installs
- [x] 2.1 Claude Code: run the TESTING.md checklist (core at full, `/braid:braid lite` survives `/compact`, "stop braid", `/braid:spec propose`)
  - pass: core at full (`BRAID ACTIVE — level: full`); `/braid:braid lite` + `/compact` → lite (re-injected `level: lite`); drift on → next prompt carries `braid: lite · ...`, drift off → gone; subagent → lite (SubagentStart `BRAID ACTIVE — level: lite`); `/braid:adhd` + `/compact` → still ADHD-shaped, "stop adhd mode" → normal prose; `/braid:spec propose add-something` in a scratch repo → `braid/changes/add-something/` (proposal.md, specs/, tasks.md), new session's Project state: `Active change: braid/changes/add-something (0/2 tasks)`; "stop braid" → `BRAID OFF for this session.`, after `/compact` no BRAID ACTIVE, core rules or Project state in context (only the compaction summary's paraphrase); `/braid:humanizer` and `/braid:security-audit` in the `/` menu, "make this sound less AI" → no skill loaded
- [x] 2.2 Codex: install from the marketplace; hooks fire; `$spec` works
  - session start: `BRAID ACTIVE — level: full` and `Active change: braid/changes/ship-v1 (9/12 tasks)` in developer context; no PONYTAIL context
  - skill picker: sends `[$braid:braid](<path>) lite` (same link form as ZCode), parsed by the picker fix: `BRAID LEVEL: lite`, `BRAID DRIFT REMINDER: on/off`; the drift line appears on the next plain prompt and is gone after drift off
  - resume and compaction: both re-inject a fresh `BRAID ACTIVE — level: lite` block with core rules and Project state (SessionStart `resume` and `compact` fire, unlike ZCode)
  - subagent: `BRAID ACTIVE — level: lite` from SubagentStart, no Project state
  - user-only: "make this sound less AI" → no humanizer loaded
  - "stop braid" → `BRAID OFF for this session.`; after compaction no BRAID ACTIVE, core rules or Project state
  - `$spec propose add-something3` in a scratch repo → proposal.md, specs/, tasks.md (0/2); a new session reports that change at 0/2 with the pointer's checklist guidance (Codex declines to quote developer context verbatim)
- [x] 2.3 ZCode: install from `.claude-plugin/marketplace.json`; confirm the shared hooks.json loads (route records the evidence so far)
  - install: plugin enabled from the GitHub marketplace, no hooks.json error; SessionStart + UserPromptSubmit registered, SubagentStart dropped with a non-blocking "not supported by this ZCode runtime" warning
  - session start: `BRAID ACTIVE — level: full`, Project state lists ship-v1, all skills present with user-only ones suffixed "Only when the user explicitly invokes it."
  - hook input (debug-logged in the installed copy): `session_id` in stdin equals `CLAUDE_SESSION_ID` and stays the same across compact; state lands in ZCode's plugin data folder; UserPromptSubmit output reaches the model (drift on/off and the drift line work when typed as plain text)
  - skill picker: sends `[$braid](<path>) lite` raw, so picker commands never parsed; fixed in braid.cjs with a check.cjs case; live: picker `drift off` → `BRAID DRIFT REMINDER: off`, next plain prompt has no drift line
  - compaction: SessionStart never fires on compact (logged with the matcher on and off, explicit and auto compact; ZCode source runs it once per runtime), so core rules aren't re-injected; documented in README and TESTING, fix options in routes/v1.md
  - restart: SessionStart `resume` fires twice, under the real id (saved state) and a fresh one (default level), so a stray `level: full` banner can appear
  - `/braid:spec propose add-something2` in a scratch repo → change folder with 3 tasks; new session's Project state: `Active change: braid/changes/add-something2 (0/3 tasks)`
  - skills: Settings → Skills renders no switch for plugin skills (ZCode source: `SkillsSection.tsx`), and ZCode reads no user-only frontmatter; "make this sound less AI" auto-loaded humanizer. README, TESTING and ADR 0002 corrected

## 3. Release
- [x] 3.1 TESTING.md manual checklist
- [x] 3.2 GitHub Actions: `node scripts/check.cjs` on windows-latest and ubuntu-latest
- [x] 3.3 README: Codex and ZCode install, ZCode skills to toggle off
- [x] 3.4 A/B baseline (bench/results/2026-10-03-sonnet-baseline): checks 15/15 all arms; braid fewest lines incl. tests (306 vs 344 vs 396), DRY 3/6 vs 0/6, cost +18% vs ponytail
- [x] 3.5 CHANGELOG.md; manifests to 1.0.0
- [ ] 3.6 Create public `ZacharyArthur/braid`, push, tag v1.0.0 (ask the user first)
- [ ] 3.7 Verify: `node scripts/check.cjs`, then `/braid:spec archive`
