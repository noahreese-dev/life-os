# ICS Call Reminder -- Runs weekday mornings at 10am
# Forces proactive outreach that CEO keeps "forgetting"
# Schedule: Task Scheduler -> 10:00 AM, weekdays only

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\..\config.ps1"
$telegramSend = "$lifeOS\.claude\telegram\send.js"

$message = @"
CALL ICS NOW

Summer/CTO -- UltrawashAPP API pricing.
This has been waiting 17+ days.
Do it BEFORE you open anything else.

This reminder will keep firing every weekday until you confirm the call happened.
"@

try {
    node $telegramSend $message
    Write-Host "ICS reminder sent via Telegram"
} catch {
    Write-Host "Failed to send ICS reminder: $_"
}
