// Life-OS Telegram Tunnel -- Persistent file watcher (Node.js)
// HYBRID: fs.watch + polling for Windows reliability.
// Watches queue.json for "pending" status, outputs message and exits.
// Exits cleanly at timeout (under Bash limit).
// Launched by Claude Code via run_in_background with timeout: 600000.

import { watch, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "queue.json");
const LAST_ID_FILE = join(__dirname, ".last_processed_id");
const SESSION_FILE = join(__dirname, ".session");

const POLL_INTERVAL = 500; // 500ms -- tight polling for near-instant detection
const MAX_RUNTIME = 60000; // 60 seconds -- tight relaunch cycle
const SESSION_HEARTBEAT_INTERVAL = 30000; // 30s heartbeat

// --- Session heartbeat: tells bot.js that a Claude Code session is alive ---
function writeSessionHeartbeat() {
  try {
    writeFileSync(SESSION_FILE, JSON.stringify({
      timestamp: Date.now(),
      pid: process.pid,
    }));
  } catch (err) {
    // Log but don't crash -- heartbeat is best-effort
    // Avoid console.error since stdout is parsed by watcher-loop
    if (err.code !== "ENOENT") {
      process.stderr.write(`[WATCHER] Heartbeat write failed: ${err.message}\n`);
    }
  }
}

// Write heartbeat immediately and every 30s
writeSessionHeartbeat();
const heartbeatTimer = setInterval(writeSessionHeartbeat, SESSION_HEARTBEAT_INTERVAL);

async function getLastProcessedId() {
  try {
    return (await readFile(LAST_ID_FILE, "utf-8")).trim();
  } catch {
    return "";
  }
}

let found = false; // Guard against double-fire

async function checkQueue() {
  if (found) return; // Already found a message, exiting
  try {
    const raw = await readFile(QUEUE_FILE, "utf-8");
    if (!raw || !raw.trim()) return; // Empty file -- skip

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      // JSON parse failed -- file was mid-write. Retry on next poll.
      return;
    }

    if (data.status === "pending") {
      const lastId = await getLastProcessedId();
      if (data.id === lastId) return; // Already processed

      found = true; // Lock -- prevent duplicate processing

      // Mark as seen immediately -- if this fails, the next cycle will re-process
      // which is safer than losing the message entirely
      try {
        writeFileSync(LAST_ID_FILE, data.id);
      } catch (writeErr) {
        process.stderr.write(`[WATCHER] Failed to write last ID: ${writeErr.message}\n`);
      }

      const photoInfo = data.photos ? `|PHOTOS:${data.photos.join(",")}` : "";
      console.log(`QUEUE_MESSAGE|${data.id}|${data.message}${photoInfo}`);

      clearInterval(heartbeatTimer);
      process.exit(0);
    }
  } catch (err) {
    // File might not exist yet or be mid-rename -- ignore and retry next poll
    if (err.code !== "ENOENT") {
      // Log unexpected errors but don't crash
      // console.error(`[WATCHER] checkQueue error: ${err.message}`);
    }
  }
}

// --- Check immediately on startup ---
await checkQueue();

// --- fs.watch -- fast detection when it works ---
let debounce = null;
let watcher = null;

try {
  watcher = watch(QUEUE_FILE, { persistent: true }, () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(checkQueue, 100); // 100ms debounce
  });

  watcher.on("error", () => {
    // fs.watch failed -- polling alone will handle it
  });
} catch {
  // fs.watch not supported -- polling only
}

// --- Polling -- always runs as safety net ---
const pollTimer = setInterval(checkQueue, POLL_INTERVAL);

// --- Graceful timeout -- exit before Bash kills us ---
setTimeout(() => {
  if (!found) {
    clearInterval(pollTimer);
    clearInterval(heartbeatTimer);
    if (watcher) watcher.close();
    // Write one last heartbeat before exiting so the gap is minimal
    writeSessionHeartbeat();
    console.log("WATCHER_TIMEOUT");
    process.exit(0);
  }
}, MAX_RUNTIME);
