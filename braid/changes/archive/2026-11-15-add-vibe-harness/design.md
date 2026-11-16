## Evidence (Vibe 3.1.2, Windows, 2026-11-15)

"Docs" means the reference that ships inside 3.1.2: the built-in `vibe` plugin's `skills/vibe/SKILL.md` and `skills/create-plugin/SKILL.md`, pinned by a fresh `VIBE_HOME` to package `1d13b98f…`. The online docs were not consulted by the author; review round 1 cited some (round 1 in `braid/reviews/2026-11-15-diff/prompt.md`). "Probe" means a throwaway `VIBE_HOME` in a temp folder, with a provider at `127.0.0.1` that records each request and answers `ok`. Nothing left the machine, and `~/.vibe` was only read.

| Claim | Backed by |
|---|---|
| No `plugin`/`install` subcommand (it has `mcp`, `config`, `update`, `help`) | `vibe --help` |
| The Agent Plugins `$schema` is exactly `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`; any other value is fatal | create-plugin Step 1; probe |
| Hooks exist: `session_start` (`startup`, `resume`, `clear`, `fork`), `pre_agent`, `post_agent`, `pre_tool`, `post_tool`, `notification`, `session_end`; none on compaction | docs, Hooks |
| Native plugins in `~/.vibe/plugins/<name>/` with `plugin.json` (Agent Plugins 1.0) and `ai.mistral.vibe/hooks.toml`, which needs the `ai.mistral.vibe` extension; every `[[hooks]]` entry needs a unique `name` | docs, Plugins and Hooks; create-plugin Step 5 |
| Vibe knows the Claude Code and Codex markers (not ZCode's): two foreign formats → rejected as ambiguous; imported Claude hooks don't run | docs, Foreign Plugin Formats and Hooks; create-plugin, Compatibility |
| With `.claude-plugin`, `.codex-plugin` and `.zcode-plugin` present plus a root native `plugin.json` → loads natively; `/braid:<skill>` resolves | probe (braid HEAD exported, plus the two new files) |
| A manifest without `description` loads, and Vibe lists it as "Capabilities provided by <name>." | probe |
| Plugin hooks run with cwd = the session's copy of the plugin; `PLUGIN_ROOT` = that copy; shell = Git Bash here | probe; create-plugin Step 5 |
| The copy holds the whole tree (`bench/`, `mods/`, top-level files) except `.git` | probe |
| `PLUGIN_DATA` = `logs/session/plugins/data/<session id>/<plugin>`, the same on resume; Vibe adds `PLUGIN_ROOT`/`PLUGIN_DATA` to the inherited environment, so another harness's `CLAUDE_PLUGIN_DATA` reaches the hook and today wins | probe; reproduced by three round 1 reviewers |
| stdin: `hook_event_name` `session_start`/`pre_agent`, `session_id`, `cwd` (the project), `source` (`session_start`), `prompt` (raw, e.g. `/braid:braid lite`) | probe; docs, Wire protocol |
| Claude Code, Codex and ZCode send `SessionStart`/`UserPromptSubmit`; Pi's extension sends no `hook_event_name`, so any other value keeps today's output | `hooks/hooks.json`, `extensions/braid.js` |
| Output key `hook_specific_output.additional_context`; braid's Claude-shaped output reaches the model as nothing | docs, Wire protocol; probe (unchanged hook: no `BRAID` in the request) |
| Both hooks' context is appended to the user message, not the system prompt | probe, request body |
| With the output branch: core at full; `/braid:braid lite` → `BRAID LEVEL: lite`, next resume carries lite; `stop braid` → `BRAID OFF`, next request has no core; state file `{"mode":"off",…}` in `PLUGIN_DATA/sessions/` | probe, five runs on one session id |
| `session_start` re-fires on every resume and its text joins that message | probe |
| `disable-model-invocation: true` hides a skill from the system prompt and tools; `/<plugin>:<skill>` still runs it | probe; docs, Invoking Skills (also `agents/openai.yaml`) |
| Model-invoked braid skills listed: `braid:braid`, `braid:domain-modeling`, `braid:grilling`, `braid:map` | probe, system prompt |
| `pre_agent` `match = "main"` runs for the main agent | probe; docs, Agent matching |
| `session_start` never fires for subagents; built-in read-only `explore` subagent; custom subagents take `active_model` aliases from `[[models]]` and are rejected for an unknown one | docs, Hooks and Subagents |
| Plugins are pinned per session; `/reload-plugins` re-pins | docs, Plugin Pinning and Reload |
| Failing hook → UI warning, session goes on without its context | docs, Failure path |
| `--system-prompt-file` is headless only and replaces Vibe's own instructions | `vibe --help` |
| `~/.vibe/AGENTS.md` and project AGENTS.md files are loaded at startup | docs, AGENTS.md Discovery |
| Store `logs/session/unified/<id>/`: `meta.json` (`origin_directory`, `parent_session_id`, `start_time`); the root also holds a file, `.session-index.json` | the user's own store, keys and shapes only |
| Failures are `effect` entries: `detail.toolName`, `detail.input`, `state.status` (`failed`), `state.error.message`, shell `state.output.structured_content.returncode`; they sit in `chunks/*.json` arrays and, until flushed, only in `journal/*.jsonl` at `payload.delta[].entry`; ids repeat across chunks as identical copies | the user's store (30 sessions: 55 failures in chunks, 41 in journals, none journal-only today); round 1 saw 19 journal-only in a session still running |
| Slash commands `/config`, `/reload`, `/mcp`, `/plugins`, `/reload-plugins`, `/skills`, `/status`, `/context`, `/compact`, `/branch`, `/rewind` | docs, Built-in Slash Commands |
| Spend shows in the footer's monthly usage gauge (with a Vibe key and a Mistral model); `/status` "displays agent statistics" | docs, Footer and Built-in Slash Commands |

Task 1.1, answered from Vibe 3.1.2's installed source (`uv` tool `mistral-vibe`, `Lib/site-packages`) and one headless probe:

| Question | Answer, and what backs it |
|---|---|
| What marks a subagent's session? | Each session's `generations/<n>/runtime-state.json` holds `identity`, whose `kind` is `root`, `fork` or `subagent`. A fork and a subagent both carry `parent_session_id`; only a subagent is `kind: "subagent"` (depth 1). Vibe's own validator enforces this (`mistralai_vibe_local_harness/vibe/_subagents/_models.py`, `_storage.py` `validate_identity_and_ownership`). Every session in the user's store is `root` today. |
| Does `/reload-plugins` run a new hook? | No: plugin hook commands are compiled when the session starts, and a re-pin can't recompile them (`vibe/app_server/_plugins.py`, `first_bound`). A new session is needed. |
| `/branch` and `/rewind`: a new `PLUGIN_DATA`? | Yes: it is `plugins/data/<session id>` (`_plugins.py:724`), and a fork gets a new session id. |
| A braid command queued while a turn runs? | `pre_agent`'s `prompt` is the turn's first typed text block (`_foreign_hooks.py`, `_typed_text`). Queued prompts are merged into one follow-up turn (docs, Input Queue), so a command queued behind another message never reaches the hook. A gap. |
| No `node` on the PATH? | Probe: Vibe shows `node: command not found` as a `braid:prompt` hook warning, and the message reaches the model without braid's context. |
| Does Vibe ask before a user plugin's hooks first run? | No gate found: user plugins load "always" (create-plugin, discovery table), `_plugins.py` has no trust check for them, and the probe's headless runs ran the hooks unasked. |
| `/status` and cost | `/status` and the TUI live in the Rust binary, so its contents weren't read. Spend is the footer's usage gauge; retro's standing line names that, `/status` and `/context`. |

Not verified:

- **Compaction dropping the core:** headless `-p "/compact"` is sent as plain text, so this rests on the docs' source list.
- **The PowerShell fallback when Git Bash is absent:** not tried; Git Bash is installed here.
- **macOS and Linux:** not tried.
- **Which model the built-in `explore` uses:** the docs give the session's model only for custom subagents, so standards names no model for it.
- **Whether the root `plugin.json` bothers Codex, ZCode or Pi's package loader:** a round 1 reviewer found `claude plugin validate` unchanged. Task 6.2 checks the rest.

## How the core reaches a Vibe session: Vibe's own hooks

- **Static `~/.vibe/AGENTS.md`** (today's hand setup): it sits in the system prompt, so it survives compaction. But the level can't switch, no pointers or map arrive, it goes stale, and it is the user's file.
- **`--system-prompt-file`**: headless only, and it replaces Vibe's own instructions.
- **A custom agent** (`~/.vibe/agents/braid.toml`, instructions = the core): it survives compaction. But the level is static, and Vibe's agents are its approval modes (`ask`, `accept-edits`, `smart-approve`, `auto-approve`), so a braid agent would compete with them.
- **The Claude-format plugin, adapted by Vibe**: braid carries Claude Code's and Codex's markers, which Vibe rejects as ambiguous. Even with one marker, imported Claude hooks don't run yet.
- **A Pi-style adapter**: Vibe has no in-process extension API, and it already runs command hooks, so there is nothing to adapt.
- **A native plugin whose `hooks.toml` runs `hooks/braid.cjs`** (chosen): the same logic, state file and budget as everywhere else. The cost is one more manifest and one branch in the hook. It is the only option where the level switch and the pointers work.

## Vibe's branch in the hook

The hook treats a payload as Vibe's when `hook_event_name` is `session_start` or `pre_agent`. Every other value, or none (Pi), keeps today's behavior.

- A `vibe` argument on the command line would be just as small, but it would be a second way to say the same thing.
- Emitting both output keys always would put an unknown key in front of Codex and ZCode, whose tolerance is untested.

The branch does two things:

- **Output:** the context goes out as `hook_specific_output.additional_context`.
- **State folder:** `PLUGIN_DATA` alone. Vibe adds its variables to the environment it inherited, so a `vibe` started from a Claude Code or ZCode shell also sees `CLAUDE_PLUGIN_DATA` or `ZCODE_PLUGIN_DATA`. The hook prefers those, which would put Vibe's level in that harness's folder. Pi's extension avoids this by removing them for its child. The hook can't remove them for itself, so it picks the folder after reading stdin.

## State

`PLUGIN_DATA` is already per session, and the hook keys its file by session id inside it. So a resume finds the level, and a fork or rewind (a new id, so a new folder) starts at the default. In Claude Code a forked session also starts at the default.

## Ordering

`session_start`'s text follows `pre_agent`'s in the same message. If the first message after opening a session is a braid command, the model reads the reply (`BRAID OFF`) and then the core at the previous level (seen in the probe). Both stay in the conversation until compaction, so the older core comes last in the history. Later messages carry the right level, but they don't remove it. A fix would make the hook reorder or rewrite another hook's text, which it can't do. The spec and the README state the gap, and the workaround: send the command as a later message.

## Retro

Vibe's store is internal and undocumented (journal, generations, content-addressed chunks).

- **What the reader reads:** each session folder's `meta.json`, and every `effect` entry it finds in `chunks/*.json` and `journal/*.jsonl`. It doesn't replay the journal into Vibe's projection. Retro counts sessions per failure signature, so a repeated or superseded copy of an effect changes nothing: a session is counted once whichever copy matched.
- **Failures:** an effect counts when its status is `failed`, or when it is a shell call that exited non-zero, as the other harnesses count it, even though Vibe marks that `success`. `file_system.bash` joins `SHELL_TOOLS`, and so do `file_system.git_bash` and `file_system.powershell`, the shell tools Vibe's managed variant (a setting and an experiment, off by default) exposes on native Windows, which also report `returncode` (round 4), so the failure is signed `shell <program>` and groups with the same failure elsewhere.
- **Skipped:** entries in the store root that aren't folders (`.session-index.json`), and folders without a `meta.json` or whose `origin_directory` isn't a string. A session whose files can't be read is skipped inside its own try/catch, so one bad session never ends the run. The Claude Code, Codex and Pi readers instead skip unparseable lines.
- **Time:** `meta.json`'s file mtime, a number, as the other readers give (file mtime, ZCode's `time_updated`). `end_time` doesn't move when a session is resumed: round 3 found sessions written days after their `end_time`, while `meta.json`'s mtime tracked their last write.
- **Shell exit codes:** only a `returncode` that is a number other than 0 counts. A few completed shell calls store no `structured_content` (only `content` text: 15 of about 1,050 in the user's store, round 4), which is no failure. Journal entries carry `returncode` as chunks do, so a non-zero exit counts wherever it sits.
- **Subagent sessions:** ZCode's reader skips them, so Vibe's does too. `meta.json` `parent_session_id` is also set on a forked conversation, whose failures are its own, so the marker is `identity.kind: "subagent"` in a `generations/*/runtime-state.json` (task 1.1). A fork stays in the fixture and must be counted.
