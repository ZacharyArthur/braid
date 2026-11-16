## 1. Confirm Vibe's behavior

- [x] 1.1 Against the installed Vibe (3.1.2) with a throwaway `VIBE_HOME` and a local recording provider. First confirm design.md's Evidence table still holds (the full re-run is 6.1, on the built branch). Then (answered in design.md, "Task 1.1": from Vibe's installed source, and a no-`node` probe; `explore`'s model stays unverified):
  - spawn an `explore` subagent: where does its session land, what tells it apart from a `/branch` fork (both may set `parent_session_id`; try `.session-index.json` `identity.kind` and the parent's `child_sessions`), and which model does its request name?
  - queue `stop braid` behind another message while a turn runs: does the hook see it alone?
  - `/branch` gives a new `PLUGIN_DATA`?
  - a hook whose `node` is missing shows a warning and lets the message through?
  - after a `git pull` of the plugin, does `/reload-plugins` run the new hook, or only a new session?
  - does Vibe ask before a user plugin's hooks first run?
  - does `/status` show tokens or cost? The retro standing line names it, or says Vibe ships no cost tool

  Update design.md, and the spec or the gaps for each answer that differs

## 2. Manifest and hooks

- [x] 2.1 Root `plugin.json`: `$schema` exactly `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, `name: braid`, braid's version, `repository`, `license`, and `extensions["ai.mistral.vibe"].schemaVersion: 1`; no `description`
- [x] 2.2 `ai.mistral.vibe/hooks.toml`, both with `timeout = 15.0`:
  - `name = "session"`, `type = "session_start"`, no `match`, `command = "node hooks/braid.cjs session"`
  - `name = "prompt"`, `type = "pre_agent"`, `match = "main"`, `command = "node hooks/braid.cjs prompt"`
- [x] 2.3 `hooks/braid.cjs`: a Vibe payload (`hook_event_name` `session_start` or `pre_agent`) keeps its state under `PLUGIN_DATA` alone and gets `{"hook_specific_output":{"additional_context":…}}`; the header names Vibe
- [x] 2.4 `check.cjs`, manifests and wiring:
  - root `plugin.json` in the manifest list (one version), with its `$schema`, name and extension checked, and no `description`
  - `hooks.toml`: each block's name, type, command and a timeout of 1-15 s; no `match` on `session_start`; `match = "main"` on `pre_agent`
  - mutations: removing the extension, adding `match = "startup"`, or dropping `match = "main"` fails it
- [x] 2.5 `check.cjs`, hook tests:
  - a Vibe `session_start` payload returns the core under the Vibe key and no `hookSpecificOutput`
  - a `pre_agent` `/braid:braid lite` returns `BRAID LEVEL: lite`
  - with `PLUGIN_DATA`, `CLAUDE_PLUGIN_DATA` and `zcode_plugin_data` all set, the state file lands under `PLUGIN_DATA/sessions/`, and a second `session_start` there injects lite
  - a Claude payload still returns `hookSpecificOutput` and uses `CLAUDE_PLUGIN_DATA`
  - mutations: dropping either half of the branch fails it

## 3. Retro

- [x] 3.1 `skills/retro/retro.cjs`: `file_system.bash`, `file_system.git_bash` and `file_system.powershell` join `SHELL_TOOLS`, `vibe` joins the header's `counts`, and a `vibeSessions` reader goes over `$VIBE_HOME/logs/session/unified/` (default `~/.vibe`):
  - folders only; a folder without `meta.json` is skipped
  - cwd is `meta.json` `origin_directory`, and time is `meta.json`'s mtime (a number, as the other readers give)
  - subagent sessions are skipped by `identity.kind === "subagent"` in any `generations/*/runtime-state.json`, never by `parent_session_id`
  - failures are every `effect` entry in `chunks/*.json` arrays and `journal/*.jsonl` lines (`payload.delta[].entry`): one with `state.status: "failed"` (text `state.error.message`), or a call to one of those shell tools whose `state.output.structured_content.returncode` is a number other than 0 (text: stderr, else stdout); a call with no `structured_content` is no failure; `cmd` comes from `detail.input.command`
  - each session's reads sit in their own try/catch
- [x] 3.2 `check.cjs` fixture, in a fake home with `.vibe/logs/session/unified/`:
  - two project sessions with the same failing `git` shell call: one in a chunk with a non-zero `returncode`, one only in a journal as a `failed` effect; one of them a fork with `parent_session_id` set
  - a completed `file_system.bash` with no `structured_content`, asserted not counted
  - a subagent session with the same failure, its `runtime-state.json` `identity.kind` `subagent`; the fork's is `fork`
  - a session in another folder
  - a corrupt session folder, two whose `meta.json` is valid JSON of the wrong shape (`null`, a numeric `origin_directory`), and a stray file in the store root
  - `VIBE_HOME: ''` joins the env the block already clears

  Assertions to update, since the header and the `shell git` group gain `vibe`:
  - `want` and `wantOther`, each with and without SQLite
  - the broken-ZCode `6 sessions (claude, codex, pi)` check
  - the `pi 1)` and `pi 2)` header probes become `pi 1,` and `pi 2,`

  New assertions:
  - the header counts `vibe 2`
  - the fork is counted; the subagent, the other folder and the corrupt folder are not
  - mutations: dropping `file_system.bash` from `SHELL_TOOLS`, the journal read, or the subagent skip fails it
- [x] 3.3 `skills/retro/SKILL.md`:
  - Vibe in the description, and "all four harnesses" becomes "all five"
  - global AGENTS.md: `~/.vibe/AGENTS.md` (`$VIBE_HOME`), offered only on a yes, as for the other harnesses
  - router column: permissions `/config` (tools); config `/config`, `/reload`; MCP `/mcp`; skills or plugins `/skills`, `/plugins`, `/reload-plugins`
  - standing line: `/status`, `/context`, and the footer's usage gauge for spend

## 4. Standards, help, glossary

- [x] 4.1 `skills/standards`:
  - `SKILL.md`: Vibe in the AGENTS.md readers line, and its Review drift rule exempts Vibe's `explore`
  - `delegation.md`: a Vibe paragraph (the tier line names the built-in `explore` and no models; no agent file, since its model would be a per-user alias); its Review paragraph says Vibe's `explore`, like ZCode's `Explore`, expects no file
- [x] 4.2 `skills/help/SKILL.md`: a Vibe row `/braid:<skill> [args]`, Vibe in the description, and Vibe beside ZCode in "never re-injects after `/compact`"
- [x] 4.3 `braid/GLOSSARY.md`: Explorer gains "`explore` in Vibe (built in)"
- [x] 4.4 `skills/skill/SKILL.md`: one line saying Vibe has no route yet (skill folders, user-only marks, test runs, evals), said when the skill runs in Vibe

## 5. Docs

- [x] 5.1 README:
  - Vibe in the harness list
  - a Vibe section: Vibe 3.1.2 or later, the clone install, update and uninstall, each ending in a new session, with paths written as `"$HOME/.vibe/plugins/braid"` (Windows PowerShell passes `~` to `git` literally), and in prose: the folder is `plugins/braid` in Vibe's home, `VIBE_HOME` when set, written in full in cmd.exe; the clone tracks `main` and its hooks run with your rights from the next session
  - for a hand setup, remove the core block from `~/.vibe/AGENTS.md` and the old `~/.vibe/plugins/braid` first
  - the gaps: core in the user message, an older core left behind by a braid command sent as the first message, lost at compaction (drift), no subagent core, the level resets on `/branch` and `/rewind`, a hook warning without Node, a resumed session keeps the braid it pinned, no `/braid:skill` route
  - the update line
  - the `retro` row names Vibe; the `skill` row says no Vibe route yet; the "Always on" line names ZCode and Vibe as losing the core at compaction
  - the Mods paragraph says Vibe never loads them
- [x] 5.2 AGENTS.md: five harnesses, `hooks.toml` in Stack, invariant 2 "All four manifests". CONTRIBUTING: "all four `plugin.json` files"
- [x] 5.3 TESTING.md, a Vibe section:
  - the README's install and update, run as written in Windows PowerShell and in a POSIX shell, then a new session; `/plugins` shows braid
  - the level kept across `--resume`; `stop braid`
  - a user-only skill absent from the model's list but runs as `/braid:<skill>`
  - after `/compact` with drift on, the drift line still arrives
  - `/braid:retro` counts `vibe` sessions

  The Codex and ZCode sections each gain: with the root `plugin.json` present, braid installs and its hooks run as before
- [x] 5.4 Records:
  - ADR 0002 amended, title included (Vibe, the fifth harness: a native manifest and `hooks.toml`, no adapter)
  - ADR 0014 amended: no explorer offer where agent models are per-user aliases; its "all three harnesses" line explained in the amendment
  - ADRs 0011 ("three harnesses", "a three-harness plugin") and 0015 ("all three harnesses read"): amended, the new counts given in the amendment
  - `braid/map.md` patched
  - `braid/changes/vibe-skill-evals/proposal.md` queued (Why and Out of scope only)
- [x] 5.5 Release prep: version 1.10.0 in all four manifests, and the CHANGELOG entry under `## [1.10.0] - <date>`

## 6. Verify

- [x] 6.1 Manual, in Vibe 3.1.2 with a throwaway `VIBE_HOME` and the local recording provider (the working tree copied in, since the branch has no commit to clone; `.git` and ignored files left out, as a clone has them):
  - a clone of the branch in `plugins/braid` loads, and Vibe's plugin line carries no braid text ("Capabilities provided by braid.")
  - the first request carries the core at full; `/braid:braid lite` then a resume carries lite; `stop braid` drops it; bare `/braid:braid` brings it back (six runs on one session; the first-message gap shows on each command, every headless run being a resume)
  - with `CLAUDE_PLUGIN_DATA` set in the shell that starts `vibe`, the state still lands in `PLUGIN_DATA` (nothing written to the other folder)
  - a user-only skill is not in the system prompt (`braid:humanizer` absent, `braid:map` listed)
- [x] 6.2 The other harnesses are unaffected by the root `plugin.json`:
  - `claude plugin validate .`: passes, with the same two warnings round 1 found at HEAD (root CLAUDE.md, no icon)
  - in a throwaway `PI_CODING_AGENT_DIR`, `pi install <checkout path>` loads the extension and skills as before (`/skill:braid lite` saved lite to `braid/sessions/`)
  - Codex and ZCode: the TESTING.md lines from 5.3. Untested at release, the user's call; the README says nothing beyond what was run
- [x] 6.3 Untested at release, the user's call (a patch release follows if it fails). By the user, in the real `vibe` with their own model, once the branch is installed: `/compact`, and the next message has no core (headless `-p` can't run `/compact`)
- [x] 6.4 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`
- [x] 6.5 `/braid:spec archive` (6.3 marked untested)
