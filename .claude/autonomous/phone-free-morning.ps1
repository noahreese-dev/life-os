# Life-OS Phone-Free Morning -- Autonomous Telegram Push
# Runs daily at 7:25am via Windows Task Scheduler
# Pushes a phone-free reminder with today's contract items BEFORE the full briefing arrives
# This fires first so the CEO sees "don't touch the phone" before anything else
#
# IMPORTANT: Uses Start-Job (not inline claude -p) to invoke claude.
# Start-Job runs a background PowerShell worker that resolves claude.ps1 correctly.
# Inline claude -p with @"..."@ here-strings fails when multiple tasks fire
# simultaneously (batch catch-up after sleep/wake). Start-Job isolates each run.
# Pattern proven in autoresearch-loop.ps1 (Fix #32, Mar 19 2026).
#
# ENCODING: Every Out-File call MUST use -Encoding utf8. Windows PowerShell 5.1
# defaults to UTF-16LE which produces double-spaced output in logs and garbled
# Telegram messages. This was the root cause of the Mar 20 encoding bug.

$ErrorActionPreference = "Continue"
$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "2000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\phone-free-$date.log"
$TimeoutMinutes = 10

# Ensure log directory exists
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) -ErrorAction SilentlyContinue | Out-Null

Set-Location $lifeOS

# --- Centralized stagger delay (config.ps1 Get-StaggerDelay) ---
# Normal: 3-10s. Wake-from-sleep batch: 45-75s (Tier 2, short claude-p)
$delay = Get-StaggerDelay -ScriptName "phone-free-morning"
"[$(Get-Date -Format 'HH:mm:ss')] Phone-Free Morning starting (delay: ${delay}s)" | Out-File $logFile -Encoding utf8
Start-Sleep -Seconds $delay

# --- Build prompt ---
$prompt = @"
You are the Life-OS Chief of Staff running an autonomous morning push. Be EXTREMELY short. This is the first thing the CEO sees when he wakes up.

## What to Read
1. Read the latest Days/day-XXX.md file (find the highest numbered one)
2. Extract: Tomorrow's Contract items (which are TODAY's commitments)

## What to Generate
Generate a Telegram message under 400 characters. Format exactly:

---
Phone-free first hour. Open laptop first.

Today's contract:
1. [item 1]
2. [item 2]
3. [item 3]

The phone is the #1 saboteur. Every morning that starts with the phone loses opening momentum.
---

If there is no day log or no contract, send:
Phone-free first hour. Open laptop first. No contract set -- that means drift. First task: set today's 3 commitments.

Do NOT add any explanation, preamble, or sign-off. Just the message text, nothing else.
"@

# --- Run claude -p via Start-Job with timeout ---
"[$(Get-Date -Format 'HH:mm:ss')] Launching claude -p via Start-Job (timeout: ${TimeoutMinutes}min)" | Out-File $logFile -Append -Encoding utf8

$job = Start-Job -ScriptBlock {
    param($p, $wd, $budget)
    Set-Location $wd
    $result = claude -p $p --permission-mode auto --max-budget-usd $budget --model claude-sonnet-4-6 --no-session-persistence 2>&1
    $result -join "`n"
} -ArgumentList $prompt, $lifeOS, 0.50

$completed = $job | Wait-Job -Timeout ($TimeoutMinutes * 60)

if ($completed) {
    $message = Receive-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
    "[$(Get-Date -Format 'HH:mm:ss')] Claude completed successfully" | Out-File $logFile -Append -Encoding utf8
} else {
    # Timeout -- kill job
    $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
    $message = ""
    "[$(Get-Date -Format 'HH:mm:ss')] TIMEOUT: Claude killed after ${TimeoutMinutes}min" | Out-File $logFile -Append -Encoding utf8
}

# --- Fallback if claude produced no output ---
if (-not $message -or $message.Trim().Length -lt 10) {
    $message = "Phone-free first hour. Open laptop first.`n`nThe phone is the #1 saboteur. Every morning that starts with the phone loses opening momentum.`n`nOpen laptop -> check contract -> start working."
    "[$(Get-Date -Format 'HH:mm:ss')] Used fallback message (claude output was empty/failed)" | Out-File $logFile -Append -Encoding utf8
}

# --- Log the output ---
$message | Out-File $logFile -Append -Encoding utf8

# --- Send to Telegram ---
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    $msg = $message
    if ($msg.Length -gt 3500) { $msg = $msg.Substring(0, 3500) }
    try {
        node $sendScript $msg 2>&1 | Out-Null
        "[$(Get-Date -Format 'HH:mm:ss')] Telegram sent" | Out-File $logFile -Append -Encoding utf8
    } catch {
        "[$(Get-Date -Format 'HH:mm:ss')] WARNING: Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
    }
}

"[$(Get-Date -Format 'HH:mm:ss')] Phone-Free Morning complete" | Out-File $logFile -Append -Encoding utf8

# Always exit 0 so Task Scheduler shows success
exit 0
