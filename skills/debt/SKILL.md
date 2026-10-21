---
name: debt
description: "List every shortcut(yagni|kiss|dry) comment, and plain shortcut: or older braid(...) ones, as a debt ledger grouped by strand, flagging ones with no upgrade trigger. One-shot report, changes nothing. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[marker word]"
license: MIT
metadata:
  source: https://github.com/DietrichGebert/ponytail
---

Every deliberate braid shortcut is marked with a `shortcut(<strand>):` comment naming
its ceiling and upgrade path (other code may say plain `shortcut:` or older `braid(<strand>):`). This collects them into one ledger so a deferral
can't quietly become permanent.

## Scan

Grep the repo for comment markers, skipping `.git` and everything the
`.gitignore` files ignore (dependencies, build output, caches, in any stack):

`git grep --no-index --exclude-standard -nE '(#|//|--|;|/[*]|<!--) ?(shortcut(\((yagni|kiss|dry)\))?|braid\((yagni|kiss|dry)\)):'`  (add other comment prefixes if your stack uses them)

If the user names their own marker word (`/braid:debt TODO`), grep for that word instead.

Each hit is one ledger row. The comment prefix keeps prose that merely mentions
the convention out of the ledger. Skip hits that are not a deferral, like a note
about a keyboard shortcut.

## Output

One row per marker, grouped by file:

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

The convention is `shortcut(<strand>): <ceiling>, <upgrade path>`, so pull the ceiling
and the trigger straight from the comment. Want an owner per row too? add
`git blame -L<line>,<line>`.

Flag the rot risk: any marker comment that names no upgrade path or
trigger gets a `no-trigger` tag, those are the ones that silently rot.

End with `<N> markers, <M> with no trigger.` Nothing found: `No shortcut debt. Clean ledger.`

In braid, group the rows by strand first (yagni, kiss, dry, then unstranded), then by file,
and count per strand at the end: `<N> markers (<y> yagni, <k> kiss, <d> dry, <u> unstranded), <M> with no trigger.`

## Boundaries

Reads and reports only, changes nothing. To persist it, ask and it writes the
ledger to a file (e.g. `braid/DEBT.md`). One-shot.
