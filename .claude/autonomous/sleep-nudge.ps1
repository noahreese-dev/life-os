# Life-OS Sleep Nudge -- Autonomous Telegram Push
# Runs daily at 11:00pm via Windows Task Scheduler
# Reads tomorrow's contract from latest day log, pushes sleep reminder to Telegram
#
# IMPORTANT: Uses Start-Job (not inline claude -p) to invoke claude.
# Inline claude -p with @"..."@ fails under batch contention (sleep/wake catch-up).
# Start-Job isolates the run. Pattern proven in nightly-accountability.ps1 (Fix #33).

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "2000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\sleep-nudge-$date.log"
$briefingFile = "$lifeOS\briefings\sleep-nudge-${date}_$(Get-Date -Format 'HHmm').md"
$TimeoutMinutes = 8

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $briefingFile) -ErrorAction SilentlyContinue | Out-Null

Set-Location $lifeOS

# --- Centralized stagger delay (config.ps1 Get-StaggerDelay) ---
# Normal: 3-10s. Wake-from-sleep batch: 270-300s (Tier 6, short claude-p)
$delay = Get-StaggerDelay -ScriptName "sleep-nudge"
"[$(Get-Date -Format 'HH:mm:ss')] Sleep nudge starting (delay: ${delay}s)" | Out-File $logFile -Encoding utf8
Start-Sleep -Seconds $delay

# --- Build prompt ---
$prompt = @"
You are the Life-OS Chief of Staff running an autonomous sleep nudge. Be SHORT. This is a Telegram push notification, not a briefing.

## What to Read
1. Read the latest Days/day-XXX.md file (find the highest numbered one)
2. Extract: Tomorrow's Contract items and Sleep target

## What to Generate
Generate a Telegram message under 500 characters. Format:

---
It's 11pm. Tomorrow's contract:
1. [item 1]
2. [item 2]
3. [item 3]

Sleep target: [time from the day log]

Nothing after midnight beats being rested.
---

If there is no day log or no contract set, send:
It's 11pm. No contract set for tomorrow -- that's a problem. Set one now or drift tomorrow. Sleep target: midnight. Go.

Do NOT add any explanation, preamble, or sign-off. Just the message text, nothing else.
"@

# --- Run claude -p via Start-Job with timeout ---
"[$(Get-Date -Format 'HH:mm:ss')] Launching claude -p via Start-Job (timeout: ${TimeoutMinutes}min, budget: 0.50)" | Out-File $logFile -Append -Encoding utf8

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
    $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
    $message = ""
    "[$(Get-Date -Format 'HH:mm:ss')] TIMEOUT: Claude killed after ${TimeoutMinutes}min" | Out-File $logFile -Append -Encoding utf8
}

# --- Fallback if claude produced no output ---
if (-not $message -or $message.Trim().Length -lt 10) {
    $message = "It's 11pm. No contract set for tomorrow -- that's a problem. Set one now or drift tomorrow. Sleep target: midnight. Go."
    "[$(Get-Date -Format 'HH:mm:ss')] Used fallback message (claude output was empty)" | Out-File $logFile -Append -Encoding utf8
}

# --- Save to log and briefing ---
$message | Out-File $logFile -Append -Encoding utf8
$message | Out-File $briefingFile -Encoding utf8

# --- Send to Telegram ---
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    $cleanMessage = ($message | Where-Object { $_ -match '\S' }) -join "`n"
    if ($cleanMessage.Length -gt 3500) { $cleanMessage = $cleanMessage.Substring(0, 3500) }
    try {
        node $sendScript $cleanMessage 2>&1 | Out-Null
        "[$(Get-Date -Format 'HH:mm:ss')] Telegram sent" | Out-File $logFile -Append -Encoding utf8
    } catch {
        "[$(Get-Date -Format 'HH:mm:ss')] WARNING: Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
    }
}

"[$(Get-Date -Format 'HH:mm:ss')] Sleep nudge complete" | Out-File $logFile -Append -Encoding utf8
exit 0
