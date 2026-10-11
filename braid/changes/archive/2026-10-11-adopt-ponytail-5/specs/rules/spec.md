## ADDED Requirements

### Requirement: Ponytail's rules plus the strands

The always-on rules SHALL be ponytail's current rules at the pinned release, renamed for braid, with braid's precedence sentence (YAGNI > KISS > DRY), KISS block, DRY block and "done means verified" block added.

#### Scenario: Session starts

- **WHEN** a session starts with braid on at any level
- **THEN** the injected rules include ponytail's ladder, rule bullets and "never cut" list, and braid's precedence sentence, KISS, DRY and "done means verified" blocks
- **AND** they include only the active level's row of the levels table

#### Scenario: Ponytail releases

- **WHEN** ponytail changes text braid did not edit
- **THEN** the next sync takes that text unchanged

### Requirement: Always-on cost near ponytail's

The worst-case always-on context (session-start text plus the descriptions of skills that load on their own) SHALL stay within ~2.5k tokens and within ~300 tokens of ponytail's worst case at the pinned release.

#### Scenario: Worst case

- **WHEN** every pointer is present, every list is full and the generated map is at its cap
- **THEN** the measured total is at most 2.5k tokens

#### Scenario: Compared with ponytail

- **WHEN** braid's worst case is set against ponytail's (its core, its map at the cap, its auto-loading descriptions) at the pin
- **THEN** braid's is at most ~300 tokens larger, and the repo check fails otherwise

#### Scenario: Long non-ASCII names

- **WHEN** active changes or routes have long names in multi-byte characters
- **THEN** each name in the project state is clipped by bytes, so the lines cost no more than ASCII ones

### Requirement: Closing line

Every reply that changes or proposes code SHALL end with one or two lines naming what was skipped or not checked and any risk the user must know.

#### Scenario: Something skipped

- **WHEN** the agent leaves out a feature the request could have implied
- **THEN** the reply ends by naming it in one line

### Requirement: Corner-cut marker

The agent SHALL mark a deliberate shortcut with a known limit as `shortcut(<strand>): <ceiling>, <upgrade path>`, strand being yagni, kiss or dry.

#### Scenario: Global lock

- **WHEN** the agent uses one global lock where per-account locks would scale
- **THEN** the code carries `shortcut(yagni): global lock, per-account locks if throughput matters`
