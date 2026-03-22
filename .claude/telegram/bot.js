import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import { readFile, writeFile, rename, mkdir } from "fs/promises";
import { watch, createWriteStream, existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const QUEUE_FILE = join(__dirname, "queue.json");
const QUEUE_TMP = join(__dirname, "queue.json.tmp");
const STATE_FILE = join(__dirname, "state.json");
const HEARTBEAT_FILE = join(__dirname, ".heartbeat");
const SESSION_FILE = join(__dirname, ".session");
const LOG_FILE = join(__dirname, "bot.log");
const PHOTOS_DIR = join(__dirname, "photos");
// --- Single-instance guard via PID file ---
const PID_FILE = join(__dirname, '.bot.pid');

function isProcessRunning(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

if (existsSync(PID_FILE)) {
  const oldPid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
  if (oldPid && oldPid !== process.pid && isProcessRunning(oldPid)) {
    console.log("[GUARD] Killing old bot instance (PID " + oldPid + ") to prevent duplicates.");
    try { process.kill(oldPid, 'SIGTERM'); } catch {}
    // Wait briefly for the old process to exit
    const start = Date.now();
    while (Date.now() - start < 3000 && isProcessRunning(oldPid)) {
      // spin-wait up to 3 seconds
    }
    if (isProcessRunning(oldPid)) {
      try { process.kill(oldPid, 'SIGKILL'); } catch {}
    }
    console.log("[GUARD] Old instance (PID " + oldPid + ") terminated. Taking over.");
  } else {
    console.log("[GUARD] Stale PID file (PID " + (oldPid || 'N/A') + " not running). Taking over.");
  }
}
writeFileSync(PID_FILE, String(process.pid), 'utf8');
console.log("[GUARD] PID file written: " + process.pid);

// Clean up PID file on exit
function cleanPid() { try { if (readFileSync(PID_FILE, 'utf8').trim() === String(process.pid)) unlinkSync(PID_FILE); } catch {} }
process.on('exit', cleanPid);
process.on('SIGINT', () => { cleanPid(); process.exit(0); });
process.on('SIGTERM', () => { cleanPid(); process.exit(0); });


// --- Backoff state for polling errors ---
let consecutiveErrors = 0;
let backoffMs = 0;
const BACKOFF_SCHEDULE = [0, 5000, 10000, 30000, 60000, 300000]; // 0, 5s, 10s, 30s, 1min, 5min max

// --- Catch unhandled rejections so DNS failures don't kill the process ---
process.on("unhandledRejection", (err) => {
  const code = err?.code || err?.message || "unknown";
  if (code === "EFATAL" || code === "ENOTFOUND" || code === "ETIMEDOUT" || code === "ECONNRESET") {
    consecutiveErrors++;
    if (consecutiveErrors <= 3 || consecutiveErrors % 50 === 0) {
      console.error(`[NET ERROR] ${code} (count: ${consecutiveErrors})`);
    }
  } else {
    console.error(`[UNHANDLED] ${err?.stack || err}`);
  }
});

process.on("uncaughtException", (err) => {
  console.error(`[UNCAUGHT] ${err?.stack || err}`);
  // Don't exit — let the bot try to recover
});

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: {
    params: { timeout: 30 },
    interval: 2000, // Poll every 2s when healthy
  },
});

// --- Polling error handler with exponential backoff ---
bot.on("polling_error", (err) => {
  const code = err?.code || err?.message || "unknown";
  consecutiveErrors++;

  // Log sparingly — first 3, then every 50th
  if (consecutiveErrors <= 3 || consecutiveErrors % 50 === 0) {
    const backoffIdx = Math.min(consecutiveErrors, BACKOFF_SCHEDULE.length - 1);
    backoffMs = BACKOFF_SCHEDULE[backoffIdx];
    console.error(`[POLL ERROR] ${code} (count: ${consecutiveErrors}, backoff: ${backoffMs / 1000}s)`);
  }

  // After too many errors, stop and restart polling with backoff
  // Use modulo so recovery is retried every 50 errors, not just once at exactly 5
  if (consecutiveErrors === 5 || (consecutiveErrors > 5 && consecutiveErrors % 50 === 0)) {
    console.log("[RECOVERY] Stopping polling for backoff...");
    bot.stopPolling().then(() => {
      const delay = BACKOFF_SCHEDULE[Math.min(consecutiveErrors, BACKOFF_SCHEDULE.length - 1)];
      console.log(`[RECOVERY] Resuming polling in ${delay / 1000}s...`);
      setTimeout(() => {
        bot.startPolling().then(() => {
          console.log("[RECOVERY] Polling resumed.");
        }).catch((e) => {
          console.error(`[RECOVERY] Resume failed: ${e.message}. Will retry in 60s.`);
          setTimeout(() => bot.startPolling().catch(() => {}), 60000);
        });
      }, delay);
    }).catch(() => {});
  }
});

