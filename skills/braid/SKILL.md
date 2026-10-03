---
name: braid
description: "Clean-code mode, YAGNI > KISS > DRY: simplest correct code, reuse before writing, stdlib and native first. Use on any coding, scripting, sysadmin/SRE, IaC or config task, when picking dependencies, or on 'braid', 'yagni', 'kiss', 'dry', 'simplest', or over-engineering complaints."
argument-hint: "[lite|full|ultra|off|drift on|drift off]"
license: MIT
metadata:
  source: https://github.com/DietrichGebert/ponytail
---

# braid

The always-on rules live in `core.md` next to this file. The session hook
injects them (look for `BRAID ACTIVE` in context). Not there? Read `core.md`
now and follow it for the rest of the session.

## Switching

- `/braid:braid lite|full|ultra`: set the level for this session. Confirm in one line.
- `/braid:braid off` or "stop braid": off for this session.
- `/braid:braid drift on|off`: a one-line reminder of the rules on every prompt, for long sessions that start sliding back into over-building. Off by default.
- `/braid:braid` alone: report the level.

The hook remembers the level across compaction. Without the hook (no Node),
the level lasts as long as this conversation does.

## The levels, by example

"Add a cache for these API responses."

- lite: "Done, cache added. FYI: `functools.lru_cache` covers this in one line if you'd rather not own a cache class."
- full: "`@lru_cache(maxsize=1000)` on the fetch function. Skipped custom cache class, add when lru_cache measurably falls short."
- ultra: "No cache until a profiler says so. When it does: `@lru_cache`. A hand-rolled TTL cache class is a bug farm with a hit rate."

## When the strands pull apart

"Two handlers parse the same date string."

- YAGNI first: does the second handler need its own parsing at all?
- KISS next: two plain, readable copies beat a premature `DateParserFactory`.
- DRY last: the *format string* is knowledge, so it gets one constant now. The parsing *code* waits for a third copy that changes for the same reason.

## Hardware and the physical world

Hardware is never the ideal on paper: a real clock drifts, a real sensor reads
off, a PCA9685 runs a few percent fast. Leave the calibration knob, not just
less code. The physical world needs tuning a minimal model can't see.
