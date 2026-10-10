# Changelog

All notable changes to braid. Versions follow semver: major = a skill renamed or removed, or the `braid/` layout changed; minor = a new skill or verb; patch = wording and upstream syncs.

## [Unreleased]

- `braid-context` 0.1.1: the band follows each main-thread response, so context and spend move during a long turn instead of at its end.

## [1.2.0] - 2026-10-08

- Mods: optional Claude Code-only plugins in braid's marketplace, each installed and switched on or off on its own (ADR 0011). Codex never sees them.
- New mod `braid-context` 0.1.0: a band above the prompt with context used, a prompt cache countdown with its TTL (from the transcript; red under 1 min, and on a 1h cache yellow under 5 first; "live" while a turn runs), the last turn's cache hit rate, session spend (percent of the 5-hour window on a subscription, its reset time once used up, dollars on API or Bedrock; context and the window turn yellow from 75%, red from 90%; the hit rate yellow under 80%, red under 50%), braid's level and active change, all on one line, with block-character bars for context, cache time left and the 5-hour window from 120 columns up.
- README: the status line says braid is released and points to this changelog and the ADRs.

## [1.1.0] - 2026-10-05

- New `skill`: write a skill that stays small and triggers right (interview, minimal draft, cross-harness frontmatter checks, a fresh-subagent test run); hands off to Anthropic's `skill-creator` for evals.
- New `help`: what each skill does and how to invoke it in Claude Code, Codex and ZCode; `help <skill>` for one in depth. `check.cjs` fails if a skill is missing from it.
- `scripts/upstream.cjs` reports how far each pinned upstream has moved and what changed under its path; UPSTREAM.md documents the sync workflow per kind, including clean-room sources (their SHA is the commit last reviewed). New `CONTRIBUTING.md` for adding a skill.
- Ideas from ponytail (rewritten, per ADR 0008): `review` and `audit` number their findings so you can say "fix 2 and 5"; `review` greps the whole tree, tests and string references included, before a `delete:` finding; `debt`'s grep skips `.git`, `node_modules`, `dist` and `build`.
- Hook: a mid-session level switch confirms with that level's definition, not just its name. Bare `/braid:braid` after "stop braid" switches back on at full instead of reporting "ACTIVE — level: off"; switching back on, bare or with a level, re-sends the core and project pointers.
- Repo standards: root `AGENTS.md` (`CLAUDE.md` imports it); markdownlint-cli2 and Biome via `npx`, a lint job in CI.

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
