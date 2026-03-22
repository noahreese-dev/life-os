/**
 * session-manager.js
 * Manages Claude Code child processes — one per agent tower.
 * Spawns CLI sessions, pipes stdin/stdout, emits parsed NDJSON events.
 */

const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const towerAgentMap = require('./tower-agent-map');

class SessionManager extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, { process: import('child_process').ChildProcess, status: string, towerType: string }>} */
    this.sessions = new Map();
  }

  /**
   * Spawn a Claude Code CLI session for the given agent.
   * @param {string} agentId   Unique identifier for this tower instance
   * @param {string} towerType Key from tower-agent-map (e.g. 'cos', 'garage')
   * @param {string} [cwdOverride] Optional working directory override
   * @returns {{ agentId: string, status: string }}
   */
  spawn(agentId, towerType, cwdOverride) {
    if (this.sessions.has(agentId)) {
      console.log(`[session-manager] Agent ${agentId} already running — skipping spawn`);
      return { agentId, status: 'already_running' };
    }

    const mapping = towerAgentMap[towerType];
    if (!mapping) {
      const err = `Unknown tower type: ${towerType}`;
      console.error(`[session-manager] ${err}`);
      this.emit('error', { agentId, error: err });
      return { agentId, status: 'error', error: err };
    }

    const cwd = cwdOverride || mapping.cwd;
    const args = ['--output-format', 'stream-json', '--verbose'];

    if (mapping.agent) {
      args.push('--agent', mapping.agent);
    }

    // Append the system prompt as the initial message
    args.push('--print', mapping.prompt);

    console.log(`[session-manager] Spawning agent ${agentId} (${towerType}) in ${cwd}`);

    const child = spawn('claude', args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    this.sessions.set(agentId, { process: child, status: 'running', towerType });

    // --- stdout: NDJSON stream ---
    let stdoutBuffer = '';
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split('\n');
      // Keep the last partial line in the buffer
      stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const eventType = parsed.type || 'unknown';
          this.emit(eventType, { agentId, data: parsed });
          this.emit('message', { agentId, data: parsed });
        } catch (_err) {
          // Non-JSON output — emit as raw text
          this.emit('text_delta', { agentId, data: { type: 'text_delta', text: trimmed } });
        }
      }
    });

    // --- stderr ---
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) {
        console.error(`[session-manager] stderr (${agentId}): ${text}`);
        this.emit('error', { agentId, error: text });
      }
    });

    // --- exit ---
    child.on('close', (code) => {
      console.log(`[session-manager] Agent ${agentId} exited with code ${code}`);
      const session = this.sessions.get(agentId);
      if (session) session.status = 'exited';
      this.emit('complete', { agentId, code });
    });

    child.on('error', (err) => {
      console.error(`[session-manager] Spawn error (${agentId}):`, err.message);
      const session = this.sessions.get(agentId);
      if (session) session.status = 'error';
      this.emit('error', { agentId, error: err.message });
    });

    return { agentId, status: 'spawned' };
  }

  /**
   * Send a prompt to a running agent's stdin.
   */
  send(agentId, prompt) {
    const session = this.sessions.get(agentId);
    if (!session || session.status !== 'running') {
      const err = `Agent ${agentId} is not running (status: ${session ? session.status : 'not found'})`;
      console.error(`[session-manager] ${err}`);
      this.emit('error', { agentId, error: err });
      return false;
    }
    console.log(`[session-manager] Sending prompt to ${agentId}: ${prompt.substring(0, 80)}...`);
    session.process.stdin.write(prompt + '\n');
    return true;
  }

  /**
   * Kill a running agent process.
   */
  kill(agentId) {
    const session = this.sessions.get(agentId);
    if (!session) {
      console.log(`[session-manager] No session found for ${agentId}`);
      return false;
    }
    console.log(`[session-manager] Killing agent ${agentId}`);
    session.process.kill('SIGTERM');
    session.status = 'killed';
    this.sessions.delete(agentId);
    return true;
  }

  /**
   * Get the status of an agent session.
   */
  getStatus(agentId) {
    const session = this.sessions.get(agentId);
    if (!session) return { agentId, status: 'not_found' };
    return { agentId, status: session.status, towerType: session.towerType };
  }

  /**
   * Kill all running sessions (for graceful shutdown).
   */
  killAll() {
    console.log(`[session-manager] Killing all ${this.sessions.size} sessions`);
    for (const [agentId] of this.sessions) {
      this.kill(agentId);
    }
  }
}

module.exports = SessionManager;
