# A/B: claude sonnet, 3 run(s) per cell

2026-10-11 · arms: braid · medians · python checks: Python 3.14.6

| task | arm | code | tests | check | complete | DRY | tokens | cost $ | time s | turns | errors |
|---|---|--:|--:|:-:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +4 −0 | 0 | 3/3 | 3 | - | 110258 | 0.0596 | 8.8 | 3 | 0 |
| debounce | braid | +9 −0 | 0 | 3/3 | 3 | - | 73951 | 0.0580 | 9.4 | 3 | 0 |
| dry-reuse | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 149334 | 0.0733 | 12.2 | 7 | 0 |
| dry-reuse-mapped | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 150447 | 0.0766 | 12.3 | 8 | 0 |
| dry-reuse-open | braid | +7 −1 | 0 | 3/3 | 3 | 3/3 | 186183 | 0.0756 | 11.8 | 7 | 0 |
| dry-third | braid | +6 −10 | 0 | 3/3 | 3 | 3/3 | 111595 | 0.0666 | 12.4 | 4 | 0 |
| email | braid | +26 −0 | 0 | 3/3 | 3 | - | 74478 | 0.0624 | 11.7 | 3 | 0 |
| rate-limit | braid | +22 −2 | 0 | - | 3 | - | 267400 | 0.1045 | 26.6 | 9 | 0 |
| react-countdown | braid | +18 −0 | 0 | - | 3 | - | 73703 | 0.0572 | 7.2 | 2 | 0 |
| safe-path | braid | +27 −2 | 0 | 3/3 | 3 | - | 150231 | 0.0797 | 16.3 | 6 | 0 |
| scope-recipients | braid | +2 −3 | 8 | 0/3 | 3 | - | 229285 | 0.0961 | 19.2 | 10 | 0 |
| scope-rename | braid | +5 −5 | 2 | 3/3 | 3 | - | 185302 | 0.0721 | 12.3 | 5 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify; categories.js: reuses utils/text.js slugify (repo has braid/map.md); categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm); reports.js: the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
