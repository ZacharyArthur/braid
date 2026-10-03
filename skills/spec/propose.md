# propose

Plan a change. Planning only: **no code edits**, even if the request says
"build". Stop when the change is ready to apply.

1. **Name it.** From the argument or the conversation, derive a kebab-case
   name. Nothing to go on → ask "What change do you want to make?"
2. **Synthesize, don't re-interview.** The conversation, a grilling session,
   or a cleared `braid/routes/<effort>.md` already holds the decisions. Ask
   only when an ambiguity would change scope, observable behavior,
   compatibility, or acceptance; otherwise pick the sensible default and
   record it in the proposal.
3. **Orient.** Read `braid/map.md`, the affected `braid/specs/<domain>/spec.md`,
   `braid/GLOSSARY.md`, and relevant ADRs. Check what the code does today.
4. **Climb the ladder on the change itself.** Does all of it need to exist?
   What is the smallest version that delivers the value? Cut scope goes under
   *Out of scope* with a one-line reason.
5. **Write** `braid/changes/<name>/`:
   - `proposal.md`: `## Why` (the problem, 1-3 lines), `## What changes`
     (bullets), `## Impact` (affected specs and code areas), `## Out of scope`.
   - Delta specs in `specs/<domain>/spec.md`, in the delta format.
   - `design.md` only for a real decision: alternatives weighed, the choice,
     why. No decision → no file.
   - `tasks.md`: small steps in dependency order, each verifiable. Non-trivial
     logic gets its one runnable check as a task. Last task: "Verify: <exact
     command>, then `/braid:spec archive`".
6. **Report** in a few lines: the change, task count, anything you defaulted.
   End with: "Review it, then `/braid:spec apply`."
