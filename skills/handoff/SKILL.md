---
name: handoff
description: "Write braid/HANDOFF.md: a snapshot that lets a new implementor with zero context pick up where this session left off. Only when the user explicitly invokes it."
disable-model-invocation: true
license: MIT
---

Write for a stranger: a new person or agent who has never seen this repo or
this conversation. **80-120 lines.** Overwrite the file each time; it's a
snapshot, and git keeps the history.

## First, put durable knowledge where it belongs

The handoff **links, never copies**. Before writing it:

- behavior decided this session → the spec or change delta
- domain terms → `braid/GLOSSARY.md`; hard-to-reverse decisions → an ADR
- where things live, new modules → `braid/map.md` (patch it)
- task progress → tick `tasks.md`

What's left is session state: that goes in the handoff.

## Format

```markdown
<!-- braid:handoff sha=<git rev-parse --short HEAD> date=<YYYY-MM-DD> -->
# Handoff

## Read this first
1. `braid/map.md`: the repo in 150 lines
2. <the active change or route, the specs and ADRs that matter here, in order>

## Goal
<one paragraph: what we're doing and why>

## State
- Done: <what works now, concretely>
- In progress: <change name, task N of M, what's half-done and where>
- Uncommitted: <files, or "none">

## Next
1. <the first concrete action, doable in minutes>
2. <then>
3. <then>

## Run and verify
<exact commands; which ones passed at the end of this session>

## Gotchas
- <dead ends tried and why they failed>
- <things that look wrong but are intentional>

## Open questions
- <decision still needed, who decides>
```

The session hook shows the header SHA as "N commits since", so a stale
handoff warns its reader. Always write the current short SHA.
