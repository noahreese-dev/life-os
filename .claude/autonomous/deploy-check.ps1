# Life-OS Autonomous Deploy Health Check
# Runs every 6 hours via Windows Task Scheduler
# Checks Vercel deployments for active projects

. "$PSScriptRoot\..\config.ps1"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$logFile = "$lifeOS\.claude\autonomous\logs\deploy-$timestamp.log"

Set-Location $lifeOS
claude -p @"
You are the Life-OS deploy monitor running autonomously.

Check the health of deployed projects:
1. Read STATUS.md to find active deployed project URLs
2. Use WebFetch to check if each deployed site is responding
3. If any site is down or returning errors, append alert to: $lifeOS\briefings\urgent.md with timestamp

Only write to urgent.md if something is actually wrong. No noise if everything is fine.
"@ --permission-mode auto --max-budget-usd 0.10 2>&1 | Out-File $logFile

# If urgent items were flagged, push to Telegram
$urgentFile = "$lifeOS\briefings\urgent.md"
if (Test-Path $urgentFile) {
    $lastWrite = (Get-Item $urgentFile).LastWriteTime
    $threshold = (Get-Date).AddMinutes(-5)
    if ($lastWrite -gt $threshold) {
        $urgent = Get-Content $urgentFile -Tail 20 -Raw
        node "$lifeOS\.claude\telegram\send.js" "DEPLOY ALERT:`n$urgent"
    }
}
