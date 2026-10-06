#!/usr/bin/env node
// Upstream drift: for each UPSTREAM.md row with a SHA, how far upstream has moved and what changed under its path.
// Read-only. Needs the GitHub CLI (gh), signed in. Run: node scripts/upstream.cjs [skill ...]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const only = process.argv.slice(2);
const rows = fs
  .readFileSync(path.join(__dirname, '..', 'UPSTREAM.md'), 'utf8')
  .split(/\r?\n/)
  .filter((l) => /^\|\s*`?[a-z0-9]/.test(l))
  .map((l) =>
    l
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim().replace(/`/g, '')),
  )
  .filter(([skill, , , , sha]) => /^[0-9a-f]{40}$/.test(sha) && (!only.length || only.includes(skill)));

// One compare per repo@sha: several rows share a pin.
const cache = new Map();
function compare(repo, sha) {
  const key = `${repo}@${sha}`;
  if (!cache.has(key)) {
    try {
      const out = execFileSync(
        'gh',
        [
          'api',
          `repos/${repo}/compare/${sha}...HEAD`,
          '--jq',
          '{ahead: .ahead_by, files: [.files[] | {name: .filename, prev: .previous_filename, status, add: .additions, del: .deletions}]}',
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      cache.set(key, JSON.parse(out));
    } catch (e) {
      cache.set(key, new Error((e.stderr || e.message).trim()));
    }
  }
  return cache.get(key);
}

const unpinned = only.filter((s) => !rows.some(([skill]) => skill === s));
if (unpinned.length) {
  console.log(`No pinned row for: ${unpinned.join(', ')}`);
  process.exitCode = 1;
} else if (!rows.length) console.log('No pinned rows in UPSTREAM.md');
for (const [skill, kind, repo, paths, sha] of rows) {
  const head = `${skill} (${kind}${kind === 'clean-room' ? ', ideas only' : ''}) ${repo}@${sha.slice(0, 7)}`;
  const res = compare(repo, sha);
  if (res instanceof Error) {
    console.log(`✗ ${head}: ${res.message}`);
    process.exitCode = 1;
    continue;
  }
  // Path cell: comma-separated files or folders; parenthesised notes like "(minus X)" are dropped.
  const prefixes = paths
    .replace(/\(.*?\)/g, '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  // A rename counts when either end is under the path: a moved folder is something to read.
  const inPath = (name) => !!name && prefixes.some((p) => name === p || name.startsWith(p.replace(/\/?$/, '/')));
  const under = res.files.filter((f) => inPath(f.name) || inPath(f.prev));
  if (!res.ahead) {
    console.log(`✓ ${head}: up to date`);
    continue;
  }
  console.log(
    `${under.length ? '●' : '○'} ${head}: ${res.ahead} commits ahead, ${under.length} files changed under ${prefixes.join(', ')}`,
  );
  for (const f of under) console.log(`    ${f.status} ${f.prev ? `${f.prev} → ` : ''}${f.name} +${f.add} -${f.del}`);
  // GitHub's compare lists at most 300 files.
  if (res.files.length >= 300) console.log('    (compare capped at 300 files: check the path by hand)');
}
