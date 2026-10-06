---
name: debt
description: "Collect every braid(yagni|kiss|dry) comment into a debt ledger of deliberate shortcuts, grouped by pillar, flagging ones with no upgrade trigger. Read-only. Only when the user explicitly invokes it."
disable-model-invocation: true
license: MIT
metadata:
  source: https://github.com/DietrichGebert/ponytail
---

Every deliberate braid shortcut is marked `braid(<pillar>): <ceiling>,
<upgrade path>`. This collects them into one ledger so a deferral can't
quietly become permanent.

## Scan

Skip `node_modules`, `.git`, and build output. Require a comment prefix so
prose that merely mentions the convention stays out:

`grep -rnE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build '(#|//|--|;|/\*|<!--) ?braid\((yagni|kiss|dry)\):' .`

Add the project's other build or vendor folders as more `--exclude-dir`s.

Each hit is one ledger row.

## Output

Grouped by pillar (yagni, kiss, dry), then by file:

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

Tag `no-trigger` on any marker that names no upgrade path or trigger: those
are the ones that silently rot. Want an owner per row? Add
`git blame -L<line>,<line>`.

End with `<N> markers (<y> yagni, <k> kiss, <d> dry), <M> with no trigger.`
Nothing found: `No braid debt. Clean ledger.`

## Boundaries

Reads and reports only. To persist it, ask and it writes the ledger to
`braid/DEBT.md`.
