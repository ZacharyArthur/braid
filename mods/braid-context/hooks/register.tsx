import type { EngineInterface as $, Register, SessionRateLimit } from 'claude-code';
import { atom, read, update } from 'claude-code';

import type { Braid, Cache, Session, Ttl } from '../types';

const cache = atom({ plugin: 'braid-context', key: 'cache' } as const, null);
const braid = atom({ plugin: 'braid-context', key: 'braid' } as const, null);
const session = atom({ plugin: 'braid-context', key: 'session' } as const, null);
const branch = atom({ plugin: 'braid-context', key: 'branch' } as const, null);
// A main-thread response has arrived in this conversation; the cache figures wait for the turn's end.
const answered = atom({ plugin: 'braid-context', key: 'answered' } as const, false);

const TTL_MS = { '5m': 5 * 60_000, '1h': 60 * 60_000 };

const LEVELS = ['lite', 'full', 'ultra'];

const record = (line: string) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};

// Mods can't read Claude Code's own prompt_cache figures (the status line gets them), so the TTL comes
// from the transcript's last cache write: Anthropic's own 5m/1h split. Whole response records only, so
// a "cache_creation" quoted in a prompt or a tool's output can't mislead it.
// shortcut(yagni): $.fs.read rejects past 4 MiB, so a longer transcript's end is read by a child process
// (tail), ~1 s on Windows; read $.session.usage()'s prompt cache instead once mods get it.
async function ttlFromTranscript($: $, path: string): Promise<Ttl | undefined> {
  let text: string;
  try {
    text = await $.fs.read(path);
  } catch {
    text = await tail($, path).catch(() => '');
  }
  for (const line of text.split('\n').reverse()) {
    if (!line.includes('"cache_creation"')) continue;
    const r = record(line);
    if (r?.type !== 'assistant' || r.isSidechain) continue;
    const w = r.message?.usage?.cache_creation;
    if (w?.ephemeral_1h_input_tokens > 0) return '1h';
    if (w?.ephemeral_5m_input_tokens > 0) return '5m';
  }
  return undefined;
}

// A file's last MiB, by bytes: a child's output is cut at 4 MiB, and a line tail could pass that. The first,
// partial line doesn't parse and is skipped. Windows has no `tail` on its PATH; PowerShell seeks instead.
// Single quotes only, so the script survives however the runtime quotes it onto the Windows command line.
const TAIL_BYTES = 1 << 20;
const PS_TAIL = `[Console]::OutputEncoding=[Text.Encoding]::UTF8;$f=[IO.File]::Open($env:BRAID_TAIL,'Open','Read','ReadWrite');$n=[Math]::Min($f.Length,${TAIL_BYTES});[void]$f.Seek(-$n,'End');$b=New-Object byte[] $n;$r=0;while($r -lt $n){$r+=$f.Read($b,$r,$n-$r)};$f.Close();[Console]::Out.Write([Text.Encoding]::UTF8.GetString($b))`;
async function tail($: $, path: string): Promise<string> {
  const init = { timeoutMs: 10_000 };
  try {
    return (await $.process.run(['tail', '-c', String(TAIL_BYTES), path], init)).stdout;
  } catch {
    const ps = ['powershell', '-NoProfile', '-NonInteractive', '-Command', PS_TAIL];
    return (await $.process.run(ps, { ...init, env: { BRAID_TAIL: path } })).stdout;
  }
}

// Subscriptions get usage windows back; API and Bedrock (a gateway's spend_limit included) only a cost.
const isSubscription = (limits: readonly { kind: string }[]) =>
  limits.some((r) => r.kind === 'five_hour' || r.kind === 'seven_day');
// The figures are the last response's: once the 5-hour window's reset passes, nothing of the next one is used yet.
const resetOf = (limits: readonly SessionRateLimit[]) =>
  Date.parse(limits.find((r) => r.kind === 'five_hour')?.resetsAt ?? '');
