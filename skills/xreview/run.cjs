#!/usr/bin/env node
// braid xreview runner: starts a round's reviewer programs headless, at once, in the working directory.
// Run: node run.cjs <review folder> <round> <name[:model]>[,...]   |   --list   |   --running <review folder>
// Exit: 0 at least one report, 1 none (or, for --running, no fan-out), 2 nothing started.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');

// The command lines, verified by hand (braid/map.md says when). Each program reads the hand-off line
// from stdin, so the command line holds flags and a validated model only. Nobody is there to answer a prompt, so
// each runs in its automatic approval mode, where the program decides which actions run: Claude Code's auto
// mode, Codex's approve-for-me (which keeps its workspace sandbox), Vibe's smart-approve. Pi has no approvals.
const PROGRAMS = {
  claude: (m) => ['-p', '--permission-mode', 'auto', ...(m ? ['--model', m] : [])],
  codex: (m) => ['exec', '--approve-for-me', ...(m ? ['-m', m] : []), '-'],
  pi: (m) => ['-p', ...(m ? ['--model', m] : [])],
  vibe: (m) => ['-p', '--smart-approve', ...(m ? ['--model', m] : [])],
  // Codex on the user's own `zai` profile (Z.AI's GLM models), so GPT and GLM can review side by side. There
  // Codex's approval reviewer is GLM too and has not been seen to deny anything: the sandbox is the boundary.
  glm: (m) => ['exec', '-p', 'zai', '--approve-for-me', ...(m ? ['-m', m] : []), '-'],
};
const BIN = { glm: 'codex' };
const ZAI_PROFILE = path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'zai.config.toml');
// Windows only: started detached as `node -e WRAP shell|exe <program> <args>`, it starts the program attached.
const WRAP =
  "const [how, ...a] = process.argv.slice(1); const cp = require('node:child_process'); const o = { stdio: 'inherit', windowsHide: true }; const c = how === 'shell' ? cp.spawn(a.join(' '), { ...o, shell: true }) : cp.spawn(a[0], a.slice(1), o); c.on('exit', (code) => process.exit(code ?? 1)); c.on('error', (x) => { console.error(x.message); process.exit(1); });";
const MARKER = /^fanout-\d+\.json$/;
const NOT_COVERED =
  "This is a check on leftovers, not a guarantee: containers, processes that left a program's tree, ignored files and anything outside the repository are not covered.";
const win = process.platform === 'win32';
const limit = Number(process.env.BRAID_XREVIEW_LIMIT_MS) || 60 * 60 * 1000;
// cmd.exe looks in the current directory, the tree under review, before PATH: a `pi.bat` there must not stand
// in for the reviewer. Every child inherits this, the shim's shell included.
if (win) process.env.NoDefaultCurrentDirectoryInExePath = '1';

function which(name) {
  const exts = win ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').filter(Boolean) : [''];
  // A relative PATH entry would resolve inside the tree under review.
  for (const dir of (process.env.PATH || '').split(path.delimiter).filter((d) => path.isAbsolute(d))) {
    for (const ext of exts) {
      const file = path.join(dir, name + ext);
      try {
        if (!fs.statSync(file).isFile()) continue;
        if (!win) fs.accessSync(file, fs.constants.X_OK);
        return file;
      } catch {}
    }
  }
  return null;
}

