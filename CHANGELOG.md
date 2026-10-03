# Changelog

All notable changes to braid. Versions follow semver: major = a skill renamed or removed, or the `braid/` layout changed; minor = a new skill or verb; patch = wording and upstream syncs.

## [1.0.0] - unreleased

First release.

- Always-on core: ponytail's ladder extended to YAGNI > KISS > DRY, rule of three, `braid(<strand>):` corner-cut markers, "done means verified"; levels lite/full/ultra; optional drift reminder.
- One Node hook for Claude Code, Codex and ZCode: injects the core and project pointers, remembers level/drift/adhd per session across compaction, covers subagents.
- Workflow: `spec` (propose, apply, archive, discover), `wayfind`, `map`, `standards`, `handoff`, `xreview`, `review`, `audit`, `debt`, `design`.
- A/B benchmark (`bench/ab.cjs`) against ponytail and no plugin; v1 baseline in `bench/results/2026-10-03-sonnet-baseline/`.
- Vendored: `grilling`, `grill-me`, `grill-with-docs`, `domain-modeling` (mattpocock/skills), `adhd` (i-have-adhd), `humanizer`, `security-audit` (Cloudflare), `systematic-debugging` (superpowers).
