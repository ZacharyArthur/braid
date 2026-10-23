## ADDED Requirements

### Requirement: Heavy path routes to the right creator

When the user wants evals against a baseline, benchmarks or description-trigger tuning, `skill` SHALL hand the work to a skill creator that runs evals when the user names or prefers it and it is installed, and SHALL otherwise run braid's own eval path, in any of the four harnesses. After a hand-off, `skill`'s frontmatter checks SHALL still run on the result.

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

### Requirement: Evals compare against a baseline

braid's eval path SHALL run each test case in a fresh context both with the skill and without it (or with the previous version when improving one), grade each assertion pass or fail with quoted evidence, and show the user the results side by side before revising the skill.

#### Scenario: First iteration

- **WHEN** the eval path runs on a new skill with three test cases
- **THEN** six fresh runs are made, and the user sees each case's grades with and without the skill

#### Scenario: Assertion passes either way

- **WHEN** an assertion passes both with and without the skill
- **THEN** it is flagged as measuring nothing the skill adds

#### Scenario: Pi without a container

- **WHEN** output evals would run in Pi and no container or throwaway VM is at hand
- **THEN** `skill` says so and runs no Pi output evals, since Pi asks no approval before a tool call

### Requirement: Trigger tuning is opt-in and held out

Trigger tuning SHALL run only after the user agrees to its stated number of model runs, SHALL revise the description from a tuning subset of the queries only, and SHALL keep the description that scores best on the held-out rest.

#### Scenario: Cost stated first

- **WHEN** the user asks to tune a description
- **THEN** `skill` states how many runs a round takes and starts only on a yes

#### Scenario: Later round overfits

- **WHEN** a later description scores better on the tuning queries but worse on the held-out ones
- **THEN** the earlier description is kept

#### Scenario: Pi trigger runs

- **WHEN** trigger queries run headless in Pi
- **THEN** each run loads the skill under test without trusting the scratch copy's project files, has no MCP tools, and can only read files

#### Scenario: Installed copy in Pi

- **WHEN** another copy of a skill of the same name is installed where Pi finds it
- **THEN** trigger runs load only the copy under test, and `skill` says near-miss queries then meet no neighbouring skills
