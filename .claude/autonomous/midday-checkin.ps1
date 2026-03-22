# Life-OS Midday Check-In -- Autonomous Telegram Push
# Runs daily at 1:00pm via Windows Task Scheduler
# Checks contract items from latest day log, asks CEO for status update

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "2000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\midday-checkin-$date.log"

Set-Location $lifeOS

# Find latest day log
$latestDay = Get-ChildItem "$lifeOS\Days\day-*.md" | Sort-Object Name | Select-Object -Last 1

if ($latestDay) {
    $content = Get-Content $latestDay.FullName -Raw

    # Extract contract items (lines starting with "1. [ ]", "2. [ ]", "3. [ ]")
    $contracts = ($content | Select-String -Pattern '\d+\.\s*\[\s*\].*' -AllMatches).Matches | ForEach-Object { $_.Value.Trim() }

    if ($contracts.Count -gt 0) {
        $contractList = ($contracts | ForEach-Object { $_ }) -join "`n"
        $msg = "1pm Check-In`n`nToday's contract:`n$contractList`n`nHow many of these are done? Reply with status."
    } else {
        $msg = "1pm Check-In`n`nNo contract items found for today. What are you working on?"
    }
} else {
    $msg = "1pm Check-In`n`nWhat have you accomplished so far today?"
}

# Send to Telegram
node "$lifeOS\.claude\telegram\send.js" $msg 2>&1 | Out-File $logFile
