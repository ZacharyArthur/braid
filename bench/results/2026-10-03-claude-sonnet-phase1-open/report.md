# A/B: claude sonnet, 3 run(s) per cell

2026-10-03 · arms: braid, ponytail, none · medians · python checks: Python 3.14.6

| task | arm | lines | check | DRY | tokens | cost $ | time s | turns | errors |
|---|---|--:|:-:|:-:|--:|--:|--:|--:|--:|
| dry-reuse-open | braid | +7 −1 | 3/3 | 3/3 | 332227 | 0.1301 | 24.5 | 7 | 0 |
| dry-reuse-open | ponytail | +7 −1 | 3/3 | 3/3 | 240655 | 0.1128 | 16.9 | 6 | 0 |
| dry-reuse-open | none | +7 −1 | 3/3 | 3/3 | 225662 | 0.0979 | 14.3 | 5 | 0 |

DRY probes: categories.js: reuses utils/text.js slugify (the prompt doesn't spell out the slug algorithm).
Diffs per run are in `diffs/`; read them for duplication the probes can't see.
