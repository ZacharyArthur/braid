# braid v1 plan

Interim record of the design grilling (2026-10-02). Folds into `braid/adr/` + `braid/routes/v1.md` at milestone 5.

**braid**: a skills/agent harness plugin for Claude Code (primary), Codex and ZCode. Ponytail-derived core extended from YAGNI to all three clean-code pillars, plus a grilling, spec, wayfinding and review workflow. Three strands, one braid.

## Principles

- Precedence when pillars conflict: **YAGNI > KISS > DRY**.
- DRY = reuse what exists; extract only on the third copy that changes for the same reason; duplication beats the wrong abstraction; one source of truth for *knowledge* (config, schemas, business rules) is mandatory.
- KISS = flat over nested, explicit over magic, one obvious way, readable cold.
- Verification (from superpowers): no "done/fixed/passing" claim without running the check this turn and quoting the result.
- Corner-cut marker: `braid(yagni|kiss|dry): <ceiling>, <upgrade path>`. Zero GitHub code-search hits, grep-safe.

## Packaging

- One plugin, one public repo `ZacharyArthur/braid` that is its own marketplace for all three harnesses.
- Shared `skills/<name>/SKILL.md`; thin manifests: `.claude-plugin/`, `.codex-plugin/` + `.agents/plugins/marketplace.json`, `.zcode-plugin/` (ZCode marketplace path TBD at milestone 7).
- Hooks: one `hooks/hooks.json` (Claude format) for all three: Claude Code and ZCode load it by default, Codex via its manifest. ZCode's `command` type takes the same shell string and expands `${CLAUDE_PLUGIN_ROOT}`; verify at milestone 7, split only if ZCode rejects it. One script: `hooks/braid.cjs session|prompt|subagent`.
- Hook scripts: `.cjs` (immune to a parent `"type": "module"`), stdlib only, no package.json. Requires Node ≥ 18; without Node the hook fails silently and the core skill's broad description is the fallback.
- MIT license. semver + git tags + hand-written CHANGELOG; v1.0.0 at launch; `braid/` layout is a stable public format from day one. major = renamed/removed skill or `braid/` layout change, minor = new skill/verb, patch = wording/upstream sync.

## Always-on budget (enforced by `scripts/check.cjs`, bytes÷4)

| Item | Cap |
|---|---|
| `core.md` (hook-injected) | ≤ ~1.5k tokens, can stretch |
| Pointer lines (active change/route, map staleness, handoff, adhd) | ≤ 5 lines, 0 when nothing applies |
| Model-invocable description | ≤ 300 chars |
| Total always-on | ~2–2.5k tokens |

