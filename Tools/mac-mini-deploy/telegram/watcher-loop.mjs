// Life-OS Telegram Tunnel -- Self-cycling watcher loop
// Runs watcher.js in a tight loop with zero gap between cycles.
// When a message arrives, outputs it immediately and continues watching.
// This script runs as a single long-lived background task in Claude Code.

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WATCHER_SCRIPT = join(__dirname, 'watcher.js');
const SESSION_FILE = join(__dirname, '.session');

// Max runtime for the entire loop (9:55 -- squeeze every second from the 10-min Bash limit)
const MAX_LOOP_RUNTIME = 595000;
const startTime = Date.now();

// Write session heartbeat from the loop too (covers the gaps between watcher cycles)
function writeSessionHeartbeat() {
  try {
    writeFileSync(SESSION_FILE, JSON.stringify({
      timestamp: Date.now(),
      pid: process.pid,
      type: 'loop',
    }));
  } catch (err) {
    // Log but don't crash -- heartbeat is best-effort
    process.stderr.write(`[LOOP] Heartbeat write failed: ${err.message}\n`);
  }
}

// Heartbeat every 15s from the loop level
const heartbeatTimer = setInterval(writeSessionHeartbeat, 15000);
writeSessionHeartbeat();

let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 10;

function runWatcher() {
  return new Promise((resolve) => {
    const child = spawn('node', [WATCHER_SCRIPT], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: __dirname
    });

    let output = '';
    let timedOut = false;

    // Safety: kill child if it hangs beyond expected runtime (90s, watcher should exit at 60s)
    // On Windows, SIGTERM/SIGKILL are not supported. child.kill() uses taskkill internally.
    const childTimeout = setTimeout(() => {
      timedOut = true;
      try { child.kill(); } catch {}
      // Force kill fallback after 5s (child.kill() again is safe -- no-op if already dead)
      setTimeout(() => { try { child.kill(); } catch {} }, 5000);
    }, 90000);

    child.stdout.on('data', (data) => {
      const text = data.toString().trim();
      if (text) {
        output += text + '\n';
        // Immediately flush to parent stdout so Claude sees it
        process.stdout.write(text + '\n');
      }
    });

    child.stderr.on('data', (data) => {
      // Log stderr for debugging but don't spam
      const text = data.toString().trim();
      if (text && consecutiveFailures < 3) {
        process.stderr.write(`[WATCHER STDERR] ${text}\n`);
      }
    });

    child.on('close', (code) => {
      clearTimeout(childTimeout);
      const result = { code, output: output.trim(), timedOut };
      output = ''; // Release memory -- output is only used for result classification
      resolve(result);
    });

    child.on('error', (err) => {
      clearTimeout(childTimeout);
      resolve({ code: -1, output: 'ERROR: ' + err.message, timedOut: false });
    });
  });
}

// Main loop
let cycleCount = 0;
while (Date.now() - startTime < MAX_LOOP_RUNTIME) {
  // Don't start a new watcher cycle if we don't have enough time for it to complete.
  // Watcher runs for 60s + 30s safety margin. If less than 90s remain, exit cleanly.
  const remaining = MAX_LOOP_RUNTIME - (Date.now() - startTime);
  if (remaining < 90000) {
    break;
  }

  cycleCount++;

  // Write heartbeat at the start of each cycle (covers gaps between watcher exit and restart)
  writeSessionHeartbeat();

  const result = await runWatcher();

  // Track consecutive failures for circuit-breaking
  if (result.code !== 0 && !result.output.includes('QUEUE_MESSAGE') && !result.output.includes('WATCHER_TIMEOUT')) {
    consecutiveFailures++;
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      process.stderr.write(`[LOOP] ${MAX_CONSECUTIVE_FAILURES} consecutive failures. Pausing 30s.\n`);
      await new Promise(r => setTimeout(r, 30000));
      consecutiveFailures = 0; // Reset after pause
    } else {
      // Brief pause to prevent spin-looping on errors (escalating: 1s, 2s, 3s...)
      await new Promise(r => setTimeout(r, Math.min(consecutiveFailures * 1000, 5000)));
    }
  } else {
    consecutiveFailures = 0; // Reset on success
  }

  // If watcher was killed for hanging, log it
  if (result.timedOut) {
    process.stderr.write(`[LOOP] Watcher hung and was killed. Restarting.\n`);
  }
}

clearInterval(heartbeatTimer);
console.log(`LOOP_TIMEOUT|cycles=${cycleCount}`);
process.exit(0);
