// Voice Message Handler for Life-OS Telegram Bot
// Handles voice messages and voice notes by:
// 1. Downloading the audio file from Telegram
// 2. Transcribing it using OpenAI Whisper API
// 3. Returning the transcribed text for processing
//
// Setup:
//   Add OPENAI_API_KEY to .claude/telegram/.env
//   npm install openai (or use fetch-based approach below)
//
// The handler uses the native fetch API (Node 18+) to call Whisper,
// avoiding additional dependencies.

import { mkdir } from "fs/promises";
import { createWriteStream, createReadStream, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOICE_DIR = join(__dirname, "voice");

// Transcription provider: "openai" or "local" (future: local whisper)
const PROVIDER = process.env.VOICE_TRANSCRIPTION_PROVIDER || "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Download a file from Telegram servers
 * @param {object} bot - Telegram bot instance
 * @param {string} fileId - Telegram file ID
 * @param {string} filename - Local filename to save as
 * @returns {string} Local file path
 */
async function downloadVoice(bot, fileId, filename) {
  await mkdir(VOICE_DIR, { recursive: true });
  const filePath = await bot.getFileLink(fileId);
  const localPath = join(VOICE_DIR, filename);

  return new Promise((resolve, reject) => {
    const file = createWriteStream(localPath);
    https.get(filePath, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} downloading voice file`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(localPath); });
      file.on("error", (err) => { file.close(); reject(err); });
    }).on("error", (err) => {
      file.close();
      reject(err);
    });
  });
}

/**
 * Transcribe audio using OpenAI Whisper API via native fetch
 * @param {string} filePath - Path to audio file
 * @returns {string} Transcribed text
 */
async function transcribeWithWhisper(filePath) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set. Add it to .claude/telegram/.env");
  }

  // Use FormData with native fetch (Node 18+)
  const { FormData, File } = await import("node:buffer").then(() => {
    // node:buffer doesn't have FormData, use undici or global
    return { FormData: globalThis.FormData, File: globalThis.File };
  }).catch(() => {
    return { FormData: globalThis.FormData, File: globalThis.File };
  });

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(filePath);
  const blob = new Blob([fileBuffer], { type: "audio/ogg" });

  const formData = new FormData();
  formData.append("file", blob, "voice.ogg");
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error (${response.status}): ${error}`);
  }

  const result = await response.json();
  return result.text;
}

/**
 * Handle a voice message from Telegram
 * @param {object} bot - Telegram bot instance
 * @param {object} msg - Telegram message object
 * @returns {object} { text: string, duration: number } or null if failed
 */
export async function handleVoiceMessage(bot, msg) {
  const voice = msg.voice || msg.audio;
  if (!voice) return null;

  const fileId = voice.file_id;
  const duration = voice.duration || 0;
  const ts = Date.now();
  const ext = voice.mime_type?.includes("ogg") ? "ogg" : "oga";
  const filename = `voice_${ts}.${ext}`;

  try {
    console.log(`[VOICE] Downloading voice message (${duration}s)...`);
    const localPath = await downloadVoice(bot, fileId, filename);

    console.log(`[VOICE] Transcribing with ${PROVIDER}...`);
    const text = await transcribeWithWhisper(localPath);

    console.log(`[VOICE] Transcribed: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`);

    // Clean up the downloaded file
    try { unlinkSync(localPath); } catch {}

    return { text, duration };
  } catch (err) {
    console.error(`[VOICE ERROR] ${err.message}`);
    return null;
  }
}

/**
 * Check if voice transcription is available
 * @returns {boolean}
 */
export function isVoiceEnabled() {
  return !!OPENAI_API_KEY;
}
