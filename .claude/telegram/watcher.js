// Life-OS Telegram Tunnel — Persistent file watcher (Node.js)
// Watches queue.json for "pending" status, outputs message and exits.
// NO timeout — runs until a message arrives or Bash kills it.
// Launched by Claude Code via run_in_background with timeout: 600000.

import { watch } from "fs";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "queue.json");

async function checkQueue() {
  try {
    const data = JSON.parse(await readFile(QUEUE_FILE, "utf-8"));
    if (data.status === "pending") {
      console.log(`QUEUE_MESSAGE|${data.id}|${data.message}`);
      process.exit(0);
    }
  } catch {}
}

// Check immediately on startup
await checkQueue();

// Watch for changes — persistent, no timeout
let debounce = null;
const watcher = watch(QUEUE_FILE, { persistent: true }, () => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(async () => {
    await checkQueue();
  }, 150);
});

watcher.on("error", () => {
  // If watch fails, fall back to 2-second polling
  setInterval(checkQueue, 2000);
});