// Reset error count on successful message receipt
function resetErrors() {
  if (consecutiveErrors > 0) {
    console.log(`[RECOVERY] Network restored after ${consecutiveErrors} errors.`);
    consecutiveErrors = 0;
    backoffMs = 0;
  }
}

let state = { chatId: null };
let waitingForResponse = false;
let shuttingDown = false;
const messageQueue = [];
let typingInterval = null;
const bootTime = Date.now();
let lastMessageTime = null;
let messagesProcessed = 0;

// --- Collect mode: coalesce rapid-fire messages into one prompt ---
const COLLECT_WINDOW = 5000; // 5 seconds
let collectBuffer = []; // Array of { text, photos }
let collectTimer = null;
let collectChatId = null;
let collectTypingInterval = null; // Typing indicator while collecting

// --- Photo deduplication (prevents burst duplicates) ---
const recentFileIds = new Map(); // file_unique_id -> timestamp
const DEDUP_WINDOW = 60000; // 60 seconds

// Periodic cleanup of dedup map to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of recentFileIds) {
    if (now - ts > DEDUP_WINDOW) recentFileIds.delete(id);
  }
}, DEDUP_WINDOW);

// --- Write serialization: prevent concurrent writes to queue.json ---
let writeInProgress = false;
let writePendingData = null;

const STATE_TMP = join(__dirname, "state.json.tmp");

async function loadState() {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    // Validate: state must have expected shape (guards against corruption - scenario 15)
    if (parsed && typeof parsed === "object") {
      state = { chatId: parsed.chatId || null };
    } else {
      console.error("[STATE] Corrupted state (not an object). Resetting.");
      state = { chatId: null };
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      // JSON corrupted -- reset to clean state instead of crashing
      console.error(`[STATE] Corrupted JSON in state.json. Resetting.`);
      state = { chatId: null };
      // Overwrite the corrupted file
      try { await writeFile(STATE_FILE, JSON.stringify(state, null, 2)); } catch {}
    } else if (err.code !== "ENOENT" && err.code !== "ERR_MODULE_NOT_FOUND") {
      console.error(`[STATE] Failed to load state: ${err.message}`);
    }
  }
}

// Atomic saveState: write to .tmp then rename (prevents corruption on crash/power loss)
async function saveState() {
  const json = JSON.stringify(state, null, 2);
  try {
    await writeFile(STATE_TMP, json);
    await rename(STATE_TMP, STATE_FILE);
  } catch (err) {
    // Fallback: direct write if rename fails (better than losing state entirely)
    console.error(`[STATE] Atomic save failed (${err.code}), falling back to direct write.`);
    await writeFile(STATE_FILE, json);
  }
}

