# Testing

`node scripts/check.cjs` covers manifests, frontmatter, the hook's behavior and the token budget; CI runs it on Windows and Ubuntu. What it can't cover is each harness actually loading the plugin. Run this checklist once per release, with ponytail disabled so it can't mask results.

## Claude Code

```bash
claude plugin marketplace add ZacharyArthur/braid
claude plugin install braid@braid
```

In a new session:

- [ ] Ask "what braid level are you at?" → **full**, quoting `BRAID ACTIVE`
- [ ] `/braid:braid lite`, then `/compact`, then ask again → **lite**
- [ ] `/braid:braid drift on` → the next prompt carries a `braid: lite · ...` line; `drift off` removes it
- [ ] Spawn a subagent and ask it for its braid level → **lite**
- [ ] `/braid:adhd`, then `/compact` → answers stay ADHD-shaped; "stop adhd mode" ends it
- [ ] In a project: `/braid:spec propose add-something` → `braid/changes/add-something/` with `tasks.md`; a new session shows "Active change: add-something (0/N tasks)"
- [ ] "stop braid", then `/compact` → no braid rules in context
- [ ] `/braid:humanizer` and `/braid:security-audit` appear in the `/` menu; ask "make this sound less AI" without the command → humanizer does **not** auto-load

## Codex

```bash
codex plugin marketplace add ZacharyArthur/braid
codex plugin add braid@braid
```

Run `codex`, open `/hooks`, review and trust braid's hooks, start a new thread.

- [ ] Core injected (ask for the braid level)
- [ ] `$spec propose add-something` works
- [ ] User-only skills don't auto-trigger

## ZCode

Install from the plugin marketplace (GitHub source `ZacharyArthur/braid`).

- [ ] Plugin loads; note any hooks.json error (if ZCode rejects the shared file, it needs its own)
- [ ] Core injected at session start; level survives compaction
- [ ] Skills listed in Settings → Skills; toggling one off removes it

## A/B against ponytail

Pick 5 tasks from ponytail's benchmark set. Run each three ways (braid, ponytail, neither) on the same model, in fresh sessions. Record per run: diff size (lines), whether the tests pass, total tokens. braid should match ponytail on size and tests, and do better on duplication.
