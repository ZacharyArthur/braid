#!/usr/bin/env node
// braid A/B benchmark: the same tasks through Claude Code or Codex with braid, ponytail, or no plugin.
//
//   node bench/ab.cjs [--agent claude|codex] [--model m] [--runs 3] [--tasks a,b] [--arms braid,ponytail,none] [--label x] [--fake]
//
// Each run copies bench/tasks/<task>/files into a fresh git repo, runs the agent there with only
// that arm's rules, then measures the diff, runs the task's check, and probes for DRY.
//   claude: `claude -p` with --setting-sources project,local (skips installed plugins) and
//           --plugin-dir for the arm's plugin, so its hooks and skills load for real.
//   codex:  `codex exec` with --ignore-user-config (skips installed plugins); the arm's always-on
//           text goes in as developer_instructions: braid's own hook output for that run dir,
//           or ponytail's own instruction builder.
// --fake skips the agent: it applies the task's reference solution (arms braid, ponytail) or
// nothing (arm none), to test the harness and the checks without spending tokens.
// Results: bench/results/<date>-<agent>-<model>[-label]/ (report.md, runs.jsonl, one .diff per run),
// with home paths, user name and host name redacted.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const TASKS = path.join(__dirname, 'tasks');
// Runs must live outside the home folder: Claude Code loads every CLAUDE.md above the working
// dir, and a home-level one (e.g. C:\Users\me\CLAUDE.md) makes agents treat home as the project.
const WORK = process.env.BRAID_BENCH_DIR ||
  (process.platform === 'win32' ? path.join(path.parse(os.homedir()).root, 'braid-bench') : path.join(os.tmpdir(), 'braid-bench'));

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i < 0 ? dflt : args[i + 1]; };
const FAKE = args.includes('--fake');
const AGENT = opt('agent', 'claude');
const codexDefaultModel = () => (fs.readFileSync(path.join(os.homedir(), '.codex', 'config.toml'), 'utf8').match(/^model\s*=\s*"([^"]+)"/m) || [])[1];
const MODEL = opt('model', AGENT === 'codex' ? codexDefaultModel() : 'sonnet');
const RUNS = Number(opt('runs', FAKE ? 1 : 3));
const ARMS = opt('arms', 'braid,ponytail,none').split(',');
const TASK_IDS = opt('tasks', fs.readdirSync(TASKS).join(',')).split(',');

const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }).toString();
const git = (cwd, ...argv) => run('git', ['-c', 'user.name=bench', '-c', 'user.email=bench@local', ...argv], cwd);

// Results are committed to a public repo: no home paths, user or host names in them.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SECRETS = [
  ...[os.homedir(), os.homedir().replace(/\\/g, '/'), os.homedir().replace(/\\/g, '\\\\')].map((h) => [new RegExp(escapeRe(h), 'gi'), '~']),
  [new RegExp(`\\b${escapeRe(os.userInfo().username)}\\b`, 'gi'), '<user>'],
  [new RegExp(`\\b${escapeRe(os.hostname())}\\b`, 'gi'), '<host>'],
];
const redact = (s) => SECRETS.reduce((t, [re, to]) => t.replace(re, to), String(s ?? ''));

// Python checks need a real interpreter; the Windows Store stub prints "Python was not found".
// Fall back to one uv manages, and put it first on PATH so the agents can run Python too.
const pyVersion = (p) => spawnSync(p, ['--version']).stdout?.toString().trim() || '';
const PYTHON = ['python3', 'python'].find((p) => /^Python 3/.test(pyVersion(p)))
  || spawnSync('uv', ['python', 'find']).stdout?.toString().trim() || null;
const ENV = { ...process.env, PATH: PYTHON && path.isAbsolute(PYTHON) ? path.dirname(PYTHON) + path.delimiter + process.env.PATH : process.env.PATH };

// ponytail at the commit braid is derived from: the pin lives only in UPSTREAM.md.
function ponytailDir() {
  const sha = fs.readFileSync(path.join(ROOT, 'UPSTREAM.md'), 'utf8').match(/^\| `braid` \|.*\| ([0-9a-f]{40}) \|/m)[1];
  const dir = path.join(WORK, `ponytail-${sha.slice(0, 8)}`);
  if (!fs.existsSync(path.join(dir, '.claude-plugin'))) {
    fs.rmSync(dir, { recursive: true, force: true });
    run('git', ['clone', '--quiet', 'https://github.com/DietrichGebert/ponytail.git', dir]);
    run('git', ['checkout', '--quiet', sha], dir);
  }
  return dir;
}

const promptFor = (task) => [task.prompt, task.interface].filter(Boolean).join('\n\n');

