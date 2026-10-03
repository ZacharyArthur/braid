# discover

Write specs for an existing codebase by asking the user what its code is
*supposed* to do. Each run covers a small set; run it again for the next.
**Never edits code.**

1. **Orient.** Read `braid/map.md`. Missing → build it first (the map skill).
   Read every existing `braid/specs/*/spec.md`.
2. **Pick 1-3 capabilities with no spec yet** (modules in the map with no
   matching spec are the candidates). Rank by:
   - business weight: money, auth, permissions, and data rules beat glue code
   - churn: `git log --since=6.months --name-only --format= -- <path> | wc -l`
   - risk: few tests, complex branching, many callers

   Name the picks and a one-line reason for each. The user can swap them.
3. **Draft the as-is behavior** for each pick: requirements and scenarios in
   the spec format, describing what the code does *today*. Every requirement
   carries evidence: `(src/billing/refund.ts:42)`.
4. **Grill on it.** Use the grilling skill (`braid:grilling`). For each
   requirement the question is: intended, bug, or business logic that has
   drifted? Lead with the surprising ones: dead branches, magic numbers,
   inconsistent rules, behavior the tests contradict. Along the way, resolved
   terms go to `braid/GLOSSARY.md` and hard-to-reverse "why" answers become
   ADRs (the domain-modeling skill).
5. **Write the intended spec** to `braid/specs/<domain>/spec.md`, minus the
   evidence references: intended behavior only.
6. **Queue each mismatch** (code ≠ intent) as a proposal-only change,
   `braid/changes/fix-<short-name>/proposal.md`: why, the requirement it
   violates, the evidence. No tasks yet; `/braid:spec propose fix-<name>`
   fills them in later.
7. **Report:** specs written, mismatches queued, and the next uncovered
   capabilities for the following run.
