## Why

Mistral Vibe (3.1.2) users get braid today only by hand: a static copy of the core at level full in `~/.vibe/AGENTS.md` and a skills-only copy of braid 1.8.0 in `~/.vibe/plugins/braid`. The level never changes, the project pointers and map never arrive, and both copies go stale. Vibe 3.1.2 turns out to have native plugins with command hooks (`session_start`, `pre_agent`) that take the same JSON-on-stdin shape braid's hook already reads, so braid can run there with no adapter.

## What changes

- Vibe becomes braid's fifth harness, as a native Vibe plugin (Agent Plugins 1.0). It needs no adapter, because Vibe runs command hooks itself (see design):
  - New root `plugin.json`: the Agent Plugins 1.0 manifest, with `name: braid`, braid's version, and an `ai.mistral.vibe` extension (`schemaVersion: 1`), which turns hooks on. Vibe prefers it to the Claude Code and Codex manifests, two foreign formats it would otherwise reject as ambiguous. It has no `description`: Vibe lists every plugin in its system prompt, and with no description of braid's own, braid adds no always-on text there (Vibe writes its own generic line).
  - New `ai.mistral.vibe/hooks.toml` with two named hooks. `session`, type `session_start`, has no `match`, so it fires on startup, resume, clear and fork; it runs `node hooks/braid.cjs session`. `prompt`, type `pre_agent`, has `match = "main"` so subagent turns don't trigger it; it runs `node hooks/braid.cjs prompt`. Both have a 15 s timeout, as in `hooks.json`.
  - `hooks/braid.cjs`: a payload is Vibe's when its `hook_event_name` is `session_start` or `pre_agent`. Such a payload changes two things, and every other harness keeps what it gets today:
    - the state folder is Vibe's `PLUGIN_DATA` (a per-session folder) alone, so a Vibe started from another harness's shell never writes to that harness's folder (Pi's extension guards against the same leak)
    - the context goes out as `hook_specific_output.additional_context`, the key Vibe reads
- Skills: `/braid:<skill> [args]`, as in Claude Code and ZCode. Vibe honors `disable-model-invocation` (and `agents/openai.yaml`), so user-only skills stay out of the model's list and still run from the slash menu. Invariant 4 stays three marks.
- Install, update, uninstall. Vibe 3.1.2 or later; it has no plugin install command. The hooks bind when a session starts, and a resumed session keeps the plugin copy it pinned, so each step below ends by starting a new session:
  - install: `git clone https://github.com/ZacharyArthur/braid "$HOME/.vibe/plugins/braid"`. The README says it in prose too: the folder is `plugins/braid` inside Vibe's home (`~/.vibe`, or `VIBE_HOME` when set). The command uses `$HOME`, not `~`, because Windows PowerShell passes `~` to `git` literally. In cmd.exe, which expands neither, the folder is written out in full.
  - the clone tracks `main`, and from the next session its hooks run with the user's rights, without Vibe asking first
  - update: `git -C "$HOME/.vibe/plugins/braid" pull`
  - uninstall: delete the folder, or list braid in `disabled_plugins`
  - hand setups: the README tells them to remove the core block from `~/.vibe/AGENTS.md` and the old `~/.vibe/plugins/braid` folder first. braid never touches either.
- What braid writes under `~/.vibe`: nothing at install. At run time, one state file per session, `sessions/<id>.json`, inside the folder Vibe passes as `PLUGIN_DATA` (`~/.vibe/logs/session/plugins/data/<session id>/braid/`), Vibe's folder for plugin state. `/braid:retro all` may also write `~/.vibe/AGENTS.md`, after the user's yes, as it does each harness's global file.
- Gaps, stated in the README and the spec rather than worked around:
  - The core is added to the first user message (and to the first message after each resume, clear or fork), not to the system prompt. A braid command sent as that first message is followed by the core at the old level, which stays in the conversation until compaction; sending it as a later message avoids this.
  - Vibe fires no `session_start` on compaction, so after a compaction the core is gone, as in ZCode. `drift on` partly makes up for it.
  - Subagents get no core: `session_start` never fires for them (as in ZCode and Pi).
  - `/branch` and `/rewind` start a new session id, so the level goes back to the default.
  - Without Node, Vibe shows a warning for each hook and runs without braid.
  - A braid command queued behind another message while a turn runs is not seen: Vibe merges the queue into one turn, and the hook gets only its first message.
  - After an install or update, only new sessions run the new braid.
  - `/braid:skill` has no Vibe route yet (folders, user-only marks, test runs, evals); the skill says so when run in Vibe.
- `skills/retro` reads Vibe's store at `$VIBE_HOME/logs/session/unified/<id>/` (default `~/.vibe`):
  - each session folder: the project is `meta.json` `origin_directory`, and the time is `meta.json`'s file mtime (last activity, as the other readers use; `end_time` doesn't move when a session is resumed)
  - the failures are the `effect` entries in `chunks/*.json`, and those still only in `journal/*.jsonl` (`payload.delta[].entry`): a tool call that `failed`, or a shell call whose `state.output.structured_content.returncode` is a number other than 0 (a few completed calls carry no `structured_content`, which is no failure)
  - `file_system.bash` (and the managed `file_system.git_bash` and `file_system.powershell`) joins retro's shell tools, so a Vibe shell failure groups with the same failure from the other harnesses
  - subagent sessions are skipped, as ZCode's are, by `identity.kind: "subagent"` in `generations/*/runtime-state.json`; `meta.json` `parent_session_id` can't be the marker, because Vibe also sets it on a forked conversation, whose session counts
  - router rows and the standing line for Vibe: `/config`, `/reload`, `/mcp`, `/plugins`, `/reload-plugins`, `/skills`, `/status`, `/context`, and the footer's usage gauge for spend; its global AGENTS.md is `~/.vibe/AGENTS.md`
