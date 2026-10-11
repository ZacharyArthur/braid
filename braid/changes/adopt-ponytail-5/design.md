## Provenance: based, not derived or vendored

- **Derived** (today): every release is hand-ported. v5 rewrote most of the text, so following it meant a full rewrite.
- **Vendored**: allows surgical edits only (ADR 0003). braid's KISS and DRY blocks aren't surgical.
- **Based** (chosen): verbatim import commit, then a braid-edits commit. Edits are renames and whole inserted blocks, so `git merge-file core.md old-upstream new-upstream` applies most releases cleanly. A conflict means upstream rewrote a line braid renamed, which you resolve by hand. Keep a pristine copy of the pinned upstream file for the merge base, fetched by SHA at sync time, not committed.

The always-on file stays `core.md`: the hook injects it, filtered to the active level's row (ADR 0007). Ponytail's frontmatter and its `/ponytail` lines are dropped as part of the rename edits.

## Marker: `shortcut(<strand>):`

- `braid(<strand>):` (today): puts a tool name in users' code, against braid's own rule for committed artifacts, and outlives uninstalling braid.
- `shortcut:` (ponytail's): neutral, but loses the strand that `debt` groups by, and it matches prose about keyboard shortcuts.
- `shortcut(<strand>):` (chosen): neutral, keeps the strand, is one word off ponytail's line so it still merges, and its parenthesis rules out false matches. Readers accept all three forms.

## Map: vendored, behind `braid/map.md`

A curated `braid/map.md` beats a regex map, and the hook already points to it, so the generated map runs only without one. Worst case is the character cap plus the header. The check measures it at the cap, using long identifiers.

The source walks up to 4,000 files, which can take seconds in a large repo. The braid edit stops the walk at a time limit and lists what it has, so session start stays within the hook's no-block rule.