const fiveHour = (limits: readonly SessionRateLimit[], now: number) => {
  const w = limits.find((r) => r.kind === 'five_hour');
  return w?.resetsAt && Date.parse(w.resetsAt) <= now ? undefined : w;
};

// Same counting as braid's session hook: a change with checkboxes in tasks.md is active.
async function activeChange($: $): Promise<string | null> {
  const found: string[] = [];
  for (const root of ['braid/changes', 'openspec/changes']) {
    const entries = await $.fs.list(root).catch(() => []);
    for (const e of entries) {
      if (e.kind !== 'dir' || e.name === 'archive') continue;
      const tasks = await $.fs.read(`${root}/${e.name}/tasks.md`).catch(() => '');
      const done = (tasks.match(/^\s*- \[x\]/gim) || []).length;
      const total = done + (tasks.match(/^\s*- \[ \]/gm) || []).length;
      if (total) found.push(`${e.name} ${done}/${total}`);
    }
  }
  const [first, ...rest] = found;
  if (!first) return null;
  return rest.length ? `${first} +${rest.length}` : first;
}

// braid keeps each session's level in its plugin data folder; no file means its default, full.
async function braidState($: $, s: Session): Promise<Braid | null> {
  const enabled = ((await $.settings.read()).enabledPlugins ?? {}) as Record<string, unknown>;
  const ids = Object.keys(enabled)
    .filter((k) => k.startsWith('braid@') && enabled[k] === true)
    .map((k) => k.slice(6));
  // <config>/projects/<project>/<session>.jsonl, cut from the end: the config path may hold a "projects" too.
  const data = `${s.transcript.replace(/[\\/]projects[\\/][^\\/]+[\\/][^\\/]+$/, '')}/plugins/data/braid-`;
  // --plugin-dir loads braid@inline in place of an installed copy, which settings still list; the Claude app's
  // synced copy, braid@synced, loads only when no installed copy is enabled. Only the copy that runs writes
  // this session's file, so try each in that order.
  // shortcut(kiss): a folder left by a copy no longer loaded reads as braid on, and a session resumed under
  // another copy can show the old one's level until a new session; have braid.cjs record its folder if that bites.
  const has = (id: string) => $.fs.exists(`${data}${id}`).catch(() => false);
  if (await has('inline')) ids.unshift('inline');
  if (await has('synced')) ids.push('synced');
  if (!ids.length) return null;
  let mode: unknown;
  for (const id of ids) {
    try {
      mode = JSON.parse(await $.fs.read(`${data}${id}/sessions/${s.sid.replace(/[^\w-]/g, '_')}.json`)).mode;
      break;
    } catch {}
  }
  if (mode === 'off') return null;
  const level = typeof mode === 'string' && LEVELS.includes(mode) ? mode : 'full';
  return { level, change: await activeChange($) };
}

// The checked-out branch; null when detached, outside a repository, or without git.
async function gitBranch($: $): Promise<string | null> {
  try {
    // Bounded: this runs as each prompt is submitted.
    const r = await $.process.run(['git', 'branch', '--show-current'], { timeoutMs: 2000 });
    return (r.exitCode === 0 && r.stdout.trim()) || null;
  } catch {
    return null;
  }
}

// The branch first: it never throws, and braidState can (settings unreadable).
async function refresh($: $, s: Session) {
  const g = await gitBranch($);
  await update($, branch, () => g);
  const b = await braidState($, s);
  await update($, braid, () => b);
}

// Called after next(e): braid's own hook, beneath the mods, records a level switch first.
async function remember($: $, e: { transcript_path: string; session_id: string }) {
  const s = { transcript: e.transcript_path, sid: e.session_id };
  await update($, session, () => s);
  await refresh($, s);
}

