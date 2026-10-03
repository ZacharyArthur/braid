# A/B: sonnet, 3 run(s) per cell

2026-10-03 · arms: braid, ponytail, none · medians · python checks: Python 3.14.6

| task | arm | lines | check | DRY | tokens | cost $ | time s | turns | errors |
|---|---|--:|:-:|:-:|--:|--:|--:|--:|--:|
| csv-sum | braid | +6 −0 | 3/3 | - | 188581 | 0.0959 | 13.1 | 4 | 0 |
| csv-sum | ponytail | +6 −0 | 3/3 | - | 95384 | 0.0767 | 6.7 | 2 | 0 |
| csv-sum | none | +9 −0 | 3/3 | - | 89637 | 0.0646 | 6.4 | 2 | 0 |
| debounce | braid | +9 −0 | 3/3 | - | 141637 | 0.0875 | 13.5 | 3 | 0 |
| debounce | ponytail | +9 −0 | 3/3 | - | 95470 | 0.0770 | 7.7 | 2 | 0 |
| debounce | none | +12 −0 | 3/3 | - | 89731 | 0.0651 | 6.0 | 2 | 0 |
| dry-reuse | braid | +11 −1 | 3/3 | 0/3 | 237393 | 0.1129 | 17.7 | 6 | 0 |
| dry-reuse | ponytail | +11 −1 | 3/3 | 0/3 | 191488 | 0.1005 | 10.8 | 4 | 0 |
| dry-reuse | none | +11 −1 | 3/3 | 0/3 | 179953 | 0.0874 | 11.3 | 4 | 0 |
| dry-third | braid | +12 −8 | 3/3 | 3/3 | 238583 | 0.1170 | 19.6 | 5 | 0 |
| dry-third | ponytail | +9 −1 | 3/3 | 0/3 | 191879 | 0.1013 | 11.9 | 4 | 0 |
| dry-third | none | +9 −1 | 3/3 | 0/3 | 180467 | 0.0888 | 12.8 | 4 | 0 |
| email | braid | +17 −0 | 3/3 | - | 142075 | 0.0894 | 13.1 | 3 | 0 |
| email | ponytail | +17 −0 | 3/3 | - | 144148 | 0.0919 | 12.7 | 3 | 0 |
| email | none | +15 −0 | 3/3 | - | 89921 | 0.0669 | 7.1 | 2 | 0 |
| rate-limit | braid | +21 −2 | - | - | 604811 | 0.2443 | 66.3 | 15 | 0 |
| rate-limit | ponytail | +41 −2 | - | - | 545768 | 0.2006 | 44.1 | 12 | 0 |
| rate-limit | none | +13 −2 | - | - | 369464 | 0.1488 | 28.6 | 9 | 0 |
| react-countdown | braid | +26 −0 | - | - | 94410 | 0.0772 | 8.5 | 2 | 0 |
| react-countdown | ponytail | +20 −0 | - | - | 95744 | 0.0793 | 16.0 | 2 | 0 |
| react-countdown | none | +69 −0 | - | - | 91105 | 0.0751 | 12.9 | 2 | 0 |

DRY probes: reuses utils/text.js slugify; the third copy triggered one shared formatter.
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
