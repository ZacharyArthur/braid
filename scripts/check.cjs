#!/usr/bin/env node
// braid repo check: manifests, hooks.json, skill frontmatter, hook behavior, always-on budget, provenance and licenses.
// Run: node scripts/check.cjs
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
const version = [...versions][0];
if (!/^\d+\.\d+\.\d+$/.test(version || '')) fail(`manifest version "${version}" is not x.y.z`);
else if (!read('CHANGELOG.md').includes(`## [${version}]`)) fail(`CHANGELOG.md: no "## [${version}]" entry for the manifest version`);

// Paths a manifest points at must exist (Claude Code and ZCode use the defaults: skills/, hooks/hooks.json).
const codex = (() => { try { return JSON.parse(read('.codex-plugin/plugin.json')); } catch { return {}; } })();
for (const key of ['skills', 'hooks']) if (!codex[key] || !exists(codex[key])) fail(`.codex-plugin/plugin.json: ${key} "${codex[key]}" does not exist`);

// hooks/hooks.json is what every harness actually loads: each event must run this hook with its argument.
try {
  const { hooks } = JSON.parse(read('hooks/hooks.json'));
  for (const [event, arg] of [['SessionStart', 'session'], ['UserPromptSubmit', 'prompt'], ['SubagentStart', 'subagent']]) {
    const runs = (g) => (g.hooks || []).some((h) => h.type === 'command' && h.command === `node "\${CLAUDE_PLUGIN_ROOT}/hooks/braid.cjs" ${arg}` && h.timeout > 0 && h.timeout <= 10);
    const groups = (hooks[event] || []).filter(runs);
    if (!groups.length) fail(`hooks/hooks.json: ${event} must run node "\${CLAUDE_PLUGIN_ROOT}/hooks/braid.cjs" ${arg} with a timeout of 1-10 s`);
    // The group running the session hook must fire for every session source (matchers are regexes).
    if (event === 'SessionStart') {
      const fires = (src) => groups.some((g) => { if (!g.matcher || g.matcher === '*') return true; try { return new RegExp(`^(?:${g.matcher})$`).test(src); } catch { return false; } });
      for (const src of ['startup', 'resume', 'clear', 'compact']) if (!fires(src)) fail(`hooks/hooks.json: SessionStart hook does not fire on "${src}"`);
    }
  }
} catch (e) {
  fail(`hooks/hooks.json: ${e.message}`);
}

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
  // User-only skills: Codex needs the policy file, ZCode (no flag) needs the description to say so.
  if (!modelInvocable) {
    const yaml = `skills/${dir}/agents/openai.yaml`;
    if (!exists(yaml) || !/allow_implicit_invocation:\s*false/.test(read(yaml))) fail(`${yaml}: user-only skill needs allow_implicit_invocation: false`);
    if (!desc.includes('Only when the user explicitly invokes it.')) fail(`${file}: user-only description must say "Only when the user explicitly invokes it."`);
  }
}

