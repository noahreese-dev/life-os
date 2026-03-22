#!/bin/bash
# Life-OS Always-On Server — Mac Mini Setup
# Run this ONCE on the Mac Mini. Everything auto-runs after.
# Usage: bash setup.sh

set -e
echo "=== Life-OS Always-On Server Setup ==="

LIFEOS_DIR="$HOME/life-os"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Install prerequisites
echo "[1/7] Checking prerequisites..."
if ! command -v node &>/dev/null; then
    echo "Installing Node.js..."
    if command -v brew &>/dev/null; then
        brew install node
    else
        echo "Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install node
    fi
fi
echo "  Node: $(node -v)"

if ! command -v claude &>/dev/null; then
    echo "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
fi
echo "  Claude: $(claude --version 2>/dev/null || echo 'installed')"

npm install -g @googleworkspace/cli 2>/dev/null || true

# 2. Set up directory structure
echo "[2/7] Creating Life-OS directory..."
mkdir -p "$LIFEOS_DIR/.claude/telegram"
mkdir -p "$LIFEOS_DIR/.claude/agents"
mkdir -p "$LIFEOS_DIR/.claude/autonomous"
mkdir -p "$LIFEOS_DIR/briefings"
mkdir -p "$HOME/.config/gws"

# 3. Copy all files from deploy package
echo "[3/7] Copying files..."
cp "$SCRIPT_DIR/telegram/"* "$LIFEOS_DIR/.claude/telegram/" 2>/dev/null || true
cp "$SCRIPT_DIR/gws/"* "$HOME/.config/gws/" 2>/dev/null || true
cp "$SCRIPT_DIR/always-on-loop.sh" "$LIFEOS_DIR/" 2>/dev/null || true
chmod +x "$LIFEOS_DIR/always-on-loop.sh"

# Copy agent definitions from the deploy package
cp "$SCRIPT_DIR/agents/"* "$LIFEOS_DIR/.claude/agents/" 2>/dev/null || true
cp "$SCRIPT_DIR/METRICS.md" "$LIFEOS_DIR/" 2>/dev/null || true

# Use the Mac Mini-specific CLAUDE.md (stripped down for always-on server role)
cp "$SCRIPT_DIR/CLAUDE-macmini.md" "$LIFEOS_DIR/CLAUDE.md" 2>/dev/null || true

# Copy MCP config for Google Workspace integration
cp "$SCRIPT_DIR/.mcp.json" "$LIFEOS_DIR/.mcp.json" 2>/dev/null || true

# Also try to sync fresh agents/METRICS from the parent vault if available
VAULT_ROOT="$SCRIPT_DIR/../.."
if [ -f "$VAULT_ROOT/.claude/agents/autoresearch.md" ]; then
    cp "$VAULT_ROOT/.claude/agents/autoresearch.md" "$LIFEOS_DIR/.claude/agents/" 2>/dev/null || true
    cp "$VAULT_ROOT/.claude/agents/verifier.md" "$LIFEOS_DIR/.claude/agents/" 2>/dev/null || true
    cp "$VAULT_ROOT/METRICS.md" "$LIFEOS_DIR/" 2>/dev/null || true
fi

# Install telegram dependencies
cd "$LIFEOS_DIR/.claude/telegram"
if [ -f package.json ]; then
    npm install --production 2>/dev/null
fi

# 4. Create .env with the actual bot token
echo "[4/7] Setting up Telegram bot..."
cat > "$LIFEOS_DIR/.claude/telegram/.env" << 'ENVEOF'
TELEGRAM_BOT_TOKEN=REDACTED_TELEGRAM_TOKEN_1
LIFEOS_PATH=PLACEHOLDER
ENVEOF
# Replace placeholder with actual path
sed -i '' "s|PLACEHOLDER|$LIFEOS_DIR|" "$LIFEOS_DIR/.claude/telegram/.env" 2>/dev/null || \
sed -i "s|PLACEHOLDER|$LIFEOS_DIR|" "$LIFEOS_DIR/.claude/telegram/.env" 2>/dev/null || true

# 5. Create launchd service for Telegram bot (auto-start, auto-restart)
echo "[5/7] Installing Telegram bot service..."
PLIST_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$PLIST_DIR"

