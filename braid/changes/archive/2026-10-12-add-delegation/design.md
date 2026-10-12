## Where it lives: a standards section, not a skill

- **Model-invoked skill**: loads when the agent thinks of delegating, but its description joins the always-on budget (ADR 0007) on every session of every project.
- **User-only skill**: free, but never loaded at the moment an agent decides to spawn.
- **AGENTS.md section via `standards`** (chosen): read every session in the projects that opt in, only there; Codex delegates when AGENTS.md asks it to. The detail an agent doesn't need every session (IDs, prices, sources, file bodies) sits in `delegation.md`, read only by `standards`, like `stacks.md`.

## Routing: replace the built-in explorer

Claude Code and Codex can both take a model per spawn, but then routing holds only while the main agent remembers to pass it, every time; ZCode's built-ins only change in Settings. Replacing the built-in by name (`Explore`, `explorer`) means the agent's habit of reaching for the explorer routes to the fast tier with no new name to learn. ZCode refuses built-in names, so its agent gets a new one, `braid-explore`, and AGENTS.md names it. ZCode documents only user-level agents, but a project folder is reported to load, so the project file comes first, flagged as possibly not loading, and the user-wide file is the fallback: braid's only write outside a project, so it gets its own yes. The project file carries an account-qualified model id, which teammates on another account replace.

`thoughtLevel` is left out of the ZCode file: the default level is enough for a locator (official plugins run Flash at `max` for judging, not searching). Its `model` is the user's account-qualified id, asked for, never guessed. Codex sets `model_reasoning_effort = "high"`, the docs' starting point for Luna; `low` is their starting point for Astra, not Luna.