// --- ATOMIC write: write to .tmp then rename ---
// rename() is atomic on all OSes (including Windows NTFS)
// Retry on EPERM/EACCES which can happen on Windows if another process has the file open briefly
async function writeQueue(data) {
  const json = JSON.stringify(data, null, 2);
  await writeFile(QUEUE_TMP, json);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await rename(QUEUE_TMP, QUEUE_FILE);
      return;
    } catch (err) {
      if ((err.code === "EPERM" || err.code === "EACCES" || err.code === "EBUSY") && attempt < 2) {
        console.log(`[WRITE] Rename failed (${err.code}), retrying in ${50 * (attempt + 1)}ms...`);
        await new Promise(r => setTimeout(r, 50 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
}

// --- Serialized write: prevents two writes from overlapping ---
// Uses iterative draining instead of recursion to prevent stack overflow
// under rapid-fire message bursts.
async function writeQueueSafe(data) {
  if (writeInProgress) {
    // Another write is happening — store this one and it will be written after
    writePendingData = data;
    return;
  }
  writeInProgress = true;
  try {
    await writeQueue(data);
  } finally {
    writeInProgress = false;
  }
  // Iteratively drain pending writes (no recursion — safe under burst load)
  while (writePendingData) {
    const pending = writePendingData;
    writePendingData = null;
    writeInProgress = true;
    try {
      await writeQueue(pending);
    } finally {
      writeInProgress = false;
    }
  }
}

async function readQueue() {
  try {
    const raw = await readFile(QUEUE_FILE, "utf-8");
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    // ENOENT = file doesn't exist yet (normal). SyntaxError = mid-write (transient).
    // Anything else is worth logging.
    if (err.code !== "ENOENT" && !(err instanceof SyntaxError)) {
      console.error(`[QUEUE] Read failed: ${err.message}`);
    }
    return null;
  }
}

function truncate(text, limit = 4096) {
  if (!text) return "Done (no output).";
  if (text.length <= limit) return text;
  const suffix = "\n\n... (truncated)";
  return text.slice(0, limit - suffix.length) + suffix;
}

// Split long text into multiple Telegram-safe chunks (max 4096 chars each)
// Tries to split at newlines to avoid breaking mid-word/mid-sentence
function splitMessage(text, limit = 4096) {
  if (!text) return ["Done (no output)."];
  if (text.length <= limit) return [text];

  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }
    // Try to split at a newline near the limit
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt < limit * 0.5) {
      // No good newline found in the last half -- split at space
      splitAt = remaining.lastIndexOf(" ", limit);
    }
    if (splitAt < limit * 0.3) {
      // No good space either -- hard split
      splitAt = limit;
    }
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  // Cap at 5 chunks to prevent spam (5 * 4096 = ~20K chars)
  if (chunks.length > 5) {
    chunks.length = 5;
    chunks[4] += "\n\n... (remaining output truncated)";
  }
  return chunks;
}

// --- Retry wrapper for Telegram sends (handles 429 rate limits + transient errors) ---
async function sendWithRetry(chatId, text, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await bot.sendMessage(chatId, text, options);
    } catch (err) {
      const is429 = err?.response?.statusCode === 429 || err?.message?.includes("429");
      const isTransient = err?.code === "ETELEGRAM" || err?.code === "ECONNRESET" || err?.code === "ETIMEDOUT";

      if ((is429 || isTransient) && attempt < maxRetries) {
        // Respect Retry-After header if present, otherwise use exponential backoff
        const retryAfter = err?.response?.body?.parameters?.retry_after;
        const delay = retryAfter ? retryAfter * 1000 : Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`[SEND RETRY] Attempt ${attempt + 1}/${maxRetries} failed (${is429 ? "429" : err.code}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err; // Non-retryable or exhausted retries
    }
  }
}

function startTyping(chatId) {
  bot.sendChatAction(chatId, "typing").catch(() => {});
  typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, "typing").catch(() => {});
  }, 4000);
}

function stopTyping() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
}

async function downloadFile(fileId, filename) {
  await mkdir(PHOTOS_DIR, { recursive: true });
  const filePath = await bot.getFileLink(fileId);
  const localPath = join(PHOTOS_DIR, filename);
  return new Promise((resolve, reject) => {
    const file = createWriteStream(localPath);
    https.get(filePath, (res) => {
      // Check for HTTP errors -- don't pipe error bodies into the file
      if (res.statusCode < 200 || res.statusCode >= 300) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} downloading file`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(localPath); });
      file.on("error", (err) => { file.close(); reject(err); });
    }).on("error", (err) => {
      file.close(); // Clean up write stream on network error
      reject(err);
    });
  });
}

let msgCounter = 0; // Monotonic counter to prevent ID collisions within the same millisecond

async function sendToQueue(chatId, text, photos = null) {
  const data = {
    id: `msg_${Date.now()}_${msgCounter++}`,
    chatId,
    message: text,
    status: "pending",
    timestamp: new Date().toISOString(),
    response: null,
    error: null,
  };
  if (photos && photos.length > 0) {
    data.photos = photos;
  }
  try {
    await writeQueueSafe(data);
    console.log(`[QUEUE] Wrote pending: ${text.slice(0, 60)}${photos ? ` [${photos.length} photo(s)]` : ""}`);
  } catch (err) {
    // Scenario 8: disk full, permissions error, etc.
    console.error(`[QUEUE WRITE FAILED] ${err.message}`);
    // Notify the user their message wasn't queued
    try {
      await sendWithRetry(chatId, `Failed to queue your message (${err.code || "write error"}). Please try again in a moment.`);
    } catch {}
    // Reset state so the bot doesn't get stuck in waitingForResponse
    waitingForResponse = false;
    stopTyping();
    throw err; // Re-throw so callers know it failed
  }
}

async function processNext() {
  if (messageQueue.length > 0) {
    const next = messageQueue.shift();
    console.log(`[QUEUE] Processing next (${messageQueue.length} remaining): ${next.text.slice(0, 60)}`);
    startTyping(next.chatId);
    await sendToQueue(next.chatId, next.text, next.photos || null);
    startResponsePolling(); // Restart polling for the new message
    // Set a new timeout for this message
    setPendingTimeout(next.chatId);
  } else {
    waitingForResponse = false;
    stopTyping();
  }
}

// --- Collect mode helpers ---
function stopCollectTyping() {
  if (collectTypingInterval) {
    clearInterval(collectTypingInterval);
    collectTypingInterval = null;
  }
}

