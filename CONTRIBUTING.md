# Contributing

The gate in [AGENTS.md](AGENTS.md#before-saying-done) must pass before every commit; CI runs it (`check.cjs` on Windows and Ubuntu, the lints on Ubuntu).

## Adding a skill

`/braid:skill` walks through writing one. In this repo it also needs:

1. `skills/<name>/SKILL.md`: `license: MIT` in the frontmatter; ≤ 8 KB per markdown file unless vendored.
2. User-only (the default; the always-on budget has little room): `disable-model-invocation: true`, the description ends "Only when the user explicitly invokes it.", and `skills/<name>/agents/openai.yaml` sets `allow_implicit_invocation: false`. Model-invoked: description ≤ 300 chars and a reason it must load on its own.
3. A row in [UPSTREAM.md](UPSTREAM.md) (`clean-room` with `-` cells if it has no source). Vendored: keep the upstream `LICENSE`. Derived: the upstream notice in `THIRD-PARTY-NOTICES`.
4. A row in the README's skill table and in `skills/help/SKILL.md`.
5. A `CHANGELOG.md` entry and a version bump in all three `plugin.json` files: minor for a new skill or verb, major for a rename or removal.
6. `node scripts/check.cjs`, then the harness checklist in [TESTING.md](TESTING.md) before the release.

## Syncing upstream

See [UPSTREAM.md](UPSTREAM.md#syncing).
