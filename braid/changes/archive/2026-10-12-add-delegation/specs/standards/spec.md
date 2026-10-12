## ADDED Requirements

### Requirement: Delegation is opt-in

`standards` SHALL offer a Delegation section with three choices, none (recommended), braid's policy, or custom, and SHALL leave the section out of AGENTS.md when the user picks none.

#### Scenario: User takes the recommendation

- **WHEN** the user accepts the Delegation round as recommended
- **THEN** AGENTS.md has no Delegation section and no subagent file is written

#### Scenario: User picks braid's policy

- **WHEN** the user picks braid's policy
- **THEN** AGENTS.md's Delegation section says to delegate reads rather than writes, to delegate only when the output is large and the answer small, which tier locates, reviews, and plans and edits, what a subagent returns, to verify a subagent's claim before acting on it, and to fan out only for independent questions
- **AND** it names the fast and mid tier models for each harness the user picked, and the explorer agent for each one not declined (see Explorer declined)

### Requirement: Explorer routed to the fast tier

When braid's policy is chosen, `standards` SHALL offer, per harness the user picked, a read-only explorer agent on the fast tier model, and SHALL write each one only after the user says yes to it.

#### Scenario: Claude Code or Codex

- **WHEN** the user says yes for Claude Code or Codex
- **THEN** a project-level agent replaces that harness's built-in explorer and runs on its fast tier model

#### Scenario: ZCode

- **WHEN** the user picks ZCode
- **THEN** `standards` offers a project-level agent, saying ZCode may not load it and that its model id is tied to the user's provider account

#### Scenario: ZCode project agent declined or not loaded

- **WHEN** the user declines the project agent, or a new session can't delegate to it
- **THEN** `standards` offers the same agent for every project on this machine, saying so, behind its own yes
- **AND** an existing agent of that name is shown before it is replaced

#### Scenario: ZCode agents declined

- **WHEN** the user declines both ZCode agents
- **THEN** `standards` shows the Settings step that sets the built-in Explore's model, and writes nothing

#### Scenario: Confirming the routing

- **WHEN** the explorer files are written
- **THEN** `standards` tells the user how to see which model a subagent actually ran on, without spawning one itself

### Requirement: Delegation drift

`standards` review SHALL report drift when AGENTS.md's Delegation section names an explorer agent but that agent is missing or names a different model.

#### Scenario: Explorer file missing

- **WHEN** AGENTS.md names Explore on `haiku` for Claude Code and the project defines no Explore agent
- **THEN** review lists it as drift, with the file it would write

#### Scenario: Explorer declined

- **WHEN** the user declined a harness's explorer
- **THEN** that harness's tier line names only its models (ZCode after the Settings step: its built-in Explore), and review reports no drift for it
