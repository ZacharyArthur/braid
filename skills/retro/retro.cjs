#!/usr/bin/env node
// braid retro: failed tool calls that recur across sessions, from every harness's transcripts on this machine.
// Run: node retro.cjs [all] [insights] [<sessions>] [<days>d]   (defaults: 30 sessions, 30 days, this project)
// Prints signatures, counts, dates and one snippet each; never prompts or model text, never writes.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

let limit = 30;
let days = 30;
let all = false;
let insights = false;
for (const a of process.argv.slice(2)) {
  if (a === 'all') all = true;
  else if (a === 'insights') insights = true;
  else if (/^\d+$/.test(a)) limit = Number(a);
  else if (/^\d+d$/.test(a)) days = Number(a.slice(0, -1));
  else {
    console.error(`retro: unknown argument "${a}"; usage: retro.cjs [all] [insights] [<sessions>] [<days>d]`);
    process.exit(2);
  }
}

const home = os.homedir();
const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(home, '.claude');
const codexDir = process.env.CODEX_HOME || path.join(home, '.codex');
const zcodeDb = path.join(home, '.zcode', 'cli', 'db', 'db.sqlite');
// Pi's session folder as Pi resolves it, `~` included; a `sessionDir` in Pi's settings file is not read.
const tilde = (p) => p.replace(/^~(?=$|[\\/])/, home);
const piSessionsDir = tilde(
  process.env.PI_CODING_AGENT_SESSION_DIR || path.join(process.env.PI_CODING_AGENT_DIR || '~/.pi/agent', 'sessions'),
);
const since = Math.max(0, Date.now() - days * 86400000); // any window, however large
const norm = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));
const root = (() => {
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { stdio: ['ignore', 'pipe', 'ignore'] });
    return norm(top.toString().trim());
  } catch {
    return norm(process.cwd());
  }
})();
const inProject = (cwd) => all || (!!cwd && (norm(cwd) === root || norm(cwd).startsWith(root + path.sep)));
const exists = (p) => fs.existsSync(p);
const files = (dir, test) =>
  exists(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? files(p, test) : test(e.name) ? [p] : [];
      })
    : [];
const parse = (line) => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};
// A transcript's working directory from its first ~256 KiB, without reading the whole file.
const headCwd = (file) => {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(262144);
  const n = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const m = buf.toString('utf8', 0, n).match(/"cwd":\s*"((?:[^"\\]|\\.)*)"/);
  return m ? parse(`"${m[1]}"`) : null;
};

