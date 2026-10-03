# A/B: codex gpt-6.1-sol, 3 run(s) per cell

2026-10-03 · arms: braid, ponytail, none · medians · python checks: Python 3.14.6

| task | arm | lines | check | DRY | tokens | cost $ | time s | steps | errors |
|---|---|--:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +7 −0 | 3/3 | - | 66096 | - | 28.0 | 4 | 0 |
| csv-sum | ponytail | +7 −0 | 3/3 | - | 66070 | - | 40.6 | 4 | 0 |
| csv-sum | none | +15 −0 | 3/3 | - | 45643 | - | 25.9 | 4 | 0 |
| debounce | braid | +39 −0 | 3/3 | - | 66668 | - | 39.5 | 4 | 0 |
| debounce | ponytail | +34 −0 | 3/3 | - | 49836 | - | 26.8 | 3 | 0 |
| debounce | none | +12 −0 | 3/3 | - | 45546 | - | 20.2 | 3 | 0 |
| dry-reuse | braid | +7 −1 | 3/3 | 3/3 | 66936 | - | 28.6 | 4 | 0 |
| dry-reuse | ponytail | +7 −1 | 3/3 | 3/3 | 84083 | - | 32.6 | 5 | 0 |
| dry-reuse | none | +7 −1 | 3/3 | 3/3 | 77124 | - | 34.2 | 5 | 0 |
| dry-reuse-mapped | braid | +7 −1 | 3/3 | 3/3 | 67630 | - | 31.0 | 4 | 0 |
| dry-reuse-mapped | ponytail | +7 −1 | 3/3 | 3/3 | 84488 | - | 32.8 | 6 | 0 |
| dry-reuse-mapped | none | +7 −1 | 3/3 | 2/3 | 77480 | - | 31.7 | 5 | 0 |
| dry-reuse-open | braid | +7 −1 | 3/3 | 3/3 | 67021 | - | 29.2 | 4 | 0 |
| dry-reuse-open | ponytail | +7 −1 | 3/3 | 3/3 | 83548 | - | 32.4 | 5 | 0 |
| dry-reuse-open | none | +7 −1 | 3/3 | 3/3 | 77077 | - | 34.3 | 6 | 0 |
| dry-third | braid | +27 −8 | 3/3 | 3/3 | 67341 | - | 39.3 | 4 | 0 |
| dry-third | ponytail | +15 −1 | 3/3 | 1/3 | 67404 | - | 36.9 | 5 | 0 |
| dry-third | none | +9 −1 | 3/3 | 0/3 | 61457 | - | 30.8 | 4 | 0 |
| email | braid | +32 −0 | 3/3 | - | 50225 | - | 37.0 | 3 | 0 |
| email | ponytail | +35 −0 | 3/3 | - | 50246 | - | 33.7 | 3 | 0 |
| email | none | +29 −0 | 3/3 | - | 46382 | - | 31.8 | 3 | 0 |
| rate-limit | braid | +63 −2 | - | - | 160427 | - | 90.2 | 10 | 0 |
| rate-limit | ponytail | +61 −2 | - | - | 181281 | - | 100.6 | 9 | 0 |
| rate-limit | none | +42 −2 | - | - | 80388 | - | 77.9 | 5 | 0 |
| react-countdown | braid | +83 −0 | - | - | 67790 | - | 54.6 | 4 | 0 |
| react-countdown | ponytail | +65 −0 | - | - | 67829 | - | 44.8 | 5 | 0 |
| react-countdown | none | +26 −0 | - | - | 46114 | - | 29.4 | 2 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify; categories.js: reuses utils/text.js slugify (repo has braid/map.md); categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm); reports.js: the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
