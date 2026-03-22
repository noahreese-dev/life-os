// Agent BTD Bridge Server
// WebSocket server connecting browser game to Claude Code sessions
const http = require('http');
const SessionManager = require('./session-manager');

// Simple WebSocket implementation (no external deps)
const crypto = require('crypto');

const PORT = process.env.BRIDGE_PORT || 9876;
const TOKEN = process.env.BRIDGE_TOKEN || 'agent-btd-local';

const sessions = new SessionManager();
const clients = new Set();

// Create HTTP server for WebSocket upgrade
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Agent BTD Bridge Server v1.0\n');
});

// Manual WebSocket upgrade handler
server.on('upgrade', (req, socket) => {
  // Verify token
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const token = url.searchParams.get('token') || req.headers['x-bridge-token'];
  if (token !== TOKEN) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    console.log('[bridge] Rejected connection — invalid token');
    return;
  }

  // WebSocket handshake
  const key = req.headers['sec-websocket-key'];
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-5AB5DC11CE56')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  );

  console.log('[bridge] Client connected');
  clients.add(socket);

  let buffer = Buffer.alloc(0);

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const isMasked = (secondByte & 0x80) !== 0;
      let payloadLength = secondByte & 0x7F;
      let offset = 2;

      if (payloadLength === 126) {
        if (buffer.length < 4) return;
        payloadLength = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) return;
        payloadLength = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskOffset = offset;
      if (isMasked) offset += 4;

      if (buffer.length < offset + payloadLength) return;

      const payload = Buffer.alloc(payloadLength);
      for (let i = 0; i < payloadLength; i++) {
        payload[i] = isMasked
          ? buffer[offset + i] ^ buffer[maskOffset + (i % 4)]
          : buffer[offset + i];
      }

      buffer = buffer.slice(offset + payloadLength);

      const opcode = firstByte & 0x0F;
      if (opcode === 0x08) {
        // Close
        clients.delete(socket);
        socket.end();
        console.log('[bridge] Client disconnected');
        return;
      }
      if (opcode === 0x01) {
        // Text frame
        handleMessage(socket, payload.toString('utf8'));
      }
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log('[bridge] Client disconnected');
  });

  socket.on('error', (err) => {
    clients.delete(socket);
    console.log('[bridge] Socket error:', err.message);
  });
});

function sendWsFrame(socket, data) {
  const json = JSON.stringify(data);
  const payload = Buffer.from(json, 'utf8');
  const frame = Buffer.alloc(2 + (payload.length > 125 ? 2 : 0) + payload.length);
  frame[0] = 0x81; // text frame, final
  let offset = 1;
  if (payload.length > 125) {
    frame[offset++] = 126;
    frame.writeUInt16BE(payload.length, offset);
    offset += 2;
  } else {
    frame[offset++] = payload.length;
  }
  payload.copy(frame, offset);
  try { socket.write(frame); } catch (e) { /* client gone */ }
}

function broadcast(data) {
  for (const client of clients) {
    sendWsFrame(client, data);
  }
}

function handleMessage(socket, raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch (e) {
    sendWsFrame(socket, { type: 'error', error: 'Invalid JSON' });
    return;
  }

  console.log('[bridge] Message:', msg.type, msg.agentId || '');

  switch (msg.type) {
    case 'spawn_agent': {
      const { agentId, towerType } = msg;
      const success = sessions.spawn(agentId, towerType);
      sendWsFrame(socket, { type: 'spawn_result', agentId, success });
      break;
    }
    case 'send_prompt': {
      const { agentId, prompt } = msg;
      const success = sessions.send(agentId, prompt);
      sendWsFrame(socket, { type: 'prompt_result', agentId, success });
      break;
    }
    case 'kill_agent': {
      const { agentId } = msg;
      const success = sessions.kill(agentId);
      sendWsFrame(socket, { type: 'kill_result', agentId, success });
      break;
    }
    case 'status': {
      const { agentId } = msg;
      const status = sessions.getStatus(agentId);
      sendWsFrame(socket, { type: 'status_result', agentId, ...status });
      break;
    }
    default:
      sendWsFrame(socket, { type: 'error', error: `Unknown message type: ${msg.type}` });
  }
}

// Forward session events to all connected clients
sessions.on('text_delta', (data) => broadcast({ type: 'text_delta', ...data }));
sessions.on('tool_use', (data) => broadcast({ type: 'tool_use', ...data }));
sessions.on('tool_result', (data) => broadcast({ type: 'tool_result', ...data }));
sessions.on('complete', (data) => broadcast({ type: 'complete', ...data }));
sessions.on('error', (data) => broadcast({ type: 'error', ...data }));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[bridge] Shutting down...');
  sessions.killAll();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  sessions.killAll();
  server.close();
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  console.log(`[bridge] Agent BTD Bridge Server running on ws://localhost:${PORT}`);
  console.log(`[bridge] Token: ${TOKEN}`);
  console.log('[bridge] Waiting for game client connection...');
});
