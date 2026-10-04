---
name: standards
description: "Create or review the project's AGENTS.md (plus a CLAUDE.md that imports it): project priorities, stack, exact lint/type/test/dead-code/validation commands, quality gate, conventions, spec workflow, and git workflow. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[section: project|stack|commands|gate|conventions|workflow|git|dont|...]"
license: MIT
---

`AGENTS.md` is the project's rulebook for every agent: Codex and ZCode read it
directly, Claude Code through a `CLAUDE.md` containing `@AGENTS.md`. It loads
every session, so it holds commands and decisions, never explanations.

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

## Sections

Default, always offered: **Project** (name, purpose in 1-3 lines, priorities in
order, e.g. "best practice, KISS, maintainable; simplicity wins"), **Stack**
(languages, frameworks, runtime shape, dependency policy), **Commands**,
**Before saying done** (the quality gate), **Conventions** (code rules no tool
enforces), **Git**, **Don't**.

Optional, offered when they apply: **Dev environment** (a devcontainer, Docker,
or Nix setup is detected: where commands must run), **Invariants** (hard rules,
ideally backed by tests: "secrets never reach the client", "only `clients/`
makes HTTP calls"), **Workflow** (spec framework, below), **Security** (a
`SECURITY.md` exists or auth/web code is present: link it, say when to walk it),
**Reference** (related repos: consult, don't port). No layout tree: where
things live is `braid/map.md`'s job; name a folder only when an invariant needs it.

## Create

1. **Detect.** Stacks (manifests, IaC templates, scripts), tool configs
   (`pyproject.toml` `[tool.*]`, eslint, tsconfig, `.pre-commit-config.yaml`,
   `.cfnlintrc`, ...), CI workflows (does CI run a single gate command?),
   lockfiles, `.devcontainer/` / Docker / Nix, `SECURITY.md`, spec frameworks
   (`openspec/`, `.specify/`, `.kiro/specs/`, `braid/`, ...), and the git host
   from `git remote get-url origin`.
2. **Draft.** What the repo already configures wins: AGENTS.md records it.
   For each gap, recommend a default from `stacks.md` (in this folder) with one
   or two alternatives. Stacks it doesn't list: use your own knowledge, same shape.
   A small or new repo is no reason to recommend skipping a tool or a git
   convention: standards are set before the code grows. YAGNI applies to code,
   not to the checks and conventions guarding it.
3. **Confirm in rounds** with the grilling skill (`braid:grilling`), one per
   section group, each item with its recommendation so a round can be approved
   in one reply:
   - **Project and stack**, then **commands and gate**, then **conventions**.
   - **Workflow:** offer braid's spec workflow (recommended), OpenSpec, or none.
     None → leave the section out. Chosen → record `Specs: <framework> (<dir>)`,
     the rule "new features, behavior changes, and architecture decisions go
     through a spec change first; fixes restoring specified behavior, docs,
     chores, and dependency bumps go straight to a branch", and that
     framework's order of steps (braid: propose → branch → apply → archive on
     the branch before merging, so code and spec land in one squash).
   - **Git:** commit format, branching, branch names, merge method, PR/MR tool
     (`gh`, `glab`, `tea`), PR template, worktrees, and what the agent may do on
     its own (commit on feature branches; push and open PRs only when asked;
     never force-push or commit to the main branch). Also offer: "never mention
     AI tools in committed artifacts" and "show the exact commit or PR text and
     confirm before commit, push, or PR".
   - **Optional sections** that apply.
4. **Write** `AGENTS.md` (format in `template.md`, this folder) and
   `CLAUDE.md` = `@AGENTS.md`.
5. **Verify.** Run every command once. Report each: passes, fails (first error
   line), or not installed (with its install command). Never install tools or
   fix findings yourself; the user decides.

## Review

1. Summary table: section → what it defines → command.
2. Findings: **gaps** (a default section or tool category missing), **drift**
   (AGENTS.md says one tool or workflow, the repo uses another), **broken**
   (run each command: fails or not installed).
3. Offer to walk through sections, explaining the choice and its alternatives.
   The user picks which, or none.
4. Write only confirmed changes, then re-run the commands.

## Rules

- Only sections and lines that apply. Exact commands, runnable from the root.
  A "why" worth keeping goes in an ADR or a linked doc, not here.
- **Multi-stack repos:** group Commands by folder (`### api/ (Python)`, commands
  like `cd api && ...`); "Before saying done" lists checks per area ("changed
  `api/` → ...") so only touched areas run. Other sections stay shared.
- **About 100 lines;** a large monorepo may stretch to about 150. Past that,
  link out (as with `SECURITY.md`) instead of inlining.
- Documentation only: no commit hooks, branch protection, or host settings.
  Want enforcement? Offer it as a `/braid:spec propose` change.
