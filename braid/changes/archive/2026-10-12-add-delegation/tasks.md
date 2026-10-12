## 1. Decision

- [x] 1.1 ADR 0014: `standards` writes subagent definitions after a yes, the one exception to its "documentation only" rule; ZCode's goes in the project first, user-wide as a fallback behind its own yes
- [x] 1.2 GLOSSARY: **Tier** (fast, mid, main) and **Explorer** (the read-only agent the fast tier runs)

## 2. Standards

- [x] 2.1 `skills/standards/delegation.md`: braid's policy lines, the tier table per harness with model IDs and prices (dated, with sources), the three explorer files (`.claude/agents/Explore.md`, `.codex/agents/explorer.toml`, `.zcode/agents/braid-explore.md`), ZCode's user-wide and Settings fallbacks, how to confirm the model that ran
- [x] 2.2 `template.md`: optional `## Delegation` section between Workflow and Security
- [x] 2.3 `SKILL.md`: Delegation in the optional sections; a Delegation round after Git offers none (recommended), braid's policy, or custom, then the harnesses and each explorer file; the "Documentation only" rule names the exception; review's drift covers the explorer files; verify prints the routing check
- [x] 2.4 Walk the skill text through both paths (recommended → nothing written; braid's policy → section plus only the files said yes to); a live run needs a paid session, so it joins the release checklist in TESTING.md

## 3. Docs

- [x] 3.1 README's and `help`'s `standards` rows mention optional delegation
- [x] 3.2 CHANGELOG `[Unreleased]` entry

## 4. Verify

- [x] 4.1 Verify: `node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`, then `/braid:spec archive`
