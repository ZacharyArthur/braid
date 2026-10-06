#!/usr/bin/env node
// braid hook: one script for Claude Code, Codex and ZCode.
//   node braid.cjs session    SessionStart: inject core rules + project pointers
//   node braid.cjs prompt     UserPromptSubmit: track level / drift / adhd per session
//   node braid.cjs subagent   SubagentStart: inject core rules into subagents
// Stdlib only, .cjs so a parent package.json with "type": "module" can't break it.
// Never throws, never blocks: every failure degrades to injecting less.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CORE = path.join(ROOT, 'skills', 'braid', 'core.md');
const ADHD = path.join(ROOT, 'skills', 'adhd', 'SKILL.md');
const LEVELS = ['lite', 'full', 'ultra'];
const DATA =
  process.env.CLAUDE_PLUGIN_DATA ||
  process.env.ZCODE_PLUGIN_DATA ||
  process.env.PLUGIN_DATA ||
  path.join(os.tmpdir(), 'braid');
const SESSIONS = path.join(DATA, 'sessions');

const event = process.argv[2];
const EVENT_NAME = { session: 'SessionStart', prompt: 'UserPromptSubmit', subagent: 'SubagentStart' }[event];

// --- session state: { mode, drift, adhd } keyed by session id ---

function statePath(sid) {
  return path.join(SESSIONS, `${String(sid).replace(/[^\w-]/g, '_')}.json`);
}
// No session id → defaults, never a shared file one session could switch off for another.
// Each field is validated on its own, so a hand-edited or stale file can't inject odd values.
function load(sid) {
  let s = {};
  if (sid)
    try {
      s = JSON.parse(fs.readFileSync(statePath(sid), 'utf8')) || {};
    } catch {}
  return {
    mode: [...LEVELS, 'off'].includes(s.mode) ? s.mode : 'full',
    drift: s.drift === true,
    adhd: s.adhd === true,
  };
}
function save(sid, st) {
  fs.mkdirSync(SESSIONS, { recursive: true });
  fs.writeFileSync(statePath(sid), JSON.stringify(st));
}
function prune() {
  const cutoff = Date.now() - 7 * 864e5;
  for (const f of fs.readdirSync(SESSIONS)) {
    const p = path.join(SESSIONS, f);
    if (fs.statSync(p).mtimeMs < cutoff) fs.unlinkSync(p);
  }
}

// --- injected text ---

const stripFrontmatter = (s) => s.replace(/^---[\s\S]*?---\s*/, '');
const tryRead = (p) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
};

// Keep only the active level's row of the levels table.
function core(mode) {
  const text = tryRead(CORE);
  if (!text) return null;
  const body = text
    .split(/\r?\n/)
    .filter((line) => {
      const row = line.match(/^\|\s*\*\*(\w+)\*\*\s*\|/);
      return !row || !LEVELS.includes(row[1]) || row[1] === mode;
    })
    .join('\n');
  return `BRAID ACTIVE — level: ${mode}\n\n${body}`;
}

