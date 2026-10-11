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

### Requirement: Always-on cost at or below ponytail's

The worst-case always-on context SHALL stay within ~2.5k tokens and no larger than ponytail's own session-start output at the pinned release.

#### Scenario: Worst case

- **WHEN** every pointer is present, every list is full and the generated map is at its cap
- **THEN** the measured total is at most 2.5k tokens

#### Scenario: Compared with ponytail

- **WHEN** braid and ponytail at the pin start a session in the same repo
- **THEN** braid's injected context is no larger than ponytail's

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
