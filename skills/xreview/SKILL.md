---
name: xreview
description: "Write a self-contained review prompt for a different model or fresh session: correctness, completeness, spec and principle adherence. Adversarial by default, --open for neutral; --run hands it to a fresh subagent. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[--open] [--run] [diff|<path>|all]"
license: MIT
---

You write the review **prompt**, not the review. A different model or a cold
session reviews better than the one that wrote the code: no anchoring on its
own reasoning.

## Inputs

- Scope: `diff` (default: uncommitted changes plus the branch against its base), a path, or `all`.
- `--open`: neutral framing. Default is adversarial.
- `--run`: also hand the prompt to a fresh subagent, if the harness has them, and relay its report.

## Gather, don't paste

Collect pointers the reviewer opens itself: the diff command or file list; the
specs, active change (`proposal.md`, `tasks.md`), route, and ADRs that touch
the scope; `braid/map.md`. Excerpt only a line or two where it saves the
reviewer a search.

## Write `braid/reviews/<YYYY-MM-DD>-<scope>.md`

Sections, in order:

1. **Role.**
   - Adversarial: "You are a senior SRE and staff engineer. Your job is to break this: find what fails, is missing, or contradicts its spec."
   - `--open`: "You are a senior SRE and staff engineer. Decide whether this is correct and complete. 'No significant issues' is a valid, expected answer."
2. **Intent.** What this code is supposed to do: the pointers above.
3. **Scope.** The exact diff command or paths. Nothing outside it.
4. **Principles.** YAGNI > KISS > DRY; rule of three. Point to `skills/braid/core.md` in the braid plugin, or paste its Rules section if the reviewer can't reach it. Flag over-building and under-building alike.
5. **Check.** Completeness against `tasks.md` and the spec deltas; correctness and edge cases; spec and vision alignment; security basics; error handling; whether verification actually ran; ops (config, rollout, observability).
6. **Don't flag.** Style preferences; anything an ADR already decided; speculative "what if later"; anything out of scope; a `braid(<pillar>):` corner cut whose upgrade trigger hasn't fired.
7. **Method.** Two passes:
   - Find: candidates with `file:line` and evidence only. No fixes yet.
   - Refute: try to disprove each candidate against the code. Run a test or a reproduction wherever possible. Keep survivors, labelled **CONFIRMED** (shown by running something) or **PLAUSIBLE** (reasoned only). Drop the rest.
   - Then, for survivors only, the smallest fix.
8. **Output.** Findings ranked by severity: `SEVERITY CONFIRMED|PLAUSIBLE file:line: problem. Evidence. Smallest fix.` End with **What I could not verify**.

Then tell the user the file path and suggest a reviewer from another model
family than the one that wrote the code.