// Why a reviewer can't run on this machine, or '' when it can.
function missing(name) {
  const bin = BIN[name] || name;
  if (!which(bin)) return `${bin} is not installed (not on PATH)`;
  if (name === 'glm' && !fs.existsSync(ZAI_PROFILE)) return `Codex has no zai profile (${ZAI_PROFILE})`;
  return '';
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

// A fan-out's marker is fanout-<runner pid>.json in the review folder: live while the runner that wrote it, or
// any program it started, still runs. Markers are only ever renamed into place, so a reader never sees half of
// one; one that can't be read counts as live, since deleting a live fan-out's marker is the worse mistake.
const markers = (folder) => {
  try {
    return fs
      .readdirSync(folder)
      .filter((f) => MARKER.test(f))
      .map((f) => path.join(folder, f));
  } catch {
    return [];
  }
};
const live = (file) => {
  try {
    // Not this process: a marker naming it was left by an earlier owner of its pid.
    return JSON.parse(fs.readFileSync(file, 'utf8')).pids.some((p) => p !== process.pid && alive(p));
  } catch (e) {
    return e.code !== 'ENOENT';
  }
};

function stop(text) {
  console.error(`xreview run: ${text}`);
  process.exit(2);
}

const argv = process.argv.slice(2);
if (argv[0] === '--list') {
  console.log(
    Object.keys(PROGRAMS)
      .filter((p) => !missing(p))
      .join('\n'),
  );
  process.exit(0);
}
if (argv[0] === '--running') {
  // A folder named from the wrong directory must not read as "nothing running".
  if (!fs.existsSync(path.join(argv[1] || '', 'prompt.md'))) stop(`no prompt.md in ${argv[1] || '(no folder)'}`);
  const on = markers(argv[1]).filter(live);
  console.log(on.length ? `fan-out still running: ${on.join(', ')}` : 'no fan-out running');
  process.exit(on.length ? 0 : 1);
}

const rel = (p) => path.relative(process.cwd(), p).split(path.sep).join('/');
const folder = path.resolve(argv[0] || '');
const round = argv[1] || '';
const names = argv
  .slice(2)
  .flatMap((a) => a.split(','))
  .map((a) => a.trim())
  .filter(Boolean);
if (!names.length || !/^\d+$/.test(round)) stop('usage: run.cjs <review folder> <round> <name[:model]>[,...]');
if (!fs.existsSync(path.join(folder, 'prompt.md'))) stop(`no prompt.md in ${argv[0]}`);
if (!/^[A-Za-z0-9._-]+$/.test(path.basename(folder)))
  stop(
    `can't fan out a review folder named "${path.basename(folder)}": only ASCII letters, digits and ._- are passed on`,
  );

// Claimed before result names are assigned: this runner's own marker goes in first, then any other live one
// stops it. Each fan-out has its own file, so nobody clears a marker another runner may have just replaced; of
// two started at once, the later sees the earlier, or each sees the other and both start nothing.
const marker = path.join(folder, `fanout-${process.pid}.json`);
const mark = (pids) => {
  fs.writeFileSync(`${marker}.tmp`, JSON.stringify({ pids: [process.pid, ...pids] }));
  fs.renameSync(`${marker}.tmp`, marker);
};
// A killed runner that had this pid may have left this very file, its programs still running.
if (live(marker)) stop(`fan-out still running: ${rel(marker)}`);
mark([]);
process.on('exit', () => fs.rmSync(marker, { force: true }));
for (const other of markers(folder)) {
  if (other === marker) continue;
  if (live(other)) stop(`fan-out still running: ${rel(other)}`);
  fs.rmSync(other, { force: true });
}

const taken = new Set(fs.readdirSync(folder).map((f) => f.toLowerCase()));
const entries = names.map((entry) => {
  const colon = entry.indexOf(':');
  const name = colon < 0 ? entry : entry.slice(0, colon);
  const model = colon < 0 ? null : entry.slice(colon + 1);
  if (!Object.hasOwn(PROGRAMS, name))
    stop(`can't run "${entry}": unknown reviewer (${Object.keys(PROGRAMS).join(', ')})`);
  // A leading dash would read as a flag of the program.
  if (model !== null && !/^(?!-)[A-Za-z0-9._/:-]+$/.test(model))
    stop(`can't run "${entry}": a model is ASCII letters, digits and ._/:- only, not empty, and doesn't start with -`);
  const why = missing(name);
  if (why) stop(`can't run "${entry}": ${why}`);
  const bin = BIN[name] || name;
  const file = which(bin);
  const base = `r${round}-${name}${model ? `-${model.replace(/[^A-Za-z0-9.]/g, '-')}` : ''}`;
  let result = `${base}.md`;
  for (let n = 2; taken.has(result.toLowerCase()); n++) result = `${base}-${n}.md`;
  taken.add(result.toLowerCase());
  return { entry, name, model, bin, file, result: path.join(folder, result) };
});

const hash = (file) => {
  try {
    return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
  } catch {
    return 'unreadable';
  }
};
const walk = (dir) => {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  } catch {
    return [];
  }
};
// By full path on Windows: older Node looks a bare name up in the current directory, the tree under review,
// before PATH, and doesn't honor the variable set above. Only an .exe or .com starts without a shell, so a
// shim earlier on PATH is passed over, and with none the repository is not compared rather than run bare.
const GIT = win
  ? (process.env.PATH || '')
      .split(path.delimiter)
      .filter((d) => path.isAbsolute(d))
      .flatMap((d) => ['git.exe', 'git.com'].map((x) => path.join(d, x)))
      .find((f) => fs.existsSync(f))
  : which('git');
