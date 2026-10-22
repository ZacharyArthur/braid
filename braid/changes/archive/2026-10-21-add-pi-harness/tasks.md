## 1. Confirm Pi's API

- [x] 1.1 Against the installed Pi (1.3.0, its source): `ctx.sessionManager.getSessionId()` exists; `input` sees `/skill:braid lite` raw, before the skill expands; discovery loads only `.ts` and `.js`, so the extension is `extensions/braid.js` in CommonJS; `systemPromptOptions.sections` is a mutable record and a returned `message` is added to the run; extensions get no agent folder accessor, so `$PI_CODING_AGENT_DIR` or `~/.pi/agent`, as Pi's `getAgentDir` does. design.md updated

## 2. Hook

- [x] 2.1 `hooks/braid.cjs`: the level and `adhd` regexes accept `skill:` as well as `braid:`
- [x] 2.2 Test in `check.cjs`: `/skill:braid drift off` parses, `/skill:adhd` sets adhd

## 3. Extension

- [x] 3.1 `extensions/braid.js`: `session_start` spawns `node hooks/braid.cjs session` asynchronously with `{session_id, cwd}` and keeps the context; every child gets `PLUGIN_DATA=<agent folder>/braid`, without `CLAUDE_PLUGIN_DATA` or `ZCODE_PLUGIN_DATA`; `input` runs the prompt hook on the raw text, and a `BRAID` reply rebuilds the section; `before_agent_start` sets or clears the `braid` section and the reply's first line goes to the next run (round 1: by `nextTurn`); every failure injects nothing
- [x] 3.2 Test in `check.cjs`: load the extension with a stub `pi`; the core in the section at session start; `/skill:braid lite` switches it; `stop braid` clears it; bare `/skill:braid` brings it back without repeating the core as a message; with `PI_CODING_AGENT_DIR` and `CLAUDE_PLUGIN_DATA` both set, the state file lands under `$PI_CODING_AGENT_DIR/braid/sessions/`; a hook with unreadable output injects nothing and throws nothing. Mutations checked: dropping the env cleanup or sending the whole reply fails the check
- [x] 3.3 `check.cjs` requires `extensions/braid.js`, so a missing or moved extension fails the check; biome checks it (round 1)

## 4. Docs

- [x] 4.1 README: Pi in the harness list, install (`pi install git:github.com/ZacharyArthur/braid`), update, and its gaps (no subagent injection, silent without Node)
- [x] 4.2 `skills/help/SKILL.md`: a Pi row (`/skill:<skill> [args]`), Pi in the description
- [x] 4.3 AGENTS.md: four harnesses; the extension in Stack and Conventions
- [x] 4.4 ADR 0002 amendment matches what landed (`extensions/braid.js`); `braid/map.md` patched; CHANGELOG entry under Unreleased

## 5. Review round 1

Three reviewers (Claude, Codex, GLM 5.3): approve with fixes, changes needed, approve with fixes.

- [x] 5.1 ADHD toggles: the hook confirms `/braid:adhd`, `/skill:adhd`, "stop adhd mode" and "normal mode" with `BRAID ADHD MODE: on|off` in all four harnesses, so Pi rebuilds its section; before, "normal mode" left ADHD in it and ADHD switched on mid-session was lost at compaction (the user chose the hook over teaching the extension the commands). Tests: the hook's two replies; the section gains and drops ADHD
- [x] 5.2 Steered commands: the reply goes by `pi.sendMessage(..., { deliverAs: 'nextTurn' })` instead of a `before_agent_start` return, which never fired for a steered prompt and left the reply for a later run. Steering the reply as well was tried and dropped: Pi steers one message per turn, so it cost a model turn of its own (seen live). Test: a steered `stop braid` clears the next run's section, confirms there, and steers nothing
- [x] 5.3 State folder: `~` in `PI_CODING_AGENT_DIR` expands to the home folder, as Pi does, instead of a folder named `~` under the project; `CLAUDE_PLUGIN_DATA` and `ZCODE_PLUGIN_DATA` are removed in any letter case. Test: `~/pi` with a stubbed home, plus an inherited `Claude_Plugin_Data` and `ZCODE_PLUGIN_DATA`, all land in the stubbed Pi folder
- [x] 5.4 Hook output that parses but isn't text injects nothing, instead of throwing at `out.startsWith`. Test: `additionalContext: 5`
- [x] 5.5 `windowsHide: true` on the hook spawn, as Pi's own spawns have
- [x] 5.6 Biome now checks `extensions/**`; the redundant `'use strict'` is gone. README: `pi update git:github.com/ZacharyArthur/braid`, since plain `pi update` updates only Pi. The hook's header names Pi
- [x] 5.7 Each fix reverted in turn fails `check.cjs` (env cleanup exact-case only, no `~` expansion, reply steered on its own, non-text output passed through, "normal mode" unconfirmed). Live again with GLM 5.3 Flash: `/skill:braid lite` and `/skill:adhd` confirmations reach the model with their runs; a `stop braid` steered into a streaming answer took one model turn, and the next run had no core section and carried `BRAID OFF`

## 6. Review round 2

Three reviewers: approve (two nits), approve, approve with fixes (one doc gap).

- [x] 6.1 design.md: with drift on, an ADHD toggle's reply is two lines and Pi sends only the first, so that prompt's drift line is dropped; the design now says so and why it costs nothing in Pi (no code change)
- [x] 6.2 Test: a `stop braid` from another extension (`source: 'extension'`) runs no command; removing the guard fails the check
- [x] 6.3 TESTING.md: a Pi section for the per-release checklist (install, level kept across `pi --continue` and `/compact`, ADHD, a command steered mid-answer, help and user-only skills)
- [x] 6.4 Pi updated itself to 1.4.0 during review: the API points braid relies on are unchanged there (`input` before expansion, `nextTurn` delivery, `sections`, `getSessionId`, `.ts`/`.js` discovery, `session_start` reasons, `steeringMode` default), and the live GLM 5.3 Flash run (levels, ADHD, `stop braid` steered mid-answer) gives the same result as on 1.3.0

## 7. Review round 3

Three reviewers: approve (three nits), approve, approve. No confirmed findings.

- [x] 7.1 Spec delta: `Generated codebase map` MODIFIED so its "Any harness" scenario names Pi
- [x] 7.2 TESTING.md: `pi remove <path to your checkout>` (the command needs its source)
- [x] 7.3 Out of scope: skills that list harnesses one by one (`retro` reads no Pi transcripts; `standards`, `skill`), queued as `braid/changes/pi-skill-support/`

## 8. Verify

- [x] 8.1 Manual, in Pi 1.3.0 with a throwaway `PI_CODING_AGENT_DIR` and a local provider that refuses connections (nothing leaves the machine; requests captured in `before_provider_request`): `pi install <repo path>` loads the extension and skills by convention; the first run carries the `<braid>` section at full; `/skill:braid lite` expands the skill, switches the section to lite and adds the `BRAID LEVEL: lite` line; a new `pi -p` process on the same session id resumes at lite, read from `<agent folder>/braid/sessions/`; `stop braid` drops the section. Also: the extension under a parent `"type": "module"` loads and injects; with no `node` on the PATH, Pi runs with no section and no error from braid. Live, with GLM 5.3 Flash over RPC (tools off, `keepRecentTokens` 50): the model reports full, then lite after `/skill:braid lite`; after a real `compact` the next request still carries the lite section and the model still says lite; `stop braid` drops the section and the model says off; resumed in new `pi -p` processes, the session is still off, and bare `/skill:braid` brings it back at full
- [x] 8.2 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, then `/braid:spec archive`
