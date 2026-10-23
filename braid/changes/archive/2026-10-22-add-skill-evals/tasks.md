## 1. Provenance

- [x] 1.1 `UPSTREAM.md`: bump the Anthropic `skill-creator` row's SHA to the commit reviewed; add clean-room rows for Codex's `skill-creator` (openai/codex) and agentskills.io's skill-creation guides (agentskills/agentskills), ideas only
- [x] 1.2 README "Derived or inspired by": name the two new sources

## 2. skill

- [x] 2.1 `skills/skill/SKILL.md`: heavy-path routing; baseline-first line in §1; Pi's folders in §2; a gotchas slot in §3's template; Pi in §4's user-only check and the Done line; description names four harnesses
- [x] 2.2 `skills/skill/evals.md`: fresh runs per harness, output evals against a baseline, opt-in trigger tuning, written fresh (no upstream text), under 8000 bytes

## 3. Pi sweep

- [x] 3.1 `skills/retro/retro.cjs`: read Pi's store (`PI_CODING_AGENT_SESSION_DIR`, else the agent folder's `sessions/`, `~` expanded); `bash` counted as a shell tool; Pi in the session counts. Dropping Pi's `Command exited with code N` line was tried and left out: the error line above it is picked anyway
- [x] 3.2 `scripts/check.cjs`: a Pi session in the default store joins the recurring `git` signature, two more in a `~/`-prefixed `PI_CODING_AGENT_SESSION_DIR` replace it; a passing `bash` call and the prompt stay out. Each of these reverted fails the check: Pi left out of the store list, no `~` expansion, the override ignored
- [x] 3.3 `skills/retro/SKILL.md`: Pi in the description, the user-level file for `all`, the router table and the standing line
- [x] 3.4 `skills/standards/SKILL.md` and `delegation.md`: Pi reads AGENTS.md directly; Pi ships no subagents, so no explorer and no Pi agent in the tier line
- [x] 3.5 README `retro` row, TESTING.md (retro line, a Pi retro check)

## 4. Record

