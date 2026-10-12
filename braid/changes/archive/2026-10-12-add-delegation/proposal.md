## Why

Subagents now inherit the main model in all three harnesses (Claude Code's Explore no longer defaults to Haiku), so a session on a top model also greps on it, at up to ~40× the input price of the fast tier. Codex delegates when AGENTS.md asks it to, which makes AGENTS.md the place to say when and to which model work goes. Delegation also has known costs: duplicate reads, a fixed overhead per spawn, conflicting parallel writes, and things a cheap explorer misses. So the section is opt-in and its rules say when not to delegate.

## What changes

- `standards` gains an optional **Delegation** section, offered in its own round after Git (whose worktrees answer the policy uses) as none (recommended: the section is left out), braid's policy, or custom.
- braid's policy, about six lines: delegate reads, not writes (parallel writers only on disjoint files, in worktrees only if the Git section allows them); delegate when the output is large and the answer small, never for one to three targeted searches or files the main agent will read anyway; the fast tier locates, the mid tier reviews and researches, the main model plans, edits and synthesizes; subagents return paths with line numbers and a short answer, naming what they didn't check; verify a claim before acting on it, and treat "not found" as weak; fan out in parallel only for independent questions.
- Tiers named in AGENTS.md per harness: Claude Code `haiku` → `sonnet` → main; Codex `gpt-6-luna` (effort `high`, Codex's starting point for Luna) → `gpt-6.1-sol`; ZCode `GLM-5.3-Flash` → `GLM-5.3`. Exact IDs, prices and the sources behind the policy live in a new `skills/standards/delegation.md`, updated on release.
- With the policy chosen, standards offers the fast-tier explorer for the harnesses the user picks, each written only after a yes: Claude Code's project `Explore` and Codex's project `explorer` (both replace the built-in, read-only); for ZCode, which doesn't let custom agents reuse built-in names, a project `braid-explore` agent, noting ZCode documents only user-level agents so it may not load; declined or not loaded → the same agent user-wide in the user's home, behind a separate yes that says it affects every project, showing an existing file before replacing it; declined too → the Settings step that sets the built-in Explore's model. AGENTS.md names the explorer per harness.
- The "Documentation only" rule gains that one exception. ADR 0014.
- Review reports drift: AGENTS.md names an explorer but its file is missing or names a different model. A declined explorer leaves a tier line with models only, which expects no file.
- Verify never spawns an agent: it tells the user how to confirm which model actually ran.

## Impact

New spec domain `standards`. Code: `skills/standards/{SKILL.md,template.md}`, new `skills/standards/delegation.md`, `braid/adr/0014-*`, `braid/GLOSSARY.md`, README's and `help`'s standards rows, CHANGELOG.md. No hook change, no always-on cost: `standards` stays user-only.

## Out of scope

- A separate delegation skill: a model-invoked one adds to the always-on budget, a user-only one is never there when delegation is decided
- Mid-tier agent files: Claude Code passes `model` per spawn, and Codex's mid tier is close to its main model
- Codex `agents.default_subagent_model` in a project `.codex/config.toml`: sets only the model; the agent file also carries the read-only sandbox and the return format
- A spawn to check routing: costs money each run; the user checks once
- braid's own AGENTS.md opting in: separate decision, later
- Pointing game-dev, modding and reverse-engineering projects at existing plugin frameworks: its own brainstorm and change
