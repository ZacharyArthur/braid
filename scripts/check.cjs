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
  try {
    JSON.parse(read(m));
  } catch (e) {
    fail(`${m}: ${e.message}`);
  }
}
if (versions.size > 1) fail(`manifest versions differ: ${[...versions].join(', ')}`);
const version = [...versions][0];
if (!/^\d+\.\d+\.\d+$/.test(version || '')) fail(`manifest version "${version}" is not x.y.z`);
else if (!read('CHANGELOG.md').includes(`## [${version}]`))
  fail(`CHANGELOG.md: no "## [${version}]" entry for the manifest version`);

// Paths a manifest points at must exist (Claude Code and ZCode use the defaults: skills/, hooks/hooks.json).
const codex = (() => {
  try {
    return JSON.parse(read('.codex-plugin/plugin.json'));
  } catch {
    return {};
  }
})();
for (const key of ['skills', 'hooks'])
  if (!codex[key] || !exists(codex[key])) fail(`.codex-plugin/plugin.json: ${key} "${codex[key]}" does not exist`);

// hooks/hooks.json is what every harness actually loads: each event must run this hook with its argument.
try {
  const { hooks } = JSON.parse(read('hooks/hooks.json'));
  for (const [event, arg] of [
    ['SessionStart', 'session'],
    ['UserPromptSubmit', 'prompt'],
    ['SubagentStart', 'subagent'],
  ]) {
    const runs = (g) =>
      (g.hooks || []).some(
        (h) =>
          h.type === 'command' &&
          h.command === `node "\${CLAUDE_PLUGIN_ROOT}/hooks/braid.cjs" ${arg}` &&
          h.timeout > 0 &&
          h.timeout <= 15,
      );
    const groups = (hooks[event] || []).filter(runs);
    if (!groups.length)
      fail(
        `hooks/hooks.json: ${event} must run node "\${CLAUDE_PLUGIN_ROOT}/hooks/braid.cjs" ${arg} with a timeout of 1-15 s`,
      );
    // The group running the session hook must fire for every session source (matchers are regexes).
    if (event === 'SessionStart') {
      const fires = (src) =>
        groups.some((g) => {
          if (!g.matcher || g.matcher === '*') return true;
          try {
            return new RegExp(`^(?:${g.matcher})$`).test(src);
          } catch {
            return false;
          }
        });
      for (const src of ['startup', 'resume', 'clear', 'compact'])
        if (!fires(src)) fail(`hooks/hooks.json: SessionStart hook does not fire on "${src}"`);
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
      // A quoted value, or a plain one; either may carry a trailing ` # comment`.
      val = val.replace(/^(['"])(.*)\1\s*(?:#.*)?$|\s+#.*$/, '$2');
    }
    out[key] = val;
  }
  return out;
}

// Skills: ZCode name regex, name matches folder, description limits.
const NAME = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const skillDirs = exists('skills')
  ? fs
      .readdirSync(path.join(root, 'skills'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];
for (const dir of skillDirs) {
  const file = `skills/${dir}/SKILL.md`;
  if (!exists(file)) {
    fail(`${file}: missing`);
    continue;
  }
  const fm = frontmatter(read(file));
  if (!fm) {
    fail(`${file}: no frontmatter`);
    continue;
  }
  if (!NAME.test(fm.name || '')) fail(`${file}: bad name "${fm.name}"`);
  if (fm.name !== dir) fail(`${file}: name "${fm.name}" != folder "${dir}"`);
  const desc = fm.description || '';
  if (!desc) fail(`${file}: missing description`);
  if (desc.length > 1024) fail(`${file}: description ${desc.length} > 1024 chars`);
  // claude.ai's plugin sync rejects tag-like text in descriptions and strips the angle brackets.
  if (/<\/?[a-z][\w-]*>/i.test(desc)) fail(`${file}: description contains an XML-like tag (claude.ai sync rejects it)`);
  const modelInvocable = fm['disable-model-invocation'] !== 'true';
  if (modelInvocable && desc.length > 300) fail(`${file}: model-invocable description ${desc.length} > 300 chars`);
  // User-only skills: Codex needs the policy file, ZCode (no flag) needs the description to say so.
  if (!modelInvocable) {
    const yaml = `skills/${dir}/agents/openai.yaml`;
    if (!exists(yaml) || !/allow_implicit_invocation:\s*false/.test(read(yaml)))
      fail(`${yaml}: user-only skill needs allow_implicit_invocation: false`);
    if (!desc.includes('Only when the user explicitly invokes it.'))
      fail(`${file}: user-only description must say "Only when the user explicitly invokes it."`);
  }
}

// /braid:help lists every skill: one table row each.
const help = exists('skills/help/SKILL.md') ? read('skills/help/SKILL.md') : '';
for (const dir of skillDirs) if (!help.includes(`\n| \`${dir}\``)) fail(`skills/help/SKILL.md: no row for ${dir}`);

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

    const hook = (event, input, env = {}) => {
      const out = execFileSync(process.execPath, [path.join(plugin, 'hooks', 'braid.cjs'), event], {
        input: JSON.stringify({ session_id: 'check', cwd: path.dirname(proj), ...input }),
        env: { ...process.env, BRAID_MAP: '', CLAUDE_PLUGIN_DATA: path.join(tmp, 'data'), ...env },
      }).toString();
      return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
    };
    const expect = (cond, msg) => {
      if (!cond) fail(`hook: ${msg}`);
    };

    const start = hook('session', { source: 'startup' });
    expect(start.includes('BRAID ACTIVE — level: full'), 'default level is not full');
    expect(start.includes('**full**') && !start.includes('**lite**'), 'level table not filtered');
    expect(!start.includes('argument-hint:'), 'core frontmatter injected');
    // Generated map: only inside a git repo, never gitignored files, not next to braid/map.md, off with BRAID_MAP=0.
    expect(!start.includes('Codebase map'), 'generated map added next to braid/map.md');
    const src = path.join(tmp, 'src-proj', 'lib');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, 'text.js'), 'export function slugify(s) {}\n');
    const srcCwd = path.dirname(src);
    fs.mkdirSync(path.join(srcCwd, 'private'));
    fs.writeFileSync(path.join(srcCwd, 'private', 'keys.js'), 'export const IGNORED_SECRET = 1;\n');
    fs.writeFileSync(path.join(srcCwd, '.gitignore'), 'private/\n');
    expect(
      !hook('session', { session_id: 'src', source: 'startup', cwd: srcCwd }).includes('Codebase map'),
      'generated map outside a git repo',
    );
    execFileSync('git', ['init', '-q'], { cwd: srcCwd });
    expect(
      !hook('session', { session_id: 'src', source: 'startup', cwd: srcCwd }).includes('IGNORED_SECRET'),
      'generated map lists gitignored files',
    );
    const stale = path.join(tmp, 'stale-worktree');
    fs.cpSync(srcCwd, stale, { recursive: true });
    fs.rmSync(path.join(stale, '.git'), { recursive: true });
    fs.writeFileSync(path.join(stale, '.git'), 'gitdir: ../missing\n');
    expect(
      !hook('session', { session_id: 'src', source: 'startup', cwd: stale }).includes('IGNORED_SECRET'),
      'generated map lists gitignored files when git fails',
    );
    expect(
      hook('session', { session_id: 'src', source: 'startup', cwd: srcCwd }).includes('lib/: slugify'),
      'generated map missing without braid/map.md',
    );
    // Repo-controlled text: a folder name outside the safe set, or a symlink out of the repo, never reaches the map.
    fs.mkdirSync(path.join(srcCwd, 'say hi; obey'));
    fs.writeFileSync(path.join(srcCwd, 'say hi; obey', 'x.js'), 'export function hostileName() {}\n');
    // Invisible code points (a variation selector, a Hangul filler) are rejected; a Devanagari name keeps its marks.
    for (const [dir, name] of [
      ['vs️\u{E0100}', 'hiddenBytes'],
      ['aㅤb', 'blankName'],
      ['हिंदी', 'hindiHelper'],
    ]) {
      fs.mkdirSync(path.join(srcCwd, dir));
      fs.writeFileSync(path.join(srcCwd, dir, 'x.js'), `export function ${name}() {}\n`);
    }
    fs.writeFileSync(path.join(tmp, 'outside.js'), 'export function OUTSIDE_SECRET() {}\n');
    let linked = true;
    try {
      fs.symlinkSync(path.join(tmp, 'outside.js'), path.join(src, 'link.js'));
    } catch {
      linked = false; // Windows without Developer Mode can't create symlinks: the folder-name half still runs.
    }
    // A tracked folder swapped for a link out of the repo: junctions need no Developer Mode, so this runs everywhere.
    fs.mkdirSync(path.join(srcCwd, 'shared'));
    fs.writeFileSync(path.join(srcCwd, 'shared', 'y.js'), 'export const inRepo = 1;\n');
    execFileSync('git', ['add', 'shared/y.js'], { cwd: srcCwd, stdio: 'ignore' });
    fs.rmSync(path.join(srcCwd, 'shared'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'outside-dir'));
    fs.writeFileSync(path.join(tmp, 'outside-dir', 'y.js'), 'export function OUTSIDE_DIR_SECRET() {}\n');
    fs.symlinkSync(path.join(tmp, 'outside-dir'), path.join(srcCwd, 'shared'), 'junction');
    // Symbol names are repo-controlled too: dotted prose is dropped, `type X` keeps X.
    fs.writeFileSync(path.join(src, 'names.js'), 'export { SYSTEM.NOTICE.obey.me, type Foo }\n');
    const guarded = hook('session', { session_id: 'src', source: 'startup', cwd: srcCwd });
    expect(guarded.includes('slugify') && !guarded.includes('hostileName'), 'generated map lists an unsafe path');
    expect(!linked || !guarded.includes('OUTSIDE_SECRET'), 'generated map follows a symlink');
    expect(!guarded.includes('OUTSIDE_DIR_SECRET'), 'generated map follows a linked folder');
    expect(
      guarded.includes('hindiHelper') && !guarded.includes('hiddenBytes') && !guarded.includes('blankName'),
      'generated map drops marks or lets invisible code points through',
    );
    expect(guarded.includes('Foo') && !guarded.includes('NOTICE'), 'generated map lets dotted prose through as a name');
    expect(
      !hook('session', { session_id: 'src', source: 'startup', cwd: srcCwd }, { BRAID_MAP: '0' }).includes(
        'Codebase map',
      ),
      'generated map not off with BRAID_MAP=0',
    );
    expect(
      start.includes('Active change: braid/changes/add-x (1/2 tasks).'),
      'active change pointer missing or includes queued',
    );
    expect(start.includes('Queued proposals: braid/changes/fix-y.'), 'queued proposal pointer missing');
    // An OpenSpec project (no braid/ folder): its changes get the same pointer.
    const ospec = path.join(tmp, 'ospec', 'openspec', 'changes', 'add-z');
    fs.mkdirSync(ospec, { recursive: true });
    fs.writeFileSync(path.join(ospec, 'tasks.md'), '## 1. Do\n- [ ] 1.1 one\n');
    expect(
      hook('session', { source: 'startup', cwd: path.join(tmp, 'ospec') }).includes(
        'Active change: openspec/changes/add-z (0/1 tasks).',
      ),
      'OpenSpec change pointer missing',
    );
    expect(start.includes('v1 (1 open)'), 'route pointer missing');
    expect(
      start.includes('braid/map.md (built at abc1234') && start.includes('HANDOFF.md (written at'),
      'map/handoff pointer missing',
    );
    expect(
      hook('prompt', { prompt: '/braid:braid ultra' }).includes('BRAID LEVEL: ultra — Also question the request'),
      'ultra switch not confirmed with its table row',
    );
    expect(
      hook('prompt', { prompt: '/braid:braid lite' }).includes('BRAID LEVEL: lite — Build what was asked'),
      'level switch not confirmed with its table row',
    );
    const report = hook('prompt', { prompt: '/braid:braid' });
    expect(
      report.includes('BRAID ACTIVE — level: lite') && !report.includes('## The smallest complete change'),
      'bare /braid:braid while on does not just report',
    );
    expect(hook('session', { source: 'compact' }).includes('level: lite'), 'level lost across compaction');
    expect(hook('subagent', {}).includes('level: lite'), 'subagent not injected');
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'drift reminder on by default');
    hook('prompt', { prompt: '/braid:braid drift on' });
    expect(hook('prompt', { prompt: 'fix the bug' }).startsWith('braid: lite'), 'drift reminder missing');
    // ZCode's and Codex's skill pickers deliver commands as raw "[$braid](<path>) args" links.
    hook('prompt', { prompt: '[$braid](C:\\x\\skills\\braid\\SKILL.md) drift off' });
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'ZCode picker link form not parsed');
    hook('prompt', { prompt: '/braid:braid drift on' });
    hook('prompt', { prompt: '[$braid:braid](C:/x/skills/braid/SKILL.md) drift off' });
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'Codex picker link form not parsed');
    // Pi invokes skills as "/skill:<name> args".
    hook('prompt', { prompt: '/braid:braid drift on' });
    hook('prompt', { prompt: '/skill:braid drift off' });
    expect(hook('prompt', { prompt: 'fix the bug' }) === '', 'Pi skill command form not parsed');
    // ADHD toggles confirm like the other commands.
    expect(
      hook('prompt', { session_id: 'pi-adhd', prompt: '/skill:adhd' }) === 'BRAID ADHD MODE: on',
      'Pi /skill:adhd not confirmed',
    );
    expect(
      hook('session', { session_id: 'pi-adhd', source: 'compact' }).includes('ADHD MODE ACTIVE'),
      'Pi /skill:adhd not parsed',
    );
    expect(
      hook('prompt', { session_id: 'pi-adhd', prompt: 'stop adhd mode' }) === 'BRAID ADHD MODE: off',
      '"stop adhd mode" not confirmed',
    );
    hook('prompt', { prompt: '/braid:braid drift on' });
    expect(
      hook('prompt', { prompt: '/braid:spec propose' }) ===
        'braid: lite · YAGNI > KISS > DRY · smallest complete change first · done means verified',
      'other braid skills misread as level commands',
    );
    hook('prompt', { prompt: 'stop braid' });
    expect(hook('session', { source: 'compact' }) === '', 'still injecting after "stop braid"');
    // Coming back from off re-sends what a session starts with, by level or bare.
    const lite = hook('prompt', { prompt: '/braid:braid lite' });
    expect(
      lite.includes('BRAID ACTIVE — level: lite') &&
        lite.includes('## The smallest complete change') &&
        lite.includes('Active change:'),
      'level switch while off does not re-send the core and pointers',
    );
    hook('prompt', { prompt: 'stop braid' });
    const back = hook('prompt', { prompt: '/braid:braid' });
    expect(
      back.includes('BRAID ACTIVE — level: full') &&
        back.includes('## The smallest complete change') &&
        back.includes('Active change:'),
      'bare /braid:braid while off does not switch on with the core and pointers',
    );
    expect(hook('session', { source: 'compact' }).includes('level: full'), 'switch back on not remembered');

    // No session id: nothing is shared between id-less sessions, so one can't switch another off.
    hook('prompt', { session_id: undefined, prompt: 'stop braid' });
    expect(
      hook('session', { session_id: undefined, source: 'startup' }).includes('level: full'),
      'id-less sessions share state',
    );
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
    const pointerLines = busyOut
      .slice(busyOut.indexOf('## Project state'))
      .split('\n')
      .filter((l) => l.startsWith('- '));
    expect(
      pointerLines.length <= 5 && pointerLines.every((l) => l.length <= 300) && busyOut.includes('and 17 more'),
      `pointer lines not capped: ${pointerLines.map((l) => l.length)}`,
    );

    // The budget is measured on the worst case: the ultra level (the longest row), every pointer present,
    // lists long enough for a 3-digit "and N more", ASCII names past the 32-byte clip under the longer
    // openspec/ prefix, 4-digit counts, and 1,000 commits since the map and handoff shas. Each further
    // digit in a count adds a quarter of a token.
    const worst = path.join(tmp, 'worst');
    fs.mkdirSync(path.join(worst, 'braid', 'routes'), { recursive: true });
    const git = (args, input) => execFileSync('git', args, { cwd: worst, input }).toString().trim();
    git(['init', '-q']);
    git(['symbolic-ref', 'HEAD', 'refs/heads/main']);
    git(['fast-import', '--quiet'], 'commit refs/heads/main\ncommitter c <c@c> 0 +0000\ndata 0\n\n'.repeat(1001));
    const sha = git(['rev-list', '--max-parents=0', 'HEAD']);
    fs.writeFileSync(path.join(tmp, 'data', 'sessions', 'worst.json'), '{"mode":"ultra"}');
    const long = (i) => `${i}-${'x'.repeat(80)}`;
    const tasks = `${'- [x] t\n'.repeat(1000)}${'- [ ] t\n'.repeat(8999)}`;
    for (let i = 0; i < 103; i++) {
      fs.mkdirSync(path.join(worst, 'openspec', 'changes', long(i)), { recursive: true });
      fs.writeFileSync(path.join(worst, 'openspec', 'changes', long(i), 'tasks.md'), tasks);
      fs.mkdirSync(path.join(worst, 'openspec', 'changes', `q${long(i)}`));
      fs.writeFileSync(path.join(worst, 'braid', 'routes', `${long(i)}.md`), '- [ ] open\n'.repeat(1000));
    }
    fs.writeFileSync(path.join(worst, 'braid', 'map.md'), `<!-- braid:map sha=${sha} -->\n`);
    fs.writeFileSync(path.join(worst, 'braid', 'HANDOFF.md'), `<!-- braid:handoff sha=${sha} -->\n`);
    const worstOut = hook('session', { session_id: 'worst', source: 'startup', cwd: worst });
    const exercised = ['level: ultra', '…', '(1000/9999 tasks)', '(1000 open)', '1000 commits since', 'and 100 more'];
    expect(
      exercised.every((s) => worstOut.includes(s)),
      'worst-case fixture not exercised',
    );
    // Names in multi-byte characters clip by bytes too, so they cost no more than ASCII ones.
    const wide = (i) => `${i}-${'漢'.repeat(80)}`;
    const cjk = path.join(tmp, 'cjk', 'braid', 'changes', wide(0));
    fs.mkdirSync(cjk, { recursive: true });
    fs.writeFileSync(path.join(cjk, 'tasks.md'), '- [ ] t\n');
    const cjkName = hook('session', { session_id: 'cjk', cwd: path.join(tmp, 'cjk') }).match(/changes\/(\S+…)/);
    expect(cjkName && Buffer.byteLength(cjkName[1]) <= 32, 'multi-byte names not clipped by bytes');
    // The other worst case: a git repo with no braid/map.md, so the generated map fills its cap (non-ASCII folder names).
    fs.rmSync(path.join(worst, 'braid', 'map.md'));
    for (let i = 0; i < 30; i++) {
      fs.mkdirSync(path.join(worst, 'src', wide(i)), { recursive: true });
      fs.writeFileSync(path.join(worst, 'src', wide(i), 'm.js'), 'export const alpha = 1, beta = 2, gamma = 3;\n');
      // Short folders fill the bytes the long lines leave under the cap.
      fs.mkdirSync(path.join(worst, 'src', `z${i}`));
      fs.writeFileSync(path.join(worst, 'src', `z${i}`, 'm.js'), 'export const a = 1;\n');
    }
    const worstMap = hook('session', { session_id: 'worst', source: 'startup', cwd: worst });
    expect(worstMap.includes('more folders not listed'), 'worst-case map fixture not at its cap');
    alwaysOn += Math.max(Buffer.byteLength(worstOut), Buffer.byteLength(worstMap));

    // Windows can swallow a hook's stdin so it never closes: the hook must still answer and exit
    // well inside its 15 s timeout. A child keeps the pipe open and times the hook.
    const probe = execFileSync(process.execPath, [
      '-e',
      `
      const c = require('node:child_process').spawn(process.execPath, [process.argv[1], 'session'], { stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, CLAUDE_PLUGIN_DATA: process.argv[2] } });
      let out = ''; const t = Date.now();
      c.stdout.on('data', (d) => { out += d; });
      c.on('exit', () => { console.log(JSON.stringify({ ms: Date.now() - t, bytes: out.length })); process.exit(0); });
      setTimeout(() => { console.log(JSON.stringify({ ms: -1 })); c.kill(); process.exit(0); }, 4000);`,
      path.join(plugin, 'hooks', 'braid.cjs'),
      path.join(tmp, 'data'),
    ]).toString();
    const { ms, bytes } = JSON.parse(probe);
    expect(
      ms >= 0 && ms < 3000 && bytes > 0,
      `hook with open stdin: ${ms < 0 ? 'still running after 4 s' : `${ms} ms, ${bytes} bytes`}`,
    );
  } catch (e) {
    fail(`hook: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// debt's scan, run as its SKILL.md writes it: a marker in a gitignored folder is not a ledger row.
{
  const scan = read('skills/debt/SKILL.md').match(/`git grep (--no-index --exclude-standard -nE) '([^']+)'`/);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'braid-debt-'));
  try {
    if (!scan) throw new Error('no `git grep --no-index --exclude-standard -nE` command in skills/debt/SKILL.md');
    fs.mkdirSync(path.join(tmp, 'build'));
    fs.writeFileSync(path.join(tmp, '.gitignore'), 'build/\n');
    fs.writeFileSync(
      path.join(tmp, 'a.js'),
      '// shortcut(yagni): one store; add a second when a second caller needs it\n',
    );
    fs.writeFileSync(path.join(tmp, 'build', 'b.js'), '// shortcut(dry): IGNORED_MARKER\n');
    const out = execFileSync('git', ['grep', ...scan[1].split(' '), scan[2]], { cwd: tmp }).toString();
    if (!out.includes('a.js') || out.includes('IGNORED_MARKER')) throw new Error(`unexpected rows:\n${out}`);
  } catch (e) {
    fail(`debt scan: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// retro's extractor on a fake home with all three stores: recurring failures counted across harnesses, one-offs,
// other projects and prompt text left out, the window and `all` honored, insights read, nothing written.
{
  // realpath: macOS's tmpdir is a symlink, and retro compares against the physical cwd.
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'braid-retro-')));
  const write = (p, text) => {
    fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true });
    fs.writeFileSync(path.join(tmp, p), text);
  };
  const jsonl = (...lines) => `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`;
  try {
    const proj = path.join(tmp, 'proj');
    const other = path.join(tmp, 'other');
    fs.mkdirSync(proj);
    const claude = (dir, id, cmd, err, prompt = 'hi') =>
      write(
        `.claude/projects/${dir.replace(/[^a-zA-Z0-9]/g, '-')}/${id}.jsonl`,
        jsonl(
          { type: 'user', cwd: dir, message: { content: prompt } },
          {
            type: 'assistant',
            cwd: dir,
            message: { content: [{ type: 'tool_use', id: 't1', name: 'Bash', input: { command: cmd } }] },
          },
          {
            type: 'user',
            cwd: dir,
            message: {
              content: [{ type: 'tool_result', tool_use_id: 't1', is_error: true, content: `Exit code 1\n${err}` }],
            },
          },
        ),
      );
    // The error lines differ only in a quoted value, after an apostrophe that must not open a quote.
    // Each command reaches `git` its own way: past set/export/cd, and an env prefix before a quoted path.
    claude(
      proj,
      's1',
      'set -e; export X=1 && cd x && git push',
      `fatal: can't find upstream "a"`,
      'my token is SECRET_TOKEN_123',
    );
    claude(proj, 's2', 'GIT_TERMINAL_PROMPT=0 "/usr/bin/git" push origin', `fatal: can't find upstream 'b'`);
    // A rejection with the user's feedback, in two sessions: the feedback must not be printed.
    const rejected = (w) =>
      `The user doesn't want to proceed with this tool use. The tool use was rejected. To tell you how to proceed, the user said:\nno, push failed last time; SECRET_FEEDBACK_${w}`;
    claude(proj, 'r1', 'git push', rejected(1));
    claude(proj, 'r2', 'git push', rejected(2));
    claude(proj, 's3', 'npm run x', 'npm error Missing script: "x"');
    claude(other, 'o1', 'npm run y', 'npm error Missing script: "y"');
    write('.claude/projects/.DS_Store', ''); // a stray file must not stop the run
    // Codex sessions, each a list of [script input, output text] calls.
    const codex = (id, ...calls) =>
      write(
        `.codex/sessions/2026/10/01/rollout-${id}.jsonl`,
        jsonl(
          { type: 'session_meta', payload: { id, cwd: proj } },
          ...calls.flatMap(([input, text], n) => [
            { type: 'response_item', payload: { type: 'custom_tool_call', call_id: `${n}`, name: 'exec', input } },
            {
              type: 'response_item',
              payload: { type: 'custom_tool_call_output', call_id: `${n}`, output: [{ type: 'input_text', text }] },
            },
          ]),
        ),
      );
    // A captured call to a quoted Windows path: still `git`, on every OS.
    const two = String.raw`tools.exec_command({cmd:"node -v"}); tools.exec_command({cmd:"$out = & \"C:\\Program Files\\Git\\bin\\git.exe\" push"})`;
    const noUpstream = (b) => ({ exit_code: 1, output: `fatal: can't find upstream '${b}'` });
    // One step fanning out to several results: positions no longer name steps, so nothing is blamed on `node -v`.
    const fanOut = [
      '[1, 2].map((session_id) => tools.write_stdin({ session_id })); tools.exec_command({cmd:"node -v"})',
      ['{"exit_code":0}', JSON.stringify(noUpstream('f')), '{"exit_code":0}'].join('\n'),
    ];
    const patchFail =
      'Script failed\nWall time 0.0 seconds\nOutput:\n\nScript error:\napply_patch verification failed: x';
    // Parallel steps keyed by i; an array behind headers; a command finished by a write_stdin poll.
    codex('c1', [
      two,
      ['Wall time 0.1s', '{"i":0,"value":{"exit_code":0}}', JSON.stringify({ i: 1, value: noUpstream('c') })].join(
        '\n',
      ),
    ]);
    codex(
      'c2',
      [two, `Wall time 0.1s\nOutput:\n\n${JSON.stringify([{ exit_code: 0 }, noUpstream('d')])}`],
      ['tools.apply_patch("x")', patchFail],
      fanOut,
    );
    codex(
      'c3',
      [`tools.exec_command({cmd:"$env:GIT_PAGER = 'cat'; git push"})`, '{"session_id":7,"output":"..."}'],
      ['tools.write_stdin({session_id:7,chars:""})', JSON.stringify(noUpstream('e'))],
      ['tools.apply_patch("y")', patchFail],
      fanOut,
    );
    const dbFile = path.join(tmp, '.zcode/cli/db/db.sqlite');
    let sqlite = false;
    try {
      process.removeAllListeners('warning');
      write('.zcode/cli/db/db.sqlite', ''); // present either way, so an older Node shows the skip note
      const db = new (require('node:sqlite').DatabaseSync)(dbFile);
      // WAL like the real store: retro's read-only open may add SQLite's -wal and -shm files, nothing else.
      db.exec(`PRAGMA journal_mode = WAL;
        CREATE TABLE session (id, parent_id, directory, time_updated, time_deleted);
        CREATE TABLE tool_usage (session_id, tool_call_id, tool_name, status, exit_code, error_message);
        CREATE TABLE part (session_id, data);
        INSERT INTO session VALUES ('z1', NULL, '${proj.replace(/'/g, "''")}', ${Date.now()}, NULL);
        INSERT INTO tool_usage VALUES ('z1', 'c', 'Bash', 'completed', 1, NULL);
        INSERT INTO part VALUES ('z1', '{"callID":"c","state":{"input":{"command":"git push"},"output":"fatal: can''t find upstream \\"z\\""}}');`);
      db.close();
      sqlite = true;
    } catch {} // Node < 22.13: retro says it skipped ZCode, asserted below
    write(
      '.claude/usage-data/report.html',
      '<input type="checkbox" class="cmd-checkbox" checked data-text="- Use `gh` with &apos;--repo&apos;">',
    );
    write(
      '.claude/usage-data/session-meta/s1.json',
      JSON.stringify({ project_path: proj, start_time: new Date().toISOString() }),
    );
    write(
      '.claude/usage-data/facets/s1.json',
      JSON.stringify({ friction_counts: { wrong_approach: 1 }, friction_detail: 'tried X' }),
    );

    const tree = (d) =>
      fs
        .readdirSync(d, { withFileTypes: true })
        .flatMap((e) => (e.isDirectory() ? tree(path.join(d, e.name)) : [path.join(d, e.name)]));
    const files = () => String(tree(tmp).filter((f) => !/db\.sqlite-(wal|shm)$/.test(f)));
    const before = files();
    const retro = (...args) =>
      execFileSync(process.execPath, [path.join(root, 'skills', 'retro', 'retro.cjs'), ...args], {
        cwd: proj,
        env: { ...process.env, HOME: tmp, USERPROFILE: tmp, CLAUDE_CONFIG_DIR: '', CODEX_HOME: '' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }).toString();
    const out = retro();
    const want = sqlite
      ? '1. 6 sessions (claude, codex, zcode) · shell git'
      : '1. 5 sessions (claude, codex) · shell git';
    if (!out.includes(want)) throw new Error(`no "${want}" in:\n${out}`);
    if (!out.includes('2 sessions (codex) · apply_patch'))
      throw new Error(`Codex script failures not counted:\n${out}`);
    if (!sqlite && !out.includes('zcode: skipped')) throw new Error(`no ZCode skip note in:\n${out}`);
    if (/npm|SECRET|shell node/.test(out))
      throw new Error(`one-off, other project, prompt text or a passing step in:\n${out}`);
    if (!retro('all').includes('2 sessions (claude) · shell npm'))
      throw new Error('`all` did not count the other project');
    if (!retro('1').includes('no failure recurs'))
      throw new Error('a 1-session window still found a recurring failure');
    if (!retro('100000000d').includes('· shell git')) throw new Error('a huge window failed');
    const ins = retro('insights');
    if (!ins.includes("- Use `gh` with '--repo'") || !ins.includes('wrong_approach: 1 sessions · tried X'))
      throw new Error(`insights not read:\n${ins}`);
    if (files() !== before) throw new Error('retro wrote files');
    fs.rmSync(path.join(tmp, '.claude/usage-data/report.html'));
    const noReport = retro('insights');
    if (!noReport.includes('run /insights first') || !noReport.includes('· shell git'))
      throw new Error(`no report: missing the "run /insights first" note or the transcript pass:\n${noReport}`);
    if (sqlite) {
      for (const f of tree(path.dirname(dbFile))) fs.rmSync(f);
      fs.writeFileSync(dbFile, 'not a database');
      const broken = retro();
      if (
        !broken.includes('zcode: skipped, its store could not be read') ||
        !broken.includes('5 sessions (claude, codex)')
      )
        throw new Error(`a broken ZCode store stopped the other harnesses:\n${broken}`);
    }
  } catch (e) {
    fail(`retro: ${e.message}`);
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
// ponytail's worst case at the UPSTREAM.md pin, same bytes/4: its ultra-level core as its hook injects it, its map at
// the cap (2,000 ASCII bytes plus header and overflow line; it caps characters, braid caps bytes) and its model-invocable skill descriptions. Re-measure on
// every ponytail sync (UPSTREAM.md); braid stays within ~300 tokens of it (AGENTS.md, ADR 0012).
const PONYTAIL_ALWAYS_ON = 1678;
if (tokens > PONYTAIL_ALWAYS_ON + 300)
  fail(`always-on ~${tokens} tokens > ponytail's ~${PONYTAIL_ALWAYS_ON} + 300 (re-measure it if ponytail moved)`);

// UPSTREAM.md: one row per skill; vendored ones carry their LICENSE, based and derived ones' upstream
// notice (copyright line and permission text, not just a link) is in THIRD-PARTY-NOTICES.
const notices = exists('THIRD-PARTY-NOTICES') ? read('THIRD-PARTY-NOTICES').split(/^---$/m) : [];
const hasNotice = (repo) =>
  notices.some(
    (s) =>
      s.includes(`https://github.com/${repo}`) &&
      /^Copyright \(c\) \d{4} \S/m.test(s) &&
      s.includes('Permission is hereby granted'),
  );
const rows = read('UPSTREAM.md')
  .split(/\r?\n/)
  .filter((l) => /^\|\s*`?[a-z0-9]/.test(l));
const rowSkills = rows.map((r) => r.split('|')[1].trim().replace(/`/g, ''));
for (const dir of skillDirs) if (!rowSkills.includes(dir)) fail(`UPSTREAM.md: no row for skills/${dir}`);
for (const row of rows) {
  const [skill, kind, repo] = row
    .split('|')
    .slice(1)
    .map((c) => c.trim().replace(/`/g, ''));
  if ((kind === 'based' || kind === 'derived') && !hasNotice(repo))
    fail(`THIRD-PARTY-NOTICES: ${kind} on ${repo} but carries no copyright notice for it`);
  if (!exists(`skills/${skill}/SKILL.md`)) fail(`UPSTREAM.md: skills/${skill} does not exist`);
  if (!['vendored', 'based', 'derived', 'clean-room'].includes(kind))
    fail(`UPSTREAM.md: ${skill} has unknown kind "${kind}"`);
  if (kind === 'vendored' && !exists(`skills/${skill}/LICENSE`)) fail(`skills/${skill}: vendored without LICENSE`);
  // braid's own skills stay small: each markdown file ≤ ~2k tokens.
  if (kind !== 'vendored' && exists(`skills/${skill}`)) {
    for (const f of fs.readdirSync(path.join(root, 'skills', skill)).filter((f) => f.endsWith('.md'))) {
      const size = fs.statSync(path.join(root, 'skills', skill, f)).size;
      if (size > 8000) fail(`skills/${skill}/${f}: ${size} bytes > 8000 (~2k tokens)`);
    }
  }
}

// Pi's extension, driven by a stub `pi` as Pi drives it, spawning the real hook. Last, because it sets
// process.env for the hook it spawns.
const piCheck = (async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'braid-pi-'));
  // `~` must expand to the home folder, as Pi expands it. Mixed case: Windows env lookups ignore case.
  const env = {
    HOME: path.join(tmp, 'home'),
    USERPROFILE: path.join(tmp, 'home'),
    PI_CODING_AGENT_DIR: '~/pi',
    Claude_Plugin_Data: path.join(tmp, 'claude'),
    ZCODE_PLUGIN_DATA: path.join(tmp, 'zcode'),
  };
  const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  const expect = (cond, msg) => {
    if (!cond) fail(`pi extension: ${msg}`);
  };
  // Pi's side, stubbed: a nextTurn message joins the next run; a steer or followUp would join the run streaming now.
  const load = (file) => {
    const on = {};
    let nextTurn = [];
    const queued = [];
    const pi = {
      on: (name, fn) => (on[name] = fn),
      sendMessage: (m, o) => (o?.deliverAs === 'nextTurn' ? nextTurn : queued).push(m.content),
    };
    require(file)(pi);
    const ctx = { cwd: tmp, sessionManager: { getSessionId: () => 'pi-check' } };
    return {
      queued,
      start: () => on.session_start({ reason: 'startup' }, ctx),
      steer: (text) => on.input({ text, source: 'interactive', streamingBehavior: 'steer' }),
      input: (text, source) => on.input({ text, source }),
      run: async (text) => {
        if (text !== undefined) await on.input({ text, source: 'interactive' });
        const event = { systemPromptOptions: { sections: {} } };
        await on.before_agent_start(event);
        const message = nextTurn.join('\n');
        nextTurn = [];
        return { section: event.systemPromptOptions.sections.braid || '', message };
      },
    };
  };
  const cwd = process.cwd();
  try {
    Object.assign(process.env, env);
    // From inside tmp: an unexpanded `~/pi` (a regression) then lands here, not as a `~` folder in the repo.
    process.chdir(tmp);
    const pi = load(path.join(root, 'extensions', 'braid.js'));
    await pi.start();
    let r = await pi.run();
    expect(r.section.includes('BRAID ACTIVE — level: full') && !r.message, 'no core section at session start');
    r = await pi.run('/skill:braid lite');
    expect(r.section.includes('level: lite') && r.message.startsWith('BRAID LEVEL: lite'), 'level switch not applied');
    expect(
      fs.existsSync(path.join(tmp, 'home', 'pi', 'braid', 'sessions', 'pi-check.json')) &&
        !fs.existsSync(env.Claude_Plugin_Data) &&
        !fs.existsSync(env.ZCODE_PLUGIN_DATA),
      "state not kept in Pi's agent folder",
    );
    r = await pi.run('/skill:adhd');
    expect(r.section.includes('ADHD MODE ACTIVE') && r.message === 'BRAID ADHD MODE: on', 'ADHD on not in the section');
    r = await pi.run('normal mode');
    expect(!r.section.includes('ADHD MODE ACTIVE'), 'ADHD still in the section after "normal mode"');
    // A command steered into a streaming run: confirmed and applied from the next run, costing no turn of its own.
    await pi.steer('stop braid');
    r = await pi.run();
    expect(
      !pi.queued.length && !r.section && r.message === 'BRAID OFF for this session.',
      'steered command not applied and confirmed at the next run, or steered on its own',
    );
    r = await pi.run('/skill:braid');
    expect(
      r.section.includes('level: full') && r.message === 'BRAID ACTIVE — level: full',
      'coming back on: no section, or the core repeated as a message',
    );
    // Another extension's sendUserMessage isn't the user: it can't switch braid off.
    await pi.input('stop braid', 'extension');
    r = await pi.run();
    expect(r.section.includes('level: full') && !r.message, 'a message from another extension ran a braid command');
    // A hook whose output can't be read, or isn't text, injects nothing and throws nothing.
    for (const out of ['{', '{"hookSpecificOutput":{"additionalContext":5}}']) {
      const broken = fs.mkdtempSync(path.join(tmp, 'broken-'));
      fs.mkdirSync(path.join(broken, 'hooks'));
      fs.cpSync(path.join(root, 'extensions'), path.join(broken, 'extensions'), { recursive: true });
      fs.writeFileSync(path.join(broken, 'hooks', 'braid.cjs'), `process.stdout.write(${JSON.stringify(out)});`);
      const bad = load(path.join(broken, 'extensions', 'braid.js'));
      await bad.start();
      r = await bad.run('/skill:braid lite');
      expect(!r.section && !r.message, `hook output ${out} injected`);
    }
  } catch (e) {
    fail(`pi extension: ${e.message}`);
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})();

piCheck.then(() => {
  if (errors.length) {
    console.error([...new Set(errors)].map((e) => `✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(
    `✓ ${manifests.length} manifests, ${skillDirs.length} skills, ${rows.length} upstream rows, hook ok, always-on ~${tokens} tokens (ponytail ~${PONYTAIL_ALWAYS_ON})`,
  );
});
