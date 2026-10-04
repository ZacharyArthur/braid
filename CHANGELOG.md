# Changelog

All notable changes to braid. Versions follow semver: major = a skill renamed or removed, or the `braid/` layout changed; minor = a new skill or verb; patch = wording and upstream syncs.

## [1.0.1] - 2026-10-04

- `wayfind` description no longer contains `<effort>`, which claude.ai's plugin sync rejects as an XML tag; `check.cjs` now catches tag-like text in descriptions.

## [1.0.0] - 2026-10-04

First release.

- Always-on core: ponytail's ladder extended to YAGNI > KISS > DRY, rule of three, `braid(<strand>):` corner-cut markers, "done means verified"; levels lite/full/ultra; optional drift reminder.
- One Node hook for Claude Code, Codex and ZCode: injects the core and project pointers, remembers level/drift/adhd per session and re-injects after compaction, covers subagents in Claude Code and Codex. Skill-picker commands (`[$braid](<path>) lite`, as Codex and ZCode send them) are understood.
- Workflow: `spec` (propose, apply, archive, discover), `wayfind`, `map`, `standards`, `handoff`, `xreview`, `review`, `audit`, `debt`, `design`.
- Spec workflow follows the project's framework: first-class OpenSpec support (`openspec/` specs and changes, `config.yaml`, CLI when installed, session-hook pointers); other frameworks are asked about once and followed.
- A/B benchmark (`bench/ab.cjs`) against ponytail and no plugin, on Claude Code and Codex; v1 baseline in `bench/results/2026-10-03-sonnet-baseline/`.
- Known gaps in ZCode: no SubagentStart event; SessionStart never fires on compact, so the core is not re-injected after `/compact` (`drift on` partly covers it); no user-only flag and no per-skill switch for plugin skills, so user-only skills can auto-load.
- Vendored: `grilling`, `grill-me`, `grill-with-docs`, `domain-modeling` (mattpocock/skills), `adhd` (i-have-adhd), `humanizer`, `security-audit` (Cloudflare), `systematic-debugging` (superpowers).
