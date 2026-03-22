#!/bin/bash
# PreToolUse Hook — Cold Email Protection
# Blocks outbound emails from intelligencemasters.me to unknown contacts.
# Prevents accidental cold outreach from the CEO's main domain.
# Windows compatible — no jq dependency.

INPUT=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')

# Only check email-sending tools
case "$TOOL_NAME" in
    mcp__google-workspace__gmail_users_messages_send|mcp__google-workspace__gmail_users_drafts_create)
        ;;
    Bash)
        # Check if bash command involves sending email
        COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')
        if ! echo "$COMMAND" | grep -qEi '(sendmail|mail[[:space:]]|mutt|msmtp)'; then
            exit 0
        fi
        ;;
    *)
        exit 0
        ;;
esac

# Extract the full input for email content inspection
INPUT_STR=$(echo "$INPUT" | tr '\n' ' ')

# Check if sending FROM intelligencemasters.me
if echo "$INPUT_STR" | grep -qEi 'intelligencemasters\.me'; then
    # Known safe recipients (CEO's own addresses, team)
    SAFE_PATTERNS="noahreese|noah\.reese|reese\.noah|intelligencemasters\.me|garage33|ultrawash"

    # Check if recipient is in safe list
    if echo "$INPUT_STR" | grep -qEi "$SAFE_PATTERNS"; then
        exit 0
    fi

    # Block — unknown external recipient from main domain
    echo "BLOCKED: Cold outreach detected from intelligencemasters.me to external recipient." >&2
    echo "Use a different sender domain for cold outreach, or add recipient to safe list in protect-cold-email.sh." >&2
    exit 2
fi

exit 0
