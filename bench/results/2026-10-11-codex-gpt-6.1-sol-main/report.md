# A/B: codex gpt-6.1-sol, 3 run(s) per cell

2026-10-11 · arms: braid · medians · python checks: Python 3.14.6

| task | arm | code | tests | check | complete | DRY | tokens | cost $ | time s | steps | errors |
|---|---|--:|--:|:-:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +7 −0 | 0 | 3/3 | 3 | - | 109364 | - | 42.2 | 4 | 0 |
| debounce | braid | +10 −0 | 27 | 3/3 | 3 | - | 51637 | - | 22.1 | 3 | 0 |
| dry-reuse | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 67262 | - | 22.2 | 4 | 0 |
| dry-reuse-mapped | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 67974 | - | 22.1 | 4 | 0 |
| dry-reuse-open | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 67086 | - | 21.8 | 4 | 0 |
| dry-third | braid | +12 −8 | 11 | 3/3 | 3 | 3/3 | 67687 | - | 25.1 | 5 | 0 |
| email | braid | +33 −0 | 0 | 3/3 | 3 | - | 50439 | - | 26.4 | 3 | 0 |
| rate-limit | braid | +32 −2 | 31 | - | 3 | - | 162785 | - | 85.5 | 9 | 0 |
| react-countdown | braid | +22 −0 | 53 | - | 3 | - | 68141 | - | 37.8 | 4 | 0 |
| safe-path | braid | +17 −2 | 23 | 3/3 | 3 | - | 114797 | - | 56.9 | 9 | 0 |
| scope-recipients | braid | +4 −3 | 27 | 0/3 | 3 | - | 86558 | - | 38.4 | 6 | 0 |
| scope-rename | braid | +5 −5 | 2 | 3/3 | 3 | - | 88250 | - | 34.8 | 6 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify; categories.js: reuses utils/text.js slugify (repo has braid/map.md); categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm); reports.js: the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