const tokens = (n: number) =>
  n >= 999_500 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${n}`;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
// One scale for everything that fills up (context, the 5-hour window): yellow from 75%, red from 90%,
// judged on the figure as shown, so 89.6% reads 90% in red.
const fill = (percent: number) => {
  const p = Math.round(percent);
  return p >= 90 ? 'error' : p >= 75 ? 'warning' : undefined;
};
const timeOfDay = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
// Eight cells of block characters. `█` is East Asian Ambiguous width: a terminal set to draw those wide (some
// CJK setups) lengthens each bar, as it does Claude Code's own interface. The band with bars runs to about
// 110 characters, so they start at 120 columns; narrower, it stays text only.
const BAR_MIN_COLUMNS = 120;
const bar = (fraction: number) => {
  const n = Math.round(Math.min(1, Math.max(0, fraction)) * 8);
  return `${'█'.repeat(n)}${'░'.repeat(8 - n)} `;
};

export const register: Register = (on) => {
  // Ticks the countdown while the cache is warm, and redraws once whenever a deadline passes (the cache going
  // cold, the 5-hour window resetting), however late that tick.
  on('session.start', async ($, e, next) => {
    let last = 0;
    $.clock.every(1000, async () => {
      const now = await $.clock.now();
      const value = await read($, cache);
      const expiry = value?.at == null ? 0 : value.at + TTL_MS[value.ttl];
      const reset = resetOf((await $.session.usage()).rateLimits);
      const passed = (deadline: number) => last < deadline && deadline <= now;
      if (now < expiry || passed(expiry) || passed(reset)) $.ui.invalidate('ui.render');
      last = now;
    });
    return next(e);
  });

  // Context, windows and cost moved (a response, a compaction, a window reported anew): draw them.
  on('session.measure', async ($, e, next) => {
    $.ui.invalidate('ui.render');
    return next(e);
  });

  // The engine skips a hook that throws and runs the rest, so a failure here never blocks a prompt.
  on('classic.SessionStart', async ($, e, next) => {
    // A new conversation (startup, /clear, resume, compact) has no cache of its own until its first response.
    await update($, cache, () => null);
    await update($, answered, () => false);
    const result = await next(e);
    await remember($, e);
    return result;
  });
  on('classic.UserPromptSubmit', async ($, e, next) => {
    const result = await next(e);
    await remember($, e);
    return result;
  });

  // The cache's TTL restarts when a request is sent, not when the turn ends; a long final answer would
  // otherwise count as cache life it doesn't have. Lost on a reload, when the turn's end stands in.
  let requested: number | null = null;
  // Only a request the API answered with cache use counts: a failed one never touched the cache.
  // session.measure waits for the turn's end, so each main-thread response redraws context and spend here.
  on('turn.step', async function* ($, e, next) {
    const sent = await $.clock.now();
    const r = yield* next(e);
    if (e.agentId !== undefined) return r;
    const u = r.usage;
    if (u && u.cache_read_input_tokens + u.cache_creation_input_tokens > 0) requested = sent;
    if (u) await update($, answered, () => true);
    $.ui.invalidate('ui.render');
    return r;
  });

  on('turn.complete', async ($, e, next) => {
    const result = await next(e);
    if (e.agentId !== undefined) return result;
    const s = await read($, session);
    // An interrupted or failed turn reports no usage, but its tools may have switched the branch. Caught: a
    // throw (settings unreadable) would skip this whole hook and lose the turn's cache figures below.
    if (s) await refresh($, s).catch(() => {});
    if (!e.usage) return result;
    const u = e.usage;
    const total = u.input_tokens + u.cache_read_input_tokens + u.cache_creation_input_tokens;
    const prev = await read($, cache);
    const ttl =
      (s && (await ttlFromTranscript($, s.transcript))) ??
      prev?.ttl ??
      (isSubscription((await $.session.usage()).rateLimits) ? '1h' : '5m');
    const latest: Cache = {
      at: u.cache_read_input_tokens + u.cache_creation_input_tokens > 0 ? (requested ?? (await $.clock.now())) : null,
      ttl,
      hit: total ? u.cache_read_input_tokens / total : null,
      first: prev == null,
    };
    await update($, cache, () => latest);
    return result;
  });

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e);
    const { Text } = $.ui.resolve(e);
    const { context, rateLimits, cost } = await $.session.usage();
    const window5h = fiveHour(rateLimits, await $.clock.now());
    const c = await read($, cache);
    const b = await read($, braid);
    const g = await read($, branch);
    const gauge = (fraction: number) => (e.props.bodyColumns >= BAR_MIN_COLUMNS ? bar(fraction) : '');

    // The fill arrives with a response; before one, only the window is known.
    const parts = [
      context.tokens == null || context.percent == null ? (
        <Text key="ctx" dimColor>
          ctx –/{tokens(context.window)}
        </Text>
      ) : (
        <Text key="ctx" color={fill(context.percent)}>
          ctx {gauge(context.percent / 100)}
          {tokens(context.tokens)}/{tokens(context.window)} {Math.round(context.percent)}%
        </Text>
      ),
    ];
    if (c) {
      const left = c.at == null ? 0 : c.at + TTL_MS[c.ttl] - (await $.clock.now());
      // Seconds as shown, so 1:00 is never red. A 5m cache would be yellow from its first second, so only the
      // 1h one gets a yellow stage.
      const secs = Math.ceil(left / 1000);
      const warn = secs < 60 ? 'error' : secs < 5 * 60 && c.ttl === '1h' ? 'warning' : undefined;
      parts.push(
        // Every request of a running turn refreshes the cache, so the last turn's clock would mislead.
        e.props.isWorking ? (
          <Text key="cache">
            cache {gauge(1)}live ({c.ttl})
          </Text>
        ) : left > 0 ? (
          <Text key="cache" color={warn}>
            cache {gauge(left / TTL_MS[c.ttl])}
            {clock(secs)} ({c.ttl})
          </Text>
        ) : (
          <Text key="cache" dimColor>
            cache cold ({c.ttl})
          </Text>
        ),
      );
      // Warm turns read nearly all of their prompt from cache; lower means part of it was paid for again.
      // Summed over the turn's requests, so one cold re-write in a long turn is diluted.
      if (c.hit != null) {
        const pct = Math.round(c.hit * 100);
        parts.push(
          <Text key="hit" color={c.first ? undefined : pct < 50 ? 'error' : pct < 80 ? 'warning' : undefined}>
            hit {pct}%
          </Text>,
        );
      }
    }
    // Spend waits for this conversation's first response, mid-turn or a finished turn's: only a response
    // tells a subscription from API.
    if (c || (await read($, answered))) {
      if (window5h && window5h.percentUsed >= 100 && window5h.resetsAt)
        parts.push(
          <Text key="spend" color="error">
            5h limit until {timeOfDay(window5h.resetsAt)}
          </Text>,
        );
      else if (window5h)
        parts.push(
          <Text key="spend" color={fill(window5h.percentUsed)}>
            5h {gauge(window5h.percentUsed / 100)}
            {Math.round(window5h.percentUsed)}%
          </Text>,
        );
      else if (cost && cost.usd > 0 && !isSubscription(rateLimits))
        parts.push(<Text key="spend">${cost.usd.toFixed(2)}</Text>);
    }
    if (b) parts.push(<Text key="braid">braid {b.level}</Text>);
    if (g) parts.push(<Text key="branch">git {g}</Text>);
    if (b?.change) parts.push(<Text key="change">{b.change}</Text>);

    // One line, cut at the edge: the end that goes is braid's change.
    return (
      <Text wrap="truncate-end">
        {parts.flatMap((p, i) =>
          i
            ? [
                <Text key={`sep${i}`} dimColor>
                  {' '}
                  ·{' '}
                </Text>,
                p,
              ]
            : [p],
        )}
      </Text>
    );
  });
};
