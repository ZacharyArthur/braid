# Changelog

All notable changes to braid. Versions follow semver: major = a skill renamed or removed, or the `braid/` layout changed; minor = a new skill or verb; patch = wording and upstream syncs.

## [1.5.0] - 2026-10-21

- Pi is a fourth harness: `pi install git:github.com/ZacharyArthur/braid`. A small extension (`extensions/braid.js`) runs the same hook and puts the core in Pi's system prompt on every run, so it survives compaction. Skills are `/skill:<name>`, and the level is `/skill:braid lite`, kept per session in `braid/` inside Pi's agent folder. Pi has no subagent event, so subagents there don't get the core, as in ZCode. ADR 0002 amended.
- ADHD toggles (`/braid:adhd`, "stop adhd mode", "normal mode") now confirm with one line, `BRAID ADHD MODE: on|off`, in every harness, as the level and drift commands do.

## [1.4.0] - 2026-10-20

- New user-only skill `retro`: reads this project's last 30 sessions within 30 days from Claude Code, Codex and ZCode transcripts (ZCode needs Node 22.13+), finds tool failures that recur in 2 or more sessions, and proposes AGENTS.md rules as one numbered diff, written only after a yes. `all` covers every project and writes to each harness's user-level file; `insights` also reads Claude Code's `/insights` report. It ends by pointing to the harness's own tools for what it found (permissions, config, MCP, skills, memory) and for cost. ADR 0015.
- **Codex users: re-trust braid once in `/hooks`.** Its hook timeouts changed, and Codex skips a changed hook until it is trusted again; until then braid's rules and map aren't injected.
- Upstream sync (ponytail 5.3.2): the codebase map reads nothing through a symlink or a linked folder and drops paths with spaces, quotes, invisible characters or other prose, so repo-controlled text stays out of the context; hook output is written synchronously, so a fast exit can't drop it on macOS; hooks get 15 s and the map 3 s (was 5 s and 1.5 s), so a slow Windows start keeps its output and its map; `debt` scans with `git grep --exclude-standard`, skipping every gitignored folder in any stack. `spec` apply reads the current spec text of a REMOVED or MODIFIED requirement (idea from OpenSpec). `design` tells a page people visit once from a screen they come back to every day, which should stay out of the way, and flags invented numbers and a color per chart series (ideas from impeccable and taste-skill). Other pins bumped with nothing to take; ponytail's always-on cost is unchanged.
- README: installing from the Claude app (claude.ai), how its copy relates to Claude Code's, and updating it. TESTING: how to test a branch before it merges.
- `standards`: an optional Delegation section (recommended off): when to hand work to subagents and on which model tier per harness, and, after a yes per harness, a read-only explorer on the fast model (Claude Code's `Explore` on Haiku, Codex's `explorer` on `gpt-6-luna`, ZCode's `braid-explore` on GLM-5.3-Flash, in the project, or user-wide if ZCode doesn't load project agents). Review flags an explorer file that drifted from AGENTS.md. ADR 0014.
- `braid-context` 0.1.2: the band shows braid's level when braid comes from the Claude app's synced copy (`braid@synced`, loaded only when no copy installed in Claude Code is enabled) or from `--plugin-dir` (`braid@inline`, which replaces an installed copy).
- `braid-context` 0.1.3: the band shows the git branch checked out, between braid's level and the active change. Fix: in a long session the cache countdown no longer drops to 5m after a compaction, a resume or once the transcript passes 4 MiB; past 4 MiB the mod reads the transcript's last MiB with `tail`, or PowerShell on Windows.

## [1.3.1] - 2026-10-11

- braid syncs on claude.ai again. Since 1.2.0 its sync skipped braid, keeping 1.1.0, because `braid-context`'s `plugin.json` sat inside braid's plugin folder; the mod's manifest now lives in its marketplace entry (ADR 0013). Claude Code installs are unchanged.
- `design`: the project's own component comes first on the UI ladder, before a native element, matching the core's "a house component beats a native widget".

## [1.3.0] - 2026-10-11

- Based on ponytail 5 (ADR 0012): braid's core, `review`, `audit` and `debt` now carry ponytail's own text at the pinned release, with braid's renames and added blocks on top, so each ponytail release is a three-way merge instead of a rewrite. UPSTREAM.md gains the **based** kind.
- Core: ponytail 5's rules (read every place a change must reach first, the 6-rung ladder, finish every caller, test and fixture a change breaks, keep the codebase's structure, moved code keeps its checks, one closing line on what was skipped or not checked and any risk), plus braid's precedence, KISS, DRY and "done means verified" blocks. Always-on drops from ~1.9k to ~1.5k tokens worst case before the map; AGENTS.md's budget priority is now "within ~300 tokens of ponytail's".
- Corner cuts are marked `shortcut(<strand>):`, so users' code no longer carries braid's name; `debt`, `review`, `audit` and `xreview` still read `braid(<strand>):` and plain `shortcut:`.
- `review` and `audit` are now quality reviews: bugs, risks, load, missing tests, speed, then lean cuts, numbered in must / should / nice groups with a verdict. Lean findings keep braid's one-line strand tags, plus `split:`.
- Codebase map at session start (ponytail's, based, in `hooks/map.cjs`): the top-level names per folder, within 2,000 bytes, only inside a git repo (tracked files, and untracked ones git doesn't ignore) with no `braid/map.md`; `BRAID_MAP=0` turns it off. It runs in its own process, killed at 1.5 s, so it never blocks or fails the session. Project-state names are clipped by bytes. Worst-case always-on with the map: ~2k tokens, within ~300 of ponytail's worst case, which `check.cjs` now enforces.
- Bench: a blind completeness judge (0 stub to 3 done) on every real run, and three hidden-check tasks from ponytail's set: `safe-path`, `scope-rename`, `scope-recipients`.
- `braid-context` 0.1.1: the band follows each main-thread response, so context and spend move during a long turn instead of at its end.
- Upstream sync: `grilling` words each question so "yes" takes the recommendation; `adhd`'s lead-with-the-action example drops the install command; `systematic-debugging`'s secret probes no longer echo values. Other non-ponytail pins bumped with nothing to take. Ideas from the design and map sources (rewritten, per ADR 0008): `design` states its read of the page in one line before building, treats a redesign as a replacement, adds tells (heading eyebrows, empty section numbers, gradient text, side-stripe cards, mono as costume, div-built fake screenshots, mid-page theme flips), copy and tabular-number checks, and runs its pre-ship check in one batched pass; `map` names the most-imported modules and never copies secrets. `map` and `design` sources are now pinned, so `scripts/upstream.cjs` reports their drift too.

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
