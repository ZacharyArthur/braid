# run

`--run` starts the round's reviewers, on the first run and on `next`.
`run.cjs` is the script beside this file.

## The words after `--run`

- A word starting with `--` is a flag, never the list.
- On `/braid:xreview`: `diff`, `all` or an existing path is the scope, any other
  word the list, in either order (`--run codex,pi all`, `--run all codex,pi`).
- On `next`, which takes no scope: always the list.
- `--auto` goes wherever `--run` does. It waives the another-round question in
  `next.md` and nothing else.

## Who reviews

A reviewer is `claude`, `codex`, `pi` or `vibe`, that tool's program run
headless; `glm`, which is Codex on the user's own Codex profile `zai` (Z.AI's
GLM models: `zai.config.toml` in Codex's home, with whatever key it names in
the environment), so `codex,glm` reviews on both; or `subagent`. A program may name a model after its first colon
(`pi:zai/glm-5.3:high`; ASCII letters, digits and `._/:-`, not starting with
`-`), and may appear more than once. Never pick reviewers yourself:

1. The list after `--run`.
2. Else the `Reviewers:` line in the Workflow section of the project's
   AGENTS.md (`Reviewers: codex, pi`).
3. Else run `node <this skill's folder>/run.cjs --list`, name the programs it prints, give the notice
   below, and ask which to use. Then offer to save the answer as that line:
   write it only on a yes, adding a `## Workflow` section when there is none.
   No AGENTS.md → don't offer; point to `/braid:standards`. It prints nothing →
   say none is installed, name `--run subagent` where the harness has
   subagents, and leave the round to the user.

`subagent` stands alone and takes no model: hand the prompt to a fresh subagent
that can write files. It names its own result file as the prompt says; relay
its verdict and path. Nothing under Fan out applies to it. No subagents in this
harness (Pi) → say so and leave the round to the user.

Start nothing, say which entry or folder, and leave the round to the user when
the list or the line holds an entry that can't run (an unknown name, a program
`--list` doesn't print, an empty model or one with other characters, `subagent`
beside another entry or with a model), or when the review folder's name holds
anything but ASCII letters, digits and `._-`. `run.cjs` refuses the same and
exits 2.

Leaving the round to the user: give the prompt's path and the line to paste to
a reviewer, `Read <prompt path> and do what it says.`

## Fan out

1. From the working tree's root, `node <this skill's folder>/run.cjs --running
   <review folder>` exits 0 → a fan-out of this review is still running. Say
   so, name the marker file it prints, say the user may delete that file when
   no program of it is really running, and do nothing else. Exit 2 → relay
   what it printed and do nothing else.
2. Run the check in `exposure.md`, unless you came here straight from
   `SKILL.md`'s closing check or `next.md` step 7, which just ran it.
3. Give the notice, before every fan-out: the programs run without approval
   prompts, each in its automatic approval mode where it has one (Claude
   Code, Codex and Vibe decide themselves which actions run; Pi allows all),
   with the user's rights except Codex, which keeps its workspace sandbox,
   and a program may load the project's own agent configuration
   (hooks, extensions, MCP servers) without asking. A sandboxed Codex has its
   own web search; a docs check that needs more lands under its What I could
   not verify.
4. From the working tree's root, run `node <this skill's folder>/run.cjs <review folder> <round>
   <reviewers>` the way this harness runs a long command: in the background
   where the session is woken when it exits (Claude Code), blocking elsewhere,
   with the longest timeout allowed. It starts every program at once with its
   exact result path, stops any still running after 60 minutes, and exits when
   all are done.
5. The session can't keep waiting → say the programs are still running and give
   the command that takes the round up when they finish:
   `/braid:xreview next <review folder> --run <reviewers>`, with `--auto` when
   it was given.
6. When it exits, relay its line for each program: the verdict and path, or
   that it failed, was stopped at the limit, left no result file, or left an
   incomplete one (no closing `Verdict:` line: not a report). Then relay what
   it lists as differing from before the programs started, and its lines on
   what that comparison doesn't cover or didn't compare. Undo nothing on the
   list.
7. Exit 0 → handle the round as `next.md` says, from its step 2, without the
   user asking, keeping the same `--run` and `--auto`. Exit 1 → say no
   reviewer reported, change nothing, and leave the round ready. Any other
   exit (2: it refused and started nothing; it was stopped) → relay what it
   printed, start nothing again, and leave the round to the user.
