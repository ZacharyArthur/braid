# Session

## Purpose

What the session hook adds to the context at session start besides the rules.

## Requirements

### Requirement: Generated codebase map

At session start, inside a git repo with no `braid/map.md`, the session hook SHALL add a map of the top-level functions, classes and exports of source files, one line per folder, within a fixed character cap, skipping tests, generated and vendored files, and listing shared code first.

#### Scenario: Repo without a map

- **WHEN** a session starts in a repo with source files and no `braid/map.md`
- **THEN** the injected context includes the generated map, at most the cap in length

#### Scenario: Not a git repo

- **WHEN** a session starts in a folder that is not inside a git repo
- **THEN** no generated map is added

#### Scenario: Gitignored files

- **WHEN** the repo ignores a folder in `.gitignore`
- **THEN** untracked files in that folder never appear in the map; files git already tracks still do, as git itself lists them

#### Scenario: Links and unsafe names

- **WHEN** a source path is a symlink, sits under a linked folder (symlink or junction), or contains a character that is not a visible letter, mark or digit in any script, nor one of `._-@+$()[]/`
- **THEN** it is not read and never appears in the map

#### Scenario: Switching back on

- **WHEN** braid is switched back on after "stop braid"
- **THEN** the map is re-sent with the core and pointers

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
