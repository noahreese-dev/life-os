/**
 * server.js — Agent BTD Real-OS Bridge
 *
 * WebSocket server on localhost:9876 that bridges the BTD game UI
 * to real Claude Code agent sessions. Monkey towers become real agents.
 *
 * Protocol:
 *   Client → Server:
 *     { action: 'spawn_agent', agentId, towerType, cwd? }
 *     { action: 'send_prompt', agentId, prompt }
 *     { action: 'kill_agent', agentId }
 *     { action: 'get_status', agentId }
 *
 *   Server → Client:
 *     { event, agentId, data }
 *
 * Auth: Bearer token via first message or ?token= query param.
 * Env: BRIDGE_TOKEN (default 'agent-btd-local'), BRIDGE_PORT (default 9876)
 */

const { WebSocketServer } = require('ws');
const url = require('url');
const SessionManager = require('./session-manager');

const PORT = parseInt(process.env.BRIDGE_PORT, 10) || 9876;
const TOKEN = process.env.BRIDGE_TOKEN || 'agent-btd-local';

const sessions = new SessionManager();

// ── WebSocket Server ────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });

console.log(`[bridge] Agent BTD Real-OS Bridge starting on ws://localhost:${PORT}`);
console.log(`[bridge] Auth token: ${TOKEN.substring(0, 4)}${'*'.repeat(TOKEN.length - 4)}`);

/** Track authenticated clients */
const authenticatedClients = new Set();

wss.on('connection', (ws, req) => {
  // --- Auth: check ?token= query param ---
  const params = url.parse(req.url || '', true).query;
  if (params.token === TOKEN) {
    authenticatedClients.add(ws);
    console.log('[bridge] Client connected (token via query param)');
    ws.send(JSON.stringify({ event: 'auth', status: 'ok' }));
  } else {
    console.log('[bridge] Client connected (awaiting auth message)');
  }

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (_err) {
      ws.send(JSON.stringify({ event: 'error', error: 'Invalid JSON' }));
      return;
    }

    // --- Auth: check bearer token in first message if not already authed ---
    if (!authenticatedClients.has(ws)) {
      if (msg.action === 'auth' && msg.token === TOKEN) {
        authenticatedClients.add(ws);
        console.log('[bridge] Client authenticated via message');
        ws.send(JSON.stringify({ event: 'auth', status: 'ok' }));
        return;
      }
      ws.send(JSON.stringify({ event: 'error', error: 'Unauthorized — send { action: "auth", token: "..." } first' }));
      return;
    }

    // --- Route actions ---
    switch (msg.action) {
      case 'spawn_agent': {
        if (!msg.agentId || !msg.towerType) {
          ws.send(JSON.stringify({ event: 'error', error: 'spawn_agent requires agentId and towerType' }));
          return;
        }
        const result = sessions.spawn(msg.agentId, msg.towerType, msg.cwd);
        ws.send(JSON.stringify({ event: 'spawn_result', agentId: msg.agentId, ...result }));
        break;
      }

      case 'send_prompt': {
        if (!msg.agentId || !msg.prompt) {
          ws.send(JSON.stringify({ event: 'error', error: 'send_prompt requires agentId and prompt' }));
          return;
        }
        const ok = sessions.send(msg.agentId, msg.prompt);
        ws.send(JSON.stringify({ event: 'prompt_ack', agentId: msg.agentId, delivered: ok }));
        break;
      }

      case 'kill_agent': {
        if (!msg.agentId) {
          ws.send(JSON.stringify({ event: 'error', error: 'kill_agent requires agentId' }));
          return;
        }
        const killed = sessions.kill(msg.agentId);
        ws.send(JSON.stringify({ event: 'kill_result', agentId: msg.agentId, killed }));
        break;
      }

      case 'get_status': {
        if (!msg.agentId) {
          ws.send(JSON.stringify({ event: 'error', error: 'get_status requires agentId' }));
          return;
        }
        const status = sessions.getStatus(msg.agentId);
        ws.send(JSON.stringify({ event: 'status', ...status }));
        break;
      }

      default:
        ws.send(JSON.stringify({ event: 'error', error: `Unknown action: ${msg.action}` }));
    }
  });

  ws.on('close', () => {
    authenticatedClients.delete(ws);
    console.log('[bridge] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[bridge] WebSocket error:', err.message);
    authenticatedClients.delete(ws);
  });
});

// ── Broadcast agent events to all authenticated clients ─────────────────────

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const client of authenticatedClients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  }
}

// Forward all session manager events to connected clients
sessions.on('message', (payload) => {
  broadcast({ event: 'agent_message', agentId: payload.agentId, data: payload.data });
});

sessions.on('text_delta', (payload) => {
  broadcast({ event: 'text_delta', agentId: payload.agentId, data: payload.data });
});

sessions.on('error', (payload) => {
  broadcast({ event: 'agent_error', agentId: payload.agentId, error: payload.error });
});

sessions.on('complete', (payload) => {
  broadcast({ event: 'agent_complete', agentId: payload.agentId, code: payload.code });
});

// ── Graceful Shutdown ───────────────────────────────────────────────────────

function shutdown() {
  console.log('\n[bridge] Shutting down...');
  sessions.killAll();
  wss.close(() => {
    console.log('[bridge] WebSocket server closed');
    process.exit(0);
  });
  // Force exit after 5 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('[bridge] Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

wss.on('listening', () => {
  console.log(`[bridge] Ready — listening on ws://localhost:${PORT}`);
});

wss.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[bridge] Port ${PORT} already in use. Set BRIDGE_PORT env var to use a different port.`);
    process.exit(1);
  }
  console.error('[bridge] Server error:', err.message);
});
