---
name: review
description: "Review a diff for over-engineering against YAGNI > KISS > DRY: what to delete, simplify, or stop duplicating. One line per finding. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[diff target, default: uncommitted + branch vs base]"
license: MIT
metadata:
  source: https://github.com/DietrichGebert/ponytail
---

Review the diff for unnecessary complexity. One line per finding: location,
what to cut, what replaces it. The diff's best outcome is getting shorter.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs. Rank biggest cut first.

Tags, YAGNI first:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller, a shared helper whose callers pass flags to make it behave differently (the wrong abstraction: inline it).
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `kiss:` nested, clever, or magic where a plain form reads cold: else-pyramids, reflection, metaprogramming, a second style for a job the codebase already does one way. Show the plain form.
- `dry:` the same *knowledge* defined twice (constant, config value, schema, business rule), or code re-implementing something already in this codebase (name it), or a **third** copy of logic that changes for the same reason. Never flag two copies.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L40-66: kiss: four nested ifs. Early returns, same logic, flat.`

✅ `api.ts:L9: dry: re-implements slugify from utils/text.ts:14. Import it.`

✅ `L3, L57: dry: tax rate 0.0825 hard-coded twice. One TAX_RATE constant.`

## Scoring

End with: `net: -<N> lines possible.` Nothing to cut: `Lean already. Ship.`

## Boundaries

Scope: complexity only. Correctness bugs, security holes, and performance go
to a normal review pass (`/braid:xreview`). A single smoke test or
assert-based self-check is the braid minimum, never flag it. A
`braid(<pillar>):` comment is a deliberate, documented corner cut: don't flag
it unless its upgrade trigger has fired. Lists fixes, applies none.