// Hook smoke test, run from a copy under a `"type": "module"` package.json: the
// .cjs extension must keep it CommonJS. Walks level switching, drift, pointers, off.
const { execFileSync } = require('node:child_process');
const os = require('node:os');
let alwaysOn = 0;
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'braid-check-'));
  try {
    const plugin = path.join(tmp, 'esm', 'plugin');
    fs.mkdirSync(plugin, { recursive: true });
    fs.writeFileSync(path.join(tmp, 'esm', 'package.json'), '{"type":"module"}');
    fs.cpSync(path.join(root, 'hooks'), path.join(plugin, 'hooks'), { recursive: true });
    fs.cpSync(path.join(root, 'skills'), path.join(plugin, 'skills'), { recursive: true });
    // A project with every pointer present: active change, open route, map, handoff.
    const proj = path.join(tmp, 'proj', 'braid');
    fs.mkdirSync(path.join(proj, 'changes', 'add-x'), { recursive: true });
    fs.mkdirSync(path.join(proj, 'routes'), { recursive: true });
    fs.writeFileSync(path.join(proj, 'changes', 'add-x', 'tasks.md'), '- [x] one\n- [ ] two\n');
    fs.mkdirSync(path.join(proj, 'changes', 'fix-y'));
    fs.writeFileSync(path.join(proj, 'changes', 'fix-y', 'proposal.md'), '## Why\n');
    fs.writeFileSync(path.join(proj, 'routes', 'v1.md'), '## Open\n- [ ] pick a db\n');
    fs.writeFileSync(path.join(proj, 'map.md'), '<!-- braid:map sha=abc1234 -->\n');
    fs.writeFileSync(path.join(proj, 'HANDOFF.md'), '<!-- braid:handoff sha=abc1234 -->\n');

    const hook = (event, input) => {
      const out = execFileSync(process.execPath, [path.join(plugin, 'hooks', 'braid.cjs'), event], {
        input: JSON.stringify({ session_id: 'check', cwd: path.dirname(proj), ...input }),
        env: { ...process.env, CLAUDE_PLUGIN_DATA: path.join(tmp, 'data') },
      }).toString();
      return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
    };
    const expect = (cond, msg) => { if (!cond) fail(`hook: ${msg}`); };

    const start = hook('session', { source: 'startup' });
    expect(start.includes('BRAID ACTIVE — level: full'), 'default level is not full');
    expect(start.includes('**full**') && !start.includes('**lite**'), 'level table not filtered');
    expect(start.includes('Active change: braid/changes/add-x (1/2 tasks).'), 'active change pointer missing or includes queued');
    expect(start.includes('Queued proposals: braid/changes/fix-y.'), 'queued proposal pointer missing');
    // An OpenSpec project (no braid/ folder): its changes get the same pointer.
    const ospec = path.join(tmp, 'ospec', 'openspec', 'changes', 'add-z');
    fs.mkdirSync(ospec, { recursive: true });
    fs.writeFileSync(path.join(ospec, 'tasks.md'), '## 1. Do\n- [ ] 1.1 one\n');
    expect(hook('session', { source: 'startup', cwd: path.join(tmp, 'ospec') }).includes('Active change: openspec/changes/add-z (0/1 tasks).'), 'OpenSpec change pointer missing');
    expect(start.includes('v1 (1 open)'), 'route pointer missing');
    expect(start.includes('braid/map.md (built at abc1234') && start.includes('HANDOFF.md (written at'), 'map/handoff pointer missing');
    expect(hook('prompt', { prompt: '/braid:braid lite' }).includes('BRAID LEVEL: lite'), 'level switch not confirmed');
    expect(hook('session', { source: 'compact' }).includes('level: lite'), 'level lost across compaction');
    expect(hook('subagent', {}).includes('level: lite'), 'subagent not injected');
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'drift reminder on by default');
    hook('prompt', { prompt: '/braid:braid drift on' });
    expect(hook('prompt', { prompt: 'fix the bug' }).startsWith('braid: lite'), 'drift reminder missing');
    // ZCode's skill picker delivers commands as raw "[$braid](<path>) args" links.
    hook('prompt', { prompt: '[$braid](C:\\x\\skills\\braid\\SKILL.md) drift off' });
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'ZCode picker link form not parsed');
    hook('prompt', { prompt: '/braid:braid drift on' });
    expect(hook('prompt', { prompt: '/braid:spec propose' }) === 'braid: lite · YAGNI > KISS > DRY · ladder first · done means verified', 'other braid skills misread as level commands');
    hook('prompt', { prompt: 'stop braid' });
    expect(hook('session', { source: 'compact' }) === '', 'still injecting after "stop braid"');

    // No session id: nothing is shared between id-less sessions, so one can't switch another off.
    hook('prompt', { session_id: undefined, prompt: 'stop braid' });
    expect(hook('session', { session_id: undefined, source: 'startup' }).includes('level: full'), 'id-less sessions share state');
    // A state file with invalid fields falls back field by field.
    fs.mkdirSync(path.join(tmp, 'data', 'sessions'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'data', 'sessions', 'bad.json'), '{"mode":"bogus","adhd":"false","drift":1}');
    const bad = hook('session', { session_id: 'bad', source: 'startup' });
    expect(bad.includes('level: full') && !bad.includes('ADHD'), 'invalid state fields not rejected');
    // A busy repo: pointer lines stay capped (a few names, then "and N more").
    const busy = path.join(tmp, 'busy', 'braid', 'changes');
    for (let i = 0; i < 40; i++) {
      fs.mkdirSync(path.join(busy, `change-${i}`), { recursive: true });
      if (i % 2) fs.writeFileSync(path.join(busy, `change-${i}`, 'tasks.md'), '- [ ] t\n');
    }
    const busyOut = hook('session', { session_id: 'busy', source: 'startup', cwd: path.join(tmp, 'busy') });
    const pointerLines = busyOut.slice(busyOut.indexOf('## Project state')).split('\n').filter((l) => l.startsWith('- '));
    expect(pointerLines.length <= 5 && pointerLines.every((l) => l.length <= 300) && busyOut.includes('and 17 more'), `pointer lines not capped: ${pointerLines.map((l) => l.length)}`);

    // The budget is measured on the worst case: every pointer present, every list full, and
    // names far past the clip length in 3-byte characters (braid/ and openspec/ changes both).
    const worst = path.join(tmp, 'worst');
    const long = (i) => `${i}-${'漢'.repeat(80)}`;
    for (let i = 0; i < 4; i++) {
      for (const root of ['braid', 'openspec']) {
        fs.mkdirSync(path.join(worst, root, 'changes', long(i)), { recursive: true });
        fs.writeFileSync(path.join(worst, root, 'changes', long(i), 'tasks.md'), '- [ ] t\n');
        fs.mkdirSync(path.join(worst, root, 'changes', `q${long(i)}`));
      }
      fs.mkdirSync(path.join(worst, 'braid', 'routes'), { recursive: true });
      fs.writeFileSync(path.join(worst, 'braid', 'routes', `${long(i)}.md`), '- [ ] open\n');
    }
    fs.writeFileSync(path.join(worst, 'braid', 'map.md'), '<!-- braid:map sha=abc1234 -->\n');
    fs.writeFileSync(path.join(worst, 'braid', 'HANDOFF.md'), '<!-- braid:handoff sha=abc1234 -->\n');
    const worstOut = hook('session', { session_id: 'worst', source: 'startup', cwd: worst });
    expect(worstOut.includes('…') && worstOut.includes('Handoff:'), 'worst-case fixture not exercised');
    alwaysOn += Buffer.byteLength(worstOut);

    // Windows can swallow a hook's stdin so it never closes: the hook must still answer and exit
    // well inside the harness's 5 s timeout. A child keeps the pipe open and times the hook.
    const probe = execFileSync(process.execPath, ['-e', `
      const c = require('node:child_process').spawn(process.execPath, [process.argv[1], 'session'], { stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, CLAUDE_PLUGIN_DATA: process.argv[2] } });
      let out = ''; const t = Date.now();
      c.stdout.on('data', (d) => { out += d; });
      c.on('exit', () => { console.log(JSON.stringify({ ms: Date.now() - t, bytes: out.length })); process.exit(0); });
      setTimeout(() => { console.log(JSON.stringify({ ms: -1 })); c.kill(); process.exit(0); }, 4000);`,
      path.join(plugin, 'hooks', 'braid.cjs'), path.join(tmp, 'data')]).toString();
    const { ms, bytes } = JSON.parse(probe);
    expect(ms >= 0 && ms < 3000 && bytes > 0, `hook with open stdin: ${ms < 0 ? 'still running after 4 s' : `${ms} ms, ${bytes} bytes`}`);
  } catch (e) {
    fail(`hook: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// Always-on budget: worst-case session injection + model-invocable skill descriptions, bytes/4.
for (const dir of skillDirs) {
  const fm = exists(`skills/${dir}/SKILL.md`) && frontmatter(read(`skills/${dir}/SKILL.md`));
  if (fm && fm['disable-model-invocation'] !== 'true') alwaysOn += (fm.name + fm.description).length;
}
const tokens = Math.round(alwaysOn / 4);
if (tokens > 2500) fail(`always-on budget ~${tokens} tokens > 2500`);

// UPSTREAM.md: one row per skill; vendored ones carry their LICENSE, derived ones' upstream
// notice (copyright line and permission text, not just a link) is in THIRD-PARTY-NOTICES.
const notices = exists('THIRD-PARTY-NOTICES') ? read('THIRD-PARTY-NOTICES').split(/^---$/m) : [];
const hasNotice = (repo) => notices.some((s) => s.includes(`https://github.com/${repo}`) && /^Copyright \(c\) \d{4} \S/m.test(s) && s.includes('Permission is hereby granted'));
const rows = read('UPSTREAM.md').split(/\r?\n/).filter((l) => /^\|\s*`?[a-z0-9]/.test(l));
const rowSkills = rows.map((r) => r.split('|')[1].trim().replace(/`/g, ''));
for (const dir of skillDirs) if (!rowSkills.includes(dir)) fail(`UPSTREAM.md: no row for skills/${dir}`);
for (const row of rows) {
  const [skill, kind, repo] = row.split('|').slice(1).map((c) => c.trim().replace(/`/g, ''));
  if (kind === 'derived' && !hasNotice(repo)) fail(`THIRD-PARTY-NOTICES: derived from ${repo} but carries no copyright notice for it`);
  if (!exists(`skills/${skill}/SKILL.md`)) fail(`UPSTREAM.md: skills/${skill} does not exist`);
  if (!['vendored', 'derived', 'clean-room'].includes(kind)) fail(`UPSTREAM.md: ${skill} has unknown kind "${kind}"`);
  if (kind === 'vendored' && !exists(`skills/${skill}/LICENSE`)) fail(`skills/${skill}: vendored without LICENSE`);
  // braid's own skills stay small: each markdown file ≤ ~2k tokens.
  if (kind !== 'vendored' && exists(`skills/${skill}`)) {
    for (const f of fs.readdirSync(path.join(root, 'skills', skill)).filter((f) => f.endsWith('.md'))) {
      const size = fs.statSync(path.join(root, 'skills', skill, f)).size;
      if (size > 8000) fail(`skills/${skill}/${f}: ${size} bytes > 8000 (~2k tokens)`);
    }
  }
}

if (errors.length) {
  console.error([...new Set(errors)].map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${manifests.length} manifests, ${skillDirs.length} skills, ${rows.length} upstream rows, hook ok, always-on ~${tokens} tokens`);
