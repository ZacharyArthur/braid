---
name: audit
description: "Whole-repo or path audit for over-engineering against YAGNI > KISS > DRY: a ranked list of what to delete, simplify, or deduplicate. One-shot report. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[path, default: whole repo]"
license: MIT
metadata:
  source: https://github.com/DietrichGebert/ponytail
---

`/braid:review`, repo-wide. Scan the whole tree (or the given path) instead
of a diff. Use the tags, rules, and boundaries in `../review/SKILL.md`. Rank
findings biggest cut first.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
factories with one product, wrappers that only delegate, files exporting one
thing, dead flags and config, hand-rolled stdlib, the same constant or rule
defined in more than one place, two styles for one job, helpers that grew
flags to serve diverging callers.

Read `braid/map.md` first if it exists; it says where things live.

## Output

One line per finding, numbered and ranked: `<N>. <tag> <what to cut>. <replacement>. [path]`,
so the user can say "fix 2 and 5".
End with `net: -<N> lines, -<M> deps possible.` Nothing to cut: `Lean already. Ship.`
