# Testing

`node scripts/check.cjs` covers manifests, frontmatter, the hook's behavior and the token budget; CI runs it on Windows and Ubuntu. What it can't cover is each harness actually loading the plugin. Run this checklist once per release, with ponytail disabled so it can't mask results.

## Claude Code

```bash
claude plugin marketplace add ZacharyArthur/braid
claude plugin install braid@braid
```

In a new session:

- [ ] Ask "what braid level are you at?" → **full**, quoting `BRAID ACTIVE`
- [ ] `/braid:braid lite`, then `/compact`, then ask again → **lite**
- [ ] `/braid:braid drift on` → the next prompt carries a `braid: lite · ...` line; `drift off` removes it
- [ ] Spawn a subagent and ask it for its braid level → **lite**
- [ ] `/braid:adhd`, then `/compact` → answers stay ADHD-shaped; "stop adhd mode" ends it
- [ ] In a project: `/braid:spec propose add-something` → `braid/changes/add-something/` with `tasks.md`; a new session shows "Active change: braid/changes/add-something (0/N tasks)"
- [ ] "stop braid", then `/compact` → no braid rules in context
- [ ] `/braid:humanizer` and `/braid:security-audit` appear in the `/` menu; ask "make this sound less AI" without the command → humanizer does **not** auto-load

## Codex

```bash
codex plugin marketplace add ZacharyArthur/braid
codex plugin add braid@braid
```

Run `codex`, open `/hooks`, review and trust braid's hooks, start a new thread.

- [ ] Core injected (ask for the braid level)
- [ ] `$braid lite` confirms **lite**; resume that same thread later (`codex resume`) and ask again → still **lite** (proves UserPromptSubmit fires and Codex sends a session id)
- [ ] `$spec propose add-something` works
- [ ] User-only skills don't auto-trigger

## ZCode

Install from the plugin marketplace (GitHub source `ZacharyArthur/braid`).

- [ ] Plugin loads; note any hooks.json error (if ZCode rejects the shared file, it needs its own)
- [ ] Core injected at session start
- [ ] After `/compact`: core rules are NOT re-injected (ZCode never fires SessionStart on compact) — the level survives only as the summary's paraphrase; with `drift on` the drift line still restates it on every prompt
- [ ] Skills listed in Settings → Skills (plugin skills have no switch there)
- [ ] `/braid:spec propose add-something` → `braid/changes/add-something/`; a new session's Project state shows it

## A/B against ponytail

`bench/ab.cjs` runs every task in `bench/tasks/` three ways: braid, ponytail (at the commit braid is pinned to in UPSTREAM.md), and no plugin. Each run gets a fresh git repo outside your home folder and only that arm's rules. Nothing you have installed changes.

- **Claude Code** (`--agent claude`, default): `claude -p` with `--setting-sources project,local` (skips your installed plugins) and `--plugin-dir` for the arm's plugin, so its hooks and skills load for real.
- **Codex** (`--agent codex`): `codex exec --ignore-user-config --ephemeral` in a workspace-write sandbox; the arm's always-on text goes in as `developer_instructions` (braid's own hook output for that run dir, or ponytail's own instruction builder). Model defaults to the one in your `~/.codex/config.toml`.

```bash
node bench/ab.cjs --fake
```

`--fake` costs nothing: it applies each task's reference solution instead of calling an agent, to prove the harness and the checks work. Then the real thing:

```bash
node bench/ab.cjs --agent claude --model sonnet --runs 3
```
```bash
node bench/ab.cjs --agent codex --runs 3
```

`--tasks dry-reuse,dry-third`, `--arms braid,ponytail` and `--label <name>` narrow and name a run; `--model haiku --runs 1` is a cheap smoke test. Each invocation works in its own `braid-bench/run-<pid>-<time>/` folder and deletes only that, and writes a results folder of its own, so runs can go in parallel; `BRAID_BENCH_DIR` moves the parent folder.

Per run it records code lines added/removed and test lines (counted apart: a test the core rules asked for isn't bloat), whether the task's check passes, the DRY probe, tokens, cost (Claude only; Codex bills your plan), time, and turns or tool steps; the report shows medians. Results land in `bench/results/<date>-<agent>-<model>[-label]/` (`-2`, `-3`, ... if that exists; nothing is overwritten) (`report.md`, `runs.jsonl`, one `.diff` per run), with home paths, user name and host name redacted. Python checks use Python 3 from PATH or `uv python find`, else they show `skipped`. Runs happen in `C:\braid-bench` on Windows (`$TMPDIR/braid-bench` elsewhere) so a home-level `CLAUDE.md` can't leak in; when done, the script deletes the work dir and the session stubs Claude leaves in `~/.claude/projects`.

Tasks: five from ponytail's benchmark (prompts verbatim from its `benchmarks/promptfooconfig.yaml` at the pinned commit, MIT, plus one line naming the file to write) and braid's DRY tasks: `dry-third` (a third exact copy should become one shared function), `dry-reuse` (an existing helper should be reused, with the slug algorithm spelled out in the prompt), `dry-reuse-open` (same, prompt just says "slug") and `dry-reuse-mapped` (spelled out, repo has `braid/map.md`).
