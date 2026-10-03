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
- [ ] In a project: `/braid:spec propose add-something` → `braid/changes/add-something/` with `tasks.md`; a new session shows "Active change: add-something (0/N tasks)"
- [ ] "stop braid", then `/compact` → no braid rules in context
- [ ] `/braid:humanizer` and `/braid:security-audit` appear in the `/` menu; ask "make this sound less AI" without the command → humanizer does **not** auto-load

## Codex

```bash
codex plugin marketplace add ZacharyArthur/braid
codex plugin add braid@braid
```

Run `codex`, open `/hooks`, review and trust braid's hooks, start a new thread.

- [ ] Core injected (ask for the braid level)
- [ ] `$spec propose add-something` works
- [ ] User-only skills don't auto-trigger

## ZCode

Install from the plugin marketplace (GitHub source `ZacharyArthur/braid`).

- [ ] Plugin loads; note any hooks.json error (if ZCode rejects the shared file, it needs its own)
- [ ] Core injected at session start; level survives compaction
- [ ] Skills listed in Settings → Skills; toggling one off removes it

## A/B against ponytail

`bench/ab.cjs` runs every task in `bench/tasks/` through Claude Code three ways: braid, ponytail (at the commit braid is pinned to in UPSTREAM.md), and no plugin. Each run gets a fresh temp git repo and loads only its own plugin: `--setting-sources project,local` skips your installed plugins, `--plugin-dir` adds one. Nothing you have installed changes.

```bash
node bench/ab.cjs --fake
```

`--fake` costs nothing: it applies each task's reference solution instead of calling Claude, to prove the harness and the checks work. Then the real thing (63 runs at the defaults; roughly $5-15 of usage on Sonnet):

```bash
node bench/ab.cjs --model sonnet --runs 3
```

`--tasks dry-reuse,dry-third` and `--arms braid,ponytail` narrow it down; `--model haiku --runs 1` is a cheap smoke test.

It records, per run: lines added/removed, whether the task's check passes, the DRY probe, tokens, cost and time; the report shows medians. Results land in `bench/results/<date>-<model>/` (`report.md`, `runs.jsonl`, one `.diff` per run). The two Python checks use Python 3 from PATH or, failing that, `uv python find`; without either they show `skipped`. Runs happen outside your home folder (`C:braid-bench` on Windows, so a home-level `CLAUDE.md` can't leak in; override with `BRAID_BENCH_DIR`). The script deletes its temp runs, the ponytail checkout and the session stubs Claude leaves in `~/.claude/projects` when it finishes.

Tasks: five from ponytail's benchmark (prompts verbatim, MIT, plus one line naming the file to write) and two braid tasks, `dry-reuse` (an existing helper should be reused) and `dry-third` (a third near-copy should trigger one shared function). braid should match ponytail on size and checks, and win the DRY column.
