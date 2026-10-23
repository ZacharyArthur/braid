## MODIFIED Requirements

### Requirement: Explorer routed to the fast tier

When braid's policy is chosen, `standards` SHALL offer, per harness the user picked, a read-only explorer agent on the fast tier model, and SHALL write each one only after the user says yes to it. A harness that ships no subagents SHALL get no explorer offer.

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

#### Scenario: Pi

- **WHEN** the user picks Pi
- **THEN** `standards` says Pi ships no subagents, writes no agent file for it, and the tier line names no Pi agent

#### Scenario: Confirming the routing

- **WHEN** the explorer files are written
- **THEN** `standards` tells the user how to see which model a subagent actually ran on, without spawning one itself
