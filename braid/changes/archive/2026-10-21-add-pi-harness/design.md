## How the extension reuses the hook: a child process

- **Require `braid.cjs` in process**: it reads stdin and calls `process.exit` when it loads, so it would end Pi. Splitting it into a module plus a runner touches the one file every harness depends on, for one caller.
- **Port the logic into the extension** (ponytail's way, which keeps the level in Pi's session entries): a second copy of level parsing, project state and the map, which ADR 0006 exists to prevent, and state the `braid-context` band and the other harnesses can't read.
- **Run `node hooks/braid.cjs <event>` with the hook's JSON on stdin** (chosen): no change to the hook beyond Pi's command form; the same output, state file and budget. A spawn costs about what it costs in every other harness, once per prompt.

The session hook can take up to the map's 3 s limit, so the extension spawns it asynchronously at `session_start` and awaits it in `before_agent_start`. Pi's UI never blocks, and the first run waits only if the map is still building. Every failure (no `node`, a timeout, unparseable output, output that isn't text) means injecting nothing: the extension never throws into Pi. The child runs with `windowsHide`, as Pi's own spawns do, so a Pi without a console on Windows flashes no window.

The child is called as `node`, not `process.execPath`, which is Pi's own binary in a standalone install. Without Node, the extension injects nothing, as the hook does elsewhere.

## Session id

The hook keys state by `session_id`. The extension passes `ctx.sessionManager.getSessionId()`, part of the read-only session API extensions get (checked in Pi 1.3.0). If it throws, the hook's no-id path applies: defaults, no shared file.

## State folder

- **The hook's tmpdir fallback**: nothing to add, but a reboot can clear it, so a resumed session falls back to the default level.
- **Pi's session entries** (`pi.appendEntry`, ponytail's way): branch-aware, but the level would live in two stores, and the hook couldn't read it.
- **`PLUGIN_DATA=<agent folder>/braid` in the child's environment** (chosen): the agent folder is `$PI_CODING_AGENT_DIR` or `~/.pi/agent`, with a leading `~` expanded to the home folder as Pi's `getAgentDir` does. It persists like the plugin data folders, the hook reads it already, and Pi's uninstall leaves it as the others' do.

The extension removes `CLAUDE_PLUGIN_DATA` and `ZCODE_PLUGIN_DATA`, in any letter case, from the child's environment. The hook prefers them, and Pi started from inside another harness's shell can inherit them, which would put Pi's state in that harness's folder. Any case, because Windows looks up environment variables case-insensitively, while the copied environment object doesn't.

## File format

`extensions/braid.js`, in CommonJS: Pi 1.3.0 discovers only `.ts` and `.js` extensions, so braid's `.cjs` convention can't hold here. Pi loads it with jiti, which runs it as CommonJS even under a parent `"type": "module"` (checked), and `check.cjs` can `require` it on Node 18. The file's header records the exception, as does AGENTS.md.

## Refreshing the section

The section is the session hook's output, kept from `session_start`. A prompt whose hook reply starts with `BRAID` is a command (a level, off, on, drift, ADHD on or off, a status), which may have changed the state, so the extension re-runs the session hook for the section. Only the reply's first line goes to the model: coming back on, the rest is the core, which the section now carries. On a plain prompt with drift on, the drift line is that first line. After an ADHD toggle with drift on, the drift line comes second and is dropped for that prompt. That costs nothing in Pi, where the section carries the core on every run: drift exists for harnesses that lose the core at compaction.

ADHD toggles used to reply with nothing, so the section never saw them: "normal mode" left ADHD in the section, and ADHD switched on mid-session was lost at compaction, which Pi doesn't follow with a `session_start` (Claude Code and Codex re-inject on compact). Rather than teach the extension the ADHD commands (command matching in two places), the hook now confirms them like every other state change, `BRAID ADHD MODE: on|off`, in all four harnesses: one short line of context per toggle, like the drift toggle's.

## Delivering the reply

The reply goes as a hidden custom message, `pi.sendMessage(..., { deliverAs: 'nextTurn' })`, which joins the next run's starting messages. That holds for a prompt steered into a streaming run too. Pi delivers steered messages one per turn by default (`steeringMode: one-at-a-time`), so steering the confirmation separately cost the model a turn of its own, answered before it saw the user's command (seen live with GLM 5.3 Flash). The steered prompt already says what the user asked for, and the section changes at the next run, which is also when the confirmation arrives. A returned `before_agent_start` message, the first version, never fired for steered prompts and left the reply for a later, unrelated run.