const TASKKILL = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
// windowsHide: a runner started detached has no console, so each console child would open a window of its own.
const git = (...args) => {
  if (!GIT) return '';
  const r = spawnSync(GIT, args, { encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true });
  return r.status === 0 ? r.stdout : '';
};
let notCompared = '';
const ours = new Set(entries.map((e) => e.result));

// What a program could leave behind: label → state. Compared before and after; nothing is undone.
function snapshot() {
  const s = {};
  for (const f of walk(folder))
    if (!ours.has(f) && f !== marker && f !== `${marker}.tmp`) s[`review folder: ${rel(f)}`] = hash(f);
  const top = git('rev-parse', '--show-toplevel').trim();
  if (!top) {
    notCompared = GIT ? 'not a git repository, or git could not read it' : 'no git on PATH';
    return s;
  }
  const prefix = git('rev-parse', '--show-prefix').trim();
  const status = git('status', '--porcelain', '-z', '--untracked-files=all').split('\0');
  for (let i = 0; i < status.length; i++) {
    const [xy, file] = [status[i].slice(0, 2), status[i].slice(3)];
    if (!file) continue;
    if (/[RC]/.test(xy)) i++; // the next field is the rename's old path
    // The review folder is compared above, ignored or not. Paths as git gives them: relative to the top.
    if (!file.startsWith(`${path.posix.join(prefix, rel(folder))}/`))
      s[`file: ${file}`] = `${xy} ${hash(path.join(top, file))}`;
  }
  for (const flag of ['-s', '-v'])
    for (const line of git('ls-files', flag, '-z').split('\0')) {
      const file = flag === '-s' ? line.split('\t')[1] : line.slice(2);
      const key = `index${flag === '-v' ? ' flags' : ''}: ${file}`;
      // Added to, not replaced: a conflicted file has an entry per stage.
      if (file) s[key] = `${s[key] || ''} ${flag === '-s' ? line.split('\t')[0] : line[0]}`;
    }
  s['checked-out commit'] = git('rev-parse', '-q', '--verify', 'HEAD').trim();
  s['checked-out branch'] = git('symbolic-ref', '-q', 'HEAD').trim();
  for (const line of git('for-each-ref', '--format=%(refname) %(objectname)').split('\n'))
    if (line) s[`ref: ${line.split(' ')[0]}`] = line.split(' ')[1];
  for (const line of git('worktree', 'list', '--porcelain').split('\n'))
    if (line.startsWith('worktree ')) s[`worktree: ${line.slice(9)}`] = 'present';
  const gitPath = (p) => path.resolve(git('rev-parse', '--git-path', p).trim());
  const hooks = gitPath('hooks');
  for (const f of walk(hooks)) s[`git hook: ${path.relative(hooks, f)}`] = hash(f);
  s['local git config'] = hash(gitPath('config'));
  s['local exclude file'] = hash(gitPath('info/exclude'));
  // Left by a program stopped mid-write, it blocks the author's next git command.
  if (fs.existsSync(gitPath('index.lock'))) s['git index lock'] = 'present';
  return s;
}

