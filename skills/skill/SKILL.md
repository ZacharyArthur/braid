---
name: skill
description: "Create a new agent skill that stays small and triggers right: interview, minimal SKILL.md, frontmatter checks for Claude Code, Codex, ZCode and Pi, a test run in a fresh context, and evals against a baseline on request. Only when the user explicitly invokes it."
disable-model-invocation: true
argument-hint: "[what the skill should do]"
license: MIT
---

A skill is a prompt the agent loads on demand. The model already knows how to
code, write and follow a format; a skill adds only what it lacks: this team's
process, its conventions, the traps, and what to hand back. The smallest skill
that reliably changes behavior wins.

**Heavy path:** the user wants evals against a baseline, benchmarks, or
description-trigger tuning.

- They name or prefer Anthropic's `skill-creator` and it is installed
  (`/skill-creator`, `anthropic-skills:skill-creator`) → hand off, then run §4
  on what it produced, so the skill works in every harness. Not installed →
  say so, then the path below.
- They name Codex's `$skill-creator` → it creates and edits but runs no evals:
  say so and offer the path below.
- Otherwise → steps 1-4 here (an existing skill: step 4 only), then
  [evals.md](evals.md) in place of step 5.

## 1. Should it exist?

- A one-off task → just do it.
- A few lines true for every task in this repo → `AGENTS.md`, not a skill.
- An existing skill nearly covers it → extend that one.
- Unsure the model needs help → run one real task without a skill in a fresh
  context first; the skill covers only what went wrong.
- The conversation already holds the workflow ("turn this into a skill") →
  mine it first: steps, tools, the user's corrections, the output format.

## 2. Interview

Grill a round at a time (`braid:grilling`), with a recommended answer for each
question. Settle:

- **Job and deliverable**: what it produces, and what done looks like.
- **Trigger**: user-only (they type the command) or model-invoked (loads when a
  prompt matches). The phrases that should load it, and near-misses that shouldn't.
- **Inputs**: arguments, files it reads.
- **Harnesses and home**: where it runs and where it lives. A plugin's
  `skills/`; Claude Code `.claude/skills/` (project) or `~/.claude/skills/`;
  Codex `.agents/skills/` (repo) or `~/.agents/skills/`; Pi `.pi/skills/` or
  `~/.pi/agent/skills/`, and Codex's folders too.
- **Freedom**: judgment calls get prose; fragile, exact sequences get an exact
  command or a bundled script.

The repo has `CONTRIBUTING.md` or `AGENTS.md` rules for adding a skill → they
win where they differ from this file.

## 3. Draft

`<name>/SKILL.md`, plus files only when earned:

```markdown
---
name: <name>
description: "<what it does>. Use when <triggers>."
argument-hint: "[args]"           # optional, shown in the command menu
disable-model-invocation: true    # user-only skills
---

<one paragraph: what this is for and why it exists>

## <steps, in order>
## <output format or template>
## <gotchas: facts that defy a reasonable guess, if any>
## <boundaries: what it never does>
```

Write it like this:

- **Description is the trigger.** Third person; what it does, then "Use when"
  with the words a user would actually say. It's the only part the model sees
  before loading the skill. User-only skills: just say what it does.
- **Only what the model lacks.** Cut every sentence it would get right unprompted.
- **Why over MUST.** One clause of reason generalizes; capital letters don't.
- **One default per choice**, with an escape hatch: "Use X; for Y, use Z."
- **Steps for multi-step work**, with a check-and-fix loop where errors are likely.
- **A template when output shape matters**; one concrete example beats a description.
- **One term per concept**, nothing dated ("before March, use..."), forward
  slashes in paths.
- **Size**: aim for a page; over ~150 lines, move detail to sibling files
  linked straight from SKILL.md, one level deep, each saying when to read it.
- **Scripts**: deterministic work gets a script the skill runs, not code the
  model regenerates each time. Name its dependencies; handle its errors.

## 4. Check

Fix and recheck until every line holds:

- [ ] `name` matches the folder: lowercase, digits, hyphens, ≤ 64 chars, no
      `--`, no leading or trailing hyphen, not containing `claude` or `anthropic`.
- [ ] `description` non-empty, ≤ 1024 chars; ≤ 300 if model-invoked (it's in
      context every session); no `<tag>`-like text (claude.ai's sync rejects it).
- [ ] User-only: `disable-model-invocation: true` (Claude Code, Pi);
      `agents/openai.yaml` with `policy: allow_implicit_invocation: false`
      (Codex); description ends "Only when the user explicitly invokes it."
      (ZCode has no flag, so the wording is the only guard).
- [ ] Every file SKILL.md links to exists; nothing in the folder is unlinked.
- [ ] Read it cold: could a fresh agent run it with no other context?

Codex metadata, user-only or not:

```yaml
interface:
  display_name: "<Title>"
  short_description: "<under 60 chars>"
policy:
  allow_implicit_invocation: false   # user-only skills only
```

## 5. Test

1. Write 2-3 prompts a real user would send, including one that should *not*
   trigger a model-invoked skill.
2. Hand one prompt and the skill's path to a fresh subagent, when the harness
   has them: "Read `<path>/SKILL.md`, then do: `<prompt>`. Report what you did
   and anything unclear." No subagent (Pi) → ask the user to run it in a
   new session, where they watch each step (Pi asks no approval before a tool
   call).
3. Read what it did. A step skipped or misread → that line is unclear; rewrite
   it, don't add a louder one. Rerun once.

## Done

Report the path, how to invoke it in each harness (`/<name>` or
`/<plugin>:<name>` in Claude Code and ZCode, `$<name>` in Codex,
`/skill:<name>` in Pi), what the test run
showed, and the repo's checks if it has any. In the braid repo:
`node scripts/check.cjs`.
