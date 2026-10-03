#!/usr/bin/env node
// braid repo check: manifests, skill frontmatter, upstream provenance. Run: node scripts/check.cjs
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

// Manifests: valid JSON, named braid, one shared version.
const manifests = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.zcode-plugin/plugin.json'];
const versions = new Set();
for (const m of manifests) {
  try {
    const j = JSON.parse(read(m));
    if (j.name !== 'braid') fail(`${m}: name must be "braid"`);
    versions.add(j.version);
  } catch (e) {
    fail(`${m}: ${e.message}`);
  }
}
for (const m of ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']) {
  try { JSON.parse(read(m)); } catch (e) { fail(`${m}: ${e.message}`); }
}
if (versions.size > 1) fail(`manifest versions differ: ${[...versions].join(', ')}`);

// Minimal frontmatter reader: `key: value`, quoted values, and `|` / `>` block scalars.
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    if (/^[|>][-+]?$/.test(val)) {
      const block = [];
      while (i + 1 < lines.length && /^(\s+|$)/.test(lines[i + 1])) block.push(lines[++i].trim());
      val = block.join(' ').trim();
    } else {
      val = val.replace(/^(['"])(.*)\1$/, '$2');
    }
    out[key] = val;
  }
  return out;
}

// Skills: ZCode name regex, name matches folder, description limits.
const NAME = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const skillDirs = exists('skills')
  ? fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : [];
for (const dir of skillDirs) {
  const file = `skills/${dir}/SKILL.md`;
  if (!exists(file)) { fail(`${file}: missing`); continue; }
  const fm = frontmatter(read(file));
  if (!fm) { fail(`${file}: no frontmatter`); continue; }
  if (!NAME.test(fm.name || '')) fail(`${file}: bad name "${fm.name}"`);
  if (fm.name !== dir) fail(`${file}: name "${fm.name}" != folder "${dir}"`);
  const desc = fm.description || '';
  if (!desc) fail(`${file}: missing description`);
  if (desc.length > 1024) fail(`${file}: description ${desc.length} > 1024 chars`);
  const modelInvocable = fm['disable-model-invocation'] !== 'true';
  if (modelInvocable && desc.length > 300) fail(`${file}: model-invocable description ${desc.length} > 300 chars`);
}

// UPSTREAM.md rows point at real skills; vendored ones carry their LICENSE.
const rows = read('UPSTREAM.md').split(/\r?\n/).filter((l) => /^\|\s*`?[a-z0-9]/.test(l));
for (const row of rows) {
  const [skill, kind] = row.split('|').slice(1).map((c) => c.trim().replace(/`/g, ''));
  if (!exists(`skills/${skill}/SKILL.md`)) fail(`UPSTREAM.md: skills/${skill} does not exist`);
  if (!['vendored', 'derived', 'clean-room'].includes(kind)) fail(`UPSTREAM.md: ${skill} has unknown kind "${kind}"`);
  if (kind === 'vendored' && !exists(`skills/${skill}/LICENSE`)) fail(`skills/${skill}: vendored without LICENSE`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${manifests.length} manifests, ${skillDirs.length} skills, ${rows.length} upstream rows`);