NODE_PATH=$(which node)
cat > "$PLIST_DIR/com.lifeos.telegram-bot.plist" << PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lifeos.telegram-bot</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$LIFEOS_DIR/.claude/telegram/bot.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$LIFEOS_DIR/.claude/telegram</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LIFEOS_DIR/briefings/telegram-bot.log</string>
    <key>StandardErrorPath</key>
    <string>$LIFEOS_DIR/briefings/telegram-bot-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    </dict>
</dict>
</plist>
PLISTEOF

# 6. Create launchd service for the always-on autoresearch loop
echo "[6/7] Installing always-on autoresearch loop..."
cat > "$PLIST_DIR/com.lifeos.always-on.plist" << PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lifeos.always-on</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$LIFEOS_DIR/always-on-loop.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$LIFEOS_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LIFEOS_DIR/briefings/always-on-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$LIFEOS_DIR/briefings/always-on-stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
        <key>HOME</key>
        <string>$HOME</string>
    </dict>
</dict>
</plist>
PLISTEOF

# 7. Create launchd service for Remote Control (phone access to full Claude Code)
echo "[7/9] Installing Remote Control service..."

# Create a wrapper script for Remote Control (needs tmux for persistence)
cat > "$LIFEOS_DIR/start-remote-control.sh" << 'RCEOF'
#!/bin/bash
# Start Claude Code Remote Control inside tmux for persistence
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Kill any existing RC session
tmux kill-session -t lifeos-rc 2>/dev/null || true

# Start new tmux session with Remote Control
tmux new-session -d -s lifeos-rc "cd $HOME/life-os && claude remote-control --name 'Life-OS Mac Mini' --capacity 8"
RCEOF
chmod +x "$LIFEOS_DIR/start-remote-control.sh"

cat > "$PLIST_DIR/com.lifeos.remote-control.plist" << PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lifeos.remote-control</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$LIFEOS_DIR/start-remote-control.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$LIFEOS_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$LIFEOS_DIR/briefings/remote-control.log</string>
    <key>StandardErrorPath</key>
    <string>$LIFEOS_DIR/briefings/remote-control-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
        <key>HOME</key>
        <string>$HOME</string>
    </dict>
</dict>
</plist>
PLISTEOF

# 8. Copy MCP config to Life-OS root so claude sessions pick it up
echo "[8/9] Copying MCP config..."
cp "$SCRIPT_DIR/.mcp.json" "$LIFEOS_DIR/.mcp.json" 2>/dev/null || true

# 9. Start everything
echo "[9/9] Starting services..."
launchctl unload "$PLIST_DIR/com.lifeos.telegram-bot.plist" 2>/dev/null || true
launchctl load "$PLIST_DIR/com.lifeos.telegram-bot.plist"
echo "  Telegram bot: STARTED"

launchctl unload "$PLIST_DIR/com.lifeos.always-on.plist" 2>/dev/null || true
launchctl load "$PLIST_DIR/com.lifeos.always-on.plist"
echo "  Always-on loop: STARTED"

launchctl unload "$PLIST_DIR/com.lifeos.remote-control.plist" 2>/dev/null || true
launchctl load "$PLIST_DIR/com.lifeos.remote-control.plist"
echo "  Remote Control: STARTED (check claude.ai/code for session)"

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "What's now running 24/7:"
echo "  1. Telegram bot -- receives messages, auto-restarts on crash"
echo "  2. Always-on loop -- autoresearch + verifier every 30 min (15 min overnight)"
echo "  3. Remote Control -- full Claude Code access from phone/browser via claude.ai/code"
echo ""
echo "Logs:"
echo "  $LIFEOS_DIR/briefings/always-on.log"
echo "  $LIFEOS_DIR/briefings/telegram-bot.log"
echo "  $LIFEOS_DIR/briefings/remote-control.log"
echo ""
echo "To check status:"
echo "  launchctl list | grep lifeos"
echo "  tmux list-sessions"
echo ""
echo "To stop:"
echo "  launchctl unload ~/Library/LaunchAgents/com.lifeos.always-on.plist"
echo "  launchctl unload ~/Library/LaunchAgents/com.lifeos.telegram-bot.plist"
echo "  launchctl unload ~/Library/LaunchAgents/com.lifeos.remote-control.plist"
echo "  tmux kill-session -t lifeos-rc"
echo ""
echo "The Mac Mini is now an always-on Life-OS server."
echo "Score will start climbing autonomously."
