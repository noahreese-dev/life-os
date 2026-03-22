#!/bin/bash
# PreToolUse Hook — Protects sensitive files from accidental modification
# Blocks writes to .env files, credentials, and critical config
# Windows compatible — no jq dependency.

# Read stdin into variable
INPUT=$(cat)

# Extract file path using grep/sed (no jq needed)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')

# Check file path for sensitive patterns
if [ -n "$FILE_PATH" ]; then
    if echo "$FILE_PATH" | grep -qEi '(\.env$|\.env\.|credentials|secrets|\.key$|\.pem$|id_rsa|\.credentials)'; then
        echo "BLOCKED: Attempt to access sensitive file: $FILE_PATH" >&2
        exit 2
    fi
fi

# Check command for dangerous patterns
if [ -n "$COMMAND" ]; then
    if echo "$COMMAND" | grep -qEi '(rm[[:space:]]+-rf[[:space:]]+/|DROP[[:space:]]+TABLE|TRUNCATE|format[[:space:]]+[A-Z]:)'; then
        echo "BLOCKED: Dangerous command detected" >&2
        exit 2
    fi
fi

exit 0
