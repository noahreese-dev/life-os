# Mac Mini Always-On Server -- Quick Start Guide

> Time to complete: ~5 minutes (assuming prerequisites installed)
> This guide assumes the Life-OS vault has already synced to the Mac Mini via Obsidian Sync.

## Step 0: Find Your Vault

Obsidian Sync stores vaults in one of these locations on macOS:

```bash
# Check these in order:
ls ~/Documents/life-os/                          # Most common
ls ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/life-os/
ls ~/Obsidian/life-os/                           # If custom path was set
```

Once you find it, note the full path. You'll use it below.

If the vault hasn't synced yet, open Obsidian on the Mac Mini, sign in, and connect to the "Life-OS" vault (North America region, Standard encryption).

## Step 1: Pre-requisites Check

```bash
# Check Node.js
node -v    # Need 18+. If missing: brew install node

# Check Homebrew
brew -v    # If missing: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Check Claude Code
claude --version    # If missing: npm install -g @anthropic-ai/claude-code

# Then authenticate Claude Code:
claude    # Follow the login prompts, then exit
```

## Step 2: Run Setup

```bash
# Navigate to the deploy folder inside the synced vault
cd /path/to/your/obsidian/vault/Tools/mac-mini-deploy/

# Make setup executable and run it
chmod +x setup.sh always-on-loop.sh
bash setup.sh
```

The setup script will:
1. Install any missing prerequisites (Node.js, Claude Code)
2. Create `~/life-os/` as the working directory
3. Copy Telegram bot files + Google Workspace credentials
4. Install npm dependencies
5. Create launchd services (auto-start on boot, auto-restart on crash)
6. Start the Telegram bot + always-on autoresearch loop

## Step 3: Verify It's Working

```bash
# Check launchd services are running
launchctl list | grep lifeos

# Expected output (two services, both with a PID):
# 12345  0  com.lifeos.telegram-bot
# 12346  0  com.lifeos.always-on

# Check Telegram bot log
tail -20 ~/life-os/briefings/telegram-bot.log

# Check always-on loop log
tail -20 ~/life-os/briefings/always-on.log
# Should show "Always-on loop starting" and cycle entries

# Send a test Telegram message
cd ~/life-os/.claude/telegram && node send.js "Mac Mini is alive."
```

## Step 4: Verify Google Workspace (Optional)

```bash
# Test Gmail access
gws gmail messages list --max-results 1

# Test Calendar access
gws calendar events list --max-results 1
```

If these fail, re-authenticate:
```bash
gws auth login --client-secret ~/.config/gws/client_secret.json
```

## Troubleshooting

**Service won't start:**
```bash
# Check error log
cat ~/life-os/briefings/telegram-bot-error.log
cat ~/life-os/briefings/always-on-stderr.log

# Restart a service
launchctl unload ~/Library/LaunchAgents/com.lifeos.telegram-bot.plist
launchctl load ~/Library/LaunchAgents/com.lifeos.telegram-bot.plist
```

**Bot not responding to Telegram messages:**
- The bot receives messages but needs an active Claude Code session to process them
- The always-on loop handles this -- it runs `claude -p` every 30 minutes
- Check `~/life-os/briefings/always-on.log` for cycle progress

**"No chat ID registered" error on send.js:**
- Message the bot directly on Telegram first (any message)
- The bot auto-registers your chat ID in `state.json`

## What's Running After Setup

| Service | What it does | Schedule |
|---------|-------------|----------|
| `com.lifeos.telegram-bot` | Receives Telegram messages, queues them | Always on, auto-restart |
| `com.lifeos.always-on` | Autoresearch loop (audit, fix, verify, score) | Every 30 min (15 min overnight) |
| `com.lifeos.remote-control` | Full Claude Code access from phone/browser | Always on (tmux session) |

After setup, open claude.ai/code or the Claude app on your phone. You should see a session called "Life-OS Mac Mini" with a green dot. That is your full Claude Code environment running on the Mac Mini, accessible from anywhere.

## Stop Everything

```bash
launchctl unload ~/Library/LaunchAgents/com.lifeos.always-on.plist
launchctl unload ~/Library/LaunchAgents/com.lifeos.telegram-bot.plist
launchctl unload ~/Library/LaunchAgents/com.lifeos.remote-control.plist
tmux kill-session -t lifeos-rc
```

## Updating

When changes are made to Life-OS on the main machine, Obsidian Sync will push them to the Mac Mini vault automatically. The `setup.sh` can be re-run safely to pick up new files. The launchd services will restart automatically.
