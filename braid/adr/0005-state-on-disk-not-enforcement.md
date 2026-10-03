# Workflow state lives on disk; the hook points, it doesn't police

Progress is `tasks.md` checkboxes and route `- [ ]` items, never conversation memory, so it survives compaction and new sessions. The SessionStart hook re-reads that state on startup, resume, clear and compact and adds a few pointer lines (active change, queued proposals, open route, map and handoff staleness). We rejected PreToolUse/Stop hooks that block edits without an open change or nag about unticked tasks: they'd fire on one-line fixes and make the harness rigid.
