#!/bin/bash
# Stop Hook — Session Activity Logger
# Logs what was worked on each session for pattern learning.
# Feeds into: which contract items get done vs avoided.
# Windows compatible — no jq dependency.

INPUT=$(cat)

# Extract session info
STOP_REASON=$(echo "$INPUT" | grep -o '"stop_reason"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')

# Log directory
LOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$LOG_DIR/../briefings/activity.log"

# Create briefings dir if needed
mkdir -p "$(dirname "$LOG_FILE")"

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Get recent git activity as proxy for what was worked on
RECENT_FILES=""
if command -v git &>/dev/null; then
    RECENT_FILES=$(cd "$(dirname "$0")/../.." && git diff --name-only HEAD 2>/dev/null | head -10 | tr '\n' ', ')
fi

# Log the session end
{
    echo "---"
    echo "time: $TIMESTAMP"
    echo "reason: ${STOP_REASON:-unknown}"
    echo "files_touched: ${RECENT_FILES:-none}"
    echo ""
} >> "$LOG_FILE"

# Keep log from growing unbounded (keep last 200 entries)
if [ -f "$LOG_FILE" ]; then
    LINE_COUNT=$(wc -l < "$LOG_FILE")
    if [ "$LINE_COUNT" -gt 1000 ]; then
        tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
fi

exit 0
