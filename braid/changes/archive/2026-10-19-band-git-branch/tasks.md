## 1. Band

- [x] 1.1 Branch: `git branch --show-current` on session start, each prompt and each turn's end; drawn as `git <branch>` after braid's level, before the active change; nothing when detached, outside a repo or without git
- [x] 1.2 Test: branch shown before the change, shown without braid, absent when detached or git fails
- [x] 1.3 TTL: when `$.fs.read` refuses the transcript, read its last MiB with `tail -c`, or PowerShell where `tail` can't start
- [x] 1.4 Test: past 4 MiB, after a compaction, the end's 5m write wins over a subscription's guess; without `tail`, PowerShell's read gives 1h
- [x] 1.5 Mod version 0.1.3 in the marketplace entry; CHANGELOG entry
- [x] 1.6 Review round 1: a turn that ends without usage (aborted, failed) still refreshes braid's state and the branch; a test that a `tail` which starts and exits non-zero doesn't fall through to PowerShell; the proposal notes `$.process` is CLI only and the Claude app's local sessions are the CLI
- [x] 1.7 Review round 2: a `refresh` that throws (settings unreadable) no longer skips the turn's cache update, with a test; `PS_TAIL` uses single quotes only, so it doesn't rest on how the runtime escapes double quotes (rechecked byte-identical to `tail -c` through an argv-only spawn)
- [x] 1.8 Review round 3: the branch is read before braid's state, so unreadable settings no longer hide it; the unreadable-settings test checks the branch too

## 2. Verify

- [x] 2.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, plus `claude plugin test mods/braid-context`, `claude plugin validate .`, then `/braid:spec archive`