// One level's row of that table: a mid-session switch confirms with it, since the session only got the start level's row.
function levelRow(mode) {
  const row = (tryRead(CORE) || '').match(new RegExp(`^\\|\\s*\\*\\*${mode}\\*\\*\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'm'));
  return row ? row[1] : '';
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, timeout: 1000, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

// `<!-- braid:map sha=abc1234 -->` header → "built at abc1234, 3 commits behind"
function staleness(cwd, file, verb) {
  const sha = (tryRead(file) || '').match(/braid:\w+ sha=([0-9a-f]{7,40})/);
  if (!sha) return '';
  const n = git(cwd, ['rev-list', '--count', `${sha[1]}..HEAD`]);
  return ` (${verb} at ${sha[1].slice(0, 7)}${n === null ? '' : `, ${n} commits since`})`;
}

function count(text, re) {
  return (text.match(re) || []).length;
}
// Pointer lines stay short however busy the repo is: name a few, count the rest, clip long names.
const few = (items, max = 3) =>
  items.slice(0, max).join(', ') + (items.length > max ? ` and ${items.length - max} more` : '');
const clip = (name, max = 40) => {
  const c = [...name];
  return c.length > max ? `${c.slice(0, max - 1).join('')}…` : name;
};

function pointers(cwd) {
  const dir = path.join(cwd, 'braid');
  const lines = [];
  const ls = (rel) => {
    try {
      return fs.readdirSync(path.join(cwd, rel), { withFileTypes: true });
    } catch {
      return [];
    }
  };

  // Changes live in braid/changes, or openspec/changes in an OpenSpec project (same tasks.md
  // checkboxes). A change with tasks is active; one without (e.g. queued by spec discover) is queued.
  const changes = [],
    queued = [];
  for (const root of ['braid/changes', 'openspec/changes']) {
    for (const e of ls(root)) {
      if (!e.isDirectory() || e.name === 'archive') continue;
      const tasks = tryRead(path.join(cwd, root, e.name, 'tasks.md')) || '';
      const done = count(tasks, /^\s*- \[x\]/gim);
      const total = done + count(tasks, /^\s*- \[ \]/gm);
      if (total) changes.push(`${root}/${clip(e.name)} (${done}/${total} tasks)`);
      else queued.push(`${root}/${clip(e.name)}`);
    }
  }
  if (changes.length)
    lines.push(`Active change: ${few(changes)}. Re-read its tasks.md before editing code; tick tasks as they finish.`);
  if (queued.length) lines.push(`Queued proposals: ${few(queued)}. Not started; /braid:spec propose <name> plans one.`);

  const routes = ls('braid/routes')
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .flatMap((e) => {
      const open = count(tryRead(path.join(dir, 'routes', e.name)) || '', /^\s*- \[ \]/gm);
      return open ? [`${clip(e.name.slice(0, -3))} (${open} open)`] : [];
    });
  if (routes.length) lines.push(`Active route: ${few(routes)}. See braid/routes/.`);

  const map = path.join(dir, 'map.md');
  if (fs.existsSync(map))
    lines.push(
      `Repo map: braid/map.md${staleness(cwd, map, 'built')}. Read it before writing code here; it says what already exists.`,
    );

  const handoff = path.join(dir, 'HANDOFF.md');
  if (fs.existsSync(handoff))
    lines.push(`Handoff: braid/HANDOFF.md${staleness(cwd, handoff, 'written')}. Read it first.`);

  return lines;
}

function adhd() {
  const text = tryRead(ADHD);
  return text && `ADHD MODE ACTIVE (restored by braid)\n\n${stripFrontmatter(text)}`;
}

// --- events ---

// The core plus the project pointers: what a session starts with.
function coreWithState(mode, cwd) {
  const p = pointers(cwd || process.cwd());
  return [core(mode), p.length && `## Project state\n\n${p.map((l) => `- ${l}`).join('\n')}`]
    .filter(Boolean)
    .join('\n\n');
}

function onSession(input, st) {
  if (input.source === 'startup') {
    try {
      prune();
    } catch {}
  }
  const parts = [];
  if (st.mode !== 'off') parts.push(coreWithState(st.mode, input.cwd));
  if (st.adhd) parts.push(adhd());
  return parts.filter(Boolean).join('\n\n');
}

function onPrompt(input, st, sid) {
  // ZCode's and Codex's skill pickers deliver invocations raw: "[$braid](<path>) lite" — normalize to "$braid lite".
  const prompt = String(input.prompt || '')
    .trim()
    .toLowerCase()
    .replace(/^\[(\$[\w:-]+)\]\([^)]+\)\s*/, '$1 ');
  const out = [];
  let changed = false;

  const cmd = prompt.match(/^[/$@](?:braid:)?braid(?:\s+(.*))?$/);
  if (cmd) {
    const arg = (cmd[1] || '').trim();
    const drift = arg.match(/^drift\s+(on|off)$/);
    const wasOff = st.mode === 'off';
    // Bare command while off switches back on at full. Coming back from off sends what a session starts with: compaction may have dropped it.
    if (LEVELS.includes(arg) || arg === 'off' || (!arg && wasOff)) {
      st.mode = arg || 'full';
      changed = true;
      out.push(
        st.mode === 'off'
          ? 'BRAID OFF for this session.'
          : wasOff
            ? coreWithState(st.mode, input.cwd)
            : `BRAID LEVEL: ${st.mode} — ${levelRow(st.mode)}`,
      );
    } else if (drift) {
      st.drift = drift[1] === 'on';
      changed = true;
      out.push(`BRAID DRIFT REMINDER: ${drift[1]}`);
    } else if (!arg)
      out.push(`BRAID ACTIVE — level: ${st.mode}${st.drift ? ', drift reminder on' : ''}${st.adhd ? ', adhd on' : ''}`);
  } else if (/^stop braid[.!]?$/.test(prompt)) {
    st.mode = 'off';
    changed = true;
    out.push('BRAID OFF for this session.');
  }

  if (/^[/$@](?:braid:)?adhd\b/.test(prompt)) {
    st.adhd = true;
    changed = true;
  } else if (/^(stop adhd mode|normal mode)[.!]?$/.test(prompt)) {
    st.adhd = false;
    changed = true;
  }

  if (changed && sid) save(sid, st);
  if (st.drift && st.mode !== 'off' && !cmd)
    out.push(`braid: ${st.mode} · YAGNI > KISS > DRY · ladder first · done means verified`);
  return out.join('\n');
}

function run(raw) {
  let input = {};
  try {
    input = JSON.parse(raw.replace(/^﻿/, ''));
  } catch {}
  const sid = input.session_id || input.sessionId;
  const st = load(sid);
  const context =
    event === 'session'
      ? onSession(input, st)
      : event === 'prompt'
        ? onPrompt(input, st, sid)
        : event === 'subagent' && st.mode !== 'off'
          ? core(st.mode)
          : '';
  if (context && EVENT_NAME) {
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: EVENT_NAME, additionalContext: context } }),
    );
  }
}

// Read stdin, but never hang: on Windows the hook's stdin can be swallowed so
// 'end' never fires. The fallback timer must stay ref'd or it never runs.
let raw = '';
let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  try {
    run(raw);
  } catch {}
  process.exit(0);
}
process.stdin.on('data', (c) => {
  raw += c;
});
process.stdin.on('end', finish);
process.stdin.on('error', finish);
setTimeout(finish, 1000);
