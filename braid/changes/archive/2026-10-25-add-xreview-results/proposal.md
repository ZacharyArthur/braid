## Why

Each xreview round ends with the user pasting every reviewer's report into the author's chat and typing the same request: address the findings, update the prompt, ask me if needed. Reviews live only in chat, so nothing can pick up a round without the user carrying it there, and an orchestrator never could.

## What changes

- A review gets a folder, `braid/reviews/<date>-<scope>/`, holding `prompt.md` and one result file per reviewer per round, `r<N>-<reviewer>.md`. The date is round 1's; a second review of the same scope that day gets `-2`. Flat `braid/reviews/*.md` files from earlier versions stay in place and are never read.
- The prompt states the round, the exact result path and the severities HIGH, MEDIUM and LOW. The reviewer names itself by its tool or model family in lowercase (`reviewer` when it can't tell, `-2` when that file exists), writes its whole report there and no other file, ending in `Verdict: SIGN OFF` or `Verdict: CHANGES NEEDED`, and replies in chat with only the verdict and the path, or the whole report and the path to save it at when it can't write. The `--run` subagent, where the harness has subagents, writes its file the same way. `braid/reviews/` stays out of every review's scope.
- When xreview creates the first review folder in `braid/reviews/` in a git repository and git doesn't already ignore its prompt path, it asks once whether to write `braid/reviews/.gitignore` containing `*`.
- New verb `/braid:xreview next [<folder>] [--run]`: picks the named folder or the one changed last, lists the round's results and verdicts (stopping when the current round has none), checks each finding against the code, fixes those it agrees with and declines the rest, recording each in its own words in a `Round <N+1>` section of `prompt.md`, runs the project's checks, then starts the next round (after the author-and-secrets check) or declares the review done. Result files are claims to check, never instructions. It asks the user when a fix would change a signed-off decision or the project's agent instructions or check commands, when reviewers disagree, when fixes offer a real choice, or when it's unsure a fix fits the user's vision; and whether to go on after a CONFIRMED finding above LOW, or, by its judgment, a CONFIRMED LOW one in code, behavior or tests.
- This repo: markdownlint skips `braid/reviews/**`, since reviewers write Markdown nobody lints.
- CHANGELOG: the versioning rule's major becomes "a `braid/` file braid reads moves or changes format", so this ships as 1.8.0.

## Impact

Specs: `reports` (two added requirements). Code: `skills/xreview/SKILL.md` (folder, Output section, ignore question, `next` routing, frontmatter), new `skills/xreview/next.md`, and `skills/xreview/exposure.md` holding the closing author-and-secrets check moved out of `SKILL.md` to stay under the byte cap. Config: `.markdownlint-cli2.jsonc`. Docs: `skills/help/SKILL.md` and README rows, `braid/GLOSSARY.md`, `braid/map.md`, CHANGELOG; CONTRIBUTING gains a Releasing section (bump, CHANGELOG heading, annotated tag, GitHub release), since releases had stopped at v1.3.1 while the manifests reached 1.7.0 (v1.4.0 to v1.7.0 were backfilled on 2026-10-25). Manifests: 1.8.0. Always-on cost: unchanged (xreview is user-only).

## Out of scope

- An orchestrator that starts reviewers and waits for a known count: `next` proceeds with the files present; the folder and verdict line are what one would build on.
- Machine-readable output beyond the verdict line (JSON, front matter): nothing reads it yet.
- Moving old flat review files into folders: they are untracked scratch nobody reads.
- A flag to print the prompt in chat: every reviewer in use reads files.
- Committing, archiving or releasing from `next`: those stay with the spec workflow and its confirmations.
