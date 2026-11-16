## MODIFIED Requirements

### Requirement: Heavy path routes to the right creator

When the user wants evals against a baseline, benchmarks or description-trigger tuning, `skill` SHALL hand the work to a skill creator that runs evals when the user names or prefers it and it is installed, and SHALL otherwise run braid's own eval path, in Claude Code, Codex, ZCode or Pi. In Vibe it SHALL say it has no Vibe route yet. After a hand-off, `skill`'s frontmatter checks SHALL still run on the result.

#### Scenario: Anthropic's creator installed and preferred

- **WHEN** the user asks for evals and Anthropic's `skill-creator` is installed and preferred
- **THEN** `skill` hands off to it, then runs its own checks on the skill it produced

#### Scenario: Codex's creator

- **WHEN** the user asks Codex's built-in creator for evals
- **THEN** `skill` says it creates skills but runs no evals, and offers braid's eval path

#### Scenario: No creator installed

- **WHEN** the user asks for evals in ZCode or Pi, or in Claude Code without `skill-creator`
- **THEN** `skill` runs braid's eval path instead of stopping

#### Scenario: Named creator not installed

- **WHEN** the user asks for Anthropic's `skill-creator` and it is not installed
- **THEN** `skill` says so and runs braid's eval path

#### Scenario: Vibe

- **WHEN** the user runs `/braid:skill` in Vibe
- **THEN** `skill` says it has no Vibe route yet (skill folders, user-only marks, test runs, evals) before going on