function claude(task, arm, cwd) {
  const plugin = { braid: ROOT, ponytail: arm === 'ponytail' && ponytailDir() }[arm];
  const argv = ['-p', promptFor(task), '--model', MODEL, '--output-format', 'json', '--setting-sources', 'project,local', '--no-session-persistence',
    '--permission-mode', 'acceptEdits', '--allowedTools', 'Bash(node:*)', 'Bash(python:*)', 'Bash(python3:*)',
    ...(plugin ? ['--plugin-dir', plugin] : [])];
  const r = spawnSync('claude', argv, { cwd, env: ENV, timeout: 600000, maxBuffer: 64 << 20 });
  const out = JSON.parse(r.stdout.toString() || '{}');
  const u = out.usage || {};
  return {
    error: r.status !== 0 || out.is_error ? (out.result || r.stderr.toString()).slice(0, 200) : null,
    tokens: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.output_tokens || 0),
    cost: out.total_cost_usd || 0,
    seconds: (out.duration_ms || 0) / 1000,
    turns: out.num_turns || 0,
    denied: (out.permission_denials || []).map((d) => d.tool_name).join(',') || null,
    reply: String(out.result || '').slice(0, 300), // why a run wrote no file, if it didn't
  };
}

// The always-on text each arm's plugin would inject, for agents without --plugin-dir.
function rulesFor(arm, cwd) {
  if (arm === 'braid') {
    const out = spawnSync(process.execPath, [path.join(ROOT, 'hooks', 'braid.cjs'), 'session'], {
      input: JSON.stringify({ session_id: 'bench', source: 'startup', cwd }),
      env: { ...ENV, CLAUDE_PLUGIN_DATA: path.join(WORK, 'plugin-data') },
    }).stdout.toString();
    return JSON.parse(out).hookSpecificOutput.additionalContext;
  }
  if (arm === 'ponytail') return require(path.join(ponytailDir(), 'hooks', 'ponytail-instructions.js')).getPonytailInstructions('full');
  return null;
}

function codex(task, arm, cwd) {
  const rules = rulesFor(arm, cwd);
  const argv = ['exec', '--json', '--ephemeral', '--ignore-user-config', '--skip-git-repo-check', '-s', 'workspace-write', '-C', cwd,
    ...(MODEL ? ['-m', MODEL] : []),
    ...(process.platform === 'win32' ? ['-c', 'windows.sandbox="unelevated"'] : []),
    ...(rules ? ['-c', `developer_instructions=${JSON.stringify(rules)}`] : []), // a JSON string is a valid TOML string
    promptFor(task)];
  const start = Date.now();
  const r = spawnSync('codex', argv, { cwd, env: ENV, timeout: 600000, maxBuffer: 64 << 20 });
  const events = r.stdout.toString().split('\n').flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
  const items = events.filter((e) => e.type === 'item.completed').map((e) => e.item);
  const usage = events.filter((e) => e.type === 'turn.completed').map((e) => e.usage || {});
  const messages = items.filter((i) => i.type === 'agent_message');
  return {
    error: r.status !== 0 ? r.stderr.toString().slice(0, 200) || `exit ${r.status}` : null,
    tokens: usage.reduce((s, u) => s + (u.input_tokens || 0) + (u.output_tokens || 0), 0), // input includes cached
    cost: null, // billed to the ChatGPT plan, not reported per run
    seconds: (Date.now() - start) / 1000,
    turns: items.filter((i) => i.type !== 'agent_message').length, // tool steps (commands, file edits)
    denied: null,
    reply: String(messages.at(-1)?.text || '').slice(0, 300),
  };
}

function check(task, dir, cwd) {
  if (!task.check) return null;
  const file = path.join(dir, task.check);
  const cmd = file.endsWith('.py') ? PYTHON : process.execPath;
  if (!cmd) return 'skipped';
  return spawnSync(cmd, [file], { cwd, env: ENV, timeout: 30000 }).status === 0;
}

function dry(task, cwd) {
  if (!task.dry) return null;
  const text = fs.existsSync(path.join(cwd, task.dry.file)) ? fs.readFileSync(path.join(cwd, task.dry.file), 'utf8') : '';
  const n = (text.match(new RegExp(task.dry.pattern, 'g')) || []).length;
  return n >= (task.dry.min ?? 0) && n <= (task.dry.max ?? Infinity);
}