- `skills/standards`:
  - Vibe joins the "every agent reads AGENTS.md" line
  - Delegation: Vibe's tier line names its built-in read-only `explore` subagent and no models
  - no agent file is offered, because a Vibe agent's model is an alias from the user's own `[[models]]`, which a project file can't name portably
  - review reports no drift for Vibe's `explore`, as for ZCode's built-in Explore
- `skills/skill/SKILL.md`: one line saying Vibe has no route yet, and the skill names it when run there.
- `skills/help`: a Vibe row (`/braid:<skill> [args]`), Vibe in the description, and Vibe beside ZCode in "never re-injects after compaction".
- README: Vibe in the harness list, an install, update and uninstall section, and its gaps. The `retro` row names Vibe, the `skill` row says it has no Vibe route yet, the "Always on" line names the harnesses that lose the core at compaction, and the Mods paragraph says Vibe never loads mods.
- Glossary: Explorer gains "`explore` in Vibe (built in)".
- `scripts/check.cjs`:
  - root `plugin.json` joins the manifest list (one version across four manifests), and must carry the exact `$schema` `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, `name: braid`, the extension with `schemaVersion: 1`, and no `description`
  - `hooks.toml` wiring: each block's name, type, command and timeout; no `match` on `session_start`; `match = "main"` on `pre_agent`
  - Vibe hook tests: the output key, and the state file under `PLUGIN_DATA` even with the other harnesses' variables set
  - a Vibe store in retro's fake home
- AGENTS.md: five harnesses, Vibe in Stack, invariant 2 reads "All four manifests". CONTRIBUTING: "all four `plugin.json` files". TESTING.md: a Vibe section, and a root-manifest line in the Codex and ZCode sections. `braid/map.md` patched. Release: version 1.10.0 in all four manifests and a `## [1.10.0]` CHANGELOG entry, as CONTRIBUTING's Releasing says.
- ADRs:
  - 0002 amended, title included: Vibe is the fifth harness, through a native manifest and `hooks.toml`, with no adapter
  - 0014 amended: no explorer offer for a harness whose agent files can name a model only by a per-user alias
  - 0011 and 0015: their stale harness counts updated

## Impact

- Specs:
  - `session`: Vibe harness added; the map's "Any harness" scenario names Vibe.
  - `retro`: Vibe added to the stores read and to the router.
  - `standards`: Vibe added to the explorer offer, the tier line and drift review.
  - `mods`: "braid alone" covers five harnesses.
  - `skill`: the heavy path names its four harnesses and says Vibe has no route yet.
- Code:
  - new: `plugin.json`, `ai.mistral.vibe/hooks.toml`
  - changed: `hooks/braid.cjs` (Vibe's state folder and output key, header), `skills/retro/retro.cjs` (a Vibe reader, one shell tool name), `scripts/check.cjs`
- Docs: `README.md`, `skills/{help,retro,skill,standards}/`, `AGENTS.md`, `CONTRIBUTING.md`, `TESTING.md`, `braid/GLOSSARY.md`, `braid/map.md`, ADRs 0002, 0011, 0014 and 0015, `CHANGELOG.md`.
- Invariants:
  1. Budget: unchanged. Vibe sees the same core, pointers and four model-invoked descriptions that `check.cjs` measures (~1960 against a 1978 limit), and the root manifest has no description to add. Vibe's own line for the plugin (its generic text and the path) is Vibe's overhead, as each harness's skill-list wrapper is.
  2. Version: four manifests instead of three, one version, enforced.
  3. Provenance: unchanged.
  4. User-only: unchanged.
- "Identical behavior": not met where the gaps above say so.

## Out of scope

- An adapter or a re-injection hook to beat compaction (for example, the core on every `pre_agent`): it would cost about 1.5k tokens per prompt. `drift on` already exists for this.
- Core for Vibe subagents via `pre_agent` and `parent_session_id`: a subagent's turns would each re-inject it, and Vibe's per-subagent `PLUGIN_DATA` is unverified. Add it once both are measured.
- Carrying the level across `/branch` and `/rewind` from the session it forked from: other harnesses also start a forked session at the default level.
- A `braid-explore` agent file for Vibe: its model would be a per-user alias.
- `skills/skill` for Vibe (skill folders, the user-only check, headless evals): its eval path needs Vibe's headless approval and isolation behavior measured first. Queued as `braid/changes/vibe-skill-evals/`; the README and the skill itself state the gap.
- Vibe in `bench/ab.cjs`: it covers `claude` and `codex` only.
- Reading `session_logging.save_dir` in retro: retro doesn't read Pi's `sessionDir` setting either.
- Replaying Vibe's journal the way Vibe does (generations, `CURRENT`, ordered updates): retro only counts sessions per failure, so a union of every `effect` it finds is enough.
- Editing the user's `~/.vibe` (the AGENTS.md block, the old plugin folder): the user's files. The README says what to remove.
- A registry or marketplace entry: Vibe 3.1.2 has no plugin install command or plugin marketplace.
