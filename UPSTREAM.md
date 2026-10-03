# Upstream

Single source of truth for where vendored and derived skills came from. SHAs live only here.

- **vendored**: verbatim except surgical edits. Sync by merging upstream diffs.
- **derived**: substantially rewritten. Watch upstream for ideas, don't merge.
- **clean-room**: no upstream code; listed for credit only.

Update a row: `gh api repos/<owner>/<repo>/compare/<sha>...HEAD --jq '.files[] | select(.filename | startswith("<path>")) | .patch'`, merge what you want, bump the SHA.

| Skill | Kind | Repo | Path | SHA | License |
|---|---|---|---|---|---|
