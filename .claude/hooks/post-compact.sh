#!/bin/bash
# PostCompact Hook — Re-injects critical CoS context after compaction
# This prevents the "amnesia after long sessions" problem.
#
# How it works:
# 1. Claude Code compacts the conversation (auto or manual)
# 2. This hook fires and outputs the context restoration file
# 3. Claude receives the context as additionalContext
# 4. The CoS persona, rules, and routing survive compaction
#
# Note: Does NOT use jq — Windows compatible.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTEXT_FILE="$SCRIPT_DIR/post-compact-context.md"

# Read stdin (hook input) but we don't parse it — we just output context
cat > /dev/null

# Output the context restoration
if [ -f "$CONTEXT_FILE" ]; then
    cat "$CONTEXT_FILE"
else
    echo "WARNING: PostCompact context file not found at $CONTEXT_FILE"
    echo "CoS identity may be degraded. Read STATUS.md and CLAUDE.md to restore context."
fi
