## ADDED Requirements

### Requirement: Generated codebase map

At session start, in a repo with no `braid/map.md`, the session hook SHALL add a map of the top-level functions, classes and exports of source files, one line per folder, within a fixed character cap, skipping tests, generated and vendored files, and listing shared code first.

#### Scenario: Repo without a map

- **WHEN** a session starts in a repo with source files and no `braid/map.md`
- **THEN** the injected context includes the generated map, at most the cap in length

#### Scenario: Curated map exists

- **WHEN** the repo has `braid/map.md`
- **THEN** the hook points to it and adds no generated map

#### Scenario: Turned off

- **WHEN** `BRAID_MAP=0` is set
- **THEN** no generated map is added

#### Scenario: Large or broken repo

- **WHEN** building the map exceeds its time limit or fails
- **THEN** the session starts on time, with the partial map or none, and no error

#### Scenario: Any harness

- **WHEN** a session starts in Claude Code, Codex or ZCode
- **THEN** the map behaves the same
