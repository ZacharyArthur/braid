# A/B: claude sonnet, 3 run(s) per cell

2026-10-11 · arms: braid, ponytail, none · medians · python checks: Python 3.14.6

| task | arm | code | tests | check | complete | DRY | tokens | cost $ | time s | turns | errors |
|---|---|--:|--:|:-:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +4 −0 | 0 | 3/3 | 3 | - | 108719 | 0.0578 | 9.0 | 4 | 0 |
| csv-sum | ponytail | +4 −0 | 0 | 3/3 | 3 | - | 72257 | 0.0522 | 5.6 | 2 | 0 |
| csv-sum | none | +8 −0 | 0 | 3/3 | 3 | - | 69042 | 0.0451 | 5.2 | 2 | 0 |
| debounce | braid | +9 −0 | 0 | 3/3 | 3 | - | 72960 | 0.0563 | 8.9 | 3 | 0 |
| debounce | ponytail | +9 −0 | 0 | 3/3 | 3 | - | 72352 | 0.0527 | 5.8 | 2 | 0 |
| debounce | none | +46 −0 | 0 | 3/3 | 3 | - | 69931 | 0.0516 | 6.9 | 2 | 0 |
| dry-reuse | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 220863 | 0.0817 | 14.8 | 7 | 0 |
| dry-reuse | ponytail | +6 −1 | 0 | 3/3 | 3 | 1/3 | 145612 | 0.0678 | 11.3 | 5 | 0 |
| dry-reuse | none | +11 −1 | 0 | 3/3 | 3 | 0/3 | 138627 | 0.0572 | 8.1 | 4 | 0 |
| dry-reuse-mapped | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 148484 | 0.0745 | 13.3 | 8 | 0 |
| dry-reuse-mapped | ponytail | +7 −1 | 0 | 3/3 | 3 | 2/3 | 146852 | 0.0691 | 11.7 | 5 | 0 |
| dry-reuse-mapped | none | +11 −1 | 0 | 3/3 | 3 | 1/3 | 138666 | 0.0567 | 8.0 | 4 | 0 |
| dry-reuse-open | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 257761 | 0.0857 | 16.6 | 9 | 0 |
| dry-reuse-open | ponytail | +7 −1 | 0 | 3/3 | 3 | 3/3 | 218415 | 0.0738 | 11.9 | 6 | 0 |
| dry-reuse-open | none | +7 −1 | 0 | 3/3 | 3 | 3/3 | 209198 | 0.0685 | 10.3 | 6 | 0 |
| dry-third | braid | +6 −10 | 0 | 3/3 | 3 | 3/3 | 110124 | 0.0648 | 12.2 | 4 | 0 |
| dry-third | ponytail | +9 −1 | 0 | 3/3 | 3 | 1/3 | 109368 | 0.0606 | 7.2 | 3 | 0 |
| dry-third | none | +9 −1 | 0 | 3/3 | 3 | 0/3 | 104564 | 0.0537 | 6.8 | 3 | 0 |
| email | braid | +19 −0 | 0 | 3/3 | 3 | - | 73400 | 0.0599 | 10.8 | 3 | 0 |
| email | ponytail | +18 −0 | 0 | 3/3 | 3 | - | 73313 | 0.0600 | 10.7 | 3 | 0 |
| email | none | +29 −0 | 0 | 3/3 | 3 | - | 69970 | 0.0527 | 8.9 | 2 | 0 |
| rate-limit | braid | +20 −2 | 12 | - | 3 | - | 187390 | 0.0870 | 19.5 | 7 | 0 |
| rate-limit | ponytail | +20 −2 | 11 | - | 3 | - | 185615 | 0.0810 | 17.0 | 6 | 0 |
| rate-limit | none | +36 −2 | 0 | - | 3 | - | 140781 | 0.0669 | 12.6 | 4 | 0 |
| react-countdown | braid | +18 −0 | 0 | - | 3 | - | 109633 | 0.0629 | 9.8 | 3 | 0 |
| react-countdown | ponytail | +18 −0 | 0 | - | 3 | - | 109606 | 0.0634 | 9.4 | 3 | 0 |
| react-countdown | none | +60 −0 | 0 | - | 3 | - | 70468 | 0.0560 | 9.7 | 2 | 0 |
| safe-path | braid | +14 −2 | 0 | 3/3 | 3 | - | 187328 | 0.0903 | 22.1 | 7 | 0 |
| safe-path | ponytail | +15 −2 | 0 | 3/3 | 3 | - | 302754 | 0.1147 | 29.7 | 11 | 0 |
| safe-path | none | +26 −2 | 0 | 3/3 | 3 | - | 250406 | 0.0920 | 23.5 | 8 | 0 |
| scope-recipients | braid | +4 −4 | 8 | 0/3 | 3 | - | 227430 | 0.0954 | 20.8 | 11 | 0 |
| scope-recipients | ponytail | +3 −3 | 8 | 0/3 | 3 | - | 227223 | 0.0960 | 20.2 | 11 | 0 |
| scope-recipients | none | +7 −3 | 14 | 0/3 | 3 | - | 216119 | 0.0849 | 18.3 | 10 | 0 |
| scope-rename | braid | +5 −5 | 2 | 3/3 | 3 | - | 227786 | 0.0946 | 17.2 | 12 | 0 |
| scope-rename | ponytail | +5 −5 | 2 | 3/3 | 3 | - | 224648 | 0.0972 | 18.3 | 14 | 0 |
| scope-rename | none | +5 −5 | 2 | 3/3 | 3 | - | 213010 | 0.0731 | 14.1 | 7 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify; categories.js: reuses utils/text.js slugify (repo has braid/map.md); categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm); reports.js: the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
