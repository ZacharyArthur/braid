// braid for Pi, which runs no hooks.json: runs hooks/braid.cjs as the other harnesses do, and puts its
// session output in a system prompt section that every run carries. Pi has no subagent event.
// .js, not .cjs: Pi only discovers .ts and .js extensions. CommonJS, which Pi's loader (jiti) accepts.
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');

const HOOK = path.join(__dirname, '..', 'hooks', 'braid.cjs');

// Never rejects: no node, a timeout or unreadable output all inject nothing.
function hook(event, input) {
  // Pi's own default and `~` expansion (its getAgentDir), so state lands where Pi keeps its data.
  const agentDir = (process.env.PI_CODING_AGENT_DIR || '~/.pi/agent').replace(/^~(?=$|[\\/])/, os.homedir());
  const env = { ...process.env, PLUGIN_DATA: path.join(agentDir, 'braid') };
  // The hook prefers these, and a Pi started from another harness's shell inherits them. Any case: Windows env is.
  for (const key of Object.keys(env)) if (/^(claude|zcode)_plugin_data$/i.test(key)) delete env[key];
  return new Promise((resolve) => {
    try {
      // `node` by name: in a standalone Pi, process.execPath is Pi itself.
      const child = execFile('node', [HOOK, event], { env, timeout: 15000, windowsHide: true }, (err, stdout) => {
        try {
          const context = !err && stdout ? JSON.parse(stdout).hookSpecificOutput.additionalContext : '';
          resolve(typeof context === 'string' ? context : '');
        } catch {
          resolve('');
        }
      });
      child.stdin.on('error', () => {});
      child.stdin.end(JSON.stringify(input));
    } catch {
      resolve('');
    }
  });
}

module.exports = function braid(pi) {
  let input = {};
  let section = Promise.resolve('');

  pi.on('session_start', async (event, ctx) => {
    let sid;
    try {
      sid = ctx.sessionManager.getSessionId();
    } catch {}
    input = { session_id: sid, cwd: ctx.cwd };
    // Not awaited: the map can take seconds, and only the first run needs it.
    section = hook('session', { ...input, source: event.reason });
  });

  pi.on('input', async (event) => {
    if (event.source === 'extension') return;
    const out = await hook('prompt', { ...input, prompt: event.text });
    // A "BRAID ..." reply is a command's, which may change the state: rebuild the section for the next run.
    if (out.startsWith('BRAID ')) section = hook('session', input);
    // Only the first line: coming back on, the rest is the core, which the section now carries. With the next run,
    // even for a prompt steered into a streaming one: Pi steers one message per turn, so a steered confirmation
    // would cost a model turn of its own; the steered prompt already says what the user asked for.
    const content = out.split('\n')[0];
    if (content) pi.sendMessage({ customType: 'braid', content, display: false }, { deliverAs: 'nextTurn' });
  });

  pi.on('before_agent_start', async (event) => {
    const text = await section;
    const sections = event.systemPromptOptions.sections;
    if (text) sections.braid = text;
    else delete sections.braid;
  });
};