function once(id, arm, i, outDir) {
  const dir = path.join(TASKS, id);
  const task = JSON.parse(fs.readFileSync(path.join(dir, 'task.json'), 'utf8'));
  const cwd = path.join(WORK, 'runs', `${path.basename(outDir)}-${id}-${arm}-${i}`);
  fs.rmSync(cwd, { recursive: true, force: true });
  fs.mkdirSync(cwd, { recursive: true });
  if (fs.existsSync(path.join(dir, 'files'))) fs.cpSync(path.join(dir, 'files'), cwd, { recursive: true });
  git(cwd, 'init', '--quiet');
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '--quiet', '--allow-empty', '-m', 'fixture');

  const agent = FAKE
    ? (arm !== 'none' && fs.cpSync(path.join(dir, 'solution'), cwd, { recursive: true }), { error: null, tokens: 0, cost: 0, seconds: 0, turns: 0, denied: null, reply: '' })
    : (AGENT === 'codex' ? codex : claude)(task, arm, cwd);

  git(cwd, 'add', '-A');
  fs.writeFileSync(path.join(outDir, 'diffs', `${id}-${arm}-${i}.diff`), redact(git(cwd, 'diff', '--cached')));
  let added = 0, removed = 0;
  for (const line of git(cwd, 'diff', '--cached', '--numstat').split('\n').filter(Boolean)) {
    const [a, r] = line.split('\t');
    added += Number(a) || 0; removed += Number(r) || 0;
  }
  const result = { task: id, arm, run: i, ...agent, error: agent.error && redact(agent.error), reply: redact(agent.reply), added, removed, check: check(task, dir, cwd), dry: dry(task, cwd) };
  fs.rmSync(cwd, { recursive: true, force: true }); // the diff is saved; the run dir is throwaway
  return result;
}

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : 0; };
const tally = (rs, key) => {
  const vals = rs.map((r) => r[key]);
  if (vals.every((v) => v === null)) return '-';
  if (vals.every((v) => v === 'skipped')) return 'skipped';
  return `${vals.filter((v) => v === true).length}/${vals.length}`;
};
const cost = (rs) => rs.some((r) => r.cost === null) ? '-' : median(rs.map((r) => r.cost)).toFixed(4);

function report(results) {
  const rows = [];
  for (const id of TASK_IDS) for (const arm of ARMS) {
    const rs = results.filter((r) => r.task === id && r.arm === arm);
    rows.push(`| ${id} | ${arm} | +${median(rs.map((r) => r.added))} −${median(rs.map((r) => r.removed))} | ${tally(rs, 'check')} | ${tally(rs, 'dry')} | ${median(rs.map((r) => r.tokens))} | ${cost(rs)} | ${median(rs.map((r) => r.seconds)).toFixed(1)} | ${median(rs.map((r) => r.turns))} | ${rs.filter((r) => r.error).length} |`);
  }
  return [
    `# A/B: ${FAKE ? 'FAKE (reference solutions, no agent)' : `${AGENT} ${MODEL}`}, ${RUNS} run(s) per cell`,
    '',
    `${new Date().toISOString().slice(0, 10)} · arms: ${ARMS.join(', ')} · medians · python checks: ${PYTHON ? pyVersion(PYTHON) : 'skipped (no Python 3)'}`,
    '',
    `| task | arm | lines | check | DRY | tokens | cost $ | time s | ${AGENT === 'codex' ? 'steps' : 'turns'} | errors |`,
    '|---|---|--:|:-:|:-:|--:|--:|--:|--:|--:|',
    ...rows,
    '',
    'DRY probes: ' + TASK_IDS.map((id) => JSON.parse(fs.readFileSync(path.join(TASKS, id, 'task.json'), 'utf8'))).filter((t) => t.dry).map((t) => `${t.dry.file}: ${t.dry.means}`).join('; ') + '.',
    'Diffs per run are in `diffs/`; read them for duplication the probes can\'t see.',
  ].join('\n') + '\n';
}

const stamp = [new Date().toISOString().slice(0, 10), FAKE ? 'fake' : `${AGENT}-${MODEL}`, opt('label')].filter(Boolean).join('-');
const outDir = path.join(__dirname, 'results', stamp);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'diffs'), { recursive: true });
const results = [];
for (const id of TASK_IDS) for (const arm of ARMS) for (let i = 1; i <= RUNS; i++) {
  process.stdout.write(`${id} / ${arm} / ${i} ... `);
  const r = once(id, arm, i, outDir);
  results.push(r);
  fs.appendFileSync(path.join(outDir, 'runs.jsonl'), JSON.stringify(r) + '\n');
  console.log(r.error ? `error: ${r.error}` : `+${r.added} −${r.removed} check=${r.check} dry=${r.dry}`);
}
fs.writeFileSync(path.join(outDir, 'report.md'), report(results));
console.log(`\n${path.relative(ROOT, path.join(outDir, 'report.md'))}`);

// Leave nothing behind: the work dir (runs, ponytail checkout, hook state) and the session stubs
// Claude writes for each run dir even with --no-session-persistence (~/.claude/projects/<cwd-as-name>).
fs.rmSync(WORK, { recursive: true, force: true });
const projects = path.join(os.homedir(), '.claude', 'projects');
for (const d of fs.existsSync(projects) ? fs.readdirSync(projects) : []) {
  if (d.includes('braid-bench-runs')) fs.rmSync(path.join(projects, d), { recursive: true, force: true });
}
