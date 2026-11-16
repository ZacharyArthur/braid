## Why

`/braid:skill` covers Claude Code, Codex, ZCode and Pi: where skills live, the user-only marks, a test run in a fresh context, and braid's eval path. Vibe (added in add-vibe-harness) has none of that yet, and the skill only says so. Vibe has skill folders of its own (`.vibe/skills/`, `~/.vibe/skills/`, `.agents/skills/`), honors `disable-model-invocation`, and runs headless with `vibe -p`, so a route looks possible once its headless approval and isolation behavior are measured.

## Out of scope

Everything until this change is proposed in full: measure first how `vibe -p` approves tool calls (`--smart-approve`, `--auto-approve`, agent allowlists) and what a scratch `VIBE_HOME` isolates, then decide whether Vibe's output evals need a container, as Pi's do.