- `skills/braid/core.md` (inside the skill so ZCode's folder import carries it) keeps everything load-bearing: ladder, rules, output pattern, root-cause bug fixes, one-check rule, **when-NOT-to-be-lazy in full**. Flavor text (intensity examples, hardware paragraph, rationale) moves to the `braid` skill body (≤ ~500 tokens, broad triggers incl. scripting/sysadmin/SRE/IaC).
- Modes lite/full/ultra kept via a slim mode tracker (UserPromptSubmit), state in the plugin data dir keyed by session. Anti-drift one-liner per prompt: ships **off**, toggle `/braid:braid drift on|off`. No statusline.
- Clean-room skill bodies capped at ~1.5–2k tokens; no reference subfolders in v1.
- ZCode has no user-only flag: user-invoked descriptions end "Only when the user explicitly invokes it."; README lists which to toggle off in ZCode.

## Skills (18)

| Skill | Source | Invocation |
|---|---|---|
| `braid` (core, modes, drift) | derived: ponytail | model |
| `grilling` | vendored: mattpocock (rounds version) | model |
| `domain-modeling` | vendored: mattpocock, paths → `braid/adr/`, `braid/GLOSSARY.md` | model |
| `map` | clean-room: graphify-inspired | model |
| `grill-me`, `grill-with-docs` | vendored aliases | user |
| `review`, `audit`, `debt` | derived: ponytail; flag YAGNI/KISS/DRY, rule of three | user |
| `spec` (propose/apply/archive/discover) | derived: OpenSpec conventions, CLI-free | user |
| `wayfind` | clean-room: wayfinder-inspired | user |
| `handoff` | clean-room (claude-handoff idea) | user |
| `xreview [--open] [diff\|<path>\|all]` | clean-room, research-backed | user |
| `design` | clean-room: impeccable, taste-skill, ui-ux-pro-max | user |
| `adhd` | vendored: i-have-adhd | user |
| `humanizer` | vendored: blader/humanizer | user |
| `security-audit` | vendored: cloudflare (whole folder) + `disable-model-invocation` | user |
| `systematic-debugging` | vendored: superpowers | user |

Dropped: ponytail-gain, ponytail-help, superpowers TDD/plans/worktrees/etc. (covered or native).
Deferred: `diagram` (Mermaid-in-md flavored, diagram-design-inspired), wayfind tracker sync (v1.1), automated A/B benchmark (v1.1), context-engineering skills (companion only).

## Project artifacts (`braid/` in target repos)

```
braid/
  specs/<domain>/spec.md          # intended behavior, source of truth
  changes/<name>/                 # proposal.md, design.md, tasks.md (checkboxes = state), delta specs (ADDED/MODIFIED/REMOVED)
  changes/archive/<date>-<name>/
  routes/<effort>.md              # wayfind: Destination / Decided / Open / Fog / Out of scope
  adr/                            # domain-modeling ADRs
  GLOSSARY.md
  map.md                          # repo map, ≤150 lines, one Mermaid module diagram, header = built-at SHA
  reviews/<date>-<scope>.md       # xreview prompts
  HANDOFF.md                      # 80–120 line snapshot, overwritten, header = date + SHA
```

## Skill behavior notes

- **SessionStart hook** (startup|resume|clear|compact): inject `core.md` + pointer lines: active change(s) with task progress, active route(s), `map.md` commits-behind, handoff commits-since, adhd if on. SubagentStart too where it exists (not ZCode).
- **spec**: `SKILL.md` = shared format + verb router (~600 tokens); one file per verb. `propose` synthesizes from conversation (no re-interview, like to-spec). `apply` implements under core rules and ticks `tasks.md`. `archive` merges deltas into `specs/`, moves the change, patches `map.md`. `discover` (brownfield): orient via map → pick 1–3 unspecced capabilities (business weight, churn, risk) → draft as-is behavior with file:line evidence → grill "intended, bug, or drifted?" → write intended spec; mismatches become proposal-only `changes/fix-<x>/`; never edits code; re-runnable via map-vs-specs coverage.
- **wayfind**: local markdown only in v1; each session settles Open decisions via grilling, significant ones become ADRs (linked, not copied); hands off to `spec propose` when Open + Fog are empty. v1.1: one-way mirror to GitHub (`gh`), GitLab (`glab`), Gitea (`tea`, asked once, recorded as `tracker:` line) via on-demand `tracker.md`.
- **handoff**: for a zero-context implementor: read-first order, goal, state, next 1–3 actions, run/verify commands, gotchas, open questions. Links, never copies; durable knowledge goes to spec/ADR/glossary/map first.
- **xreview**: writes a self-contained prompt for a different model or fresh session. Default adversarial ("break this"); `--open` neutral ("no significant issues" is valid). Two stages: find (evidence only, no fixes) → refute each against code, run tests where possible, label CONFIRMED/PLAUSIBLE → fixes only for survivors. Explicit don't-flag list (style, ADR-decided, speculative futures, out of scope). Ends with "what I could not verify". `--run` hands it to a cold subagent. Principles referenced from `core.md`, not copied.
- **map**: entry points, modules + one-line jobs + where things live, key flows, conventions/gotchas, one Mermaid diagram. Rebuilt or patched by `/braid:map` and by `spec archive`.
- Skills that other skills call (`grilling`, `domain-modeling`, `map`, `braid`) stay model-invocable.

## Upstream sync and credit

- Vendored files stay verbatim except surgical edits; heavily changed ones are marked derived (watch upstream for ideas, don't merge).
- `UPSTREAM.md`: one row per vendored/derived skill: repo, path, pinned SHA, license, kind (vendored/derived/clean-room). SHAs live only there. Update = `gh api repos/<o>/<r>/compare/<sha>...HEAD`, merge, bump. Sync script only when manual gets annoying.
- Each vendored folder keeps upstream `LICENSE`. Frontmatter: `license:` + `metadata.source:`. No attribution lines in skill bodies.
- README Credits in three tiers: vendored / derived-or-inspired / companions (impeccable, ui-ux-pro-max, taste-skill, diagram-design, Agent-Skills-for-Context-Engineering, OpenSpec, graphify).
- Codex opt-out: per-skill `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.

## Testing

- `scripts/check.cjs` in CI (Windows + Ubuntu): frontmatter (ZCode name regex, ≤1024 / ≤300 chars), budget, manifests valid + same version, hook smoke test incl. `"type": "module"` parent trap, UPSTREAM rows ↔ folders ↔ LICENSE files.
- `TESTING.md` manual install checklist for all three harnesses (core injected, `/braid:spec propose` works, mode survives `/compact`).
- Manual A/B on 5 ponytail benchmark tasks: braid vs ponytail vs none (diff size, tests pass, tokens).

## Coexistence

README "Conflicts": don't run braid with ponytail. After v1 is verified, the user uninstalls ponytail and personal `~/.claude/skills/grilling`, `grill-me`.

## Milestones

1. Skeleton: rename folder `ZAISkills` → `braid`, git init, LICENSE, manifests + marketplaces, UPSTREAM.md, README skeleton, `check.cjs`.
2. Core: `core.md`, `braid` skill, `.cjs` hook (inject, tracker, pointers, adhd), hooks JSONs. Verify inject + compaction in Claude Code.
3. Vendored skills with LICENSE, openai.yaml, UPSTREAM rows.
4. Ponytail-derived review/audit/debt.
5. Workflow: map → spec → wayfind → handoff → xreview. Fold this plan into `braid/adr/` + `braid/routes/v1.md`.
6. design.
7. Ship: CI, TESTING.md, Codex + ZCode install, A/B, CHANGELOG, tag v1.0.0, push public repo (ask first).
