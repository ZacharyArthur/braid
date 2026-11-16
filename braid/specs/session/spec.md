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

- **WHEN** a session starts in Claude Code, Codex, ZCode, Pi or Vibe
- **THEN** the map behaves the same

### Requirement: Pi harness

Installed in Pi as a package, braid SHALL inject the same core, project state and map as in the other harnesses, track the same per-session level, and keep Pi working when anything in braid fails.

#### Scenario: Session starts in Pi

- **WHEN** a Pi session starts, is resumed, forked or made new, with braid on
- **THEN** each run's system prompt carries the core for the session's level, the project pointers and, under the same conditions as elsewhere, the generated map

#### Scenario: Level switch in Pi

- **WHEN** the user sends `/skill:braid lite`, `/skill:braid off` or `stop braid`
- **THEN** the level changes for that session as `/braid:braid lite` does in Claude Code, and the next run carries the matching core, or none when off

#### Scenario: Command sent while a run streams in Pi

- **WHEN** the user steers or queues `stop braid` (or any braid command) while a run is streaming
- **THEN** the state changes at once, the steered prompt costs no extra model turn, and the next run carries the matching section and the command's confirmation

#### Scenario: ADHD mode in Pi

- **WHEN** the user sends `/skill:adhd`, then later "normal mode"
- **THEN** the next run's section carries ADHD mode, and after "normal mode" it no longer does, compaction or not

#### Scenario: Level kept in Pi

- **WHEN** a Pi session set to lite is resumed, even after a reboot
- **THEN** it resumes at lite, read from `braid/sessions/` in Pi's agent folder (`$PI_CODING_AGENT_DIR` with a leading `~` expanded, or `~/.pi/agent`), never from another harness's folder named in an inherited variable

#### Scenario: After compaction in Pi

- **WHEN** Pi compacts the conversation
- **THEN** the next run still carries the core

#### Scenario: Subagents in Pi

- **WHEN** a Pi session runs subagents through another extension
- **THEN** they get no core from braid, since Pi has no subagent event (as in ZCode)

#### Scenario: Broken environment in Pi

- **WHEN** `node` is missing, the hook times out, or its output can't be read or isn't text
- **THEN** the run starts without braid's section and Pi shows no error from braid

### Requirement: Vibe harness

Installed in Mistral Vibe as a native plugin, braid SHALL inject the same core, project state and map as in the other harnesses, through Vibe's own hooks. It SHALL track the same per-session level, and SHALL keep Vibe working when anything in braid fails.

#### Scenario: Session starts in Vibe

- **WHEN** a Vibe session starts, is resumed, cleared or forked, with braid on
- **THEN** the session's next user message carries, for the model only, the core for the session's level, the project pointers and, under the same conditions as elsewhere, the generated map

#### Scenario: Level switch in Vibe

- **WHEN** the user sends `/braid:braid lite`, `/braid:braid off` or `stop braid`
- **THEN** the level changes for that session as in Claude Code, and the confirmation line reaches the model with that message

#### Scenario: Level kept in Vibe

- **WHEN** a Vibe session set to lite is resumed
- **THEN** it resumes at lite, read from the session's plugin data folder, never from another harness's folder named in an inherited variable

#### Scenario: Installed or updated in Vibe

- **WHEN** braid is installed or updated while Vibe sessions exist
- **THEN** a new session runs the new braid, and a session opened or resumed from before keeps the copy it pinned

#### Scenario: Command as the first message after opening

- **WHEN** the first message after Vibe opens or resumes a session that was on is a braid command that changes its level
- **THEN** that message also carries the core at the level before the command, after the command's confirmation, and the conversation keeps that older core until compaction; every later message's braid context follows the new level

#### Scenario: Command queued while a turn runs in Vibe

- **WHEN** the user queues a braid command behind another message while a turn runs
- **THEN** the command is not seen, since Vibe hands the hook only the merged turn's first message, and the level stays; sent on its own once the turn ends, it works

#### Scenario: User-only skills in Vibe

- **WHEN** a Vibe session lists its skills for the model
- **THEN** only braid's model-invoked skills are listed, and every braid skill still runs as `/braid:<skill>`

#### Scenario: After compaction in Vibe

- **WHEN** Vibe compacts the conversation
- **THEN** the core is not re-injected, as in ZCode; with drift on, each prompt still restates the level

#### Scenario: Subagents in Vibe

- **WHEN** a Vibe session spawns a subagent
- **THEN** it gets no core from braid, since Vibe fires no session event for subagents (as in ZCode and Pi), and braid's prompt hook doesn't run for its turns

#### Scenario: Fork or rewind in Vibe

- **WHEN** the user runs `/branch` or `/rewind`
- **THEN** the new session starts at the default level

#### Scenario: Broken environment in Vibe

- **WHEN** `node` is missing or the hook times out
- **THEN** Vibe shows its own hook warning and the session goes on without braid's context
