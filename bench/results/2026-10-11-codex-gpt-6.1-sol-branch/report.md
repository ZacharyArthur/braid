# A/B: codex gpt-6.1-sol, 3 run(s) per cell

2026-10-11 · arms: braid, ponytail, none · medians · stopped after 8 tasks and resumed for the last 4 · python checks: Python 3.14.6

| task | arm | code | tests | check | complete | DRY | tokens | cost $ | time s | steps | errors |
|---|---|--:|--:|:-:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +8 −0 | 0 | 3/3 | 3 | - | 84636 | - | 30.2 | 5 | 0 |
| csv-sum | ponytail | +8 −0 | 0 | 3/3 | 3 | - | 64316 | - | 20.9 | 4 | 0 |
| csv-sum | none | +13 −0 | 0 | 3/3 | 3 | - | 46111 | - | 17.6 | 4 | 0 |
| debounce | braid | +10 −0 | 0 | 3/3 | 3 | - | 65810 | - | 24.4 | 4 | 0 |
| debounce | ponytail | +10 −0 | 0 | 3/3 | 3 | - | 48199 | - | 25.3 | 3 | 0 |
| debounce | none | +12 −0 | 0 | 3/3 | 3 | - | 46082 | - | 16.5 | 3 | 0 |
| dry-reuse | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 66265 | - | 23.5 | 4 | 0 |
| dry-reuse | ponytail | +7 −1 | 0 | 3/3 | 3 | 3/3 | 81450 | - | 27.0 | 5 | 0 |
| dry-reuse | none | +7 −1 | 0 | 3/3 | 3 | 3/3 | 80077 | - | 25.9 | 5 | 0 |
| dry-reuse-mapped | braid | +7 −1 | 0 | 3/3 | 2 | 3/3 | 66615 | - | 23.5 | 4 | 0 |
| dry-reuse-mapped | ponytail | +7 −1 | 0 | 3/3 | 3 | 3/3 | 82047 | - | 27.4 | 5 | 0 |
| dry-reuse-mapped | none | +7 −1 | 0 | 3/3 | 3 | 3/3 | 93153 | - | 28.2 | 6 | 0 |
| dry-reuse-open | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 83108 | - | 25.5 | 5 | 0 |
| dry-reuse-open | ponytail | +7 −1 | 0 | 3/3 | 3 | 3/3 | 81324 | - | 23.9 | 5 | 0 |
| dry-reuse-open | none | +7 −1 | 0 | 3/3 | 3 | 3/3 | 77561 | - | 26.4 | 5 | 0 |
| dry-third | braid | +12 −8 | 0 | 3/3 | 3 | 3/3 | 66684 | - | 29.2 | 4 | 0 |
| dry-third | ponytail | +9 −1 | 0 | 3/3 | 3 | 0/3 | 64854 | - | 24.7 | 4 | 0 |
| dry-third | none | +9 −1 | 0 | 3/3 | 3 | 0/3 | 62073 | - | 23.1 | 4 | 0 |
| email | braid | +21 −0 | 23 | 3/3 | 3 | - | 51537 | - | 33.7 | 3 | 0 |
| email | ponytail | +32 −0 | 0 | 3/3 | 3 | - | 48880 | - | 29.7 | 3 | 0 |
| email | none | +29 −0 | 0 | 3/3 | 3 | - | 46732 | - | 26.9 | 3 | 0 |
| rate-limit | braid | +28 −2 | 37 | - | 3 | - | 200451 | - | 78.3 | 10 | 0 |
| rate-limit | ponytail | +26 −2 | 37 | - | 3 | - | 173629 | - | 73.8 | 8 | 0 |
| rate-limit | none | +45 −2 | 62 | - | 3 | - | 158519 | - | 72.3 | 7 | 0 |
| react-countdown | braid | +22 −0 | 52 | - | 3 | - | 69220 | - | 51.7 | 5 | 0 |
| react-countdown | ponytail | +22 −0 | 0 | - | 3 | - | 65887 | - | 44.4 | 4 | 0 |
| react-countdown | none | +30 −0 | 0 | - | 3 | - | 46719 | - | 29.4 | 3 | 0 |
| safe-path | braid | +16 −2 | 35 | 3/3 | 3 | - | 114318 | - | 84.9 | 9 | 0 |
| safe-path | ponytail | +17 −2 | 37 | 3/3 | 3 | - | 137746 | - | 89.8 | 9 | 0 |
| safe-path | none | +31 −2 | 0 | 3/3 | 3 | - | 84351 | - | 63.5 | 6 | 0 |
| scope-recipients | braid | +4 −4 | 22 | 0/3 | 3 | - | 87090 | - | 52.2 | 7 | 0 |
| scope-recipients | ponytail | +4 −4 | 24 | 0/3 | 3 | - | 83793 | - | 42.3 | 5 | 0 |
| scope-recipients | none | +6 −3 | 29 | 0/3 | 3 | - | 79844 | - | 43.6 | 5 | 0 |
| scope-rename | braid | +5 −5 | 2 | 3/3 | 3 | - | 85942 | - | 42.2 | 5 | 0 |
| scope-rename | ponytail | +5 −5 | 2 | 3/3 | 3 | - | 87342 | - | 34.3 | 4 | 0 |
| scope-rename | none | +5 −5 | 2 | 3/3 | 3 | - | 97235 | - | 44.1 | 6 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify; categories.js: reuses utils/text.js slugify (repo has braid/map.md); categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm); reports.js: the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
