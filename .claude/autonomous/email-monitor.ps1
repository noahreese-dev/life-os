# Life-OS Autonomous Email Monitor
# Runs once daily (folded into morning briefing cycle)
# Checks for urgent emails and surfaces them

. "$PSScriptRoot\..\config.ps1"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$logFile = "$lifeOS\.claude\autonomous\logs\email-$timestamp.log"

Set-Location $lifeOS
claude -p @"
You are the Life-OS email monitor running autonomously.

1. Use ToolSearch to load Gmail tools
2. Check for unread emails from the last 24 hours (userId: "me", q: "is:unread newer_than:1d", maxResults: 20)
3. If there are urgent emails (client responses, money-related, deadline-related), append them to: $lifeOS\briefings\urgent.md with timestamp
4. If nothing urgent, do nothing — don't create noise

Only flag HIGH priority: client replies, payment confirmations, meeting changes, deadline updates.
Skip: marketing, newsletters, promotions, automated notifications.
"@ --permission-mode auto --max-budget-usd 0.10 2>&1 | Out-File $logFile

# If urgent items were flagged, push to Telegram
$urgentFile = "$lifeOS\briefings\urgent.md"
if (Test-Path $urgentFile) {
    $lastWrite = (Get-Item $urgentFile).LastWriteTime
    $threshold = (Get-Date).AddMinutes(-5)
    if ($lastWrite -gt $threshold) {
        $urgent = Get-Content $urgentFile -Tail 20 -Raw
        node "$lifeOS\.claude\telegram\send.js" "URGENT:`n$urgent"
    }
}
