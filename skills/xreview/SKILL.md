---
name: xreview
description: "Write a self-contained review prompt for a different model or fresh session: correctness, completeness, spec and principle adherence, external claims checked against the pinned version's docs. Adversarial by default, --open for neutral; --offline for no network; --run starts the named reviewers (codex, pi, claude, vibe run headless, or a subagent) and goes on when they finish; next reads the reviewers' result files, fixes or declines each finding and readies the next round. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[--open] [--offline] [--run [<reviewers>]] [--auto] [diff|<path>|all] | next [<folder>] [--run [<reviewers>]] [--auto]"
license: MIT
---

You write the review **prompt**, not the review. A different model or a cold
session reviews better than the one that wrote the code: no anchoring on its
own reasoning.

## Inputs

- Scope: `diff` (default: uncommitted changes plus the branch against its base), a path, or `all`.
- `--open`: neutral framing. Default is adversarial.
- `--offline`: the reviewer reaches no network at all (section 8).
- `--run [<reviewers>]`: also start the round's reviewers (`codex,pi`, `pi:<model>`, or `subagent`) and handle their results when they finish. Read `run.md` in this folder and follow it. `--auto`, with it: don't ask whether to run another round.
- `next [<folder>] [--run [<reviewers>]] [--auto]`: address the reviewers' results and ready the next round. Read `next.md` in this folder and follow it.

## Gather, don't paste

Collect pointers the reviewer opens itself: the diff command or file list; the
specs, active change (`proposal.md`, `tasks.md`), route, and ADRs that touch
the scope; `braid/map.md`; the project's manifest and lockfile, for pinned
versions. Excerpt only a line or two where it saves the reviewer a search.

## Write `braid/reviews/<YYYY-MM-DD>-<scope>/prompt.md`

One folder per review, dated by round 1; every character of a path scope other
than ASCII letters, digits and `._-` becomes `-` (`2026-11-02-skills-xreview`,
`docs/R&D notes` → `docs-R-D-notes`). That folder exists → `-2`, `-3`, and
so on. Flat `braid/reviews/*.md` files from earlier versions: leave them, never
read them.

No review folder in `braid/reviews/` yet: in a git repo, before writing, run
`git check-ignore -q <the prompt path>` (the file, never the folder, which a
`braid/reviews/` rule misses before it exists). Exit 1 → ask once whether to
write `braid/reviews/.gitignore` containing `*`. Exit 0, or 128 (no repo) → ask
nothing.

Sections, in order:

1. **Role.**
   - Adversarial: "You are a senior SRE and staff engineer. Your job is to break this: find what fails, is missing, or contradicts its spec."
   - `--open`: "You are a senior SRE and staff engineer. Decide whether this is correct and complete. 'No significant issues' is a valid, expected answer."
2. **Intent.** What this code is supposed to do: the pointers above.
3. **Scope.** The exact diff command or paths. Nothing outside it. `braid/reviews/` is always out, ignored or not.
4. **Principles.** YAGNI > KISS > DRY; rule of three. Point to `skills/braid/core.md` in the braid plugin, or paste `core.md` if the reviewer can't reach it. Flag over-building and under-building alike.
5. **Check.** Completeness against `tasks.md` and the spec deltas; correctness and edge cases; spec and vision alignment; security basics; error handling; whether verification actually ran; ops (config, rollout, observability).
6. **Don't flag.** Style preferences; anything an ADR already decided; speculative "what if later"; anything out of scope; a `shortcut(<strand>):` (or plain `shortcut:`, or older `braid(<strand>):`) corner cut whose upgrade trigger hasn't fired.
7. **Method.** Two passes:
   - Find: candidates with `file:line` and evidence only. No fixes yet. One that depends on how an external library, API, tool, platform or standard behaves is marked for the docs check, never kept from memory alone.
   - Refute: try to disprove each candidate against the code. Run a test or a reproduction wherever possible. Check marked ones first against local sources that match the project's version (the installed package's source, `--help`, man pages, vendored docs), then, unless `--offline`, against the official docs for the version the project pins (no pin: the lowest it supports), with whatever search, fetch or docs tool you have. Newer docs count only for a deprecation, removal or advisory affecting that version. Keep survivors, labelled **CONFIRMED** (shown by running something) or **PLAUSIBLE** (reasoned, or doc-backed with the doc's URL and version in its evidence). Drop the rest; a candidate you couldn't check goes under What I could not verify.
   - Then, for survivors only, the smallest fix.
8. **Sources.** The lines in `sources.md` in this folder, with its online line or, under `--offline`, its offline line.
9. **Output.** "Round 1. Write your report to `braid/reviews/<folder>/r1-<name>.md`":
   - `<name>`: your tool or model family in lowercase (`codex`, `claude`), `reviewer` if you can't tell; that file exists → `-2`, `-3`, and so on. Your hand-off gives an exact path → write to that path instead.
   - Write that file and no other; change nothing else. Can't write → reply with the whole report and the path to save it at.
   - Before you finish, remove whatever else you created: temporary files and folders, containers, images and volumes, background processes, branches, stashes and worktrees. What you could not remove goes under What I could not verify.
   - Findings ranked by severity, HIGH, MEDIUM or LOW: `SEVERITY CONFIRMED|PLAUSIBLE file:line: problem. Evidence. Smallest fix.` Then **What I could not verify**. Last line: `Verdict: SIGN OFF` or `Verdict: CHANGES NEEDED`.
   - Reply in chat with only the verdict and the path, nothing after them.

Then tell the user the file path and the line to paste to a reviewer, `Read
<prompt path> and do what it says.`, and suggest a reviewer from another model
family than the one that wrote the code. Under `--run`, go on with `run.md`
instead.

Before giving the path or handing off, run the check in `exposure.md` in this
folder.
