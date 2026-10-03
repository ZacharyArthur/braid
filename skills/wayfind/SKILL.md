---
name: wayfind
description: "Find the way through an effort too big or foggy for one session: a route of decisions in braid/routes/<effort>.md, settled a round at a time by grilling, until it is clear enough to spec. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[effort name or idea]"
license: MIT
metadata:
  source: https://github.com/mattpocock/skills
---

Wayfinding is **deciding**, not doing. A route is done when nothing is left to
decide before someone builds it. The urge to start building means you've
reached the edge of the route: hand off to `/braid:spec propose`.

## The route file

One file per effort, `braid/routes/<effort>.md`. It is the state: every
session starts by reading it.

```markdown
<!-- braid:route created=<YYYY-MM-DD> -->
# Route: <effort>

## Destination
<one or two lines: what "clear" looks like: a spec to write, a decision to lock, a migration to plan>

## Decided
- <decision>: <answer, one line> ([ADR 0004](../adr/0004-slug.md) if it has one)

## Open
- [ ] <decision to make> (after: <other open decision>, if it depends on one)

## Fog
- <in scope, but too unclear to phrase as a decision yet>

## Out of scope
- <what this effort won't decide or do, and why>
```

`Decided` is an index: one line each. Detail that matters later lives in an
ADR, never in two places. The session hook counts the `- [ ]` boxes to show
the route is active.

## Each session

1. **No route yet:** name the destination with the user first; it shapes
   everything else. Seed `Open` and `Fog` from the conversation and
   `braid/map.md`. Write the file.
2. **Route exists:** read it. The frontier is every `Open` decision whose
   `after:` prerequisites are already decided.
3. **Settle the frontier** with the grilling skill (`braid:grilling`), one
   round at a time. Facts come from the code, not the user.
4. **Record each answer:** remove it from `Open`, add a one-line `Decided`
   entry. Hard to reverse, surprising, and a real trade-off → an ADR via the
   domain-modeling skill, linked from the line.
5. **Redraw:** decisions that are now unblocked join the frontier; fog that has
   cleared becomes `Open` items; things ruled out move to `Out of scope`.
6. **Stop** when the session's energy runs out. The file holds the place.

## Clear

`Open` and `Fog` both empty → the route is clear. Say so and end with:
"`/braid:spec propose <name>`, which builds the change from this route."
