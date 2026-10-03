# archive

Merge a finished change into the specs and file it away.

1. **Pick the change** as in `apply.md`. Unticked tasks → list them and ask
   whether to finish, drop them (note why in `proposal.md`), or stop.
2. **Merge each delta** into `braid/specs/<domain>/spec.md`:
   - ADDED → append the requirement under `## Requirements`.
   - MODIFIED → replace the whole requirement with the same header.
   - REMOVED → delete that requirement.
   - New domain → create the spec file with a `## Purpose` line.
   - Header not found for MODIFIED/REMOVED → stop and ask; never guess.
3. **Move** `braid/changes/<name>/` to
   `braid/changes/archive/<YYYY-MM-DD>-<name>/`.
4. **Patch the map.** If `braid/map.md` exists, patch it for the modules the
   change touched (as in the map skill), including its header SHA.
5. **Offer an ADR** for a `design.md` decision that is hard to reverse,
   surprising without context, and a real trade-off (domain-modeling's
   three tests). Otherwise skip it.
6. **Report:** specs updated, requirements added, modified, and removed.