- [x] 4.1 ADR 0016: braid writes its own eval path instead of vendoring a skill creator
- [x] 4.2 CHANGELOG under Unreleased
- [x] 4.3 Verify (round 1): `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, then `/braid:spec archive`

## 5. Round 1 review fixes (Claude, Codex, GLM)

- [x] 5.1 `evals.md`, Pi: `--approve` on headless runs (print and JSON modes can't answer the trust prompt, so project skills were skipped); trigger runs get `--tools read`; a scratch folder is said to fence nothing in, so Pi output evals run only in a container or throwaway VM, else Pi is skipped. `SKILL.md` §5 no longer suggests unattended `pi -p` for the smoke test
- [x] 5.2 `evals.md`: ZCode gets no trigger tuning (no headless mode) and is listed as untested; the cost names all rounds (up to 300) plus the final check; the first by-hand run also confirms the harness found the skill; "SKILL.md §4" spelled out
- [x] 5.3 `SKILL.md` routing: a named `skill-creator` that isn't installed is said so; an existing skill runs step 4 only before `evals.md`
- [x] 5.4 Spec `skill`: hand-off only to a creator that runs evals; scenarios for a named creator not installed, Pi output evals without a container, and Pi trigger runs
- [x] 5.5 `retro.cjs`: Pi's `powershell` tool counts as a shell, so a `git` failure groups across Pi's shells
- [x] 5.6 `check.cjs`: exclusions asserted on the override run too; a `powershell` session and another project's session in the override folder; `PI_CODING_AGENT_DIR` exercised. Each guard reverted in turn fails the check: Pi store left out, no `~` expansion, the session-dir override or agent-dir variable ignored, `isError` ignored, `powershell` not a shell, the project filter skipped, the prompt counted as a failure
- [x] 5.7 `design.md`: Pi's exit line described as it is (kept, after the output or `(no output)`); Pi's headless trust and fencing recorded
- [x] 5.8 Verify (round 2): `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`

## 6. Round 2 review fixes (Claude, Codex, GLM)

- [x] 6.1 Pi loading (Codex reproduced a trusted copy's project extension writing outside the folder at startup, before any tool fence): Pi runs `--no-approve --skill <skill folder>`, so the copy stays untrusted and the skill still registers. The user chose this over container-or-skip for trigger runs. Checked locally with no model call (`PI_OFFLINE`, an empty agent folder): `--approve --tools read` wrote the marker, the new flags didn't, and RPC `get_commands` listed the skill from its folder
- [x] 6.2 Pi fencing: trigger runs add `--tools read --no-mcp` (`--tools` alone keeps MCP tools); the table's Pi command carries only what both kinds of run need; output evals' container holds only the model key
- [x] 6.3 `evals.md`: an assertion failing in both runs is read before it changes; a real requirement neither run met stays
- [x] 6.4 Spec scenario "Pi trigger runs": untrusted copy, no MCP tools, reads only
- [x] 6.5 `check.cjs`: p2-p4 under `pi-agent/sessions/`, read through `PI_CODING_AGENT_DIR` and through `PI_CODING_AGENT_SESSION_DIR`, plus a stray session outside `sessions/` that neither may read. Using the agent folder without `sessions/` now fails the check, as do the eight round 1 mutations
- [x] 6.6 `design.md`: Pi loading and fencing as built
- [x] 6.7 Verify (round 3): `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`

## 7. Round 3 review fixes (Claude; Codex and GLM approved)

- [x] 7.1 Pi keeps the first skill it finds by name, so an installed copy beat `--skill` and trigger runs measured the old description. Trigger runs add `--no-skills` when a copy is installed, and say near-miss queries then meet no neighbouring skills; the first by-hand run checks the path of the copy read. Checked with no model call: RPC `get_commands` listed the installed description without `--no-skills` and the one under test with it
- [x] 7.2 `--skill` moves from the table's Pi command to the trigger-run flags, so output-eval baselines in Pi load no skill
- [x] 7.3 Trigger runs add `--exclude-tools 'mcp__*'`: `--no-mcp` leaves an extension's own MCP support alone
- [x] 7.4 Spec scenario "Installed copy in Pi"; `design.md` follows
- [x] 7.5 Verify (round 4): `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`

## 8. Round 4 review fixes (Claude, GLM; Codex approved)

- [x] 8.1 `evals.md`: the Codex and Pi headless commands carry `</dev/null`; both read piped stdin and hung under a shell tool that left it open (Claude reproduced: Pi timed out, Codex waited on "Reading additional input from stdin")
- [x] 8.2 `evals.md` and spec scenario "Installed copy in Pi": only another copy of the same name, installed elsewhere, calls for `--no-skills`; the copy under test may itself be the installed one
- [x] 8.3 `delegation.md`: "every harness with subagents runs them on the main model", no longer contradicting the Pi paragraph above it (GLM)
- [x] 8.4 Verify (round 5): `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`

## 9. Round 5 review fixes (Claude; Codex and GLM approved)

- [x] 9.1 `evals.md`: in PowerShell, `$null |` closes stdin, since PowerShell rejects `<` (Claude reproduced the parse error and the working form)
- [x] 9.2 `evals.md`: the Claude Code command carries `</dev/null` too; `claude -p` otherwise waits 3 s a run on an open stdin (nit, taken)
- [x] 9.3 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`

## 10. Round 6 review fixes (Claude; Codex and GLM approved clean)

- [x] 10.1 `evals.md`: the scratch copy keeps its `.git`, since Codex refuses to run outside a git repo (Claude reproduced the exit)
- [x] 10.2 `check.cjs`: the failing Pi call sits between two passing ones, so taking the first or last call instead of the one matching `toolCallId` fails the check (nit, taken; both mutations confirmed caught)

## 11. Round 7 review (Codex, GLM approved clean; Claude approved with a nit)

- [x] 11.1 `braid/GLOSSARY.md` Explorer: "none in Pi (no subagents)" (nit, taken)
