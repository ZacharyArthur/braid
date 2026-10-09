## 1. First mod: braid-context

- [x] 1.1 `mods/braid-context/`: `.claude-plugin/plugin.json` (own version), `hooks/hooks.json` naming one module, and the module: an `AbovePrompt` band fed by `turn.complete` usage and `$.session.usage()`, cache TTL from the transcript's last `cache_creation` split (5m/1h) with the account fallback, a `$.clock` tick for the countdown, braid's level from its session state file and progress from the active change's `tasks.md`
- [x] 1.2 One `*.test.ts` covering the spec's scenarios (before first response, countdown and colour stages, expiry, braid off), on terminal and desktop surfaces
- [x] 1.3 Entry in `.claude-plugin/marketplace.json`: `"source": "./mods/braid-context"`, description opening "Claude Code only:"
- [x] 1.4 `claude plugin validate mods/braid-context`, `claude plugin test mods/braid-context` and `claude plugin validate .` pass
- [x] 1.5 Spend segment: the 5-hour window's percent used when `$.session.usage()` reports one, else the session cost in dollars once above zero; three more test scenarios
- [x] 1.6 Colours on one fill scale for context and the 5-hour window (yellow from 75%, red from 90%); at the limit, "5h limit until <local reset time>" in red; two more test scenarios
- [x] 1.7 Bars of 8 block characters (`█`/`░`) for context fill, cache time left and the 5-hour window, coloured with their figure, from 100 columns up (120 after review); text only below; one more test scenario
- [x] 1.8 Hit rate coloured yellow under 80%, red under 50%, never on a conversation's first response; a new conversation (startup, `/clear`, resume, compact) clears the cache figures; one more test scenario
- [x] 1.9 Review fixes: TTL from whole main-thread response records; no dollars on a subscription between windows; one redraw when the cache goes cold however late the tick; unknown braid levels read full; braid's level read after its own hook; rounding and config-path edge cases; "live" while a turn runs; no yellow stage on a 5m TTL; one line cut at the edge, bars from 120 columns; regression tests for each but the late-tick redraw
- [x] 1.10 Round 2 fixes: the 5-hour window's figure drops once its reset passes, redrawn at that moment while idle; a redraw on `session.measure`; the hit rate coloured by its rounded figure; a test for the 999,600-token boundary
- [x] 1.11 Round 3 fixes: the countdown runs from the turn's last main-thread request (a `turn.step` timestamp), coloured by the seconds shown; spend waits for the conversation's first response, resumed or not; `compact` named among the new-conversation sources; tests for each
- [x] 1.12 Round 4 fixes: only a request answered with cache use sets the countdown's start; context shows only its window until a response reports the fill; comments on `at` and the summed hit rate; tests for each

## 2. Repo wiring

- [x] 2.1 `.gitignore`: `mods/*/.claude-plugin/types/` and the `tsconfig.json` the engine writes beside them; `biome.json` includes `mods/**`
- [x] 2.2 AGENTS.md: mods in Stack and Conventions (TypeScript, run by Claude Code, not Node); Commands and "Before saying done" gain "Changed `mods/` → also" the three checks from 1.4
- [x] 2.3 CONTRIBUTING.md: "Adding a mod" (folder, marketplace entry and label, checks, own version)
- [x] 2.4 README.md: Mods section with the mod's install line (`claude plugin install <name>@braid`) and that `/plugin` turns it on and off
- [x] 2.5 `braid/GLOSSARY.md`: **Mod**
- [x] 2.6 CHANGELOG entry

## 3. Harnesses

- [ ] 3.1 Claude Code: install braid and the mod from a local marketplace; the mod runs; disabling it in `/plugin` stops it and leaves braid on
- [x] 3.2 Codex: `codex plugin list` on the branch's marketplace lists only braid
- [ ] 3.3 ZCode: the mod is listed with its "Claude Code only" label; braid still loads; note what installing the mod does

## 4. Verify

- [x] 4.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, plus 1.4's checks, then `/braid:spec archive`
