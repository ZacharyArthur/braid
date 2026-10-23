## MODIFIED Requirements

### Requirement: Retro reads every harness's sessions for the project

`/braid:retro` SHALL run only when the user invokes it, and SHALL read the Claude Code, Codex, ZCode and Pi session stores present on the machine for the current project, newest first across stores, within a window of the 30 most recent sessions and 30 days by default. Either bound SHALL accept any value the user passes, with no maximum.

#### Scenario: Two harnesses used on one project

- **WHEN** the project has Claude Code and Codex sessions in the window and the user runs `/braid:retro` from Claude Code
- **THEN** failures from both harnesses' sessions are counted together

#### Scenario: Pi sessions

- **WHEN** the project has Pi sessions in the window, in Pi's default store or the folder Pi's session-folder variable names
- **THEN** their failed tool calls are counted with the other harnesses'

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

#### Scenario: Pi

- **WHEN** retro runs in Pi
- **THEN** the standing line names Pi's session stats command for the current session's tokens and cost
