## Why

The `braid-context` band doesn't say which git branch the session is on, though the spec workflow keeps each change on its own branch. And in a long session the cache countdown switches from 1h to 5m and stays there, while the cache is still 1h: the TTL comes from the transcript, which the mod can't read once it passes 4 MiB (`$.fs.read` rejects), and a compaction or resume clears the TTL it last read, so it falls back to the account guess. A 7 MB transcript shows 724 cache writes, all 1h, and one compaction. Another shows the TTL can change mid-session: 75 minutes of 5m writes between 1h ones (usage overage), so a TTL remembered from earlier can be wrong too.

## What changes

- The band shows the checked-out branch as `git <branch>`, after braid's level and before the active change, or at the end when braid is off or absent. Nothing shows when HEAD is detached, outside a repository, or when git is missing. Read with `git branch --show-current` when braid's state is read: at session start, on each prompt, and at each turn's end.
- The active change becomes its own segment of the band, so the branch sits between it and braid's level.
- Fix: when `$.fs.read` refuses the transcript, the mod reads its last MiB with a child process (`$.process.run`, whose output is cut at 4 MiB rather than refused): `tail -c`, or on Windows, which has no `tail` on its PATH, a PowerShell one-liner that seeks to the end. Byte-identical to `tail -c` on a 7 MB transcript; 0.8–3 s per run on Windows on ARM, at the turn's end only, off the prompt's path, and the countdown runs from the request's send time anyway. Works for sessions already past 4 MiB and follows a switch between 1h and 5m. Rejected: keeping each session's TTL in `$.store`, which misses sessions already past the limit, freezes a TTL that changed, and grows a key per session.
- Both rest on `$.process`, which the mod API marks "CLI only". The Claude app's local Code sessions run the Claude Code CLI itself (checked: its `claude-code/<version>/claude.exe --output-format stream-json` children), so the band gets it there too. Where a host lacks it, the calls fail, are caught, and the band behaves as before this change.
- Mod version 0.1.2 → 0.1.3; CHANGELOG entry under Unreleased.

## Impact

Spec `mods`, requirement "Context band": the branch in its sentence, two scenarios added. Code: `mods/braid-context/hooks/register.tsx`, its test, its `types/index.d.ts`; the mod's marketplace entry; `CHANGELOG.md`. No change to braid itself, its version, budget or the other harnesses.

## Out of scope

- Ahead/behind counts or a dirty marker: not asked for, and each costs another git call per refresh.
- Watching for a branch switched outside the session between prompts: it shows on the next prompt or turn end.
- A last line longer than 1 MiB leaves the TTL read before it (or the account guess): rare, and reading more costs more per turn.
