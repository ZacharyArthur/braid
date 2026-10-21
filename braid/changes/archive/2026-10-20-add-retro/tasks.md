## 1. Decision

- [x] 1.1 ADR 0015: route to vendor tools rather than rebuild them; the router names what a finding calls for, calls skills on a yes, names built-in commands; `node:sqlite` is optional
- [x] 1.2 GLOSSARY: **Failure signature** and **Router**

## 2. Script

- [x] 2.1 The user runs `/insights` once; record the report's path and the shape of its friction and rule sections in `design.md`
- [x] 2.2 `skills/retro/retro.cjs`: project root (git toplevel, else cwd), window arguments, Claude Code store, signature grouping, per-session counts, the ≥ 2 sessions cut, output capped at 200 characters per snippet
- [x] 2.3 Codex store: rollouts joined by `call_id`, `exit_code` from the output text, the fallback match
- [x] 2.4 ZCode store through `node:sqlite`, detected at run time; the "needs Node 22.13" line otherwise
- [x] 2.5 `all` (no project filter) and `insights` (reads the output from 2.1; missing or stale → the message)
- [x] 2.6 `check.cjs` writes a fake home with all three stores to a temp folder (a recurring failure across harnesses, a one-off, another project, a secret in a prompt, an `/insights` report) and asserts the grouped output, `all`, a 1-session window, `insights`, that the secret is absent and that nothing is written; ZCode is asserted skipped when `node:sqlite` is missing
- [x] 2.7 Biome covers the new script

## 3. Skill

- [x] 3.1 `skills/retro/SKILL.md`: user-only frontmatter and description suffix; run the script; filter expected and already-covered failures; one numbered diff; harness tags; `all` targets; the router table (verified 2026-10) with the existence check and the standing line
- [x] 3.2 `skills/retro/agents/openai.yaml`, user-only

## 4. Wiring and docs

- [x] 4.1 `UPSTREAM.md` clean-room row with no source; README and `help` rows
- [x] 4.2 `.github/workflows/check.yml`: `node scripts/check.cjs` in the Node 22 lint job
- [x] 4.3 `braid/map.md` patch (new skill and its script); CHANGELOG `[Unreleased]` entry
- [x] 4.4 Run `/braid:retro` on this repo and check the diff it proposes against the spec; add the cross-harness run to the release checklist in TESTING.md

## 5. Review round 1 (`braid/reviews/2026-10-20-add-retro.md`)

- [x] 5.1 Codex: results paired with steps only when counts match; `write_stdin` polls blamed on the command that started them; array results; no fallback to the first command
- [x] 5.2 Codex: `Script failed` outputs counted (`apply_patch`, rejected `exec_command`, script errors)
- [x] 5.3 `program()`: env prefixes before assignments, literal PowerShell assignments skipped, `&` with a quoted path, here-string bodies dropped, names start with a letter
- [x] 5.4 ZCode open and queries guarded (skip line with the reason); a stray file in Claude Code's `projects/` ignored
- [x] 5.5 Signature quotes ignore an apostrophe inside a word; ANSI codes stripped; local dates; any window size; unused shell tool names and call fields dropped
- [x] 5.6 Spec and SKILL.md: "no model text" scoped to transcripts with the `insights` exception stated; SQLite's `-wal`/`-shm` files allowed; ZCode skip scenario
- [x] 5.7 `check.cjs`: fixtures for each of the above (a WAL store, a broken store, a stray file, parallel, array, poll and fan-out results, script failures, an env prefix, an apostrophe); with its fix reverted, each of poll, pairing, script failures, stray file, ZCode guard, apostrophe, env prefix and the WAL allowance fails the check; realpath for macOS's temp folder

## 6. Review round 2

- [x] 6.1 `program()`: a quoted executable path (`"/usr/bin/git" push`) is the program; only a quoted value after a PowerShell assignment is a literal; `export` and `set` skipped like `cd`; Windows paths split the same on any OS
- [x] 6.2 Claude Code rejections: the user's feedback after "the user said:" is cut before the error line is picked
- [x] 6.3 `check.cjs`: fixtures for each (`set -e; export X=1 && cd x && git push`, an env prefix before a quoted path, `$env:GIT_PAGER = 'cat'; git push`, a rejection with feedback in two sessions) and for `insights` with no report; with its fix reverted, each fails the check

## 7. Review round 3

- [x] 7.1 `program()`: a PowerShell assignment of a call (`$out = & "C:\…\git.exe" push`) is not a literal
- [x] 7.2 `check.cjs`: the shared Codex command becomes that captured call to a quoted Windows path, covering both the call and the `/`-and-`\` split; reverting either fails the check

## 8. Verify

- [x] 8.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`
- [x] 8.2 After reviewer sign-off: `/braid:spec archive`
