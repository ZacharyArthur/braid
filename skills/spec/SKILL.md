---
name: spec
description: "Spec-driven changes in braid/: propose (plan a change from the conversation), apply (implement its tasks), archive (merge into specs), discover (spec an existing codebase by grilling about what it does). Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "propose|apply|archive|discover [name or description]"
license: MIT
metadata:
  source: https://github.com/Fission-AI/openspec
---

Specs say what the system must do. Changes say what is about to change. Both
live in `braid/`, on disk, so they survive sessions and compaction.

## Which framework

1. **AGENTS.md says** (`Specs: <framework> (<dir>)` in its Workflow section) → use that.
2. **Otherwise detect:** `openspec/` → OpenSpec; `braid/specs` or `braid/changes`
   → braid; `.specify/` or `specs/NNN-*/` → Spec Kit; `.kiro/specs/` → Kiro;
   `.bmad-core/` → BMAD; `.agent-os/`, `.taskmaster/` → Agent OS, Taskmaster.
   Nothing → braid. More than one → ask.
3. **The user explicitly asks for braid's workflow** → braid, whatever is present.

**OpenSpec:** every verb works on `openspec/specs/` and `openspec/changes/`
instead of `braid/`, in OpenSpec's formats (the ones below, plus `## RENAMED
Requirements` deltas: `- FROM: ### Requirement: <old>` / `- TO: ### Requirement:
<new>`). Follow `openspec/config.yaml`: its context and any sections it
requires in an artifact. `openspec` CLI installed → use `openspec validate` and
`openspec archive <id>`; otherwise edit the files. Only specs and changes move:
ADRs, glossary, map, routes, and handoff stay in `braid/`.

**Any other framework:** ask once: follow it (recommended: point to its own
commands and step aside; braid's core rules still govern the code), run braid's
workflow alongside it, or migrate to braid. Record the answer in AGENTS.md's
Workflow section (`/braid:standards workflow`) so nobody asks again.

## Route

Read the verb's file in this folder and follow it: `propose.md`, `apply.md`,
`archive.md`, `discover.md`. No verb: an active change exists → ask apply or
archive; none → `propose`. Paths below say `braid/`; under OpenSpec read
`openspec/` for specs and changes.

## Layout

```text
braid/
  specs/<domain>/spec.md            # source of truth: intended behavior now
  changes/<name>/
    proposal.md                     # why, what changes, impact, out of scope
    design.md                       # only when there is a real "how" decision
    tasks.md                        # checkboxes: the progress state
    specs/<domain>/spec.md          # delta against braid/specs/<domain>/spec.md
  changes/archive/<YYYY-MM-DD>-<name>/
```

Change names: kebab-case, verb first (`add-dark-mode`, `fix-refund-rounding`).
Domains: the capability, not the code layout (`auth`, `billing`), following
the folders already in `braid/specs/`.

## Spec format

```markdown
# <Domain>

## Purpose
<one or two lines>

## Requirements

### Requirement: <short name>
The system SHALL <observable behavior>.

#### Scenario: <short name>
- **WHEN** <condition>
- **THEN** <outcome>
```

Every requirement has at least one scenario. Behavior only: what a user,
caller, or operator can observe. No file paths, class names, or code.

## Delta format

```markdown
## ADDED Requirements
### Requirement: <name>
...full requirement with scenarios...

## MODIFIED Requirements
### Requirement: <exact existing name>
...the complete updated requirement, not a diff...

## REMOVED Requirements
### Requirement: <exact existing name>
**Reason**: <why>
```

Omit empty sections. A rename is REMOVED + ADDED.

## tasks.md format

```markdown
## 1. <group>
- [ ] 1.1 <one verifiable step>
- [ ] 1.2 ...
```

The session hook counts these boxes to show progress. Tick `- [x]` the moment
a task is done and checked.

## Always

- braid's core rules apply to every verb: the ladder, YAGNI > KISS > DRY.
- Use `braid/GLOSSARY.md` terms. Respect `braid/adr/`. Read `braid/map.md` before exploring.
