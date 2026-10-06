---
name: help
description: "Explain braid's skills: what each does, when to use it, its arguments, and how to invoke it in Claude Code, Codex and ZCode. Pass a skill name for a deeper walkthrough of that one. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[skill name]"
license: MIT
---

## With a skill name

Read `../<name>/SKILL.md` next to this file, plus any file in that folder it
says to read for the verb in question. Explain it in this order: what it's
for, when to reach for it (and when not), its arguments or verbs, what it
writes and where, then one example invocation per harness. No match → show
the overview and name the closest skills.

## Without one

Show the sections below, as they are.

### Invoking

| Harness | Form | Example |
|---|---|---|
| Claude Code | `/braid:<skill> [args]` | `/braid:spec propose add-login` |
| Codex | `$<skill> [args]` | `$spec propose add-login` |
| ZCode | `/braid:<skill> [args]` | `/braid:spec propose add-login` |

**Auto** skills also load by themselves when a prompt matches; the rest run
only when you call them. ZCode is the exception: it has no user-only flag, so
any skill can load when a prompt matches it.

### Always on

The core rules (YAGNI > KISS > DRY) are injected every session and after
compaction, with one-line pointers to the active change, route, repo map and
handoff. ZCode never re-injects after `/compact`; there `drift on` restates the
level on every prompt. `/braid:braid lite|full|ultra` sets the level, `drift on|off` toggles
a per-prompt reminder, "stop braid" turns it off for the session.

### Skills

| Skill | Use it when | Arguments |
|---|---|---|
| `braid` (auto) | Switching level or drift, or reading the rules | `lite\|full\|ultra\|off\|drift on\|drift off` |
| `grilling` (auto) | Stress-testing a plan: rounds of questions, each with a recommended answer, until it's settled | - |
| `grill-me` | Alias for `grilling` | - |
| `grill-with-docs` | Grilling that also writes the glossary and ADRs | - |
| `domain-modeling` (auto) | Pinning down terms (`braid/GLOSSARY.md`) or recording a hard-to-reverse decision (`braid/adr/`) | - |
| `map` (auto) | Orienting in a repo: builds or patches `braid/map.md` | `[rebuild]` |
| `wayfind` | An effort too big or foggy for one session: a route of decisions in `braid/routes/` | `[effort or idea]` |
| `spec` | Planning, building and recording changes: `propose`, `apply`, `archive`, `discover` | `<verb> [name or description]` |
| `standards` | Writing or reviewing the project's `AGENTS.md`: commands, quality gate, conventions, git workflow | `[section]` |
| `handoff` | Ending a session someone else will continue: `braid/HANDOFF.md` | - |
| `review` | Checking a diff for over-engineering | `[diff target]` |
| `audit` | Checking a whole repo or path for over-engineering | `[path]` |
| `debt` | Listing every `braid(<strand>):` corner cut, flagging ones with no upgrade trigger | - |
| `xreview` | A review by another model: writes the prompt, `--run` hands it to a fresh subagent | `[--open] [--run] [diff\|<path>\|all]` |
| `systematic-debugging` | A bug or failing test: root cause before any fix | - |
| `security-audit` | A security review or full audit with verified findings | - |
| `design` | Building or reviewing UI: native elements, few tokens, no generic AI look | `[what to build or review]` |
| `humanizer` | Making AI-written prose sound like you | - |
| `adhd` | Action-first answers; stays on until "stop adhd mode" | - |
| `skill` | Creating a new skill that stays small and triggers right | `[what it should do]` |
| `help` | This overview, or `help <skill>` for one in depth | `[skill]` |

### Typical flow

`grilling` or `wayfind` to decide → `spec propose` → `spec apply` → `review`
or `xreview` → `spec archive` → `handoff` if someone else picks it up.
