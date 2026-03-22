#!/bin/bash
# Life-OS Always-On Loop — Runs on Mac Mini 24/7
# AutoResearch + Verifier in a continuous Karpathy loop
#
# Managed by launchd (com.lifeos.always-on.plist)
# Auto-starts on boot, auto-restarts on crash (KeepAlive: true)
#
# Usage (manual): nohup bash always-on-loop.sh &
# Usage (launchd): setup.sh installs this as a service
#
# Improvements over v1:
# - Structured AUTORESEARCH_SUMMARY output for Telegram parsing
# - Quiet hours (11pm-8am): no Telegram notifications
# - Log rotation: keeps last 7 days of cycle logs
# - Error counting with circuit breaker (5 consecutive errors = 30min cooldown)
# - Adaptive cycle timing: 2hr during day, 30min overnight, 15min deep night

LIFEOS_DIR="$HOME/life-os"
LOG_DIR="$LIFEOS_DIR/briefings"
AUTORESEARCH_LOG_DIR="$LIFEOS_DIR/.claude/autonomous/logs"
CYCLE=0
MAX_BUDGET="5.00"
CONSECUTIVE_ERRORS=0
MAX_CONSECUTIVE_ERRORS=5

mkdir -p "$LOG_DIR" "$AUTORESEARCH_LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_DIR/always-on.log"
}

send_telegram() {
    local msg="$1"
    local HOUR=$(date +%H)
    # Quiet hours: 11pm to 8am
    if [ "$HOUR" -ge 8 ] && [ "$HOUR" -lt 23 ]; then
        if [ -f "$LIFEOS_DIR/.claude/telegram/send.js" ]; then
            node "$LIFEOS_DIR/.claude/telegram/send.js" "$msg" 2>/dev/null || true
        fi
    fi
}

get_sleep_duration() {
    local HOUR=$(date +%H)
    if [ "$HOUR" -ge 2 ] && [ "$HOUR" -lt 6 ]; then
        echo 900    # 15 min: deep night (maximum throughput)
    elif [ "$HOUR" -ge 6 ] && [ "$HOUR" -lt 8 ]; then
        echo 1800   # 30 min: early morning
    elif [ "$HOUR" -ge 23 ] || [ "$HOUR" -lt 2 ]; then
        echo 1800   # 30 min: late night
    else
        echo 7200   # 2 hours: daytime (save budget, CEO is active)
    fi
}

cleanup_old_logs() {
    # Remove autoresearch/verifier logs older than 7 days
    find "$AUTORESEARCH_LOG_DIR" -name "autoresearch-*.log" -mtime +7 -delete 2>/dev/null
    find "$LOG_DIR" -name "verifier-*.log" -mtime +7 -delete 2>/dev/null
    find "$LOG_DIR" -name "autoresearch-*.log" -mtime +7 -delete 2>/dev/null
    # Truncate always-on.log if over 1MB
    if [ -f "$LOG_DIR/always-on.log" ]; then
        local size=$(stat -f%z "$LOG_DIR/always-on.log" 2>/dev/null || stat --format=%s "$LOG_DIR/always-on.log" 2>/dev/null || echo 0)
        if [ "$size" -gt 1048576 ]; then
            tail -1000 "$LOG_DIR/always-on.log" > "$LOG_DIR/always-on.log.tmp"
            mv "$LOG_DIR/always-on.log.tmp" "$LOG_DIR/always-on.log"
            log "Truncated always-on.log (was ${size} bytes)"
        fi
    fi
}

log "Always-on loop starting (v2 - autonomous autoresearch)"

