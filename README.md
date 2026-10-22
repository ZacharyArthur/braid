# braid

Clean-code harness for AI coding agents. Three strands: **YAGNI > KISS > DRY**.

A plugin for **Claude Code**, **Codex**, **ZCode** and **Pi**: an always-on core that keeps generated code minimal, plus a workflow for grilling plans, writing specs, mapping repos, handing off and reviewing.

> Status: released and in use since v1.0.0. What each release changed: [CHANGELOG.md](CHANGELOG.md). Decisions: [braid/adr/](braid/adr/).

## Install

Requires Node ≥ 18 on the PATH for the always-on hook. Without it the skills still work, but the core rules only load when a skill is invoked, and each hook call shows a harmless "node not found" error (the exact wording depends on your shell) until Node is installed.

**Claude Code**

```bash
claude plugin marketplace add ZacharyArthur/braid
claude plugin install braid@braid
```

(or `/plugin marketplace add ZacharyArthur/braid` and `/plugin install braid@braid` inside a session)

**Claude app** (claude.ai and the Desktop app's chat): add `https://github.com/ZacharyArthur/braid` as a marketplace in the app's plugin settings and install braid. That copy belongs to your account, separate from Claude Code's. Claude Code uses it only when braid isn't installed there; when both are, Claude Code's own copy wins, so update both or keep just one.

**Codex**

```bash
codex plugin marketplace add ZacharyArthur/braid
codex plugin add braid@braid
```

Then run `codex`, open `/hooks`, review and trust braid's hooks, and start a new thread.

**ZCode:** add `ZacharyArthur/braid` as a GitHub plugin marketplace source and enable braid. Two gaps to know about. ZCode has no "user-invoked only" flag, and its Settings can't switch off a plugin's skills one at a time, so every braid skill's description costs context and the user-only ones, such as `humanizer`, can load when a prompt matches them. And ZCode never fires SessionStart on compact, so after a `/compact` the core rules are not re-injected; only the summary's paraphrase remains. `/braid:braid drift on` partly makes up for it: the drift line restates the mode on every prompt.

**Pi**

```bash
pi install git:github.com/ZacharyArthur/braid
```

Then start a new session. Skills are `/skill:<name>`, so the level is `/skill:braid lite`. braid's core is part of the system prompt on every run, so it survives compaction. It keeps each session's level in `braid/` inside Pi's agent folder (`~/.pi/agent`, or `$PI_CODING_AGENT_DIR`). Two differences: Pi has no subagent event, so subagents don't get the core (as in ZCode), and without Node on the PATH Pi starts without the core and shows no error.

**Updating:** in Claude Code, run `claude plugin marketplace update braid`, then `claude plugin update braid@braid` (in the Desktop app: sync the marketplace, then update the plugin), and start a new session. It finds an update only once a release raises the version. In the Claude app, sync the braid marketplace, then update the plugin. In Codex, `codex plugin marketplace upgrade braid` (or syncing the marketplace in the ChatGPT app) updates the plugin too. In ZCode, sync the marketplace, then uninstall and reinstall braid; updating alone keeps the old cached copy. In Pi, run `pi update git:github.com/ZacharyArthur/braid` (plain `pi update` updates only Pi itself), then start a new session.

## What's in it

**Always on:** the core rules (YAGNI > KISS > DRY), injected each session and after compaction, plus one-line pointers to the active change, route, repo map and handoff, and, in a git repo with no `braid/map.md`, a generated map of what the code already defines (`BRAID_MAP=0` turns it off). About 1.5k tokens, 2k with the map. Level: `/braid:braid lite|full|ultra`; off: "stop braid".

| Skill | What it does |
|---|---|
| `grilling` | Interview you about a plan, a round of questions at a time, until it's settled. Aliases: `grill-me`, `grill-with-docs` (also writes ADRs and glossary) |
| `wayfind` | A route of decisions for an effort too big for one session (`braid/routes/`) |
| `spec` | `propose` a change from the conversation, `apply` its tasks, `archive` it into the specs, or `discover` specs for an existing codebase (`braid/specs/`, `braid/changes/`; works on `openspec/` in OpenSpec projects and defers to other spec frameworks) |
| `map` | A short repo map in `braid/map.md`, read instead of re-exploring |
| `standards` | The project's `AGENTS.md`: priorities, stack, exact lint/type/test/dead-code/validation commands, quality gate, conventions, spec workflow, git workflow, plus optional invariants, dev environment, security and subagent delegation, with fast-model explorer agents on a yes (and a `CLAUDE.md` that imports it) |
| `domain-modeling` | Glossary and ADRs in `braid/` |
| `handoff` | `braid/HANDOFF.md` for whoever picks this up next |
| `review` / `audit` | Quality review of a change / the whole repo: bugs, risks, load, missing tests, speed, and what to cut |
| `debt` | Ledger of every `shortcut(<strand>):` corner cut |
| `xreview` | A review prompt for a different model; adversarial or `--open` |
| `design` | Native-first UI without the generic AI look |
| `systematic-debugging` | Root cause before any fix |
| `security-audit` | Multi-phase security audit with verified findings |
| `humanizer` | Make AI-written prose read like you |
| `adhd` | Action-first answers; stays on until "stop adhd mode" |
| `skill` | Write a new skill that stays small and triggers right; hands off to Anthropic's `skill-creator` for evals |
| `retro` | Failures agents repeat across sessions, read from Claude Code, Codex and ZCode transcripts, turned into AGENTS.md rules after a yes; then the harness's own usage, cost and config tools |
| `help` | What each skill does and how to call it in your harness; `help <skill>` for one in depth |

Only `braid`, `grilling`, `domain-modeling` and `map` load on their own; the rest wait for you to call them. Adding a skill or syncing upstream: [CONTRIBUTING.md](CONTRIBUTING.md).

## Mods

Optional add-ons for **Claude Code only** (terminal and Desktop app, v2.1.287+), each a separate plugin in the same marketplace. Codex never lists them; ZCode lists them but can't run them. Install one with `claude plugin install <mod>@braid` (or `/plugin install <mod>@braid`), and switch it off or on in `/plugin`.

| Mod | What it shows |
|---|---|
| `braid-context` | A line above the prompt: context used, the prompt cache's countdown to going cold (red under 1 min; on a 1h cache, yellow under 5 first; "live" while a turn runs), the last turn's cache hit rate, what the session is spending (`5h 23%` of the 5-hour window on a subscription, or the time it resets once used up; `$1.23` on API or Bedrock), braid's level, the git branch checked out, and the active change. Context, cache time left and the 5-hour window also show as block-character bars on a wide enough band, e.g. `ctx ██░░░░░░ 312k/1M 31%`. Context and the 5-hour window turn yellow from 75% and red from 90%; the hit rate turns yellow under 80% and red under 50%. Enough to stand in for a status line, including in the Desktop app, which has none |

## Benchmarks

Same tasks, same model, three arms: braid, [ponytail](https://github.com/DietrichGebert/ponytail), no plugin. Every task with a check (5 of 7 on Claude, 7 of 9 on Codex) passed it in every arm on both agents. Totals across all runs:

| | braid | ponytail | none |
|---|--:|--:|--:|
| **Claude Code** (Sonnet, 21 runs/arm): code lines | **306** | 288 (+56 test) | 396 |
| ↳ third copy turned into one shared function | **3/3** | 0/3 | 0/3 |
| ↳ cost vs no plugin | +39% | +18% | - |
| **Codex** (gpt-6.1-sol, 27 runs/arm): code lines | **415** | 409 | 461 |
| ↳ third copy turned into one shared function | **3/3** | 1/3 | 0/3 |

Codex also writes test files under the "one runnable check" rule, counted separately (braid 395 test lines, ponytail 314, none 53). One known gap: when a prompt spells out an algorithm, Claude implements it inline instead of reusing the existing helper, whatever the rules or the repo map say; describe the outcome instead and every arm reuses. Details and how to rerun: [TESTING.md](TESTING.md), raw results in [bench/results/](bench/results/).

## Conflicts

Don't run braid alongside [ponytail](https://github.com/DietrichGebert/ponytail): braid's core is based on ponytail's text and both inject near-identical rules.

## Credits

braid stands on these projects. Vendored files keep their upstream `LICENSE`, notices for based and derived code are in [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES); see [UPSTREAM.md](UPSTREAM.md) for pinned sources.

**Based on:** [ponytail](https://github.com/DietrichGebert/ponytail) (core, review, audit, debt and the codebase map).

**Vendored:** [mattpocock/skills](https://github.com/mattpocock/skills), [i-have-adhd](https://github.com/ayghri/i-have-adhd), [humanizer](https://github.com/blader/humanizer), [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill), [superpowers](https://github.com/obra/superpowers).

**Derived or inspired by:** [OpenSpec](https://github.com/Fission-AI/openspec) (spec format), mattpocock's wayfinder (wayfind), [graphify](https://github.com/Graphify-Labs/graphify) (map), [impeccable](https://github.com/pbakaus/impeccable), [taste-skill](https://github.com/Leonxlnx/taste-skill) and [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (design), superpowers (verification rule), Anthropic's [skill-creator](https://github.com/anthropics/skills) and skill-authoring guide (skill).

**Companions worth installing when you need the full thing:** impeccable, ui-ux-pro-max, taste-skill, [diagram-design](https://github.com/cathrynlavery/diagram-design), [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering), OpenSpec, graphify.

## License

MIT
