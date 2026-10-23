# Evals

Read from SKILL.md's heavy path, after step 4. Every run here is a real model
call: say how many a step takes before starting it.

## Fresh runs

A run must not remember writing the skill, so it follows only the files.

| Harness | Fresh run | Headless, one query | A load shows as |
|---|---|---|---|
| Claude Code | subagent | `claude -p "<q>" --output-format stream-json --verbose </dev/null` | a `Skill` tool call naming it |
| Codex | subagent | `codex exec --json --ephemeral "<q>" </dev/null` | a command reading its `SKILL.md` |
| ZCode | subagent | none | ask the user |
| Pi | headless (no subagents) | `pi -p --mode json --no-session --no-approve "<q>" </dev/null` | a `read` of its `SKILL.md` |

Run headless commands from a scratch copy of the project, its `.git`
included (Codex refuses to run outside a git repo). They read piped
stdin, so a shell tool that leaves it open hangs Codex and Pi and stalls
`claude -p` 3 s a run: keep the `</dev/null` (in PowerShell, start the line
with `$null |` instead). In Pi:

- `--no-approve` leaves the copy untrusted: trusted, its project extensions,
  MCP servers and packages run at startup, before any tool fence applies.
- A scratch folder fences nothing in: Pi asks no approval before a tool call
  and its tools reach any path you can. Trigger runs add
  `--skill <skill folder> --tools read --no-mcp --exclude-tools 'mcp__*'`.
  Another copy of the same name, installed elsewhere, wins over `--skill`:
  if one exists, add `--no-skills` and say near-miss queries then meet no
  neighbouring skills. Output evals need write tools: run them in a container or throwaway
  VM holding only the model key, with no other credentials and no git
  remotes; none at hand → say so and skip Pi.

## Output evals

1. **Workspace.** `<name>-evals/` beside the skill folder, never inside it
   (it would ship). `cases.md` holds the cases; each round writes
   `iteration-<n>/`.
2. **Cases.** Start with 2-3: a prompt a real user would type (paths,
   names, casual or precise), what done looks like, and any input files. One
   tests an edge: odd input, an ambiguous ask.
3. **Run.** Each case twice in one batch, same model: with the skill ("Read
   `<path>/SKILL.md`, then do: `<prompt>`") and a baseline (the bare prompt;
   when improving a skill, a copy of the old version taken before editing).
   Outputs go to `iteration-<n>/<case>/with/` and `/base/`. Note tokens and
   time where the harness reports them. A baseline that loaded an installed
   copy of the skill is void: rerun it where the skill isn't installed.
4. **Assertions,** written after the first outputs, when you know what good
   looks like: observable and specific, never exact wording. Mechanical ones
   (file exists, valid JSON, row count) get a short script reused each round.
   Taste and tone stay with the user's review.
5. **Grade** each assertion pass or fail, quoting the output as evidence. A
   heading with nothing under it fails. Grade in a fresh subagent when there is
   one; otherwise grade yourself and say so.
6. **Table** in `iteration-<n>/results.md`, one row per case: passes with the
   skill, passes in the baseline, tokens and time against the baseline. Then:
   - passes in both → it measures nothing the skill adds: replace it;
   - fails in both → read why: a broken assertion or case gets fixed; a
     real requirement neither run met stays, and the skill must cover it;
   - passes only with the skill → that is the skill's value: find the line
     that caused it and keep it.
   Read the run transcripts too: steps wasted on a line point at a vague or
   misplaced instruction, and equal scores can hide different behavior.
7. **Review.** Show the user each case's output and grades, and ask for one
   concrete note per case. No note means the case is fine.
8. **Revise** for the cause, never the single case. Cut lines that changed
   nothing; give a reason instead of louder words; when every run wrote the
   same helper, bundle it as a script. Rerun into the next iteration. Stop
   when notes come back empty, scores stop moving, or the user says so.

## Trigger tuning

Model-invoked skills only; user-only ones load by command. Triggering differs
by harness and model, so tune in each harness the skill targets, installed
where that harness finds it (SKILL.md step 2; Pi: `--skill`). ZCode has no headless mode:
no tuning there; list it as untested.

1. **Queries.** About 20 a real user would send: half should load the skill,
   half shouldn't. The first half varies phrasing, length and detail, names
   the domain or only describes the need, and buries the need inside a bigger
   task. The second half is near-misses: same words, different job. Unrelated
   queries test nothing. The user reviews the list.
2. **Split** once, kept fixed: 12 to tune, 8 held out, each half of each
   kind.
3. **Cost.** 20 queries × 3 runs is 60 headless runs per round per harness,
   up to 5 rounds (300), plus 15-30 for the final check. Say so and start
   only on a yes.
4. **Run** each query 3 times, each fresh. Read one should-load run's output
   by hand first: it confirms the harness read the copy under test (check
   the path, as an installed copy can win) and what a load looks like
   (table above). A should-load query
   passes at a load rate of 0.5 or more; a should-not one below 0.5.
5. **Revise** from the tuning set's failures only. Missed loads → widen the
   description to the need behind them; false loads → name the boundary.
   Never paste a failing query's words. Stuck after a few rounds → try a
   different framing, not another tweak. Keep within SKILL.md §4's length
   limits.
6. **Pick.** At most 5 rounds. Keep the description with the best held-out
   score, which may not be the last one, then check it on 5-10 new queries
   no round has seen.

## Report

The cases and assertions, the last results table, the description chosen with
its held-out score, the runs spent, and what was not tested (a harness, a
model, an edge).