function startCollectTyping(chatId) {
  // Show typing while collecting (so user knows bot received their message)
  if (collectTypingInterval) return; // Already showing typing
  bot.sendChatAction(chatId, "typing").catch(() => {});
  collectTypingInterval = setInterval(() => {
    bot.sendChatAction(chatId, "typing").catch(() => {});
  }, 4000);
}

async function flushCollectBuffer() {
  if (collectBuffer.length === 0) return;

  const chatId = collectChatId;
  const texts = collectBuffer.map(item => item.text).filter(Boolean);
  const allPhotos = collectBuffer.flatMap(item => item.photos || []);
  const combinedText = texts.join("\n\n") || `[${allPhotos.length} photo(s) sent]`;

  // Clear the buffer
  collectBuffer = [];
  collectChatId = null;
  if (collectTimer) { clearTimeout(collectTimer); collectTimer = null; }
  stopCollectTyping();

  if (collectBuffer.length > 0) return; // Safety: re-check after clearing

  const count = texts.length + (allPhotos.length > 0 ? 1 : 0);
  if (count > 1) {
    console.log(`[COLLECT] Coalesced ${texts.length} message(s) into one prompt.`);
  }

  // Now process like a normal message
  waitingForResponse = true;
  startTyping(chatId);
  try {
    await sendToQueue(chatId, combinedText, allPhotos.length > 0 ? allPhotos : null);
    startResponsePolling();
    setPendingTimeout(chatId);
  } catch (err) {
    console.error(`[COLLECT] Failed to queue coalesced message: ${err.message}`);
  }
}

// --- HYBRID response detection: fs.watch + polling ---
// fs.watch is unreliable on Windows. Polling is the safety net.

let debounceTimer = null;
let pendingTimeout = null;
let earlyCheckTimeout = null; // Track the 30s session-check timer
let responseCheckInterval = null;
let lastResponseId = null; // Guard against double-fire from watch + poll
let checkInProgress = false; // Prevent overlapping checks

async function checkForResponse() {
  if (checkInProgress) return; // Prevent re-entrant checks
  checkInProgress = true;
  try {
    const queue = await readQueue();
    if (!queue) return;

    if (queue.status === "done" && queue.response && queue.id !== lastResponseId) {
      lastResponseId = queue.id; // Lock -- prevent duplicate sends
      console.log(`[QUEUE] Got response: ${queue.response.slice(0, 80)}`);
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
      clearTimeout(earlyCheckTimeout);
      earlyCheckTimeout = null;
      stopTyping();
      stopResponsePolling();

      // Split long responses into multiple messages instead of truncating
      const chunks = splitMessage(queue.response);
      for (const chunk of chunks) {
        try {
          await sendWithRetry(queue.chatId, chunk, { parse_mode: "Markdown" });
        } catch {
          // Markdown failed -- send as plain text (with retry)
          try {
            await sendWithRetry(queue.chatId, chunk);
          } catch (e) {
            console.error(`[SEND ERROR] ${e.message}`);
          }
        }
      }
      messagesProcessed++;
      lastMessageTime = Date.now();
      await processNext();
    } else if (queue.status === "error" && queue.id !== lastResponseId) {
      lastResponseId = queue.id;
      console.log(`[QUEUE] Error: ${queue.error}`);
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
      clearTimeout(earlyCheckTimeout);
      earlyCheckTimeout = null;
      stopTyping();
      stopResponsePolling();
      try {
        await sendWithRetry(queue.chatId, `Error: ${queue.error || "Unknown error"}`);
      } catch (e) {
        console.error(`[SEND ERROR] ${e.message}`);
      }
      await processNext();
    }
  } finally {
    checkInProgress = false;
  }
}

function startResponsePolling() {
  // Poll every 2 seconds as safety net alongside fs.watch
  if (responseCheckInterval) clearInterval(responseCheckInterval);
  responseCheckInterval = setInterval(checkForResponse, 2000);
}

function stopResponsePolling() {
  if (responseCheckInterval) {
    clearInterval(responseCheckInterval);
    responseCheckInterval = null;
  }
}

let queueWatcher = null; // Track for cleanup on shutdown

function watchQueueFile() {
  try {
    queueWatcher = watch(QUEUE_FILE, { persistent: true }, (eventType) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkForResponse, 150);
    });

    queueWatcher.on("error", (err) => {
      console.error(`[WATCH ERROR] ${err.message}. Relying on polling.`);
      // Don't restart watcher -- polling is already running as backup
    });
  } catch (err) {
    console.error(`[WATCH INIT ERROR] ${err.message}. Relying on polling only.`);
  }
}

