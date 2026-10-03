# braid

Clean-code harness for AI coding agents. Three strands: **YAGNI > KISS > DRY**.

A plugin for **Claude Code**, **Codex** and **ZCode**: an always-on core that keeps generated code minimal, plus a workflow for grilling plans, writing specs, mapping repos, handing off and reviewing.

> Status: under construction. See [PLAN.md](PLAN.md).

## Install

Requires Node ≥ 18 for the always-on hook. Without Node, braid still works through its skills, with weaker always-on behavior.

- **Claude Code:** `/plugin marketplace add ZacharyArthur/braid`, then `/plugin install braid@braid`
- **Codex:** TODO
- **ZCode:** TODO

## Conflicts

Don't run braid alongside [ponytail](https://github.com/DietrichGebert/ponytail): braid's core is derived from it and both inject near-identical rules.

## Credits

braid stands on these projects. Vendored files keep their upstream `LICENSE`; see [UPSTREAM.md](UPSTREAM.md) for pinned sources.

**Vendored:** [ponytail](https://github.com/DietrichGebert/ponytail) (core, derived), [mattpocock/skills](https://github.com/mattpocock/skills), [i-have-adhd](https://github.com/ayghri/i-have-adhd), [humanizer](https://github.com/blader/humanizer), [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill), [superpowers](https://github.com/obra/superpowers).

**Derived or inspired by:** [OpenSpec](https://github.com/Fission-AI/openspec) (spec format), mattpocock's wayfinder (wayfind), [graphify](https://github.com/Graphify-Labs/graphify) (map), [impeccable](https://github.com/pbakaus/impeccable), [taste-skill](https://github.com/Leonxlnx/taste-skill) and [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (design), superpowers (verification rule).

**Companions worth installing when you need the full thing:** impeccable, ui-ux-pro-max, taste-skill, [diagram-design](https://github.com/cathrynlavery/diagram-design), [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering), OpenSpec, graphify.

## License

MIT
