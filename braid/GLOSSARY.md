# braid

A clean-code harness plugin for AI coding agents. These terms describe its parts and the artifacts it leaves in projects.

## Language

**Strand**:
One of the three clean-code pillars braid enforces, in precedence order: YAGNI, KISS, DRY.
_Avoid_: principle (too general)

**Core**:
The always-on rules in `skills/braid/core.md`, injected by the session hook.
_Avoid_: system prompt, persona

**Level**:
How hard the core pushes: lite, full (default) or ultra. Per session.
_Avoid_: mode, intensity

**Corner cut**:
A deliberate simplification with a known ceiling, marked `shortcut(<strand>): <ceiling>, <upgrade path>`. Older forms still read: `braid(<strand>):` and plain `shortcut:`.
_Avoid_: hack, TODO

**Pointer**:
A one-line note the session hook adds about project state (active change, route, map, handoff).

**Change**:
A proposed modification in `braid/changes/<name>/`; active once it has tasks, queued before.
_Avoid_: ticket, PR

**Spec**:
The intended behavior of one domain, `braid/specs/<domain>/spec.md`.

**Delta**:
A change's ADDED/MODIFIED/REMOVED requirements against a spec.

**Route**:
The decisions for an effort too big for one session, `braid/routes/<effort>.md`.
_Avoid_: map (that's the repo map), roadmap

**Frontier**:
The open decisions whose prerequisites are already decided.

**Tier**:
Which model a delegated task runs on: fast (locates), mid (reviews, researches) or main (plans, edits, synthesizes). Named per harness in a project's AGENTS.md.
_Avoid_: size, class

**Explorer**:
The read-only agent the fast tier runs: `Explore` in Claude Code, `explorer` in Codex, `braid-explore` in ZCode, none in Pi (no subagents).
_Avoid_: scout, searcher

**Failure signature**:
One kind of tool failure, the same in every harness: the tool (or `shell` and the program it ran) plus the error line with numbers, paths and quoted strings collapsed. `retro` proposes a rule only for one seen in 2 or more sessions.
_Avoid_: error type, failure pattern

**Router**:
The closing part of `retro` that names the harness's own tool for each kind of finding, instead of braid rebuilding it.
_Avoid_: orchestrator

**Mod**:
A Claude Code-only plugin of TypeScript hooks in `mods/<name>/`, listed in braid's marketplace and installed on its own.
_Avoid_: extension, add-on

**Vendored / based / derived / clean-room**:
How a skill relates to its upstream: verbatim copy with surgical edits; upstream's text as the base with braid's renames and added blocks, synced by three-way merge; substantial rewrite; or written from scratch with credit only.
