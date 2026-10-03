# apply

Implement a change's tasks. `tasks.md` is the state: anyone, including you
after compaction, can pick up from it.

1. **Pick the change.** The named one, or the only active folder in
   `braid/changes/` (not `archive/`). Several and none named → ask.
2. **Load context.** Read `proposal.md`, the delta specs, `design.md` if it
   exists, `tasks.md`, and `braid/map.md`.
3. **Work the first unchecked task**, then the next, in order:
   - Implement it under braid's core rules. The deltas say *what*; the ladder
     decides *how little*.
   - Run its check. Quote the result.
   - Tick it in `tasks.md` right away, not in a batch at the end.
4. **When reality disagrees with the plan:**
   - A missing step → add it to `tasks.md` and do it.
   - The spec is wrong or the design won't hold → stop, say what you found,
     update the delta or `design.md` with the user, then continue.
   - A new idea outside the change → add it under `## Follow-ups` in
     `proposal.md`. Don't build it.
5. **Finish.** All boxes ticked → run AGENTS.md's "Before saying done"
   checks (no AGENTS.md: the tests, build, and lint the project already uses) and quote the results. End with:
   "`/braid:spec archive` to merge it into the specs."

Stopping midway is fine: the ticked boxes are the handoff. For a longer
pause, `/braid:handoff`.
