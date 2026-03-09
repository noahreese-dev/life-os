# /telegram - Activate Telegram Tunnel

Opens the event-driven tunnel between this Claude Code session and Telegram.
CEO sends messages from phone, this session processes them with full tool access (Gmail, Calendar, files, personas, everything).

## Architecture

```
Phone -> Telegram -> bot.js -> queue.json {"pending"}
                                    | (instant - Node.js fs.watch)
                          THIS session processes message
                                    |
                          queue.json {"done"} -> bot.js -> Phone
```

**Event-driven on both sides. No polling.**

## Files

| File | Role |
|------|------|
| `bot.js` | Telegram long-poll, writes pending to queue.json, watches for done, sends response |
| `watcher.js` | One-shot Node.js fs.watch - detects pending, outputs message, exits |
| `send.js` | Standalone sender for autonomous agents |
| `queue.json` | Single-slot IPC channel |
| `state.json` | Stores registered Telegram chat ID |
| `.env` | Bot token + Life-OS path |
| `start-bot.ps1` | Persistent launcher with crash recovery (Task Scheduler) |

## Activation Steps

1. **Check bot.js is running:**
   ```bash
   wmic process where "Name='node.exe'" get ProcessId,CommandLine 2>/dev/null | grep -i bot
   ```
   If not running:
   ```bash
   cd "<LIFE-OS-DIR>/.claude/telegram" && node bot.js >> bot.log 2>&1 &
   ```

2. **Reset queue to idle:**
   Write `{"status": "idle"}` to queue.json

3. **Launch watcher in background:**
   ```bash
   cd "<LIFE-OS-DIR>/.claude/telegram" && node watcher.js
   ```
   Run with `run_in_background: true`, timeout `600000`.

4. **Confirm:** "Telegram tunnel active. Send messages to the bot."

## Processing Loop (CRITICAL)

When the background watcher task completes, check its output:

### If output contains `QUEUE_MESSAGE|`:
1. Parse: `QUEUE_MESSAGE|<id>|<message>`
2. Read queue.json for full details
3. **Process the message using ALL tools.** This IS the CEO talking. Respond as CoS.
4. **Write response via Bash/Node (NEVER use Write tool for queue.json):**
   ```bash
   node -e "require('fs').writeFileSync('<LIFE-OS-DIR>/.claude/telegram/queue.json', JSON.stringify({id:'MSG_ID',chatId:CHAT_ID,message:'ORIGINAL_MSG',status:'done',timestamp:'TIMESTAMP',response:'YOUR RESPONSE HERE',error:null}, null, 2))"
   ```
   This avoids the "Overwrite file?" confirmation prompt.
5. **Relaunch watcher.js in background immediately** (run both the write and relaunch in parallel)

### If output is `WATCHER_TIMEOUT`:
- Relaunch watcher.js in background. No action needed.

### Speed tips
- Run the response write and watcher relaunch in **parallel** (single message, two tool calls)
- Keep responses under 4000 chars (Telegram limit)
- When the watcher fires and a system-reminder shows queue.json changed, that IS the trigger -- read and process immediately

## Queue Schema
```json
{
  "id": "msg_<timestamp>",
  "chatId": "<FROM_STATE_JSON>",
  "message": "user's message",
  "status": "idle | pending | processing | done | error",
  "timestamp": "ISO 8601",
  "response": "your response here",
  "error": null
}
```

## Confirmation Routing

When processing Telegram messages, two categories:

### Auto-approve (no confirmation needed):
- Reading files, searching code, running queries
- Writing/editing local files
- Checking email, calendar, tasks
- Creating HTML pages, running scripts
- Any read-only or local-only action

### Confirm through Telegram (ask CEO first):
- **Sending emails** -- "About to send email to [client] about [project] payment. Yes/No?"
- **Creating/modifying calendar events** -- "Add meeting with X on Tuesday 2pm. Yes/No?"
- **Pushing code to remote** -- "Push 3 commits to [project] main. Yes/No?"
- **Deleting files/data** -- "Delete old briefing files from last week. Yes/No?"
- **Any action visible to others or hard to undo**

Flow: Write the confirmation question as the response, wait for CEO's next message (yes/no), then proceed or abort on the next watcher cycle.

## Critical Rules
- **NEVER use the Write tool for queue.json** -- always use Bash with node -e writeFileSync. The Write tool triggers an overwrite confirmation prompt that blocks the tunnel.
- Tunnel lives as long as this session is open and watcher keeps being relaunched
- Bot.js has 10-minute timeout -- notifies user if Claude Code is not responding
- Bot.js has in-memory queue for burst messages (processes sequentially)
- Bot.js has crash-recovery loop in start-bot.ps1
- Watcher auto-exits after 9 minutes (under Bash 10-min limit) -- relaunch on timeout
- When processing Telegram messages, you have FULL access: Gmail, Calendar, Drive, files, code, personas, everything
- All terminal-level prompts are bypassed (Bash for writes, broad allow rules in settings.local.json)
