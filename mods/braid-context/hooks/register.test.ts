import type { On } from 'claude-code';
import type { Engine } from 'claude-code/testing';
import { expect, mock, test } from 'claude-code/testing';

const T0 = 1_000_000;
const TRANSCRIPT = 'C:/home/.claude/projects/repo/s1.jsonl';
const STATE = 'C:/home/.claude/plugins/data/braid-braid/sessions/s1.json';
// One response record per line, as Claude Code writes them.
const response = (split: string) =>
  `{"type":"assistant","isSidechain":false,"message":{"usage":{"cache_creation":{${split}}}}}`;
const write1h = response('"ephemeral_5m_input_tokens":0,"ephemeral_1h_input_tokens":5099');
const usage = {
  input_tokens: 100,
  cache_read_input_tokens: 9_700,
  cache_creation_input_tokens: 200,
  output_tokens: 50,
  model: 'm',
};

// The engine beneath the mod: settings, files, usage, and the classic and turn events it rides on.
function world(
  on: On,
  opts: {
    braid?: boolean;
    files?: Record<string, string>;
    fiveHour?: { percentUsed: number; resetsAt?: string };
    limits?: { kind: string; percentUsed: number }[];
    ctxPercent?: number;
    ctxTokens?: number | null;
    usd?: number;
  } = {},
) {
  const files: Record<string, string> = {
    [TRANSCRIPT]: write1h,
    'braid/changes/add-mods/tasks.md': '- [x] 1.1 a\n- [ ] 1.2 b\n',
    ...opts.files,
  };
  // The engine hands paths over resolved, in the platform's separators.
  const find = (path: string) => Object.keys(files).find((k) => path.replace(/\\/g, '/').endsWith(k));
  const clock = mock.clock(on, { now: T0 });
  on('settings.read', () => ({ value: { enabledPlugins: opts.braid === false ? {} : { 'braid@braid': true } } }));
  on('fs.read', (_$, e) => {
    const k = find(e.path);
    const text = k === undefined ? undefined : files[k];
    return text === undefined ? { deny: `ENOENT ${e.path}` } : { value: text };
  });
  on('fs.list', (_$, e) =>
    e.path.replace(/\\/g, '/').endsWith('braid/changes')
      ? { value: [{ name: 'add-mods', kind: 'dir', size: 0, mtimeMs: 0, isLink: false }] }
      : { deny: 'ENOENT' },
  );
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context:
        opts.ctxTokens === null
          ? { window: 1_000_000 }
          : { tokens: opts.ctxTokens ?? 312_000, window: 1_000_000, percent: opts.ctxPercent ?? 31.2 },
      rateLimits:
        opts.limits ??
        (opts.fiveHour
          ? [
              { kind: 'seven_day', percentUsed: 61 },
              { kind: 'five_hour', ...opts.fiveHour },
            ]
          : []),
      cost: { usd: opts.usd ?? 0 },
    },
  }));
  on('classic.SessionStart', () => ({}));
  // braid's own hook, beneath the mod, records a level switch in its state file.
  on('classic.UserPromptSubmit', (_$, e) => {
    if (e.prompt === '/braid:braid ultra') files[STATE] = '{"mode":"ultra"}';
    return {};
  });
  on('session.start', (_$, e) => ({ cwd: e.cwd }));
  on('turn.complete', () => ({ text: '' }));
  // A request for model "failed" gets no response; the others answer with the cache use above.
  // biome-ignore lint/correctness/useYield: the engine's response, here with no chunks to stream.
  on('turn.step', async function* (_$, e) {
    const answered = e.model !== 'failed';
    return {
      turnId: e.turnId,
      index: e.index,
      answer: '',
      toolUses: [],
      stopReason: answered ? ('end_turn' as const) : null,
      usage: answered ? usage : null,
    };
  });
  return clock;
}

