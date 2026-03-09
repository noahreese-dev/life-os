// Standalone sender — autonomous agents call this to push messages to Telegram
// Usage: node send.js "Your message here"

import { readFile } from "fs/promises";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const STATE_FILE = join(__dirname, "state.json");
const message = process.argv[2];

if (!message) {
  console.error("Usage: node send.js \"message\"");
  process.exit(1);
}

try {
  const state = JSON.parse(await readFile(STATE_FILE, "utf-8"));
  if (!state.chatId) {
    console.error("No chat ID registered yet. Message the bot first.");
    process.exit(1);
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: state.chatId, text: message }),
  });

  if (!res.ok) {
    console.error(`Telegram API error: ${res.status}`);
    process.exit(1);
  }

  console.log("Sent.");
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