// The program a shell command runs: the first segment's executable, past cd, export and set, env prefixes
// (`FOO=1 git`), PowerShell assignments (`$x = git ...`; a literal `$x = 'a'` is skipped), the `&` call operator, a
// quoted path (`"/usr/bin/git" push`) and here-string bodies.
const SHELL_TOOLS = new Set(['Bash', 'PowerShell', 'exec', 'exec_command', 'bash', 'powershell']);
const program = (cmd) => {
  const text = String(cmd || '').replace(/@(['"])\r?\n[\s\S]*?\r?\n\1@/g, '');
  for (const seg of text.split(/&&|\|\||;|\||\n/)) {
    let s = seg.trim().replace(/^([A-Za-z_]\w*=("[^"]*"|'[^']*'|\S*)\s+)+/, '');
    const rest = s.replace(/^\$[\w:]+\s*=\s*/, '');
    const assigned = rest !== s && !rest.startsWith('&'); // `$x = & "git.exe"` still runs git
    s = rest.replace(/^&\s*/, '');
    const quoted = s.match(/^(["'])(.*?)\1/);
    if (quoted && assigned) continue; // `$x = 'a'` assigns a literal; nothing runs
    // Split on both separators so a Windows path reads the same on any OS.
    const w = (quoted ? quoted[2] : s.split(/\s+/)[0])
      .split(/[\\/]/)
      .pop()
      .replace(/\.(exe|cmd|bat|ps1)$/i, '');
    if (/^[a-z][\w.+-]*$/i.test(w) && !/^(cd|set-location|pushd|sl|export|set)$/i.test(w)) return w.toLowerCase();
  }
  return '?';
};
// The line that names the error, else the first one past exit-code and timing headers.
// biome-ignore lint/suspicious/noControlCharactersInRegex: matches ANSI colour codes in tool output
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const firstLine = (text) => {
  const lines = String(text || '')
    .replace(/<\/?tool_use_error>/g, '')
    .replace(ANSI, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !/^(exit code:?\s*-?\d+|wall time\b.*|process exited with code.*|output:?|chunk id:.*|script failed|script error:)$/i.test(
          l,
        ),
    );
  const named = lines.find((l) => /error|fatal|denied|not found|cannot|can't|failed|unknown|invalid|no such/i.test(l));
  return (named || lines[0] || '(no output)').slice(0, 200);
};
// One signature per kind of failure, the same in every harness: numbers, paths and quoted strings collapse.
const signature = (tool, cmd, line) => {
  const err = line
    .replace(/(^|\W)(["'`]).*?\2/g, '$1Q') // `can't find 'a.js'` still quotes 'a.js'
    .replace(/(?:[A-Za-z]:)?[\w.~-]*[\\/][^\s:,)]*/g, 'P')
    .replace(/\b0x[0-9a-f]+\b|\d+/gi, 'N')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
  return `${SHELL_TOOLS.has(tool) ? `shell ${program(cmd)}` : tool}: ${err}`;
};

// Each store yields sessions { harness, id, time, cwd, failures() → [{ tool, cmd, text }] }.
function claudeSessions() {
  const dir = path.join(claudeDir, 'projects');
  const prefix = root.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && (all || e.name.toLowerCase().startsWith(prefix)))
    .flatMap((e) =>
      fs
        .readdirSync(path.join(dir, e.name))
        .filter((f) => f.endsWith('.jsonl'))
        .map((f) => path.join(dir, e.name, f)),
    )
    .map((file) => ({
      harness: 'claude',
      id: path.basename(file, '.jsonl'),
      time: fs.statSync(file).mtimeMs,
      cwd: () => headCwd(file),
      failures() {
        const calls = new Map();
        const out = [];
        for (const j of fs.readFileSync(file, 'utf8').split('\n').map(parse)) {
          const content = j?.message?.content;
          if (!Array.isArray(content)) continue;
          for (const c of content) {
            if (c.type === 'tool_use') calls.set(c.id, { tool: c.name, cmd: c.input?.command });
            if (c.type === 'tool_result' && c.is_error) {
              const text = Array.isArray(c.content) ? c.content.map((x) => x.text || '').join('\n') : c.content;
              // A rejected call carries the user's own words after this marker; they stay out.
              const own = String(text ?? '').split(/\bthe user said:/i)[0];
              out.push({ ...(calls.get(c.tool_use_id) || { tool: '?' }), text: own });
            }
          }
        }
        return out;
      },
    }));
}

// Codex runs tools from a script: each `tools.<name>(` is one step, and its results come back as JSON, one line or
// array element per step (`i` when the steps ran in parallel). A command still running returns a session_id that a
// later `write_stdin` step finishes, so that result is blamed on the command that started it.
const steps = (input) => {
  const parts = String(input || '').split(/\btools\.(?=\w+\()/);
  return (parts.length > 1 ? parts.slice(1) : parts).map((s) => {
    const q = s.match(/["']?\b(?:cmd|command)["']?\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)/)?.[1];
    const sid = /^write_stdin\(/.test(s) ? s.match(/session_id\W{0,3}(\d+)/)?.[1] : undefined;
    return { cmd: q && (q[0] === '"' ? parse(q) : q.slice(1, -1)), sid };
  });
};
function* exits(v, i, output) {
  if (!v || typeof v !== 'object') return;
  const out = typeof v.output === 'string' ? v.output : output;
  if (typeof v.exit_code === 'number' || typeof v.session_id === 'number')
    yield { code: v.exit_code, sid: v.session_id, i, out };
  for (const [k, x] of Object.entries(v)) if (k !== 'output') yield* exits(x, i, out);
}
function codexSessions() {
  return files(path.join(codexDir, 'sessions'), (n) => n.endsWith('.jsonl')).map((file) => ({
    harness: 'codex',
    id: path.basename(file, '.jsonl'),
    time: fs.statSync(file).mtimeMs,
    cwd: () => headCwd(file),
    failures() {
      const calls = new Map();
      const running = new Map(); // session_id → the command that started it
      const out = [];
      for (const j of fs.readFileSync(file, 'utf8').split('\n').map(parse)) {
        const p = j?.type === 'response_item' && j.payload;
        if (!p) continue;
        if (/_call$/.test(p.type)) calls.set(p.call_id, steps(p.input ?? p.arguments));
        if (!/_call_output$/.test(p.type)) continue;
        const call = calls.get(p.call_id) || [];
        const only = call.length === 1 ? call[0].cmd : undefined;
        const text = Array.isArray(p.output) ? p.output.map((x) => x.text || '').join('\n') : String(p.output ?? '');
        const items = [];
        for (const block of parse(text) ? [text] : text.split('\n')) {
          const v = /^[[{]/.test(block.trim()) && parse(block.trim());
          if (v) items.push(...(Array.isArray(v) ? v : [v]));
        }
        // Positions name a step only when results and steps pair up; `[a, b].map(tools.x)` breaks the pairing.
        const paired = items.length === call.length;
        const found = items.flatMap((el, k) => [...exits(el, el?.i ?? k)]);
        for (const f of found) {
          const step = paired ? call[f.i] : undefined;
          const cmd = step?.cmd ?? (step?.sid && running.get(step.sid));
          if (f.code === undefined) running.set(String(f.sid), cmd);
          else if (f.code !== 0) out.push({ tool: 'exec', cmd, text: f.out ?? text });
        }
        if (found.length) continue;
        const code = text.match(/(?:exit_code|exit code)\W{0,4}(-?\d+)/i);
        const script = text.match(/^Script failed\b[\s\S]*?Script error:\s*([\s\S]*)/);
        if (code && code[1] !== '0') out.push({ tool: 'exec', cmd: only, text });
        // apply_patch, a rejected exec_command, or the script itself (a JS error).
        else if (script)
          out.push({
            tool: script[1].match(/^(\w+) (?:verification )?failed/)?.[1] || 'script',
            cmd: only,
            text: script[1],
          });
      }
      return out;
    },
  }));
}

// ZCode keeps sessions in SQLite; node:sqlite ships unflagged from Node 22.13.
let zcodeNote = '';
function zcodeSessions() {
  if (!exists(zcodeDb)) return [];
  let DatabaseSync;
  try {
    process.removeAllListeners('warning'); // its ExperimentalWarning would land in the model's input
    ({ DatabaseSync } = require('node:sqlite'));
  } catch {
    zcodeNote = 'zcode: skipped, reading its store needs node:sqlite (Node 22.13 or later)';
    return [];
  }
  // A locked, corrupt or reshaped store skips ZCode only, so the other harnesses still report.
  const skip = (e) => {
    zcodeNote = `zcode: skipped, its store could not be read (${e.message})`;
    return [];
  };
  try {
    // Opening a WAL-mode store makes SQLite create its -wal and -shm files beside it, if they are missing.
    const db = new DatabaseSync(zcodeDb, { readOnly: true });
    const usage = db.prepare(
      "SELECT tool_call_id, tool_name, error_message FROM tool_usage WHERE session_id = ? AND (status = 'error' OR exit_code <> 0)",
    );
    const part = db.prepare("SELECT data FROM part WHERE session_id = ? AND json_extract(data, '$.callID') = ?");
    // Subagent sessions (parent_id set) are left out: their failures belong to the parent's run.
    return db
      .prepare('SELECT id, directory, time_updated FROM session WHERE parent_id IS NULL AND time_deleted IS NULL')
      .all()
      .map((s) => ({
        harness: 'zcode',
        id: s.id,
        time: s.time_updated,
        cwd: () => s.directory,
        failures() {
          try {
            return usage.all(s.id).map((u) => {
              const st = parse(part.get(s.id, u.tool_call_id)?.data)?.state || {};
              return { tool: u.tool_name, cmd: st.input?.command, text: st.error || st.output || u.error_message };
            });
          } catch (e) {
            return skip(e);
          }
        },
      }));
  } catch (e) {
    return skip(e);
  }
}

// Pi: one JSONL per session, a failed call a `toolResult` message with isError, its command in the matching
// assistant `toolCall` block.
function piSessions() {
  return files(piSessionsDir, (n) => n.endsWith('.jsonl')).map((file) => ({
    harness: 'pi',
    id: path.basename(file, '.jsonl'),
    time: fs.statSync(file).mtimeMs,
    cwd: () => headCwd(file),
    failures() {
      const calls = new Map();
      const out = [];
      for (const j of fs.readFileSync(file, 'utf8').split('\n').map(parse)) {
        const m = j?.type === 'message' && j.message;
        if (!m) continue;
        if (m.role === 'assistant' && Array.isArray(m.content))
          for (const c of m.content) if (c.type === 'toolCall') calls.set(c.id, c.arguments?.command);
        if (m.role === 'toolResult' && m.isError) {
          const text = Array.isArray(m.content) ? m.content.map((x) => x.text || '').join('\n') : m.content;
          out.push({ tool: m.toolName || '?', cmd: calls.get(m.toolCallId), text });
        }
      }
      return out;
    },
  }));
}

const sessions = [...claudeSessions(), ...codexSessions(), ...zcodeSessions(), ...piSessions()]
  .filter((s) => s.time >= since && inProject(s.cwd()))
  .sort((a, b) => b.time - a.time)
  .slice(0, limit);

const groups = new Map();
for (const s of sessions)
  for (const f of s.failures()) {
    const line = firstLine(f.text);
    const key = signature(f.tool, f.cmd, line);
    const g = groups.get(key) || { key, sessions: new Set(), harnesses: new Set(), last: 0, example: line };
    g.sessions.add(`${s.harness}:${s.id}`);
    g.harnesses.add(s.harness);
    g.last = Math.max(g.last, s.time);
    groups.set(key, g);
  }
const day = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const counts = ['claude', 'codex', 'zcode', 'pi'].map((h) => `${h} ${sessions.filter((s) => s.harness === h).length}`);
console.log(
  `retro: ${all ? 'all projects' : root} · ${sessions.length} sessions (${counts.join(', ')}) · since ${day(since)}`,
);
if (zcodeNote) console.log(zcodeNote);
const recurring = [...groups.values()]
  .filter((g) => g.sessions.size >= 2)
  .sort((a, b) => b.sessions.size - a.sessions.size);
if (!recurring.length) console.log('no failure recurs in 2 or more sessions');
for (const [n, g] of recurring.entries()) {
  const harnesses = [...g.harnesses].sort().join(', ');
  console.log(`${n + 1}. ${g.sessions.size} sessions (${harnesses}) · ${g.key.split(':')[0]} · last ${day(g.last)}`);
  console.log(`   ${g.example}`);
}
if (groups.size > recurring.length) console.log(`${groups.size - recurring.length} one-off signatures not shown`);

// /insights (Claude Code): per-session friction from usage-data/facets, suggested rules from report.html.
if (insights) {
  const dir = path.join(claudeDir, 'usage-data');
  const report = path.join(dir, 'report.html');
  if (!exists(report) || fs.statSync(report).mtimeMs < since) {
    console.log('insights: no /insights report in the window; run /insights first, then rerun retro insights');
  } else {
    const friction = new Map();
    for (const f of files(path.join(dir, 'session-meta'), (n) => n.endsWith('.json'))) {
      const meta = parse(fs.readFileSync(f, 'utf8'));
      if (!meta || Date.parse(meta.start_time) < since || !inProject(meta.project_path)) continue;
      const facet = path.join(dir, 'facets', path.basename(f));
      const fc = exists(facet) && parse(fs.readFileSync(facet, 'utf8'));
      for (const k of Object.keys(fc?.friction_counts || {})) {
        const e = friction.get(k) || { n: 0, detail: String(fc.friction_detail || '').slice(0, 200) };
        e.n++;
        friction.set(k, e);
      }
    }
    console.log(`insights friction (${all ? 'all projects' : 'this project'}):`);
    for (const [k, e] of [...friction].sort((a, b) => b[1].n - a[1].n))
      console.log(`- ${k}: ${e.n} sessions · ${e.detail}`);
    const decode = (s) =>
      s
        .replace(/\\n/g, '\n')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&amp;/g, '&');
    const html = fs.readFileSync(report, 'utf8');
    const rules = [...html.matchAll(/class="cmd-checkbox"[^>]*\bdata-text="([^"]*)"/g)].map((m) => decode(m[1]));
    console.log(`insights suggested rules (all projects, ${day(fs.statSync(report).mtimeMs)}):`);
    for (const r of rules) console.log(`---\n${r}`);
  }
}
