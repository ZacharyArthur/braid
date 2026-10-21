## MODIFIED Requirements

### Requirement: Debt ledger

`/braid:debt` SHALL list every corner-cut marker in all three forms, grouped by strand (unstranded markers in their own group), and tag markers with no upgrade trigger as `no-trigger`. A user-named marker word replaces the default markers. It writes `braid/DEBT.md` only when asked.

#### Scenario: Mixed markers

- **WHEN** the repo has one `shortcut(dry):`, one `braid(yagni):` and one `shortcut:` marker
- **THEN** the ledger lists three rows in dry, yagni and unstranded groups

#### Scenario: Keyboard shortcut prose

- **WHEN** a comment says "shortcut: Ctrl+S saves"
- **THEN** it is not a ledger row

#### Scenario: Ignored folders

- **WHEN** a marker sits in a folder the project's `.gitignore` ignores (dependencies, a virtualenv, build output)
- **THEN** it is not a ledger row
