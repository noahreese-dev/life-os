// Standalone sender -- autonomous agents call this to push messages to Telegram
// Usage: node send.js "Your message here"
// Supports retry on network failure (up to 3 attempts)

import { readFile } from "fs/promises";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const STATE_FILE = join(__dirname, "state.json");
const rawMessage = process.argv[2];
const MAX_RETRIES = 3;
const TELEGRAM_MAX_LENGTH = 4096;

if (!rawMessage) {
  console.error("Usage: node send.js \"message\"");
  process.exit(1);
}

// Truncate to Telegram's 4096-char limit
const message = rawMessage.length > TELEGRAM_MAX_LENGTH
  ? rawMessage.slice(0, TELEGRAM_MAX_LENGTH - 20) + "\n\n... (truncated)"
  : rawMessage;

async function sendWithRetry(chatId, text, attempt = 1) {
  try {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // If Markdown parsing failed, retry without parse_mode
      if (res.status === 400 && body.includes("parse")) {
        const res2 = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: text }),
        });
        if (!res2.ok) throw new Error(`Telegram API error: ${res2.status}`);
      } else {
        throw new Error(`Telegram API error: ${res.status} ${body.slice(0, 100)}`);
      }
    }

    console.log("Sent.");
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = attempt * 2000; // 2s, 4s, 6s
      console.error(`Attempt ${attempt} failed: ${err.message}. Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      return sendWithRetry(chatId, text, attempt + 1);
    }
    throw err;
  }
}

try {
  const state = JSON.parse(await readFile(STATE_FILE, "utf-8"));
  if (!state.chatId) {
    console.error("No chat ID registered yet. Message the bot first.");
    process.exit(1);
  }

  await sendWithRetry(state.chatId, message);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