// --- Heartbeat: write timestamp so watcher/session can detect bot is alive ---
async function writeHeartbeat() {
  try {
    await writeFile(HEARTBEAT_FILE, JSON.stringify({
      pid: process.pid,
      timestamp: Date.now(),
      uptime: Math.floor((Date.now() - bootTime) / 1000),
      messagesProcessed,
      waiting: waitingForResponse,
      queued: messageQueue.length,
      collecting: collectBuffer.length,
      network: consecutiveErrors === 0 ? "healthy" : `${consecutiveErrors} errors`,
    }, null, 2));
  } catch (err) {
    // Log heartbeat write failures (e.g., NTFS lock contention) -- but don't crash
    if (err.code !== "ENOENT") {
      console.error(`[HEARTBEAT] Write failed: ${err.message}`);
    }
  }
}

// Write heartbeat every 30 seconds
const heartbeatInterval = setInterval(writeHeartbeat, 30000);
writeHeartbeat(); // Write immediately on boot

// --- Session detection: check if a watcher/Claude Code session is alive ---
async function isSessionActive() {
  try {
    const raw = await readFile(SESSION_FILE, "utf-8");
    const session = JSON.parse(raw);
    const age = Date.now() - session.timestamp;
    return age < 120000; // Session active if heartbeat < 2 minutes old
  } catch {
    return false;
  }
}

// --- Pending message timeout with session awareness ---
function setPendingTimeout(chatId) {
  if (pendingTimeout) clearTimeout(pendingTimeout);
  if (earlyCheckTimeout) clearTimeout(earlyCheckTimeout);

  // Phase 1: After 30 seconds, check if session is even active
  earlyCheckTimeout = setTimeout(async () => {
    earlyCheckTimeout = null; // Self-clear spent timer
    if (!waitingForResponse) return;
    const queue = await readQueue();
    if (!queue || queue.status !== "pending") return;

    const sessionActive = await isSessionActive();
    if (!sessionActive) {
      console.log("[TIMEOUT] No active session detected after 30s.");
      stopTyping();
      // Don't stop response polling -- a session might open and process the message
      try {
        await sendWithRetry(chatId, "No active Claude Code session detected. Message queued -- will process when session opens.");
      } catch {}
      // Don't clear waitingForResponse yet -- let the full timeout handle that
      // The message stays pending in queue.json for when a session opens
    }
  }, 30000);

  // Phase 2: Hard timeout at 5 minutes
  pendingTimeout = setTimeout(async () => {
    pendingTimeout = null; // Self-clear so other code doesn't try to clear a spent timer
    clearTimeout(earlyCheckTimeout);
    earlyCheckTimeout = null;
    if (waitingForResponse) {
      const queue = await readQueue();
      stopTyping();
      stopResponsePolling();

      // Mark the stuck message as error in queue.json
      if (queue && queue.status === "pending") {
        await writeQueueSafe({
          ...queue,
          status: "error",
          error: "Timed out after 5 minutes -- no Claude Code session responded",
        });
      }

      try {
        await sendWithRetry(chatId, "Message timed out after 5 minutes. No Claude Code session responded. Please resend when a session is open.");
      } catch {}
      waitingForResponse = false;

      // Process any queued messages (they'll also timeout if no session)
      if (messageQueue.length > 0) {
        // Drain the queue with timeout errors instead of blocking
        for (const queued of messageQueue) {
          try {
            await sendWithRetry(queued.chatId, `Queued message also timed out: "${queued.text.slice(0, 40)}...". Please resend.`);
          } catch {}
        }
        messageQueue.length = 0;
      }
    }
  }, 300_000);
}

// --- Stuck message monitor: runs every 60s to catch orphaned pending messages ---
let stuckMonitorActive = false; // Prevent overlapping runs (scenario 14)

const stuckMonitorInterval = setInterval(async () => {
  if (stuckMonitorActive) return; // Previous check still running
  stuckMonitorActive = true;
  try {
    if (waitingForResponse) {
      // Scenario 13: State reconciliation -- check if queue shows "done" or "error"
      // but waitingForResponse is still true (stale state from missed response)
      const queue = await readQueue();
      if (queue && (queue.status === "done" || queue.status === "error") && queue.id !== lastResponseId) {
        console.log(`[RECONCILE] waitingForResponse=true but queue is ${queue.status}. Triggering check.`);
        await checkForResponse(); // This will deliver the response and reset state
      }
      return; // Bot is actively waiting, skip stuck-message check
    }

    const queue = await readQueue();
    if (queue && queue.status === "pending") {
      const age = Date.now() - new Date(queue.timestamp).getTime();
      if (age > 300000) { // 5 minutes
        console.log(`[STUCK] Found stuck pending message (${Math.floor(age / 1000)}s old). Clearing.`);
        await writeQueueSafe({
          ...queue,
          status: "error",
          error: `Stuck in pending for ${Math.floor(age / 60000)} minutes`,
        });
        if (state.chatId) {
          try {
            await sendWithRetry(state.chatId, `Your message ("${queue.message.slice(0, 40)}...") was stuck for ${Math.floor(age / 60000)} minutes. Cleared. Please resend.`);
          } catch {}
        }
      }
    }
  } finally {
    stuckMonitorActive = false;
  }
}, 60000);

