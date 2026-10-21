## ADDED Requirements

### Requirement: Retro reads every harness's sessions for the project

`/braid:retro` SHALL run only when the user invokes it, and SHALL read the Claude Code, Codex and ZCode session stores present on the machine for the current project, newest first across stores, within a window of the 30 most recent sessions and 30 days by default. Either bound SHALL accept any value the user passes, with no maximum.

#### Scenario: Two harnesses used on one project

- **WHEN** the project has Claude Code and Codex sessions in the window and the user runs `/braid:retro` from Claude Code
- **THEN** failures from both harnesses' sessions are counted together

#### Scenario: Window overridden

- **WHEN** the user runs `/braid:retro 50 60d`
- **THEN** up to the 50 most recent sessions within 60 days are read

#### Scenario: ZCode store on an older Node

- **WHEN** a ZCode store exists and the running Node has no built-in SQLite module
- **THEN** retro says ZCode needs Node 22.13 or later and reads the other stores

#### Scenario: Store absent

- **WHEN** a harness has no session store on the machine
- **THEN** retro skips it without an error

#### Scenario: ZCode store unreadable

- **WHEN** the ZCode store is locked, corrupt or has an unexpected schema
- **THEN** retro says it skipped ZCode and why, and still reports the other harnesses

### Requirement: Only recurring failures become rules

Retro SHALL propose a rule only for a failure signature seen in at least 2 sessions, and SHALL leave out failures the work itself expected and failures the target file already covers.

#### Scenario: One-off failure

- **WHEN** a signature appears in one session only
- **THEN** no rule is proposed for it

#### Scenario: Expected test failure

- **WHEN** a recurring failure is a test run failing on the code being edited
- **THEN** no rule is proposed for it

#### Scenario: Nothing recurring

- **WHEN** no signature recurs in the window
- **THEN** retro says so and writes nothing

### Requirement: Transcript content stays out of the run

The transcript pass SHALL report only signatures, counts, session dates and one error snippet of at most 200 characters per signature, and SHALL include no user prompt or model text from the transcripts. Retro SHALL write nothing to disk, except the `-wal` and `-shm` files SQLite itself may create beside a WAL-mode ZCode store it opens.

#### Scenario: WAL-mode ZCode store

- **WHEN** retro reads a WAL-mode ZCode store whose `-wal` and `-shm` files are absent
- **THEN** those two files may appear beside it, and nothing else is written

#### Scenario: Secret in a prompt

- **WHEN** a session's prompt contains a token
- **THEN** the token does not appear in retro's output

### Requirement: Rules land in AGENTS.md on a yes

Retro SHALL show the proposed rules as one diff of the project's AGENTS.md with numbered rules, harness-specific ones tagged with the harness name, and SHALL write only the rules the user accepts. It SHALL never write to a harness's memory.

#### Scenario: Some rules dropped

- **WHEN** the user answers "drop 2, 5"
- **THEN** every other proposed rule is written and rules 2 and 5 are not

#### Scenario: Cancelled

- **WHEN** the user cancels
- **THEN** no file changes

### Requirement: Cross-project retro

`/braid:retro all` SHALL read sessions from every project and SHALL propose each rule for the user-level instructions file of each harness it applies to, in the same single diff.

#### Scenario: Untagged rule

- **WHEN** a rule applies to every harness and Claude Code and Codex are installed
- **THEN** the diff adds it to both harnesses' user-level files

### Requirement: Insights reuse is opt-in

`/braid:retro insights` SHALL, in Claude Code only, also read the existing `/insights` report and pass its findings through the same filter and diff. This opt-in path prints the report's own model-written text: each friction detail cut to 200 characters, and the suggested rules as written. With no report, or one older than the window, retro SHALL tell the user to run `/insights` first and continue with the transcript pass.

#### Scenario: No report

- **WHEN** the user runs `/braid:retro insights` and no `/insights` report exists
- **THEN** retro says to run `/insights` first and still proposes rules from the transcripts

#### Scenario: Other harness

- **WHEN** the user runs `$retro insights` in Codex
- **THEN** retro says the option is Claude Code only and runs the transcript pass

### Requirement: Router follows the findings

Retro SHALL end with the vendor tools its findings call for, plus one line naming the harness's cost and cross-project tools (or that none ship). It SHALL call a vendor skill only after a yes, SHALL name a built-in command for the user to run, SHALL say in one line when a tool isn't installed, and SHALL compute no token or cost figures itself.

#### Scenario: Recurring permission denials in Claude Code

- **WHEN** permission denials recur and `fewer-permission-prompts` is installed
- **THEN** retro offers to run it and runs it only on a yes

#### Scenario: Built-in command

- **WHEN** the standing line names `/insights`
- **THEN** retro tells the user to run it rather than running it

#### Scenario: ZCode

- **WHEN** retro runs in ZCode
- **THEN** the standing line says ZCode ships no usage or cost tool
