# /telegram - Activate Telegram Tunnel

Opens the event-driven tunnel between this Claude Code session and Telegram.
CEO sends messages from phone, this session processes them with full tool access (Gmail, Calendar, files, personas, everything).

## Architecture

```
Phone -> Telegram -> bot.js -> queue.json {"pending"}  (atomic write via rename)
                                    | (fs.watch + 500ms polling hybrid)
                          THIS session processes message
                                    |
                          queue.json {"done"} -> bot.js -> Phone
                                    (fs.watch + 2s polling hybrid)
```

**Atomic writes**: All writes to queue.json use write-to-tmp-then-rename pattern. This prevents corrupted reads from partial writes (the root cause of "send twice" bugs).

**Session heartbeat**: watcher.js and watcher-loop.mjs write `.session` file every 15-30s. bot.js reads this to detect if a Claude Code session is alive. If no session, user gets notified in 30s instead of waiting 5 minutes.

## Files

| File | Role |
|------|------|
| `bot.js` | Telegram long-poll, atomic writes to queue.json, watches for done, sends response |
| `watcher.js` | Hybrid fs.watch + 500ms polling - detects pending, outputs message, exits. Session heartbeat. |
| `watcher-loop.mjs` | Self-cycling loop: runs watcher.js repeatedly with zero gap. Session heartbeat. |
| `send.js` | Standalone sender for autonomous agents (with retry logic) |
| `queue.json` | Single-slot IPC channel (atomic writes only) |
| `state.json` | Stores registered Telegram chat ID |
| `.env` | Bot token + Life-OS path |
| `.heartbeat` | Bot health heartbeat (written every 30s by bot.js) |
| `.session` | Session presence heartbeat (written by watcher/loop) |
| `start-bot.ps1` | Persistent launcher with crash recovery + circuit breaker (Task Scheduler) |

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
   cd "<LIFE-OS-DIR>/.claude/telegram" && node watcher-loop.mjs
   ```
   Run with `run_in_background: true`, timeout `600000`.

4. **Confirm:** "Telegram tunnel active. Send messages to the bot."

## Message Classification (4-Tier Triage)

Before processing ANY incoming message, classify it into one of 4 tiers:

| Tier | Label | Action | Examples |
|------|-------|--------|----------|
| 0 | `skip` | Acknowledge silently, no processing | "ok", "k", "👍", single emoji, "lol", accidental sends |
| 1 | `info_only` | Brief acknowledgment, store context | "Meeting went well", "FYI the client liked it", status updates with no ask |
| 2 | `meeting_info` | Extract date/time/people, add to calendar | "Meeting with Boz Tuesday 1pm", "Call Mo tomorrow at 3", time references |
| 3 | `action_required` | Full CoS processing with all tools | Questions, requests, tasks, decisions, anything needing a response or execution |

**Classification rules:**
- Default to `action_required` if unsure — over-process rather than miss something
- Messages under 3 characters with no question mark → `skip`
- Messages containing date/time words (tomorrow, Monday, at 3pm, etc.) + a person → `meeting_info`
- Messages that are purely declarative with no implicit ask → `info_only`
- Everything else → `action_required`

**Tier responses:**
- `skip`: Reply "👍" (or nothing if truly noise)
- `info_only`: Reply with brief acknowledgment ("Noted." / "Got it, filed.")
- `meeting_info`: Extract details, add to calendar, reply with confirmation ("Added: Boz meeting Tue 1pm EST")
- `action_required`: Full processing as below

## Processing Loop (CRITICAL)

When the background watcher task completes, check its output:

### If output contains `QUEUE_MESSAGE|`:
1. Parse: `QUEUE_MESSAGE|<id>|<message>` (optional: `|PHOTOS:path1,path2`)
2. Read queue.json for full details
3. **Classify the message** using the 4-tier system above
4. **If tier 0-2**: Handle with the appropriate short response (skip/acknowledge/calendar)
5. **If tier 3**: **Process the message using ALL tools.** This IS the CEO talking. Respond as CoS.
4. **Write response via Bash/Node (NEVER use Write tool for queue.json):**
   ```bash
   node -e "const fs=require('fs'),p=require('path'),q=p.join(__dirname,'queue.json'),t=p.join(__dirname,'queue.json.tmp');fs.writeFileSync(t,JSON.stringify({id:'MSG_ID',chatId:CHAT_ID,message:'ORIGINAL_MSG',status:'done',timestamp:'TIMESTAMP',response:process.argv[1],error:null},null,2));fs.renameSync(t,q)" -- "YOUR RESPONSE HERE"
   ```
   This uses atomic write (tmp + rename) and avoids the "Overwrite file?" confirmation prompt.
5. **Relaunch watcher-loop.mjs in background immediately** (run both the write and relaunch in parallel)

### If output is `WATCHER_TIMEOUT`:
- Watcher ran for 60 seconds without a message. Loop auto-restarts it. No action needed unless `LOOP_TIMEOUT` appears.

### If output is `LOOP_TIMEOUT|cycles=N`:
- The entire 10-minute loop expired. Relaunch watcher-loop.mjs in background.

### Speed tips
- Run the response write and watcher relaunch in **parallel** (single message, two tool calls)
- Keep responses under 4096 chars (Telegram limit)
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
  "error": null,
  "photos": ["/path/to/photo1.jpg"]
}
```

