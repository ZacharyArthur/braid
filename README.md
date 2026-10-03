# braid

Clean-code harness for AI coding agents. Three strands: **YAGNI > KISS > DRY**.

A plugin for **Claude Code**, **Codex** and **ZCode**: an always-on core that keeps generated code minimal, plus a workflow for grilling plans, writing specs, mapping repos, handing off and reviewing.

> Status: under construction. Decisions: [braid/routes/v1.md](braid/routes/v1.md) and [braid/adr/](braid/adr/). Remaining work: [braid/changes/ship-v1/](braid/changes/ship-v1/tasks.md).

## Install

Requires Node ≥ 18 for the always-on hook. Without Node, braid still works through its skills, with weaker always-on behavior.

**Claude Code**

```bash
claude plugin marketplace add ZacharyArthur/braid
claude plugin install braid@braid
```

(or `/plugin marketplace add ZacharyArthur/braid` and `/plugin install braid@braid` inside a session)

**Codex**

```bash
codex plugin marketplace add ZacharyArthur/braid
codex plugin add braid@braid
```

Then run `codex`, open `/hooks`, review and trust braid's hooks, and start a new thread.

**ZCode:** add `ZacharyArthur/braid` as a GitHub plugin marketplace source and enable braid. ZCode has no "user-invoked only" flag, so every enabled skill's description costs context. Switch off the ones you don't use in Settings → Skills; good candidates are `humanizer`, `security-audit`, `systematic-debugging`, `design`, `adhd`, `grill-me` and `grill-with-docs`.

## What's in it

**Always on:** the core rules (YAGNI > KISS > DRY), injected each session and after compaction, plus one-line pointers to the active change, route, repo map and handoff. About 1.5k tokens. Level: `/braid:braid lite|full|ultra`; off: "stop braid".

| Skill | What it does |
|---|---|
| `grilling` | Interview you about a plan, a round of questions at a time, until it's settled. Aliases: `grill-me`, `grill-with-docs` (also writes ADRs and glossary) |
| `wayfind` | A route of decisions for an effort too big for one session (`braid/routes/`) |
| `spec` | `propose` a change from the conversation, `apply` its tasks, `archive` it into the specs, or `discover` specs for an existing codebase (`braid/specs/`, `braid/changes/`) |
| `map` | A short repo map in `braid/map.md`, read instead of re-exploring |
| `domain-modeling` | Glossary and ADRs in `braid/` |
| `handoff` | `braid/HANDOFF.md` for whoever picks this up next |
| `review` / `audit` | Over-engineering review of a diff / the whole repo |
| `debt` | Ledger of every `braid(<strand>):` corner cut |
| `xreview` | A review prompt for a different model; adversarial or `--open` |
| `design` | Native-first UI without the generic AI look |
| `systematic-debugging` | Root cause before any fix |
| `security-audit` | Multi-phase security audit with verified findings |
| `humanizer` | Make AI-written prose read like you |
| `adhd` | Action-first answers; stays on until "stop adhd mode" |

Only `braid`, `grilling`, `domain-modeling` and `map` load on their own; the rest wait for you to call them.

## Conflicts

Don't run braid alongside [ponytail](https://github.com/DietrichGebert/ponytail): braid's core is derived from it and both inject near-identical rules.

## Credits

braid stands on these projects. Vendored files keep their upstream `LICENSE`; see [UPSTREAM.md](UPSTREAM.md) for pinned sources.

**Vendored:** [ponytail](https://github.com/DietrichGebert/ponytail) (core, derived), [mattpocock/skills](https://github.com/mattpocock/skills), [i-have-adhd](https://github.com/ayghri/i-have-adhd), [humanizer](https://github.com/blader/humanizer), [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill), [superpowers](https://github.com/obra/superpowers).

**Derived or inspired by:** [OpenSpec](https://github.com/Fission-AI/openspec) (spec format), mattpocock's wayfinder (wayfind), [graphify](https://github.com/Graphify-Labs/graphify) (map), [impeccable](https://github.com/pbakaus/impeccable), [taste-skill](https://github.com/Leonxlnx/taste-skill) and [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (design), superpowers (verification rule).

**Companions worth installing when you need the full thing:** impeccable, ui-ux-pro-max, taste-skill, [diagram-design](https://github.com/cathrynlavery/diagram-design), [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering), OpenSpec, graphify.

## License

MIT
