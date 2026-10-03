# Vendor upstream skills verbatim, pinned in UPSTREAM.md

Third-party skills are copied in, not pulled via submodules or subtrees (those map whole repos onto a flat `skills/` layout and many plugin installers don't fetch them). Each copy keeps its upstream `LICENSE`, its source and commit SHA live only in `UPSTREAM.md`, and braid's edits are surgical and committed separately from the verbatim copy, so `gh api .../compare/<sha>...HEAD` diffs can be merged later. Heavily rewritten skills are marked *derived* and only watched for ideas.
