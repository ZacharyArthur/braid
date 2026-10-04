# AGENTS.md template

Fill what applies; drop the rest. Optional sections go where shown.

```markdown
# <Project name>

<1-3 lines: what it is, for whom.> Optimizes for, in order: <priorities>.
When a feature and simplicity conflict, <which wins>.

## Stack
- <language + version, frameworks, data store>. Tooling: <package manager, linters, type checker, test runner>.
- <runtime shape: one process / services / serverless>. New dependencies need <policy>.

## Invariants                                   (optional)
1. **<rule>** (enforced by <test or check>)

## Dev environment                              (optional)
- All commands run <inside the devcontainer / via docker compose / in nix develop>, never on the host.
- <how an agent runs a command there>

## Commands
Run from the repo root.
- Install: `<cmd>`
- Format: `<cmd>` · Lint: `<cmd>` · Types: `<cmd>`
- Test: `<cmd>` · one test: `<cmd>`
- Dead code: `<cmd>` · Security/validate: `<cmd>`

## Before saying done
`<the gate: chained checks or one command>`. <CI runs the same command.> Never claim done until it passes.

## Workflow                                     (optional)
- Specs: <framework> (`<dir>`). New features, behavior changes, and architecture decisions go through a spec change first; fixes restoring specified behavior, docs, chores, and dependency bumps go straight to a branch.
- Order: <propose → branch → apply → archive on the branch before merging>.

## Security                                     (optional)
<Threat model and checklists: [SECURITY.md](SECURITY.md).> Walk the relevant checklist when touching <areas>.

## Conventions
- <code rules no tool enforces: typing strictness, generated vs hand-written types, error handling, logging>
- Match surrounding style; comments only for constraints the code can't express.

## Git
- Commits: <format> · Branches: <strategy, names> · Merge: <method>
- PRs/MRs: <tool and command>, <template> · Worktrees: <yes, where / no>
- Agent may: <commit on feature branches / push and open PRs only when asked / never force-push main>
- <Never mention AI tools in committed artifacts.> <Show the exact commit/PR text and confirm before commit, push, or PR.>

## Don't
- <edit generated files, bypass hooks, ...>

## Reference                                    (optional)
- <repo or doc>: consult, don't port.
```