## Bot Commands (from phone)
| Command | What it does |
|---------|-------------|
| `/ping` | Instant "Alive." response -- tests bot is running |
| `/status` | Full health report: uptime, queue, network, session status |
| `/reset` | Clears stuck queue state. Use when messages aren't going through |
| `/start` | Initial registration message |

## Photo Handling

Bot downloads photos sent via Telegram to `.claude/telegram/photos/`. When a message includes photos:
- Watcher output includes: `QUEUE_MESSAGE|id|message|PHOTOS:path1,path2`
- Queue.json includes `photos` array with local file paths
- **Read each photo with the Read tool** (Claude Code is multimodal -- it can see images)
- Photos sent as documents (uncompressed) are also supported
- Captions on photos are used as the message text

## Reliability Features

### Atomic Writes (prevents "send twice" bug)
All writes to queue.json go through a tmp file + rename pattern. `rename()` is atomic on NTFS. This means readers never see a half-written file, which was the root cause of messages being silently dropped.

### Session Detection (fast "no session" feedback)
Bot detects within 30 seconds if no Claude Code session is running and tells the user immediately, instead of making them wait 5 minutes.

### Stuck Message Auto-Clear
- If a message is pending for >5 minutes, bot marks it as error and notifies user
- Background monitor runs every 60 seconds to catch orphaned messages
- If user sends a new message while old one is stuck (>2 min), old one is auto-cleared

### /reset Command
If the tunnel gets into a bad state, user can send `/reset` from phone to clear everything and try again. No need to restart bot.js.

### Serialized Writes
Multiple rapid writes to queue.json are serialized (queued internally) to prevent write-write races.

### Retry Logic (send.js)
Autonomous sends retry up to 3 times with escalating delays on network failure.

### Circuit Breaker (start-bot.ps1)
If bot.js crashes rapidly 20 times in a row, launcher pauses for 5 minutes before retrying. Escalating restart delays: 5s, 10s, 20s, 30s, 60s.

### Watcher Loop Safety
- Each watcher.js cycle is capped at 60s with a 90s kill timeout from the loop
- Consecutive watcher failures trigger escalating pauses
- 10 consecutive failures trigger a 30s pause

## Confirmation Routing

**CRITICAL RULE: NEVER let a tool permission prompt block the tunnel.** All tools are auto-allowed in project settings. If something still prompts on screen, it means the settings need updating -- flag it to the CEO, don't wait for a screen click.

When processing Telegram messages, two categories:

### Just do it (no confirmation needed -- this is the DEFAULT):
- Reading/writing/editing ANY files
- Running ANY bash commands, scripts, builds
- Checking/sending email, calendar, tasks
- Creating HTML pages, opening apps
- Searching, web fetching, research
- Spawning agents, running tools
- Installing packages, running tests
- ANY read-only or local-only action
- Basically EVERYTHING unless it's in the list below

### Confirm through Telegram ONLY (ask CEO first):
- **Sending emails to EXTERNAL people** -- "About to send email to [client] about [topic]. Send? Yes/No?"
- **Pushing code to remote** -- "Push 3 commits to [project] main. Yes/No?"
- **Deleting important data** -- "Delete [specific thing]. Yes/No?"
- **Financial actions** -- Anything involving money, invoices, payments
- **Any action visible to others or hard to undo**

**Use your judgment.** When in doubt, just do it. Only confirm for things that would embarrass the CEO if done wrong. Sending an email to ourselves = just do it. Sending an email to a client = confirm first.

Flow: Write the confirmation question as the response, wait for CEO's next message (yes/no), then proceed or abort on the next watcher cycle.

## Critical Rules
- **NEVER use the Write tool for queue.json** -- always use Bash with node -e writeFileSync + renameSync (atomic). The Write tool triggers an overwrite confirmation prompt that blocks the tunnel.
- Tunnel lives as long as this session is open and watcher-loop keeps being relaunched
- Bot.js has 5-minute timeout -- notifies user if Claude Code is not responding
- Bot.js has 30-second early warning -- notifies user if no session is detected
- Bot.js has in-memory queue for burst messages (processes sequentially, capped at 10)
- Bot.js has crash-recovery loop in start-bot.ps1 with circuit breaker
- Bot.js has exponential backoff on network errors (no more EFATAL spam)
- Bot.js catches unhandled rejections (DNS failures no longer crash the process)
- Bot.js has hybrid response detection: fs.watch + 2s polling (Windows reliability fix)
- Bot.js has /status command showing session status, /reset for clearing stuck state
- Bot.js has startup recovery: detects orphaned pending messages after crash
- Bot.js has background stuck-message monitor (60s interval)
- Bot.js writes heartbeat every 30s for external health monitoring
- Start-bot.ps1 rotates logs when >100KB (keeps last 50 lines)
- Watcher.js uses hybrid fs.watch + 500ms polling (not fs.watch alone)
- Watcher.js writes session heartbeat for bot.js session detection
- Watcher-loop.mjs cycles watcher.js with zero gap, circuit-breaks on repeated failures
- When processing Telegram messages, you have FULL access: Gmail, Calendar, Drive, files, code, personas, everything
- All terminal-level prompts are bypassed (Bash for writes, broad allow rules in settings.local.json)
