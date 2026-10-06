# braid

Clean-code harness plugin (always-on core plus workflow skills) for Claude Code, Codex and ZCode.
Optimizes for, in order: always-on cost no higher than ponytail's, YAGNI > KISS > DRY in its own code,
identical behavior across the three harnesses. When a feature and simplicity conflict, simplicity wins.

## Stack

- Markdown skills; Node ≥ 18 CommonJS (`.cjs`), stdlib only: `hooks/braid.cjs`, `scripts/*.cjs`, `bench/ab.cjs`. Python 3 only for bench checks.
- One plugin; runtime is one hook process per harness event. CI: `check.cjs` on Node 18 (Ubuntu, Windows); lints on Node 22 (Ubuntu).
- No npm dependencies, no `package.json`. Vendored skills enter only via UPSTREAM.md, pinned by SHA (ADR 0003).

## Invariants

1. **Always-on injection ≤ ~2.5k tokens, worst case** (ADR 0007) (enforced by `node scripts/check.cjs`)
2. **All three manifests carry one version** (enforced by `node scripts/check.cjs`)
3. **Every skill has an UPSTREAM.md row; vendored ones keep their `LICENSE`, derived ones have a notice in THIRD-PARTY-NOTICES** (enforced by `node scripts/check.cjs`)
4. **User-only skills are marked three ways: `disable-model-invocation`, `agents/openai.yaml`, description suffix** (ADR 0002) (enforced by `node scripts/check.cjs`)

## Commands

Run from the repo root.

- Check (manifests, frontmatter, hook smoke test, budget, provenance): `node scripts/check.cjs`
- Lint Markdown (needs Node ≥ 22): `npx --yes markdownlint-cli2@0.23.3` · fix: add `--fix`. Files and rules: `.markdownlint-cli2.jsonc` (vendored skills excluded).
- Format + lint JS: `npx --yes @biomejs/biome@2.5.15 check --error-on-warnings` · fix: `--write`. Files: `biome.json` (not `bench/tasks/`: fixtures stay as written).
- Tool versions are pinned here and in `.github/workflows/check.yml`; bump both together.
- Bench harness, free: `node bench/ab.cjs --fake`
- Upstream drift, read-only (needs `gh`): `node scripts/upstream.cjs [skill ...]`
- Adding a skill, syncing upstream, releasing: [CONTRIBUTING.md](CONTRIBUTING.md).

## Before saying done

`node scripts/check.cjs && npx --yes markdownlint-cli2@0.23.3 && npx --yes @biomejs/biome@2.5.15 check --error-on-warnings`.
CI runs the same three. Changed `bench/` → also `node bench/ab.cjs --fake`. Never claim done until it passes.

## Workflow

- Specs: braid (`braid/specs/`, `braid/changes/`). New features, behavior changes, and architecture decisions go through a spec change first; fixes restoring specified behavior, docs, chores, upstream syncs, and dependency bumps go straight to a branch.
- Order: propose → branch → apply → archive on the branch → squash-merge, so code and spec land in one squash.

## Conventions

- Scripts are `.cjs`, Node stdlib only. The hook never blocks (1 s stdin fallback); Node 18 is the floor.
- New or reversed decisions get an ADR in `braid/adr/` (numbered, one paragraph); domain terms go in `braid/GLOSSARY.md`.
- Vendored skills: surgical edits only, committed separately from the verbatim copy; upstream syncs bump the SHA in UPSTREAM.md.
- Match surrounding style; comments say why, briefly.

## Git

- Commits: `area: summary`, lowercase, imperative; area is a skill, `hook`, `bench`, `core`, a change name, or a file (`README`).
- Branches: `change/<name>` or `fix/<name>` · Merge: squash PR via `gh pr create` / `gh pr merge --squash` · No PR template, no worktrees.
- Agent may: commit on feature branches. Push and open PRs only when asked. Never force-push; never commit to `main`.
- Never mention AI tools in committed artifacts. Show the exact commit or PR text and confirm before commit, push, or PR.

## Don't

- Run `bench/ab.cjs` without `--fake` unless asked: real runs call `claude`/`codex` and cost money.
- Fix vendored skills in place (including their failing tests); follow UPSTREAM.md.
- Add a `package.json` or npm dependency.

## Reference

- Upstream sources: [UPSTREAM.md](UPSTREAM.md). Vendored → merge upstream diffs; derived and clean-room → consult for ideas, don't port (ADR 0008).
