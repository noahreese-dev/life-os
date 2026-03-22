import { readFile } from "fs/promises";

const creds = JSON.parse(await readFile("C:\\Users\\Pc\\.claude\\.credentials.json", "utf-8"));
const token = creds.claudeAiOauth.accessToken;

console.log("Token expires:", new Date(creds.claudeAiOauth.expiresAt).toLocaleString());
console.log("Subscription:", creds.claudeAiOauth.subscriptionType);

// Test: x-api-key header with OAuth token
console.log("\n--- Test: x-api-key ---");
const res1 = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "x-api-key": token,
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: "say hi" }],
  }),
});
console.log("Status:", res1.status);
console.log(await res1.text());

// Test: Authorization Bearer
console.log("\n--- Test: Bearer ---");
const res2 = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: "say hi" }],
  }),
});
console.log("Status:", res2.status);
console.log(await res2.text());

// Test: Create API key from OAuth
console.log("\n--- Test: Create API key ---");
const res3 = await fetch("https://api.anthropic.com/api/oauth/claude_cli/create_api_key", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ name: "lifeos-telegram-bot" }),
});
console.log("Status:", res3.status);
console.log(await res3.text());
