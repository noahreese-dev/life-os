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
const LAST_ID_FILE = join(__dirname, ".last_processed_id");

async function getLastProcessedId() {
  try {
    return (await readFile(LAST_ID_FILE, "utf-8")).trim();
  } catch {
    return "";
  }
}

async function checkQueue() {
  try {
    const data = JSON.parse(await readFile(QUEUE_FILE, "utf-8"));
    if (data.status === "pending") {
      const lastId = await getLastProcessedId();
      if (data.id === lastId) return; // Already processed by another watcher
      // Mark as seen immediately to prevent duplicates
      const { writeFileSync } = await import("fs");
      writeFileSync(LAST_ID_FILE, data.id);
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