function killTree(pid) {
  if (win) spawnSync(TASKKILL, ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {}
}

const before = snapshot();

const lastLine = (text) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .pop() || '';
const verdict = (file) => {
  try {
    const last = lastLine(fs.readFileSync(file, 'utf8'));
    return /^Verdict: (SIGN OFF|CHANGES NEEDED)$/.test(last) ? last : '';
  } catch {
    return null;
  }
};

let reports = 0;
let left = entries.length;
for (const e of entries) {
  const args = PROGRAMS[e.name](e.model);
  // Detached: head of its own process group, so stopping it takes its tree; on Windows, outside Node's job
  // object, so a runner killed outright leaves the pid in the marker alive as long as the program is.
  const opts = { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, detached: true };
  // Windows: a detached process has no console, so each console command a program ran would open a window. A
  // detached Node stands in for the program and starts it with a hidden console its children share. A .cmd shim
  // only starts through a shell, which gets the bare name, flags and the validated model; a detached cmd.exe
  // would also never pass stdin's end on.
  const shim = /\.(cmd|bat)$/i.test(e.file);
  const child = win
    ? spawn(process.execPath, ['-e', WRAP, ...(shim ? ['shell', e.bin] : ['exe', e.file]), ...args], opts)
    : spawn(e.file, args, opts);
  e.child = child;
  // After each start, so a runner killed mid-loop leaves the programs it started in the marker.
  try {
    mark(entries.map((x) => x.child?.pid).filter(Boolean));
  } catch {} // the marker stays live through the runner's own pid
  let out = '';
  let err = '';
  child.stdout.on('data', (d) => {
    out = (out + d).slice(-4000);
  });
  child.stderr.on('data', (d) => {
    err = (err + d).slice(-4000);
  });
  child.stdin.on('error', () => {});
  child.stdin.end(
    `Read ${rel(path.join(folder, 'prompt.md'))} and do what it says. Write your report to exactly this path: ${rel(e.result)}\n`,
  );
  let stopped = false;
  const timer = setTimeout(() => {
    stopped = true;
    killTree(child.pid);
  }, limit);
  let done = false;
  // 'exit', not 'close': a stray child may hold the pipes open.
  const finish = (code, signal) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    const v = verdict(e.result);
    const how = stopped
      ? 'stopped at the limit, '
      : signal
        ? `killed (${signal}), `
        : code
          ? `failed (exit ${code}), `
          : '';
    const tail = lastLine(err) || lastLine(out);
    if (v) reports++;
    console.log(
      v
        ? `${e.entry}: ${how}${v} ${rel(e.result)}`
        : `${e.entry}: ${how}${v === null ? 'no result file' : `incomplete result file ${rel(e.result)} (no closing Verdict: line)`}${tail ? `. Last output: ${tail.slice(0, 300)}` : ''}`,
    );
    if (--left === 0) end();
  };
  child.on('exit', finish);
  child.on('error', (x) => {
    err += `\n${x.message}`;
    finish(1);
  });
}

// Told to stop (interrupt, terminate, hang-up or a closed console): take every program's tree along. Only those
// still running: an exited one's pid may be another process's by now.
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP'])
  process.on(sig, () => {
    for (const { child } of entries)
      if (child.pid && child.exitCode === null && child.signalCode === null) killTree(child.pid);
    process.exit(130);
  });

function end() {
  const after = snapshot();
  const diff = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((k) => before[k] !== after[k])
    .map((k) =>
      k.startsWith('file: ')
        ? `${k} (${k in after ? `git status ${after[k].slice(0, 2).trim()}` : 'no longer modified or untracked'})`
        : `${k} (${!(k in before) ? 'new' : !(k in after) ? 'gone' : 'changed'})`,
    );
  console.log(diff.length ? `Differs from before the programs started:\n${diff.join('\n')}` : 'No leftovers found.');
  if (notCompared) console.log(`The repository was not compared (${notCompared}): only the review folder was.`);
  console.log(NOT_COVERED);
  if (!reports) console.log('No reviewer reported.');
  process.exit(reports ? 0 : 1);
}
