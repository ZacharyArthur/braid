## Stores and failures

| Harness | Store | Failure | Project |
|---|---|---|---|
| Claude Code | `$CLAUDE_CONFIG_DIR` or `~/.claude`, `projects/*/<session>.jsonl` | `tool_result` with `is_error: true`; Bash text starts `Exit code N` | `cwd` on each line |
| Codex | `$CODEX_HOME` or `~/.codex`, `sessions/YYYY/MM/DD/rollout-*.jsonl` | `custom_tool_call_output` whose JSON (one line or array element per step) holds `exit_code` ≠ 0, joined to its call by `call_id`; fallback: `exit_code: N` or `Exit code N` in the text; else `Script failed … Script error: <message>` (an `apply_patch` or `exec_command` failure, or a JS error in the script) | `session_meta.payload.cwd` |
| ZCode | `~/.zcode/cli/db/db.sqlite` (WAL mode) | `tool_usage.exit_code` ≠ 0, or `part.data.state.status = "error"` | `session.directory` |

Formats seen on 2026-10-19 (Claude Code 2.1, Codex 0.163, one ZCode install). A session belongs to the project when its working directory is the project root or under it.

## Decisions

**Read every store, not the current harness's.** AGENTS.md is shared, so a failure in any harness is evidence for it. Reading one store misses most of it for anyone who uses two. Cost: a parser per format, which a fixture each keeps honest.

**`node:sqlite` when present, else say so.** braid's floor is Node 18 and stdlib only. The `sqlite3` CLI is often missing, especially on Windows, and a SQLite dependency breaks the no-npm rule. Detected at run time, so Node 18 users lose ZCode only, with a message.

**A signature** is the command's program name (or the tool name for non-shell tools) plus the error's first line with numbers, paths and quoted strings collapsed. Counting is per session, so one session retrying ten times counts once.

**Own script before `/insights`.** The report covers every project, comes from a model, is HTML and exists only in Claude Code. The transcript pass is deterministic and the same in every harness. `insights` adds the report on request.

**`/insights` output** (seen 2026-10-20, under `$CLAUDE_CONFIG_DIR` or `~/.claude`, in `usage-data/`): `report.html` (plus a dated copy), `session-meta/<session>.json` (`project_path`, `start_time`, tool error counts) and `facets/<session>.json` (`friction_counts` by category, `friction_detail`). Friction is read from the JSON, filtered by `project_path` and `start_time`; the suggested rules are read from `report.html`, where each is the `data-text` of an `<input class="cmd-checkbox">` (HTML-escaped, `\n` for newlines), and cover every project. A `report.html` older than the window counts as missing.

**Which Codex command failed.** Codex runs tools from a JS script, so one call can hold several steps (`tools.<name>(`). A result's position (`i`, or its order) names its step only when results and steps pair up one to one; a step like `[a, b].map(tools.write_stdin)` fans out and breaks the pairing, and then the command is unknown (`shell ?`), which still groups by the error line. A command still running returns a `session_id`; the `write_stdin` step that later finishes it is blamed on the command that started it.

**A broken ZCode store skips ZCode only.** Opening, preparing and querying are guarded, so a locked, corrupt or reshaped store prints a skip line with the reason and the other harnesses still report. Opening a WAL-mode store read-only can make SQLite create its `-wal` and `-shm` files beside it (documented SQLite behavior); that is the one write retro allows.

**A rejection keeps only its boilerplate.** When the user rejects a Claude Code tool call with feedback, the result's text ends with "…the user said:" and their words. Retro cuts at that marker, so rejections group under the fixed sentence and the user's words never print.

**Shell tools share one name.** Claude Code's `Bash`/`PowerShell`, Codex's `exec` and ZCode's `Bash` all become `shell <program>` in a signature, so one mistake made in two harnesses counts as one.
