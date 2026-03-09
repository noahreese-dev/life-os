import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { watch } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const QUEUE_FILE = join(__dirname, "queue.json");
const STATE_FILE = join(__dirname, "state.json");

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: { params: { timeout: 30 } } });

bot.on("polling_error", (err) => {
  console.error(`[POLL ERROR] ${err.code || err.message}`);
});

let state = { chatId: null };
let waitingForResponse = false;
const messageQueue = [];
let typingInterval = null;

async function loadState() {
  try { state = JSON.parse(await readFile(STATE_FILE, "utf-8")); } catch {}
}
async function saveState() {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// Direct write — triggers FileSystemWatcher on the Claude Code side
async function writeQueue(data) {
  await writeFile(QUEUE_FILE, JSON.stringify(data, null, 2));
}

async function readQueue() {
  try {
    return JSON.parse(await readFile(QUEUE_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function truncate(text, limit = 4000) {
  if (!text) return "Done (no output).";
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "\n\n... (truncated)";
}

function startTyping(chatId) {
  bot.sendChatAction(chatId, "typing");
  typingInterval = setInterval(() => bot.sendChatAction(chatId, "typing"), 4000);
}

function stopTyping() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
}

// Write message to queue.json for Claude Code to pick up
async function sendToQueue(chatId, text) {
  const data = {
    id: `msg_${Date.now()}`,
    chatId,
    message: text,
    status: "pending",
    timestamp: new Date().toISOString(),
    response: null,
    error: null,
  };
  await writeQueue(data);
  console.log(`[QUEUE] Wrote pending: ${text.slice(0, 60)}`);
}

// Process next queued message
async function processNext() {
  if (messageQueue.length > 0) {
    const next = messageQueue.shift();
    console.log(`[QUEUE] Processing next (${messageQueue.length} remaining): ${next.text.slice(0, 60)}`);
    startTyping(next.chatId);
    await sendToQueue(next.chatId, next.text);
  } else {
    waitingForResponse = false;
    stopTyping();
  }
}

// Watch queue.json for "done" or "error" status — event-driven
let debounceTimer = null;
let pendingTimeout = null;

function watchQueueFile() {
  const watcher = watch(QUEUE_FILE, { persistent: true }, (eventType) => {
    // Debounce — Windows fires duplicate events
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const queue = await readQueue();
      if (!queue) return;

      if (queue.status === "done" && queue.response) {
        console.log(`[QUEUE] Got response: ${queue.response.slice(0, 80)}`);
        clearTimeout(pendingTimeout);
        stopTyping();

        try {
          await bot.sendMessage(queue.chatId, truncate(queue.response), { parse_mode: "Markdown" });
        } catch {
          await bot.sendMessage(queue.chatId, truncate(queue.response));
        }
        await processNext();
      } else if (queue.status === "error") {
        console.log(`[QUEUE] Error: ${queue.error}`);
        clearTimeout(pendingTimeout);
        stopTyping();
        await bot.sendMessage(queue.chatId, `Error: ${queue.error || "Unknown error"}`);
        await processNext();
      }
    }, 150);
  });

  watcher.on("error", (err) => {
    console.error(`[WATCH ERROR] ${err.message}`);
    setTimeout(watchQueueFile, 1000);
  });
}

// Handle all incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  if (!state.chatId) {
    state.chatId = chatId;
    await saveState();
    console.log(`Registered chat: ${chatId}`);
  }

  if (state.chatId && chatId !== state.chatId) return;

  if (text === "/start") {
    bot.sendMessage(chatId, "Life-OS CoS tunnel active. Messages go directly to Claude Code.");
    return;
  }
  if (text === "/ping") {
    bot.sendMessage(chatId, "Alive.");
    return;
  }

  console.log(`[IN] ${text}`);

  if (waitingForResponse) {
    messageQueue.push({ chatId, text, timestamp: Date.now() });
    bot.sendMessage(chatId, `Working on your last message... (${messageQueue.length} queued)`);
    return;
  }

  waitingForResponse = true;
  startTyping(chatId);
  await sendToQueue(chatId, text);

  // Safety timeout — if Claude Code doesn't respond in 10 minutes, notify user
  pendingTimeout = setTimeout(async () => {
    if (waitingForResponse) {
      stopTyping();
      await bot.sendMessage(chatId, "Claude Code session may not be active. Message timed out.");
      waitingForResponse = false;
      messageQueue.length = 0;
    }
  }, 600_000);
});

// --- Export for autonomous sends ---
export async function notify(message) {
  await loadState();
  if (state.chatId) {
    try {
      await bot.sendMessage(state.chatId, truncate(message), { parse_mode: "Markdown" });
    } catch {
      await bot.sendMessage(state.chatId, truncate(message));
    }
  }
}

// --- Boot ---
await loadState();
watchQueueFile();
console.log("Life-OS Telegram tunnel running...");
console.log(`Bot: ${TELEGRAM_TOKEN ? "configured" : "missing token"}`);
console.log(`Authorized chat: ${state.chatId || "waiting..."}`);
