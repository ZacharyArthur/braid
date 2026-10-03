---
name: standards
description: "Create or review the project's AGENTS.md (plus a CLAUDE.md that imports it): exact lint, format, type, test, dead-code and validation commands, conventions, and git workflow. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[section: commands|done|conventions|git|dont]"
license: MIT
---

`AGENTS.md` is the project's rulebook for every agent: Codex and ZCode read it
directly, Claude Code through a `CLAUDE.md` containing `@AGENTS.md`. It loads
every session, so it holds commands and decisions only, never explanations.

## Which mode

Look for `AGENTS.md` and `CLAUDE.md` at the repo root.

| Found | Do |
|---|---|
| Neither | **Create** |
| `AGENTS.md`, no `CLAUDE.md` | Create `CLAUDE.md` = `@AGENTS.md`, then **review** |
| `CLAUDE.md` with content, no `AGENTS.md` | **Migrate**, then **create** for what's missing |
| Both, `CLAUDE.md` holds more than the import | **Migrate**, then **review** |
| Both, `CLAUDE.md` is just `@AGENTS.md` | **Review** |

A section argument (`/braid:standards git`) limits create or review to that section.

## Migrate

Sort each piece of `CLAUDE.md`: standards, commands, and conventions → `AGENTS.md`;
codebase overview ("the app is…", where things live) → `braid/map.md`;
Claude-only instructions (Claude features, its MCP servers) → stay in
`CLAUDE.md` below the `@AGENTS.md` line. Show every move as "from → to" and
wait for a yes. Never delete anything silently.

## Create

1. **Detect.** Stacks (manifests, IaC templates, scripts), tool configs
   (`pyproject.toml` `[tool.*]`, eslint, tsconfig, `.pre-commit-config.yaml`,
   `.cfnlintrc`, ...), CI workflows, lockfiles (package manager), and the git
   host from `git remote get-url origin`.
2. **Draft.** What the repo already configures wins: AGENTS.md records it.
   For each gap, recommend a default from `stacks.md` (in this folder) with one
   or two alternatives. Stacks it doesn't list: use your own knowledge, same shape.
   A small or new repo is no reason to recommend skipping a tool or a git
   convention: standards are set before the code grows. YAGNI applies to code,
   not to the checks and conventions guarding it.
3. **Confirm in rounds** with the grilling skill (`braid:grilling`): one round
   per section, each item with its recommendation, so a section can be
   approved in one reply. The git round asks: commit format, branching, branch
   names, merge method, PR/MR tool (`gh`, `glab`, `tea`), worktrees, and what
   the agent may do on its own (e.g. commit on feature branches; push and open
   PRs only when asked; never force-push or commit to the main branch).
4. **Write** `AGENTS.md` (format below) and `CLAUDE.md` = `@AGENTS.md`.
5. **Verify.** Run every command once. Report each: passes, fails (first error
   line), or not installed (with its install command). Never install tools or
   fix findings yourself; the user decides.

## Review

1. Summary table: section → what it defines → command.
2. Findings: **gaps** (a category with no tool), **drift** (AGENTS.md says one
   tool, the repo configures another), **broken** (run each command: fails or
   not installed).
3. Offer to walk through sections, explaining the choice and its alternatives.
   The user picks which, or none.
4. Write only confirmed changes, then re-run the commands.

## AGENTS.md format

```markdown
# Agent instructions

## Commands
Run from the repo root.
- Install: `<cmd>`
- Format: `<cmd>` · Lint: `<cmd>` · Types: `<cmd>`
- Test: `<cmd>` · one test: `<cmd>`
- Dead code: `<cmd>` · Security/validate: `<cmd>`

## Before saying done
`<the checks that must pass, chained>`

## Conventions
- <language version, package manager, rules no tool enforces>
- Ask before adding a dependency

## Git
- Commits: <format> · Branches: <strategy, names> · Merge: <method>
- PRs/MRs: <tool and command> · Worktrees: <yes, where / no>
- Agent may: <commit on feature branches / push and open PRs only when asked / never force-push main>

## Don't
- <edit generated files, bypass hooks, ...>
```

Rules:

- Only sections and lines that apply. A shell-script repo has no Types line.
- Exact commands, runnable from the root. A "why" worth keeping goes in an ADR.
- **Multi-stack repos:** group Commands by folder (`### api/ (Python)`) with
  commands like `cd api && ...`. "Before saying done" lists checks per area:
  "changed `api/` → ...", so only the touched areas' checks run. Conventions,
  Git, and Don't stay shared.
- **About 100 lines;** a large monorepo may stretch to about 150. Past that,
  move per-area detail into linked docs and keep only commands here.
- Documentation only: no commit hooks, branch protection, or host settings.
  Want enforcement? Offer it as a `/braid:spec propose` change.