// What a session raises at load: the mod's session.start (starting its tick), then the settings hook event.
const start = async ($: Engine) => {
  await $.session.start({ cwd: 'C:/repo', surface: null, isInteractive: true });
  await $.classic.SessionStart({ source: 'startup', transcript_path: TRANSCRIPT, session_id: 's1' });
};
// cacheRead of the turn's 10,000 input tokens: 9,700 is a 97% hit; the rest is written to cache.
const turn = ($: Engine, cacheRead = 9_700) =>
  $.turn.complete({
    reason: 'answer',
    answer: '',
    durationMs: 1,
    isAborted: false,
    turnId: 't1',
    usage: { ...usage, cache_read_input_tokens: cacheRead, cache_creation_input_tokens: 9_900 - cacheRead },
  });

for (const surface of ['terminal', 'desktop'] as const) {
  // 80 columns: text only, so the scenarios below read their figures plainly; the bars test widens it.
  const band = ($: Engine, bodyColumns = 80, isWorking = false) =>
    $.ui.mount({
      plugin: 'braid-context',
      surface,
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking, maxRows: 10, bodyColumns } as never,
    });
  const text = async (ui: Awaited<ReturnType<typeof band>>) =>
    (await ui.drawn()) && (await ui.findAll({ type: 'Text' })).map((t) => t.text).join('');
  const cacheText = async (ui: Awaited<ReturnType<typeof band>>) => ui.find({ type: 'Text', text: /^cache / });

  test(`${surface}: before the first response, braid and context, no cache`, async ($, on) => {
    world(on, { files: { [STATE]: '{"mode":"lite"}' } });
    await start($);
    const ui = await band($);
    const shown = await text(ui);
    expect(shown).toContain('ctx 312k/1M 31%');
    expect(shown).toContain('braid lite · add-mods 1/2');
    expect(shown).not.toContain('cache');
  });

  test(`${surface}: counts down from the transcript's TTL, yellow then red`, { timeoutMs: 20_000 }, async ($, on) => {
    const clock = world(on);
    await start($);
    await turn($);
    const ui = await band($);
    const shown = await text(ui);
    expect(shown).toContain('cache 60:00 (1h)');
    expect(shown).toContain('hit 97%');
    expect(shown).toContain('braid full');
    expect((await cacheText(ui))?.props.color).toBeUndefined();
    await clock.advance(56 * 60_000);
    expect((await cacheText(ui))?.props.color).toBe('warning');
    expect((await cacheText(ui))?.text).toBe('cache 4:00 (1h)');
    // Judged as shown: 59.5 s left reads 1:00, still yellow; red from 0:59.
    await clock.advance(180_500);
    expect((await cacheText(ui))?.text).toBe('cache 1:00 (1h)');
    expect((await cacheText(ui))?.props.color).toBe('warning');
    await clock.advance(30_000);
    expect((await cacheText(ui))?.props.color).toBe('error');
  });

  test(
    `${surface}: cold once the TTL passes, warm again on the next response`,
    { timeoutMs: 20_000 },
    async ($, on) => {
      const clock = world(on);
      await start($);
      await turn($);
      const ui = await band($);
      await clock.advance(61 * 60_000);
      expect((await cacheText(ui))?.text).toBe('cache cold (1h)');
      await turn($);
      expect((await cacheText(ui))?.text).toBe('cache 60:00 (1h)');
    },
  );

  test(`${surface}: unreadable transcript falls back to the account guess`, async ($, on) => {
    world(on);
    await $.classic.SessionStart({ source: 'startup', transcript_path: 'C:/missing.jsonl', session_id: 's1' });
    await turn($);
    expect((await cacheText(await band($)))?.text).toBe('cache 5:00 (5m)');
  });

  test(`${surface}: a 5m cache skips yellow and turns red under 1 minute`, { timeoutMs: 20_000 }, async ($, on) => {
    const clock = world(on);
    await $.session.start({ cwd: 'C:/repo', surface: null, isInteractive: true });
    await $.classic.SessionStart({ source: 'startup', transcript_path: 'C:/missing.jsonl', session_id: 's1' });
    await turn($);
    const ui = await band($);
    await clock.advance(3 * 60_000);
    expect((await cacheText(ui))?.text).toBe('cache 2:00 (5m)');
    expect((await cacheText(ui))?.props.color).toBeUndefined();
    await clock.advance(90_000);
    expect((await cacheText(ui))?.props.color).toBe('error');
  });

  test(
    `${surface}: while a turn runs, the cache shows live, not the last turn's clock`,
    { timeoutMs: 20_000 },
    async ($, on) => {
      const clock = world(on);
      await start($);
      expect(await cacheText(await band($, 80, true))).toBeUndefined();
      await turn($);
      await clock.advance(61 * 60_000);
      expect((await cacheText(await band($, 80, true)))?.text).toBe('cache live (1h)');
    },
  );

  test(`${surface}: braid off or absent, context and cache only`, async ($, on) => {
    world(on, { braid: false });
    await start($);
    await turn($);
    const shown = await text(await band($));
    expect(shown).toContain('cache 60:00 (1h)');
    expect(shown).not.toContain('braid');
  });

  test(`${surface}: subscription shows the 5-hour window, not dollars`, async ($, on) => {
    world(on, { fiveHour: { percentUsed: 23.4 }, usd: 4.2 });
    await start($);
    await turn($);
    const shown = await text(await band($));
    expect(shown).toContain('hit 97% · 5h 23% · braid full');
    expect(shown).not.toContain('$');
  });

  test(`${surface}: the 5-hour window and context turn yellow from 75%, red from 90%`, async ($, on) => {
    world(on, { fiveHour: { percentUsed: 80 }, ctxPercent: 89.6 });
    await start($);
    await turn($);
    const ui = await band($);
    expect((await ui.find({ type: 'Text', text: /^5h / }))?.props.color).toBe('warning');
    // Judged as shown: 89.6% reads 90%, so red.
    // The band's own line starts with ctx too; the figure is the innermost match.
    const ctx = (await ui.findAll({ type: 'Text', text: /^ctx / })).pop();
    expect(ctx?.text).toContain('90%');
    expect(ctx?.props.color).toBe('error');
  });

  test(
    `${surface}: once the 5-hour window resets, its stale figure goes, even while idle`,
    { timeoutMs: 30_000 },
    async ($, on) => {
      const clock = world(on, {
        fiveHour: { percentUsed: 100, resetsAt: new Date(T0 + 2 * 60 * 60_000).toISOString() },
        usd: 4.2,
      });
      await start($);
      await turn($);
      const ui = await band($);
      // Past the cache's expiry nothing ticks the band, so only the reset deadline can redraw it.
      await clock.advance(61 * 60_000);
      expect(await text(ui)).toContain('5h limit until');
      await clock.advance(60 * 60_000);
      const shown = await text(ui);
      expect(shown).not.toContain('5h');
      expect(shown).not.toContain('$');
    },
  );

  test(`${surface}: 999,600 tokens read 1M, not 1000k`, async ($, on) => {
    world(on, { ctxTokens: 999_600 });
    await start($);
    expect(await text(await band($))).toContain('ctx 1M/1M');
  });

  test(`${surface}: at the 5-hour limit, the reset time in red`, async ($, on) => {
    const resetsAt = '2026-10-08T22:40:00Z';
    world(on, { fiveHour: { percentUsed: 100, resetsAt } });
    await start($);
    await turn($);
    const spend = await (await band($)).find({ type: 'Text', text: /^5h / });
    const local = new Date(resetsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    expect(spend?.text).toBe(`5h limit until ${local}`);
    expect(spend?.props.color).toBe('error');
  });

  test(`${surface}: 120+ columns draw bars for context, cache time left and the 5-hour window`, async ($, on) => {
    world(on, { fiveHour: { percentUsed: 23.4 } });
    await start($);
    await turn($);
    const shown = await text(await band($, 120));
    expect(shown).toContain('ctx ██░░░░░░ 312k/1M 31%');
    expect(shown).toContain('cache ████████ 60:00 (1h)');
    expect(shown).toContain('5h ██░░░░░░ 23%');
    expect(shown).toContain('hit 97%');
    expect(await text(await band($, 119))).not.toContain('█');
    // Always one line, cut at the edge rather than wrapped.
    expect((await (await band($, 60)).find({ type: 'Text' }))?.props.wrap).toBe('truncate-end');
  });

  test(`${surface}: hit rate yellow under 80%, red under 50%, but never on a session's first response`, async ($, on) => {
    world(on);
    await start($);
    const ui = await band($);
    const hit = async () => ui.find({ type: 'Text', text: /^hit / });
    await turn($, 200);
    expect((await hit())?.text).toBe('hit 2%');
    expect((await hit())?.props.color).toBeUndefined();
    await turn($, 6_000);
    expect((await hit())?.props.color).toBe('warning');
    await turn($, 3_000);
    expect((await hit())?.props.color).toBe('error');
    await turn($, 9_700);
    expect((await hit())?.props.color).toBeUndefined();
    // Judged as shown: 79.6% reads 80%, so no colour.
    await turn($, 7_960);
    expect((await hit())?.text).toBe('hit 80%');
    expect((await hit())?.props.color).toBeUndefined();
    // /clear starts a new conversation: no cache figures until its first response, which is exempt again.
    await $.classic.SessionStart({ source: 'clear', transcript_path: TRANSCRIPT, session_id: 's1' });
    expect(await hit()).toBeUndefined();
    await turn($, 200);
    expect((await hit())?.props.color).toBeUndefined();
  });

  test(`${surface}: API or Bedrock shows the session cost`, async ($, on) => {
    world(on, { usd: 1.234 });
    await start($);
    await turn($);
    const shown = await text(await band($));
    expect(shown).toContain('hit 97% · $1.23 · braid full');
    expect(shown).not.toContain('5h');
  });

  test(`${surface}: before the first response, no spend either, even resumed with a cost`, async ($, on) => {
    // Resumed: the cost counts the history, and no response has said yet whether this is a subscription.
    world(on, { usd: 12.34 });
    await $.session.start({ cwd: 'C:/repo', surface: null, isInteractive: true });
    await $.classic.SessionStart({ source: 'resume', transcript_path: TRANSCRIPT, session_id: 's1' });
    const shown = await text(await band($));
    expect(shown).not.toContain('$');
    expect(shown).not.toContain('5h');
  });

  test(`${surface}: the countdown runs from the turn's last request, not its end`, async ($, on) => {
    const clock = world(on);
    await start($);
    const step = $.turn.step({ turnId: 't1', index: 0, model: 'm', messageCount: 1 });
    for await (const _ of step);
    // A minute writing the final answer.
    await clock.advance(60_000);
    await turn($);
    expect((await cacheText(await band($)))?.text).toBe('cache 59:00 (1h)');
  });

  test(`${surface}: each response redraws context and spend before the turn ends`, async ($, on) => {
    // A conversation's first turn: no cache yet, so no tick redraws the band.
    const opts = { ctxTokens: 100_000, ctxPercent: 10, usd: 0.5 };
    world(on, opts);
    await start($);
    const ui = await band($, 80, true);
    expect(await text(ui)).toContain('ctx 100k/1M 10%');
    expect(await text(ui)).not.toContain('$');
    Object.assign(opts, { ctxTokens: 250_000, ctxPercent: 25, usd: 0.75 });
    for await (const _ of $.turn.step({ turnId: 't1', index: 0, model: 'm', messageCount: 1 }));
    expect(await text(ui)).toContain('ctx 250k/1M 25% · $0.75');
    // A subagent's response is not the main thread's: no redraw.
    Object.assign(opts, { ctxTokens: 400_000, ctxPercent: 40 });
    for await (const _ of $.turn.step({ turnId: 't1', index: 0, model: 'm', messageCount: 1, agentId: 'a1' }));
    expect(await text(ui)).toContain('ctx 250k/1M 25%');
    // /clear: spend waits again, and a failed request is no response.
    await $.classic.SessionStart({ source: 'clear', transcript_path: TRANSCRIPT, session_id: 's1' });
    for await (const _ of $.turn.step({ turnId: 't2', index: 0, model: 'failed', messageCount: 1 }));
    expect(await text(ui)).not.toContain('$');
  });

  test(`${surface}: a later turn after the cache went cold redraws per response too`, async ($, on) => {
    // No tick past expiry, and the finished turn's cache figures keep spend from reading the response flag:
    // only the step's own redraw shows the new figures.
    const opts = { ctxTokens: 100_000, ctxPercent: 10, usd: 0.5 };
    const clock = world(on, opts);
    await start($);
    await turn($);
    await clock.advance(61 * 60_000);
    const ui = await band($, 80, true);
    expect(await text(ui)).toContain('ctx 100k/1M 10%');
    Object.assign(opts, { ctxTokens: 250_000, ctxPercent: 25, usd: 0.75 });
    for await (const _ of $.turn.step({ turnId: 't2', index: 0, model: 'm', messageCount: 3 }));
    const shown = await text(ui);
    expect(shown).toContain('ctx 250k/1M 25%');
    expect(shown).toContain('$0.75');
  });

  test(`${surface}: a failed last request doesn't restart the countdown`, async ($, on) => {
    const clock = world(on);
    await start($);
    for await (const _ of $.turn.step({ turnId: 't1', index: 0, model: 'm', messageCount: 1 }));
    await clock.advance(10 * 60_000);
    for await (const _ of $.turn.step({ turnId: 't1', index: 1, model: 'failed', messageCount: 2 }));
    await turn($);
    expect((await cacheText(await band($)))?.text).toBe('cache 50:00 (1h)');
  });

  test(`${surface}: before any response reports the fill, context shows only the window`, async ($, on) => {
    world(on, { ctxTokens: null });
    await start($);
    expect(await text(await band($))).toContain('ctx –/1M');
  });

  test(`${surface}: braid switched off for the session`, async ($, on) => {
    world(on, { files: { [STATE]: '{"mode":"off"}' } });
    await start($);
    expect(await text(await band($))).not.toContain('braid');
  });

  test(`${surface}: the TTL comes from whole response records only`, async ($, on) => {
    // Later lines: a tool's output holding a 5m write, and a fragment that is not JSON.
    const tool = '{"type":"user","toolUseResult":{"cache_creation":{"ephemeral_5m_input_tokens":9}}}';
    world(on, { files: { [TRANSCRIPT]: [write1h, tool, '"cache_creation":{"x":"}"}'].join('\n') } });
    await start($);
    await turn($);
    expect((await cacheText(await band($)))?.text).toBe('cache 60:00 (1h)');
  });

  test(`${surface}: a subscription between 5-hour windows shows no dollars`, async ($, on) => {
    world(on, { limits: [{ kind: 'seven_day', percentUsed: 61 }], usd: 4.2 });
    await start($);
    await turn($);
    expect(await text(await band($))).not.toContain('$');
  });

  test(`${surface}: a level switch shows at once, an unknown level reads full`, async ($, on) => {
    world(on, { files: { [STATE]: '{"mode":{"x":1}}' } });
    await start($);
    const ui = await band($);
    expect(await text(ui)).toContain('braid full');
    await $.classic.UserPromptSubmit({ prompt: '/braid:braid ultra', transcript_path: TRANSCRIPT, session_id: 's1' });
    expect(await text(ui)).toContain('braid ultra');
  });

  test(`${surface}: a config folder under a "projects" folder still finds braid's state`, async ($, on) => {
    const transcript = 'D:/projects/cc/projects/repo/s1.jsonl';
    world(on, {
      files: { [transcript]: write1h, 'D:/projects/cc/plugins/data/braid-braid/sessions/s1.json': '{"mode":"lite"}' },
    });
    await $.classic.SessionStart({ source: 'startup', transcript_path: transcript, session_id: 's1' });
    expect(await text(await band($))).toContain('braid lite');
  });
}
