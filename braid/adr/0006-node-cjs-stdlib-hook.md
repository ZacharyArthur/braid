# One stdlib-only .cjs hook script; Node is the only runtime

All hook logic is `hooks/braid.cjs`, Node stdlib only, no package.json. `.cjs` because a parent `package.json` with `"type": "module"` (common on work machines) breaks `require()` in a `.js` file. One Node script beats parallel PowerShell and bash versions (logic written twice). The script never blocks: Windows can swallow hook stdin, so a ref'd 1 s timer finishes with defaults. Without Node, every hook call fails (the harness shows the shell's "node not found" error) and the core skill's broad description is the fallback.
