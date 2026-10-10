## 1. Band

- [x] 1.1 `turn.step`: after a main-thread response, `$.ui.invalidate('ui.render')`
- [x] 1.2 Test: a mounted band shows the new context after a step, with no turn end and no warm cache, on terminal and desktop
- [x] 1.3 Live check in a Claude Code session: `$.session.usage()` read after each main-thread `turn.step` reports that response's fill (a throwaway probe mod); if it lags, take the fill from the step's own `usage` instead and say so in the proposal
- [x] 1.4 `plugin.json` 0.1.1; CHANGELOG entry
- [x] 1.5 Review round 1: spend shows from the conversation's first answered main-thread response (mid-turn), not its first turn's end; reset with the cache on a new conversation; test asserts spend mid-turn, after /clear, and after a failed request
- [x] 1.6 Review round 2: a test for a later turn after the cache went cold, which fails without the step's redraw (the response flag's own redraw masked it); Impact and scenario wording

## 2. Verify

- [x] 2.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, plus `claude plugin validate mods/braid-context`, `claude plugin test mods/braid-context`, `claude plugin validate .`, then `/braid:spec archive`
