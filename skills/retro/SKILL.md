---
name: retro
description: "Find the tool failures agents keep repeating in this project, across Claude Code, Codex and ZCode transcripts, and turn them into AGENTS.md rules after a yes; then point to the harness's own usage, config and memory tools. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[all] [insights] [<sessions>] [<days>d]"
license: MIT
---

Agents repeat the same mistakes across sessions: wrong-shell syntax, a missing
tool, a wrong flag or path. Retro reads the transcripts every harness already
keeps, finds the failures that recur, and proposes rules for the file all three
harnesses read: the project's AGENTS.md. Usage, cost and config analysis stay
with the tools the harness ships; retro points to them.

## 1. Extract

Run the script next to this file, from the project's working directory, passing
the user's arguments through:

```bash
node <this skill's folder>/retro.cjs [all] [insights] [<sessions>] [<days>d]
```

Defaults: this project (its git root), the 30 most recent sessions within 30
days, across every harness's store. `all` drops the project filter; `insights`
(Claude Code only) also reads the `/insights` report. In another harness,
`insights` → say it is Claude Code only and run without it.

It prints numbered findings, each a failure signature seen in 2 or more
sessions, with the harnesses, last date and one error line. From transcripts it
prints no prompts or model text; `insights` adds the report's own model-written
friction notes and rules. It writes nothing (SQLite may add its `-wal` and
`-shm` files beside ZCode's store). `shell ?` means the command couldn't be told
apart; the error line still groups it. Pass on any note it prints (a skipped
store, a missing `/insights` report) as it is.

## 2. Filter

Read the target file first (below), then drop a finding when:

- the work expected it: tests failing on code being edited, a build error in
  the change itself, a check that was meant to fail;
- the file already says it;
- no rule would prevent it: a network blip, a service outage.

With `insights`, the report's suggested rules and friction go through the same
filter. They cover every project, so outside `all` keep only those that apply
here.

Nothing left → say so and skip to step 4.

## 3. Propose

One rule per kept finding: what to do instead, and why in one clause. A rule
that only one harness needs (its sandbox, its shell, its tool names) ends with
that harness in parentheses: `(Codex)`. Commands go under `## Commands`, things
to avoid under `## Don't`, matching the file's own wording.

Target:

- Default: the project's AGENTS.md. None → offer `/braid:standards` first;
  declined → show the rules in chat and write nothing.
- `all`: the user-level file of each installed harness the rule applies to:
  Claude Code `~/.claude/CLAUDE.md` (`$CLAUDE_CONFIG_DIR` if set), Codex
  `~/.codex/AGENTS.md` (`$CODEX_HOME`), ZCode `~/.zcode/AGENTS.md`.

Show every change as one diff with the rules numbered, then ask: accept all,
drop some by number ("drop 2, 5"), or cancel. Write only what is accepted, and
never into a harness's memory.

## 4. Route

End with the rows below that a finding calls for, then the standing line.
Before naming a skill, check it is in your skill list; not there → one line
saying it isn't installed. Offer to run a skill and run it only on a yes; a
built-in command is for the user to type, so name it. Retro computes no token
or cost figures itself.

Verified 2026-10:

| Finding | Claude Code | Codex | ZCode |
|---|---|---|---|
| Permission prompts or denials recur | `fewer-permission-prompts` skill | `/debug-config` | `zcode-configuration-guide` skill |
| Settings, hook or config errors | `update-config` skill, `/doctor` | `/debug-config`, `/hooks`, `codex doctor` | `diagnosing-hooks`, `zcode-configuration-guide` skills |
| MCP server failures | `/mcp` | `/mcp` | `diagnosing-mcp` skill |
| Skill or plugin failures | `/plugin`, `skill-creator` skill | `/skills`, `/plugins`, `skill-creator` skill | `diagnosing-skills`, `diagnosing-plugins` skills |
| Memory contradicts a new rule | `consolidate-memory` skill | `/memories` | none shipped |

Standing line, cost and cross-project:

- Claude Code: `/insights` (every project, with friction and suggested rules),
  `/usage`, the `explain-usage` skill.
- Codex: `/status`, `/usage`.
- ZCode: no usage or cost tool ships.