// --- Handle incoming messages (text + photos) ---
bot.on("message", async (msg) => {
  if (shuttingDown) return; // Don't accept new messages during shutdown
  resetErrors(); // If we got a message, network is fine

  const chatId = msg.chat.id;
  const text = msg.text?.trim() || msg.caption?.trim() || "";
  const hasPhoto = msg.photo && msg.photo.length > 0;
  const hasDocument = msg.document && (msg.document.mime_type || "").startsWith("image/");

  // Skip messages with no text AND no photo
  if (!text && !hasPhoto && !hasDocument) return;

  // --- Deduplicate burst photos (same photo sent multiple times rapidly) ---
  const fileUniqueId = hasPhoto ? msg.photo[msg.photo.length - 1].file_unique_id
    : hasDocument ? msg.document.file_unique_id : null;
  if (fileUniqueId && !text) {
    // Clean expired entries
    const now = Date.now();
    for (const [id, ts] of recentFileIds) {
      if (now - ts > DEDUP_WINDOW) recentFileIds.delete(id);
    }
    if (recentFileIds.has(fileUniqueId)) {
      console.log(`[DEDUP] Skipping duplicate photo: ${fileUniqueId}`);
      return;
    }
    recentFileIds.set(fileUniqueId, now);
  }

  if (!state.chatId) {
    state.chatId = chatId;
    await saveState();
    console.log(`Registered chat: ${chatId}`);
  }

  if (state.chatId && chatId !== state.chatId) return;

  // --- Built-in commands ---
  if (text === "/start") {
    sendWithRetry(chatId, "Life-OS CoS tunnel active. Messages go directly to Claude Code.").catch(() => {});
    return;
  }

  if (text === "/ping") {
    sendWithRetry(chatId, "Alive.").catch(() => {});
    return;
  }

  if (text === "/status") {
    const uptime = Math.floor((Date.now() - bootTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const queue = await readQueue();
    const queueStatus = queue?.status || "unknown";
    const lastMsg = lastMessageTime ? `${Math.floor((Date.now() - lastMessageTime) / 1000)}s ago` : "none yet";
    const netStatus = consecutiveErrors === 0 ? "healthy" : `${consecutiveErrors} errors`;
    const sessionActive = await isSessionActive();

    // Detailed timing info
    const lastRecv = lastMessageTime ? new Date(lastMessageTime).toLocaleTimeString() : "none";
    const lastRecvAgo = lastMessageTime ? `${Math.floor((Date.now() - lastMessageTime) / 1000)}s ago` : "";
    const pendingSince = queue?.status === "pending" && queue?.timestamp ? `since ${new Date(queue.timestamp).toLocaleTimeString()} (${Math.floor((Date.now() - new Date(queue.timestamp).getTime()) / 1000)}s)` : "";
    const lastDoneMsg = queue?.status === "done" && queue?.message ? `"${queue.message.substring(0, 40)}..."` : "";
    const queueDetail = queue?.status === "pending" ? `PENDING ${pendingSince}` : queue?.status === "done" ? `idle (last: ${lastDoneMsg})` : queueStatus;

    const status = [
      `*Life-OS Tunnel Status*`,
      ``,
      `*Bot*`,
      `  Uptime: ${hours}h ${mins}m`,
      `  PID: ${process.pid}`,
      `  Network: ${netStatus}`,
      ``,
      `*Queue*`,
      `  State: ${queueDetail}`,
      `  Waiting for response: ${waitingForResponse ? "YES" : "no"}`,
      `  Burst queue depth: ${messageQueue.length}`,
      `  Collect buffer: ${collectBuffer.length > 0 ? `${collectBuffer.length} message(s) collecting...` : "empty"}`,
      ``,
      `*Activity*`,
      `  Messages processed: ${messagesProcessed}`,
      `  Last message received: ${lastRecv} ${lastRecvAgo ? `(${lastRecvAgo})` : ""}`,
      `  Last response sent: ${lastMsg}`,
      ``,
      `*Session*`,
      `  Claude Code: ${sessionActive ? "ACTIVE" : "NO ACTIVE SESSION"}`,
    ].join("\n");

    try {
      await sendWithRetry(chatId, status, { parse_mode: "Markdown" });
    } catch {
      await sendWithRetry(chatId, status);
    }
    return;
  }

  if (text === "/reset") {
    // Manual reset command -- clears stuck state
    waitingForResponse = false;
    messageQueue.length = 0;
    collectBuffer = [];
    collectChatId = null;
    if (collectTimer) { clearTimeout(collectTimer); collectTimer = null; }
    stopCollectTyping();
    stopTyping();
    stopResponsePolling();
    if (pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null; }
    if (earlyCheckTimeout) { clearTimeout(earlyCheckTimeout); earlyCheckTimeout = null; }
    await writeQueueSafe({ status: "idle" });
    sendWithRetry(chatId, "Queue reset. Send your message again.").catch(() => {});
    console.log("[RESET] Manual reset via /reset command.");
    return;
  }

  // --- Download photos if present ---
  let photoPaths = [];
  try {
    if (hasPhoto) {
      const photo = msg.photo[msg.photo.length - 1];
      const ts = Date.now();
      const localPath = await downloadFile(photo.file_id, `photo_${ts}.jpg`);
      photoPaths.push(localPath);
      console.log(`[PHOTO] Downloaded: ${localPath}`);
    }
    if (hasDocument) {
      const ts = Date.now();
      const ext = msg.document.file_name?.split(".").pop() || "jpg";
      const localPath = await downloadFile(msg.document.file_id, `doc_${ts}.${ext}`);
      photoPaths.push(localPath);
      console.log(`[PHOTO] Downloaded document: ${localPath}`);
    }
  } catch (err) {
    console.error(`[PHOTO ERROR] ${err.message}`);
    sendWithRetry(chatId, `Photo download failed: ${err.message}. Send as text or try again.`).catch(() => {});
    if (!text) return;
  }

  const displayText = text || `[${photoPaths.length} photo(s) sent]`;
  console.log(`[IN] ${displayText}${photoPaths.length ? ` [${photoPaths.length} photo(s)]` : ""}`);

  // --- Determine if this message should bypass collect mode ---
  const isCommand = text.startsWith("/");
  const isPhoto = photoPaths.length > 0;
  const bypassCollect = isCommand || isPhoto;

  // --- Check for stuck pending before queueing ---
  if (waitingForResponse) {
    const queue = await readQueue();

    // If the queue shows done/error but we're still waiting, deliver the response first
    if (queue && (queue.status === "done" || queue.status === "error") && queue.id !== lastResponseId) {
      console.log(`[RECONCILE] Incoming message found undelivered ${queue.status} response. Delivering first.`);
      await checkForResponse();
      // checkForResponse will reset waitingForResponse via processNext()
    }

    // Check if the pending message is actually stuck (>2 min with no response)
    if (waitingForResponse && queue && queue.status === "pending") {
      const age = Date.now() - new Date(queue.timestamp).getTime();
      if (age > 120000) {
        // Stuck for 2+ minutes -- auto-clear and process this new message
        console.log(`[AUTO-CLEAR] Previous message stuck for ${Math.floor(age / 1000)}s. Clearing.`);
        stopTyping();
        stopResponsePolling();
        if (pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null; }
        if (earlyCheckTimeout) { clearTimeout(earlyCheckTimeout); earlyCheckTimeout = null; }
        waitingForResponse = false;
        messageQueue.length = 0;
        try {
          await sendWithRetry(chatId, `Previous message timed out. Processing your new message...`);
        } catch {}
      }
    }
  }

  // --- When waiting for response: use existing burst queue behavior ---
  if (waitingForResponse) {
    // Cap the in-memory queue to prevent memory exhaustion from spam
    const MAX_QUEUED = 10;
    if (messageQueue.length >= MAX_QUEUED) {
      sendWithRetry(chatId, `Queue full (${MAX_QUEUED} messages). Please wait for processing to finish.`).catch(() => {});
      return;
    }
    messageQueue.push({ chatId, text: displayText, photos: photoPaths, timestamp: Date.now() });
    sendWithRetry(chatId, `Processing previous message... (${messageQueue.length} queued)`).catch(() => {});
    return;
  }

  // --- Collect mode: coalesce rapid-fire messages ---

  // Photos and commands bypass collect mode entirely
  if (bypassCollect) {
    // If there are buffered messages, flush them first
    if (collectBuffer.length > 0) {
      console.log(`[COLLECT] Flushing ${collectBuffer.length} buffered message(s) before ${isCommand ? "command" : "photo"}.`);
      if (collectTimer) { clearTimeout(collectTimer); collectTimer = null; }
      await flushCollectBuffer();
      // Now waitingForResponse is true, so queue this as a burst message
      messageQueue.push({ chatId, text: displayText, photos: photoPaths, timestamp: Date.now() });
      sendWithRetry(chatId, `Processing buffered messages... (${messageQueue.length} queued)`).catch(() => {});
      return;
    }

    // No buffer -- process immediately (no collect delay)
    waitingForResponse = true;
    startTyping(chatId);
    try {
      await sendToQueue(chatId, displayText, photoPaths.length > 0 ? photoPaths : null);
      startResponsePolling();
      setPendingTimeout(chatId);
    } catch (err) {
      console.error(`[MESSAGE] Failed to queue message: ${err.message}`);
    }
    return;
  }

  // Regular text message: add to collect buffer
  collectChatId = chatId;
  collectBuffer.push({ text: displayText, photos: photoPaths });

  // Show typing while collecting so user knows bot is receiving
  startCollectTyping(chatId);

  // Reset the collect timer (extends the window with each new message)
  if (collectTimer) clearTimeout(collectTimer);
  collectTimer = setTimeout(async () => {
    collectTimer = null;
    await flushCollectBuffer();
  }, COLLECT_WINDOW);
});

// --- Export for autonomous sends ---
export async function notify(message) {
  await loadState();
  if (state.chatId) {
    try {
      await sendWithRetry(state.chatId, truncate(message), { parse_mode: "Markdown" });
    } catch {
      try {
        await sendWithRetry(state.chatId, truncate(message));
      } catch (e) {
        console.error(`[NOTIFY ERROR] ${e.message}`);
      }
    }
  }
}

// --- Startup recovery: check for orphaned pending messages ---
async function startupRecovery() {
  const queue = await readQueue();
  if (queue && queue.status === "pending") {
    const age = Date.now() - new Date(queue.timestamp).getTime();
    if (age > 60000) {
      // Pending message older than 1 minute -- it was orphaned by a crash/restart
      console.log(`[RECOVERY] Found orphaned pending message (${Math.floor(age / 1000)}s old). Re-queuing for processing.`);
      // Re-write as pending with fresh timestamp so the watcher picks it up
      // The message stays in queue.json as-is (already pending) — watcher will find it
      // Notify user that we're re-processing, not asking them to resend
      if (state.chatId) {
        try {
          await sendWithRetry(state.chatId, `Bot restarted. Re-processing your message: "${queue.message.slice(0, 50)}..."`);
        } catch {}
      }
      // Set up response monitoring for this orphaned message
      waitingForResponse = true;
      startResponsePolling();
      setPendingTimeout(queue.chatId);
    } else {
      // Pending but recent (< 1 min) — just set up monitoring, it's probably in-flight
      console.log(`[RECOVERY] Found recent pending message (${Math.floor(age / 1000)}s old). Setting up monitoring.`);
      waitingForResponse = true;
      startResponsePolling();
      setPendingTimeout(queue.chatId);
    }
  }
}

// --- Boot ---
await loadState();

// Ensure queue.json exists
try {
  await readFile(QUEUE_FILE, "utf-8");
} catch {
  await writeQueueSafe({ status: "idle" });
}

watchQueueFile();
await startupRecovery();

// --- Graceful shutdown: clean up file handles, intervals, watchers ---
async function shutdown(signal) {
  if (shuttingDown) return; // Prevent double-shutdown
  shuttingDown = true;
  console.log(`[SHUTDOWN] ${signal} received. Cleaning up...`);

  // Flush collect buffer before dying so messages aren't lost
  if (collectBuffer.length > 0) {
    try {
      console.log(`[SHUTDOWN] Flushing ${collectBuffer.length} collected message(s) before exit.`);
      if (collectTimer) { clearTimeout(collectTimer); collectTimer = null; }
      await flushCollectBuffer();
    } catch (err) {
      console.error(`[SHUTDOWN] Collect buffer flush failed: ${err.message}`);
    }
  }

  // Do one final response check before dying -- if a response arrived, deliver it
  if (waitingForResponse) {
    try {
      await checkForResponse();
    } catch (err) {
      console.error(`[SHUTDOWN] Final response check failed: ${err.message}`);
    }
  }

  stopTyping();
  stopCollectTyping();
  stopResponsePolling();
  clearInterval(heartbeatInterval);
  clearInterval(stuckMonitorInterval);
  if (collectTimer) clearTimeout(collectTimer);
  if (pendingTimeout) clearTimeout(pendingTimeout);
  if (earlyCheckTimeout) clearTimeout(earlyCheckTimeout);
  if (debounceTimer) clearTimeout(debounceTimer);
  if (queueWatcher) { try { queueWatcher.close(); } catch {} }
  bot.stopPolling().catch(() => {}).finally(() => {
    console.log("[SHUTDOWN] Clean exit.");
    process.exit(0);
  });
  // Force exit after 5s if stopPolling hangs
  setTimeout(() => process.exit(1), 5000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("Life-OS Telegram tunnel running...");
console.log(`Bot: ${TELEGRAM_TOKEN ? "configured" : "missing token"}`);
console.log(`Authorized chat: ${state.chatId || "waiting..."}`);