while true; do
    CYCLE=$((CYCLE + 1))
    TIMESTAMP=$(date '+%Y-%m-%d_%H%M')
    log "=== CYCLE $CYCLE ==="

    # Periodic log cleanup (every 24 cycles ~ once per day at 2hr intervals)
    if [ $((CYCLE % 24)) -eq 0 ]; then
        cleanup_old_logs
        log "Log cleanup complete"
    fi

    # --- AUTORESEARCH ---
    log "Running autoresearch agent..."

    AUTORESEARCH_OUTPUT=$(claude -p "You are the AutoResearch agent for Life-OS. This is an AUTONOMOUS scheduled run on the Mac Mini always-on server -- no human is watching.

Read your full protocol: .claude/agents/autoresearch.md
Read current metrics: METRICS.md

Execute ONE cycle of the Karpathy loop:
1. AUDIT - Check running processes (launchd services, Telegram bot), logs, system health
2. IDENTIFY - Find the single biggest gap (broken > not running > missing > suboptimal)
3. EXPERIMENT - Fix it. One thing, done properly.
4. VERIFY - Prove it works (run the script, check logs, confirm output)
5. SCORE - Update METRICS.md with what you did and any score changes

Rules:
- Working directory: $LIFEOS_DIR
- One experiment only. Do not try to fix everything.
- Never modify CLAUDE.md behavioral rules
- Never push to git
- Be honest in scoring
- Log everything to METRICS.md Active Experiments table

After your cycle, output a one-line summary formatted as:
AUTORESEARCH_SUMMARY: [what you did] | Score impact: [+X or no change] | New rating: [XX/100]" \
        --allowedTools 'Bash(*)' 'Read(*)' 'Write(*)' 'Edit(*)' 'Glob(*)' 'Grep(*)' 'Agent(*)' \
        --max-turns 30 \
        --max-budget-usd "$MAX_BUDGET" \
        --permission-mode auto \
        2>> "$LOG_DIR/always-on.log") || true

    # Save output to log file
    echo "$AUTORESEARCH_OUTPUT" > "$AUTORESEARCH_LOG_DIR/autoresearch-$TIMESTAMP.log"

    # Extract summary
    SUMMARY=$(echo "$AUTORESEARCH_OUTPUT" | grep -o 'AUTORESEARCH_SUMMARY:.*' | head -1)

    if [ -z "$AUTORESEARCH_OUTPUT" ] || echo "$AUTORESEARCH_OUTPUT" | grep -qi "error\|failed\|exception"; then
        CONSECUTIVE_ERRORS=$((CONSECUTIVE_ERRORS + 1))
        log "Autoresearch had issues (consecutive errors: $CONSECUTIVE_ERRORS)"
    else
        CONSECUTIVE_ERRORS=0
        log "Autoresearch complete: $SUMMARY"
    fi

    # Circuit breaker
    if [ "$CONSECUTIVE_ERRORS" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
        log "CIRCUIT BREAKER: $MAX_CONSECUTIVE_ERRORS consecutive errors. Cooling down 30 minutes."
        send_telegram "AutoResearch CIRCUIT BREAKER: $CONSECUTIVE_ERRORS consecutive errors. Pausing 30min. Check always-on.log."
        sleep 1800
        CONSECUTIVE_ERRORS=0
        continue
    fi

    # --- VERIFIER ---
    log "Running verifier agent..."

    VERIFIER_OUTPUT=$(claude -p "You are the Verifier agent for Life-OS. This is an AUTONOMOUS scheduled run.

Read your protocol: .claude/agents/verifier.md
Read current metrics: METRICS.md

Your job: independently verify the LAST autoresearch experiment logged in METRICS.md.
- Check actual files, processes, logs
- Confirm or deny each claim
- If the score was inflated, adjust it down
- Update METRICS.md with verification notes

Be ruthlessly honest. Output:
VERIFIER_SUMMARY: [verified/adjusted/failed] | [one line explanation]" \
        --allowedTools 'Bash(*)' 'Read(*)' 'Write(*)' 'Edit(*)' 'Glob(*)' 'Grep(*)' \
        --max-turns 20 \
        --max-budget-usd "$MAX_BUDGET" \
        --permission-mode auto \
        2>> "$LOG_DIR/always-on.log") || true

    echo "$VERIFIER_OUTPUT" > "$LOG_DIR/verifier-$TIMESTAMP.log"

    VERIFIER_SUMMARY=$(echo "$VERIFIER_OUTPUT" | grep -o 'VERIFIER_SUMMARY:.*' | head -1)
    log "Verifier complete: $VERIFIER_SUMMARY"

    # --- TELEGRAM ---
    if [ -n "$SUMMARY" ]; then
        TELEGRAM_MSG="AutoResearch cycle $CYCLE: ${SUMMARY#AUTORESEARCH_SUMMARY: }"
        if [ -n "$VERIFIER_SUMMARY" ]; then
            TELEGRAM_MSG="$TELEGRAM_MSG
Verifier: ${VERIFIER_SUMMARY#VERIFIER_SUMMARY: }"
        fi
        send_telegram "$TELEGRAM_MSG"
    fi

    # --- SLEEP ---
    SLEEP_DURATION=$(get_sleep_duration)
    log "Cycle $CYCLE complete. Sleeping ${SLEEP_DURATION}s ($(( SLEEP_DURATION / 60 ))min)..."
    sleep "$SLEEP_DURATION"
done
