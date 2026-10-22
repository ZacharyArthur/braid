## Why

braid runs in Claude Code, Codex and ZCode, which all read its Claude-format `hooks/hooks.json`. Pi doesn't: it runs no command hooks and takes TypeScript or JavaScript extensions instead. Ponytail, braid's base text, already ships a Pi extension, so Pi users who switch from ponytail lose the always-on core.

## What changes

- New `extensions/braid.js`: a thin Pi extension and braid's only Pi-specific code. Pi finds it, and `skills/`, by its package conventions, so `pi install git:github.com/ZacharyArthur/braid` works with no `package.json` and no fourth manifest.
- The extension runs `hooks/braid.cjs` as a child process, as the other harnesses do, so the logic and the session state stay in one place (see design):
  - `session_start` (Pi emits it on start, `/new`, `/resume` and `/fork`) runs `braid.cjs session` without blocking and keeps its output.
  - `input` runs `braid.cjs prompt` on the user's raw text. A command's reply rebuilds the section, so it follows the level, and the reply's first line goes to the model with the next run (see design).
  - `before_agent_start` puts the kept session output in a `braid` system prompt section, or clears it when braid is off.
  - Each child gets `PLUGIN_DATA` set to `braid/` inside Pi's agent folder (`$PI_CODING_AGENT_DIR`, default `~/.pi/agent`), so Pi's session state lives with Pi's own data and survives a reboot, as the plugin data folder does in the other harnesses. The hook already reads `PLUGIN_DATA`, so it needs no change for this.
- `hooks/braid.cjs`: the level, `stop braid` and `adhd` matching also accepts Pi's skill command form, `/skill:braid lite` and `/skill:adhd`. ADHD toggles now confirm like every other state change (`BRAID ADHD MODE: on|off`), in all four harnesses, so Pi's section follows them.
- The section is set on every run, so the core survives Pi's compaction with no drift reminder needed (unlike ZCode).
- User-only skills need no new mark: Pi honors `disable-model-invocation`. Invariant 4 stays three marks.
- No subagents: Pi has no subagent event, so the `subagent` injection has nowhere to go. ZCode has the same gap.
- Docs: README install and update lines for Pi, the `help` invocation table (`/skill:<skill> [args]`), AGENTS.md (four harnesses, the extension in Stack), `braid/map.md`, a CHANGELOG entry under Unreleased.
- ADR 0002 amended: Pi is the fourth harness, through the extension.

## Impact

Spec `session`: a requirement for Pi is added. Code: new `extensions/braid.js`; `hooks/braid.cjs` (two regexes, the ADHD confirmations); `scripts/check.cjs` (extension test); `biome.json` (`extensions/**`). Docs: `README.md`, `skills/help/SKILL.md`, `AGENTS.md`, `braid/map.md`, `CHANGELOG.md`, `braid/adr/0002-one-plugin-three-harnesses.md`. Always-on cost: unchanged, since Pi gets the same core and the same skill descriptions. Manifests and version: unchanged, since Pi reads none.

## Out of scope

- Subagent injection: Pi has no subagent event; add it if Pi gains one.
- A status-bar indicator, `/braid` command aliases and argument completion (ponytail has them): `/skill:braid` already switches levels.
- Oh My Pi (omp): it reportedly runs Pi extensions unchanged, but it's not tested here.
- Pi in the bench (`bench/ab.cjs`): it covers `claude` and `codex` only. Add Pi when a run needs it.
- An npm package or the Pi gallery: both need a `package.json`, which braid doesn't ship.
- The `mods` spec's "any of the three harnesses" wording: still true for Pi, which never loads `mods/`.
- Skills that list harnesses one by one: `retro` reads no Pi transcripts, and `standards` and `skill` name only the other three. Queued as `braid/changes/pi-skill-support/`.
