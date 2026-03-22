// Session Manager — manages Claude Code child processes for Agent BTD
const { spawn } = require('child_process');
const EventEmitter = require('events');
const towerAgentMap = require('./tower-agent-map');

class SessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map(); // agentId -> { process, status, type }
  }

  spawn(agentId, towerType) {
    if (this.sessions.has(agentId)) {
      console.log(`[session] Agent ${agentId} already running`);
      return false;
    }

    const mapping = towerAgentMap[towerType];
    if (!mapping) {
      console.log(`[session] Unknown tower type: ${towerType}`);
      return false;
    }

    if (mapping.isFarm) {
      console.log(`[session] ${towerType} is a farm — no session needed`);
      return false;
    }

    const args = ['--print', '--output-format', 'stream-json'];
    if (mapping.agent) {
      args.push('--agent', mapping.agent);
    }
    args.push(mapping.prompt);

    console.log(`[session] Spawning agent ${agentId} (${towerType}) in ${mapping.cwd}`);

    const proc = spawn('claude', args, {
      cwd: mapping.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    const session = {
      process: proc,
      status: 'running',
      type: towerType,
      buffer: '',
    };

    this.sessions.set(agentId, session);

    // Handle stdout as NDJSON stream
    proc.stdout.on('data', (chunk) => {
      session.buffer += chunk.toString();
      const lines = session.buffer.split('\n');
      session.buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          this.emit('agent_event', { agentId, towerType, event });

          if (event.type === 'text_delta') {
            this.emit('text_delta', { agentId, text: event.text || event.delta });
          } else if (event.type === 'tool_use') {
            this.emit('tool_use', { agentId, tool: event.name || event.tool });
          } else if (event.type === 'tool_result') {
            this.emit('tool_result', { agentId, success: !event.error });
          } else if (event.type === 'result') {
            this.emit('complete', { agentId, result: event });
          }
        } catch (e) {
          // Not valid JSON, skip
        }
      }
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) {
        this.emit('error', { agentId, error: text });
      }
    });

    proc.on('close', (code) => {
      console.log(`[session] Agent ${agentId} exited with code ${code}`);
      session.status = 'exited';
      this.emit('complete', { agentId, code });
    });

    proc.on('error', (err) => {
      console.log(`[session] Agent ${agentId} error: ${err.message}`);
      session.status = 'error';
      this.emit('error', { agentId, error: err.message });
    });

    return true;
  }

  send(agentId, prompt) {
    const session = this.sessions.get(agentId);
    if (!session || session.status !== 'running') {
      console.log(`[session] Cannot send to ${agentId} — not running`);
      return false;
    }
    session.process.stdin.write(prompt + '\n');
    return true;
  }

  kill(agentId) {
    const session = this.sessions.get(agentId);
    if (!session) return false;
    try {
      session.process.kill('SIGTERM');
    } catch (e) {
      // Already dead
    }
    this.sessions.delete(agentId);
    console.log(`[session] Killed agent ${agentId}`);
    return true;
  }

  getStatus(agentId) {
    const session = this.sessions.get(agentId);
    if (!session) return { status: 'not_found' };
    return { status: session.status, type: session.type };
  }

  killAll() {
    for (const [id] of this.sessions) {
      this.kill(id);
    }
  }
}

module.exports = SessionManager;
