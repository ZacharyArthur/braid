# Delegation

Read when the user picks braid's delegation policy, or when review meets a
Delegation section. Model names and prices as of 2026-10-11; re-check them on
each braid release.

## Policy

Write these lines into AGENTS.md's `## Delegation` section, the tier line
filled from the table below for the harnesses the user picked:

```markdown
## Delegation
- Delegate reads, not writes. Parallel writers only on disjoint files<, in worktrees>.
- Delegate when the output is large and the answer small (many files, logs, test output, web research). Never for one to three targeted searches or files you will read in full anyway.
- Fast tier locates, mid tier reviews and researches, the main model plans, edits and synthesizes.
  <Claude Code: Explore (`haiku`), then `sonnet` · Codex: explorer (`gpt-6-luna`, high), then `gpt-6.1-sol` · ZCode: braid-explore (`GLM-5.3-Flash`), then `GLM-5.3`>
- A subagent returns paths with line numbers and a short answer, and names what it did not check.
- Verify a subagent's claim before acting on it; its "not found" is weak evidence.
- Fan out in parallel only for independent questions.
```

Keep `<, in worktrees>` only when the Git section allows worktrees. Custom:
the user's own lines, same section.

## Tiers

| Harness | Fast | Mid | Main |
|---|---|---|---|
| Claude Code | `haiku` (Haiku 5.5) | `sonnet` (Sonnet 5.5) | the session's (Opus 5.5, Fable 5.1) |
| Codex | `gpt-6-luna`, effort `high` (Codex's starting point for Luna) | `gpt-6.1-sol`, effort `medium` | the session's |
| ZCode | `GLM-5.3-Flash` | `GLM-5.3` | the session's |

Pi ships no subagents (Pi 1.4.0): picking it adds nothing to the tier line and
no explorer file. Say so; Pi's sessions read the section and do the work
themselves.

Why: every harness with subagents runs them on (or near) the main model unless told
otherwise.
Per million tokens, input / output: Haiku 5.5 $0.10 / $0.50 for prompts up to
100K, $0.50 / $2.50 above (keep explorer tasks scoped); Sonnet 5.5 $2 / $10;
Opus 5.5 $4 / $20; GLM-5.3-Flash about a ninth of GLM-5.3. A subagent moves
reading cost rather than removing it and pays its own startup context, so the
policy says when not to delegate. Sources: Claude Code sub-agents docs, Claude
pricing, Codex subagents docs, ZCode subagents docs, Anthropic's multi-agent
research system, Cognition's "Don't build multi-agents".

## Explorer files

Offer one per harness the user picked, show it, and write it only after a yes.
A file already there: show it and ask before replacing it. A no: that
harness's tier line names only its models (`haiku`, then `sonnet`), no agent.

**Claude Code**, `.claude/agents/Explore.md` (replaces the built-in Explore):

```markdown
---
name: Explore
description: Fast read-only search. Use to locate files, symbols, call sites and config across the codebase.
tools: Read, Grep, Glob
model: haiku
omitClaudeMd: true
---

Find what was asked and stop. Read only what you need to answer.
Return: each relevant path with line numbers and one line on why, then a short
answer, then what you did not check. No file dumps.
```

**Codex**, `.codex/agents/explorer.toml` (replaces the built-in explorer):

```toml
name = "explorer"
description = "Fast read-only search. Use to locate files, symbols, call sites and config across the codebase."
model = "gpt-6-luna"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
Find what was asked and stop. Read only what you need to answer.
Return: each relevant path with line numbers and one line on why, then a short
answer, then what you did not check. No file dumps.
"""
```

**ZCode**, `.zcode/agents/braid-explore.md` (a new name: ZCode refuses
built-in names). ZCode's docs list only user-level agents, though its app code
reads a project agents folder: say it may not load. Its model id is tied to the
user's provider account (official ZCode plugins use
`account:bigmodel-individual-coding-plan/GLM-5.3-Flash`): ask for theirs from
the model picker, and say teammates on another account need their own.

```markdown
---
name: braid-explore
description: Fast read-only search. Use instead of Explore to locate files, symbols, call sites and config across the codebase.
model: <the user's GLM-5.3-Flash id>
tools: [Read, Grep, Glob]
injectAgentsMd: false
---

Find what was asked and stop. Read only what you need to answer.
Return: each relevant path with line numbers and one line on why, then a short
answer, then what you did not check. No file dumps.
```

No `thoughtLevel`: the default level is enough for a locator.

Whether it loaded: Settings may not list project agents, so ask the user to
open a new session and ask it which subagents it can delegate to (no spawn).

Fallbacks, offered when the user declines the project file or it didn't load.
A project file that didn't load: offer to remove it, whichever fallback
follows, so no agent outlives what AGENTS.md names.

1. The same file in `~/.zcode/agents/`, behind its own yes that says it applies
   to every project on this machine.
2. Declined too: the Settings step, Settings → Subagents → Explore → model
   `GLM-5.3-Flash`. Write nothing, and name `Explore` for ZCode in the tier
   line.

Review: a harness's tier line names an explorer but its file is missing or
names another model → drift, naming the file it would write. A line naming
only models expects no file, nor does ZCode's naming `Explore`. ZCode's
`braid-explore` may be in the project or in `~/.zcode/agents/`; found in the
project, ask whether a new session sees it, and not → the fallbacks above.

## Confirm the routing

Never spawn an agent to check; tell the user how:

- Claude Code: restart if `.claude/agents/` was just created (a new agents
  folder loads only on restart); then `/tasks` while a subagent runs names the
  model on its row.
- Codex: `/agent` switches to the explorer's thread; `/status` there shows the
  active model.
- ZCode: the load check above, in a new session (running sessions don't
  reload). Not there → the fallbacks, here or by rerunning
  `/braid:standards delegation`; say so.
