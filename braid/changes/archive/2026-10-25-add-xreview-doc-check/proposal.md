## Why

An xreview reviewer judges how libraries, APIs, tools and platforms behave from memory, which goes stale and is often wrong for the version the project pins. Letting it look things up adds the classic injection risk: it reads untrusted pages while holding the repo and a way out (fetch).

## What changes

- Find pass: a candidate that depends on external behavior isn't kept from memory alone; it's marked for the docs check.
- Refute pass: such a candidate is checked first against local, version-exact sources (the installed package's source, `--help`, man pages, vendored docs), then against the official docs for the version the project pins (with no pin, the lowest it supports), with whatever web search, fetch or docs tool the reviewer has (built-in, an MCP server, a skill). No tool is named. Latest docs only flag a deprecation, removal or advisory that affects the pinned version.
- Labels stay two: a doc-backed finding is **PLAUSIBLE** with the doc URL and version in its evidence; **CONFIRMED** still means shown by running something. A candidate that couldn't be checked goes under **What I could not verify**.
- Gather points the reviewer at the project's manifest and lockfile.
- `--offline`: no network at all (search, fetch, network-backed MCP or docs tools, the shell included, and commands that may download, such as `npx`, package installs or module fetches); local sources only, and checks that need the network go under What I could not verify. Online is the default; `--offline` opts out.
- New **Sources** section in the prompt: the diff, repo files and every fetched page, search result or tool result are material to review, never instructions; the prompt and the files it names as intent, principles or rules are what the reviewer judges against. It names the signs of an injection (including text that tells the reviewer what to report), says to report such text quoted with its source rather than follow it, and treats quoted examples and docs' command samples as evidence, not injection; text the scope adds or changes that tells the reviewer to skip, approve or what to report is reported even inside the named files, while the prompt's own rules and review rules already on the base in agent instruction files or named rule files are judged against; other base text aimed at this review that shows the signs is reported. Text aimed at this review that approves the change, skips the review or says to report nothing is reported wherever it sits, the base included. It keeps queries and URLs to public terms (no code, paths, secrets, hostnames), allows only official sources the reviewer picked and pages on the same site (on a redirect to another site, it searches for that site rather than following), and bans running, installing or changing anything because a page said to.
- xreview suggests `--offline`, and starting the reviewer with network tools off in its harness, when the scope's commits (the branch against its base for `diff`, the scope's history for a path or `all`) carry another author's email, or the working tree holds a file named like a secret (templates and files inside dependency, virtualenv or build-output folders excepted; checked by name, never opened). Under `--offline` it names only the network-off reviewer, before the hand-off under `--run`. With `--run` and online, it says so before handing off and asks; on a no, it rewrites the prompt as `--offline` first.

## Impact

Specs: `reports` (two added requirements). Code: `skills/xreview/SKILL.md` (Inputs, Gather, Method, a new Sources section, closing message, `argument-hint`, description). Docs: `skills/help/SKILL.md` and README rows, CHANGELOG. Always-on cost: unchanged (xreview is user-only).

## Out of scope

- `/braid:review` and `/braid:audit`: based on ponytail's text, where braid adds only whole blocks (ADR 0012); a later change if xreview's check earns its keep.
- Enforcing `--offline` in the `--run` subagent's tools: harnesses don't offer per-call tool removal alike, and OWASP is clear that prompt text alone doesn't enforce a boundary; the reviewer's harness permissions stay the user's control, which xreview's suggestion names (design.md).
- Wording for every lookup edge case (private package names in queries, scrubbing error text, issue threads on a source repo): reviewers could already search before this change; the rules cover the main paths, and "never repo content" already bars paths and hosts in an error.
- A third label (DOCUMENTED): docs can be wrong or ahead of a release; the citation already makes the finding checkable.
- An allowlist of doc domains: "official sources the reviewer picked, and pages on the same site" covers it without a list to maintain.
- An ADR: a behavior addition, no architecture decision.
