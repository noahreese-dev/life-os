# Life-OS Autonomous Deploy Health Check
# Runs every 6 hours via Windows Task Scheduler
# Checks Vercel deployments for active projects + Telegram watcher health
#
# IMPORTANT: Uses Start-Job (not inline claude -p) to invoke claude.
# Inline claude -p with @"..."@ fails under batch contention (sleep/wake catch-up).
# Start-Job isolates the run. Pattern proven in nightly-accountability.ps1 (Fix #33).

. "$PSScriptRoot\..\config.ps1"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$logFile = "$lifeOS\.claude\autonomous\logs\deploy-$timestamp.log"
$TimeoutMinutes = 10

# Ensure log directory exists
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) -ErrorAction SilentlyContinue | Out-Null

Set-Location $lifeOS

# --- Centralized stagger delay (config.ps1 Get-StaggerDelay) ---
# Normal: 3-10s. Wake-from-sleep batch: 150-180s (Tier 4, medium claude-p)
$delay = Get-StaggerDelay -ScriptName "deploy-check"
"[$(Get-Date -Format 'HH:mm:ss')] Deploy check starting (delay: ${delay}s)" | Out-File $logFile -Encoding utf8
Start-Sleep -Seconds $delay

# --- Build prompt ---
$prompt = @"
You are the Life-OS deploy monitor running autonomously.

Check the health of deployed projects:
1. Read STATUS.md to find active deployed project URLs
2. Use WebFetch to check if each deployed site is responding
3. If any site is down or returning errors, append alert to: briefings/urgent.md with timestamp

Only write to urgent.md if something is actually wrong. No noise if everything is fine.
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
    $output = Receive-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
    "[$(Get-Date -Format 'HH:mm:ss')] Claude deploy check completed" | Out-File $logFile -Append -Encoding utf8
} else {
    $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
    $output = "[TIMEOUT] Deploy check killed after ${TimeoutMinutes}min"
    "[$(Get-Date -Format 'HH:mm:ss')] TIMEOUT: Claude killed after ${TimeoutMinutes}min" | Out-File $logFile -Append -Encoding utf8
}

if ($output) { $output | Out-File $logFile -Append -Encoding utf8 }

# --- Check Telegram watcher health (non-claude, always runs) ---
$watcherRunning = $false
$watcherProcesses = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match 'watcher-loop\.mjs|watcher\.js|bot\.js'
}
if ($watcherProcesses) {
    $watcherRunning = $true
    "[$(Get-Date -Format 'HH:mm:ss')] Telegram watcher: RUNNING (PID: $($watcherProcesses.ProcessId -join ', '))" | Out-File $logFile -Append -Encoding utf8
} else {
    "[$(Get-Date -Format 'HH:mm:ss')] Telegram watcher: DOWN -- attempting restart..." | Out-File $logFile -Append -Encoding utf8

    # Attempt restart via start-bot.ps1
    $startBotScript = "$lifeOS\.claude\telegram\start-bot.ps1"
    if (Test-Path $startBotScript) {
        Start-Process powershell -ArgumentList "-WindowStyle Hidden -File `"$startBotScript`"" -WindowStyle Hidden
        "[$(Get-Date -Format 'HH:mm:ss')] Restart initiated via start-bot.ps1" | Out-File $logFile -Append -Encoding utf8
    } else {
        "[$(Get-Date -Format 'HH:mm:ss')] WARNING: start-bot.ps1 not found at $startBotScript" | Out-File $logFile -Append -Encoding utf8
    }

    # Append to urgent.md
    $urgentFile = "$lifeOS\briefings\urgent.md"
    "`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] TELEGRAM WATCHER DOWN -- Auto-restart attempted." | Out-File $urgentFile -Append -Encoding utf8
}

# If urgent items were flagged recently, push to Telegram
$urgentFile = "$lifeOS\briefings\urgent.md"
if (Test-Path $urgentFile) {
    $lastWrite = (Get-Item $urgentFile).LastWriteTime
    $threshold = (Get-Date).AddMinutes(-5)
    if ($lastWrite -gt $threshold) {
        $urgent = Get-Content $urgentFile -Tail 20 -Raw
        if ($watcherRunning) {
            $sendScript = "$lifeOS\.claude\telegram\send.js"
            if (Test-Path $sendScript) {
                try {
                    node $sendScript "DEPLOY ALERT:`n$urgent" 2>&1 | Out-Null
                } catch { }
            }
        }
    }
}

"[$(Get-Date -Format 'HH:mm:ss')] Deploy check complete" | Out-File $logFile -Append -Encoding utf8
exit 0
