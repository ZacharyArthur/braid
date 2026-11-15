# exposure

Check by name only, never opening a file:

- Authors: `git shortlog -s --group=format:%ae <range>` (raw emails, no mailmap) over the scope's commits (`diff`: `<base>..HEAD`; a path: `HEAD -- <path>`; `all`: `HEAD`; never no range, which reads stdin), any email other than `git config user.email`.
- Secrets: `git --glob-pathspecs --icase-pathspecs ls-files -co -- '**/.env*' '**/*.pem' '**/*.key' '**/*.p12' '**/*.pfx' '**/id_rsa*' '**/id_ed25519*' '**/id_ecdsa*' '**/*credentials*'` (tracked, ignored or untracked), skipping `*.example`, `*.sample`, `*.template`, `*.pub`, source code and anything inside `node_modules`, `venv`/`.venv`, `vendor`, `dist`, `build`, `target` or another dependency, virtualenv or build-output folder, ignored or not.

On a hit, suggest `--offline` and starting the reviewer with network tools off
in its harness, since `--offline` is only an instruction. Under `--run
subagent`, say so before the hand-off and ask whether to continue online; on a
no, rewrite the prompt as `--offline` first. Already `--offline`: name only the
network-off reviewer. Under `--run subagent`, tell the user before you start
the subagent, without asking, and add that the subagent keeps this session's
tools, so a hard boundary means running the written prompt in a network-off
session.

Before a fan-out to programs (`run.md`), on the first run or on `next`, a hit
always asks before any program starts, also when the prompt is already
`--offline`. Say that the started programs would run the scope's code without
approval prompts, and offer three answers: stay online, go offline (suggested),
or start nothing. Already `--offline` → offer only starting or not. Going
offline rewrites the prompt as `--offline` first; whenever the prompt is
`--offline`, say that it stays an instruction the started programs are not
held to. Starting nothing leaves the round to the user, as `run.md` says; on
`next`, set the round first, as its step 7 says.
