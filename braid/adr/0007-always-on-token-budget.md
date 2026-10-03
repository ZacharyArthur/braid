# Always-on budget of ~2-2.5k tokens, enforced in CI

braid must cost about what ponytail alone does: `core.md` ≤ ~1.5k tokens (only the active level's row injected), ≤ 5 pointer lines, ≤ 300-char descriptions for the four model-invocable skills, everything else user-only. Load-bearing rules (including "when not to simplify", in full) stay always-on; examples and flavor text live in the `braid` skill body, loaded on demand. braid's own skill files are capped at 8 KB each. `scripts/check.cjs` measures the worst-case injection and fails over budget.
