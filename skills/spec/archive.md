# archive

Merge a finished change into the specs and file it away.

1. **Pick the change** as in `apply.md`. Unticked tasks → list them and ask
   whether to finish, drop them (note why in `proposal.md`), or stop.
2. **OpenSpec with its CLI installed:** run `openspec archive <id>` and let it
   merge and move. Skip steps 3 and 4: never also merge or move by hand.
   Continue at step 5.
3. **Otherwise merge each delta** into `braid/specs/<domain>/spec.md` (OpenSpec:
   `openspec/specs/`), in this order, as OpenSpec does:
   - RENAMED → retitle each `FROM` requirement to its `TO` name.
   - REMOVED → delete that requirement.
   - MODIFIED → replace the whole requirement with the same header (after a
     rename, the new name).
   - ADDED → append the requirement under `## Requirements`.
   - New domain → create the spec file with a `## Purpose` line; only ADDED
     applies to it.
   - A header not found for RENAMED, REMOVED, or MODIFIED → stop and ask; never guess.
4. **Move** the change folder to `<changes>/archive/<YYYY-MM-DD>-<name>/`.
5. **Patch the map.** If `braid/map.md` exists, patch it for the modules the
   change touched (as in the map skill), including its header SHA.
6. **Offer an ADR** for a `design.md` decision that is hard to reverse,
   surprising without context, and a real trade-off (domain-modeling's
   three tests). Otherwise skip it.
7. **Report:** specs updated, requirements renamed, removed, modified, and added.
