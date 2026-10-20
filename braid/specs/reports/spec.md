# Reports

## Purpose

The review, audit and debt reports: what they check and how their findings read.

## Requirements

### Requirement: Review is a quality review

`/braid:review` SHALL report, in order of importance, bugs, risks, scale problems, missing tests, slowness and lean cuts in the named change. It defaults to uncommitted changes plus the branch against its base.

#### Scenario: Bug in the diff

- **WHEN** the change bills orders by the server's UTC date in a shop with a local time zone
- **THEN** the review lists it under must fix, with what the code is, the problem, the fix and the cost of skipping it

#### Scenario: Nothing found

- **WHEN** no finding has a concrete failing case
- **THEN** the report says what the change does, that it looks good to ship, and what was checked

### Requirement: Lean findings use the strands

Lean findings SHALL be one line each, tagged delete, yagni, stdlib, native, kiss, split, dry or shrink. A dry finding is never raised for two copies.

#### Scenario: Re-implemented helper

- **WHEN** the change re-implements a helper that exists elsewhere in the repo
- **THEN** one numbered line tagged `dry:` names the existing helper

#### Scenario: Two copies

- **WHEN** the same logic appears twice
- **THEN** no dry finding is raised

### Requirement: Findings are checkable

Every review and audit finding SHALL name a concrete case, and be numbered across the report so the user can ask for specific fixes. The report ends with a verdict, the possible lean savings when there are lean findings, and what was not checked.

#### Scenario: Fix by number

- **WHEN** the report lists five findings
- **THEN** they are numbered 1-5 across all groups

### Requirement: Audit covers the repo

`/braid:audit` SHALL apply the review's checks to the whole repo or a named path, list at most 20 findings, say how many smaller ones it left out, and name the parts it did not read.

#### Scenario: Large repo

- **WHEN** the repo is too large to read in full
- **THEN** the audit goes deepest where a mistake costs most and lists the unread parts under not checked

### Requirement: Corner cuts are decisions

Review, audit and `xreview` SHALL NOT flag a corner cut marked `shortcut(<strand>):`, `shortcut:` or `braid(<strand>):` unless its named limit has been reached.

#### Scenario: Old marker

- **WHEN** code carries `braid(kiss): <ceiling>, <upgrade>` and the ceiling is not reached
- **THEN** no finding is raised for it

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
