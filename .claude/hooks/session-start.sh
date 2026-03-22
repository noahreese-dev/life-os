#!/bin/bash
# SessionStart Hook — Fires when session resumes after compact
# Re-injects CoS context without needing jq (Windows compatible)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTEXT_FILE="$SCRIPT_DIR/post-compact-context.md"

# Consume stdin
cat > /dev/null

# Output the context file
if [ -f "$CONTEXT_FILE" ]; then
    cat "$CONTEXT_FILE"
fi

# Verify critical files
MISSING=""
[ ! -f "$PROJECT_DIR/STATUS.md" ] && MISSING="$MISSING STATUS.md"
[ ! -f "$PROJECT_DIR/CLAUDE.md" ] && MISSING="$MISSING CLAUDE.md"

if [ -n "$MISSING" ]; then
    echo ""
    echo "WARNING: Missing critical files:$MISSING"
fi
