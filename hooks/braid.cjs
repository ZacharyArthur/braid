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
const DATA = process.env.CLAUDE_PLUGIN_DATA || process.env.ZCODE_PLUGIN_DATA || process.env.PLUGIN_DATA ||
  path.join(os.tmpdir(), 'braid');
const SESSIONS = path.join(DATA, 'sessions');

const event = process.argv[2];
const EVENT_NAME = { session: 'SessionStart', prompt: 'UserPromptSubmit', subagent: 'SubagentStart' }[event];

// --- session state: { mode, drift, adhd } keyed by session id ---

function statePath(sid) {
  return path.join(SESSIONS, String(sid || 'default').replace(/[^\w-]/g, '_') + '.json');
}
function load(sid) {
  try { return { mode: 'full', ...JSON.parse(fs.readFileSync(statePath(sid), 'utf8')) }; }
  catch { return { mode: 'full' }; }
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
const tryRead = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

// Keep only the active level's row of the levels table.
function core(mode) {
  const text = tryRead(CORE);
  if (!text) return null;
  const body = text.split(/\r?\n/).filter((line) => {
    const row = line.match(/^\|\s*\*\*(\w+)\*\*\s*\|/);
    return !row || !LEVELS.includes(row[1]) || row[1] === mode;
  }).join('\n');
  return `BRAID ACTIVE — level: ${mode}\n\n${body}`;
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { return null; }
}

// `<!-- braid:map sha=abc1234 -->` header → "built at abc1234, 3 commits behind"
function staleness(cwd, file, verb) {
  const sha = (tryRead(file) || '').match(/braid:\w+ sha=([0-9a-f]{7,40})/);
  if (!sha) return '';
  const n = git(cwd, ['rev-list', '--count', `${sha[1]}..HEAD`]);
  return ` (${verb} at ${sha[1].slice(0, 7)}${n === null ? '' : `, ${n} commits since`})`;
}

function count(text, re) { return (text.match(re) || []).length; }

function pointers(cwd) {
  const dir = path.join(cwd, 'braid');
  if (!fs.existsSync(dir)) return [];
  const lines = [];
  const ls = (d) => { try { return fs.readdirSync(path.join(dir, d), { withFileTypes: true }); } catch { return []; } };

  // A change with tasks is active; one without (e.g. a fix queued by spec discover) is only queued.
  const changes = [], queued = [];
  for (const e of ls('changes')) {
    if (!e.isDirectory() || e.name === 'archive') continue;
    const tasks = tryRead(path.join(dir, 'changes', e.name, 'tasks.md')) || '';
    const done = count(tasks, /^\s*- \[x\]/gim);
    const total = done + count(tasks, /^\s*- \[ \]/gm);
    if (total) changes.push(`${e.name} (${done}/${total} tasks)`); else queued.push(e.name);
  }
  if (changes.length) lines.push(`Active change: ${changes.join(', ')}. Re-read its braid/changes/<name>/tasks.md before editing code; tick tasks as they finish.`);
  if (queued.length) lines.push(`Queued proposals: ${queued.join(', ')}. Not started; /braid:spec propose <name> plans one.`);

  const routes = ls('routes').filter((e) => e.isFile() && e.name.endsWith('.md')).flatMap((e) => {
    const open = count(tryRead(path.join(dir, 'routes', e.name)) || '', /^\s*- \[ \]/gm);
    return open ? [`${e.name.slice(0, -3)} (${open} open)`] : [];
  });
  if (routes.length) lines.push(`Active route: ${routes.join(', ')}. See braid/routes/.`);

  const map = path.join(dir, 'map.md');
  if (fs.existsSync(map)) lines.push(`Repo map: braid/map.md${staleness(cwd, map, 'built')}. Read it before broad exploration.`);

  const handoff = path.join(dir, 'HANDOFF.md');
  if (fs.existsSync(handoff)) lines.push(`Handoff: braid/HANDOFF.md${staleness(cwd, handoff, 'written')}. Read it first.`);

  return lines;
}

function adhd() {
  const text = tryRead(ADHD);
  return text && `ADHD MODE ACTIVE (restored by braid)\n\n${stripFrontmatter(text)}`;
}

// --- events ---

function onSession(input, st) {
  if (input.source === 'startup') { try { prune(); } catch {} }
  const parts = [];
  if (st.mode !== 'off') {
    parts.push(core(st.mode));
    const p = pointers(input.cwd || process.cwd());
    if (p.length) parts.push('## Project state\n\n' + p.map((l) => `- ${l}`).join('\n'));
  }
  if (st.adhd) parts.push(adhd());
  return parts.filter(Boolean).join('\n\n');
}

function onPrompt(input, st, sid) {
  const prompt = String(input.prompt || '').trim().toLowerCase();
  const out = [];
  let changed = false;

  const cmd = prompt.match(/^[/$@](?:braid:)?braid(?:\s+(.*))?$/);
  if (cmd) {
    const arg = (cmd[1] || '').trim();
    const drift = arg.match(/^drift\s+(on|off)$/);
    if (LEVELS.includes(arg) || arg === 'off') { st.mode = arg; changed = true; out.push(arg === 'off' ? 'BRAID OFF for this session.' : `BRAID LEVEL: ${arg}`); }
    else if (drift) { st.drift = drift[1] === 'on'; changed = true; out.push(`BRAID DRIFT REMINDER: ${drift[1]}`); }
    else if (!arg) out.push(`BRAID ACTIVE — level: ${st.mode}${st.drift ? ', drift reminder on' : ''}${st.adhd ? ', adhd on' : ''}`);
  } else if (/^stop braid[.!]?$/.test(prompt)) {
    st.mode = 'off'; changed = true; out.push('BRAID OFF for this session.');
  }

  if (/^[/$@](?:braid:)?adhd\b/.test(prompt)) { st.adhd = true; changed = true; }
  else if (/^(stop adhd mode|normal mode)[.!]?$/.test(prompt)) { st.adhd = false; changed = true; }

  if (changed) save(sid, st);
  if (st.drift && st.mode !== 'off' && !cmd) out.push(`braid: ${st.mode} · YAGNI > KISS > DRY · ladder first · done means verified`);
  return out.join('\n');
}

function run(raw) {
  let input = {};
  try { input = JSON.parse(raw.replace(/^﻿/, '')); } catch {}
  const sid = input.session_id || input.sessionId;
  const st = load(sid);
  const context = event === 'session' ? onSession(input, st)
    : event === 'prompt' ? onPrompt(input, st, sid)
    : event === 'subagent' && st.mode !== 'off' ? core(st.mode)
    : '';
  if (context && EVENT_NAME) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: EVENT_NAME, additionalContext: context } }));
  }
}

// Read stdin, but never hang: on Windows the hook's stdin can be swallowed so
// 'end' never fires. The fallback timer must stay ref'd or it never runs.
let raw = '';
let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  try { run(raw); } catch {}
  process.exit(0);
}
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', finish);
process.stdin.on('error', finish);
setTimeout(finish, 1000);
