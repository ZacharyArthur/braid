## Why

Claude Code now runs mods: plugins of TypeScript hooks that draw panes, bands, status lines and toasts, or rewrite tool calls and prompts. braid has no place for them, and putting one inside the `braid` plugin would make it behave differently in Claude Code than in Codex and ZCode.

## What changes

- Mods live in `mods/<name>/`, each a separate Claude Code plugin with its own version, listed in `.claude-plugin/marketplace.json` as `<name>`, its description opening "Claude Code only:"
- `.agents/plugins/marketplace.json` (Codex) stays braid-only; the `braid` plugin never loads mod code
- Lands together with the first mod, `braid-context` (clean-room; Anthropic's `token-weather` sample consulted for ideas only, per ADR 0008): one band above the prompt, so it shows in the terminal and the Desktop app alike, which has no status line. It shows context used of the window, the prompt cache's time left on its TTL (5m or 1h) with a cold marker once expired, the last turn's cache hit rate, the session's spend (`5h 23%` of the 5-hour window on a subscription, `$1.23` session cost on API or Bedrock, told apart by whether the API reports a usage window; at the window's limit, its local reset time instead), and braid's level and active change progress, so it can replace a status line. The band stays on one line, cut at the edge with an ellipsis when narrow. From 120 columns up, context fill, cache time left and the 5-hour window also get 8-cell block-character bars (text, so the terminal and Desktop draw the same; no SVG). The countdown turns red under 1 min (on a 1h TTL, yellow under 5 min first; a 5m cache would be yellow from its first second) and shows "live" while a turn runs, since each request refreshes the cache; context and the 5-hour window share one fill scale (yellow from 75%, red from 90%), and the hit rate turns yellow under 80% and red under 50% (never on a conversation's first response, which always writes the whole cache); no toasts, no re-cache cost estimate. Claude Code computes the cache's TTL and expiry for status line scripts (`prompt_cache`) but not for mods (checked in 2.1.295), so the TTL comes from the transcript's last main-thread response record that wrote cache; past `$.fs.read`'s 4 MiB limit the last TTL read stands, and before any read it is 1h on a subscription, 5m on an API key. Upgrade path: read it from `$.session.usage()` once mods get it.
- No empty `mods/` folder, no scaffolding
- AGENTS.md: mods are the one exception to `.cjs`-only scripts; their checks (`claude plugin validate`, `claude plugin test`) join the gate when `mods/` changed, like `bench/`
- Biome lints `mods/**`; the types the engine writes into `mods/*/.claude-plugin/types/` are gitignored
- README: a Mods section with each mod's install line; CONTRIBUTING: adding a mod
- ADR 0011 records the decision; GLOSSARY gains **Mod**

## Impact

New `mods/` tree and spec domain `mods`. Edits: `.claude-plugin/marketplace.json`, `.gitignore`, `biome.json`, AGENTS.md, README.md, CONTRIBUTING.md, CHANGELOG.md, `braid/GLOSSARY.md`. No change to the hook, skills, always-on budget, `check.cjs` or CI.

## Out of scope

- Turning mods on and off inside braid (`userConfig` toggles): `/plugin` already does it per mod
- A `check.cjs` rule tying `mods/*` to marketplace entries: `claude plugin validate .` already catches a bad entry; add one if a mismatch ever ships
- Mod checks in CI: they need the Claude CLI on the runner; local until there are a few mods
- A separate mods repo: upgrade path in ADR 0011
- A cache-expiry toast and a re-cache cost estimate: colour stages warn enough, and the session spend already shows
- A `/reviews` pane (review rounds, GO/NO-GO verdicts, open findings): wanted, but only once the `peers` MCP, a separate project, exists
- A push/commit guard mod: permission rules and settings hooks already cover it

## Left open at archive

- 3.1 (the band in a live Claude Code session; installing and disabling it from `/plugin`) and 3.3 (ZCode lists the mod with its label and braid still loads; its loader is expected to log a `hooks.json` error for the mod alone) need the maintainer at a screen. Released without them at the maintainer's call; anything they turn up goes through a `fix/` branch.
