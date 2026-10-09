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
A deliberate simplification with a known ceiling, marked `braid(<strand>): <ceiling>, <upgrade path>`.
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

**Mod**:
A Claude Code-only plugin of TypeScript hooks in `mods/<name>/`, listed in braid's marketplace and installed on its own.
_Avoid_: extension, add-on

**Vendored / derived / clean-room**:
How a skill relates to its upstream: verbatim copy with surgical edits, substantial rewrite, or written from scratch with credit only.
