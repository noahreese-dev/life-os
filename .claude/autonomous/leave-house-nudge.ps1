# Life-OS Leave the House Nudge -- Autonomous Telegram Push
# Runs daily at 11:00am via Windows Task Scheduler
# Reminds CEO to get out of the house -- strongest predictor of productivity from 32 days of data

. "$PSScriptRoot\..\config.ps1"

$msg = "11am -- Are you out of the house yet?`n`nFrom 32 days of data: your best execution days correlate with leaving the house before noon. Laptop + charger. Coffee shop or library.`n`nContract items won't do themselves indoors."

node "$lifeOS\.claude\telegram\send.js" $msg 2>&1 | Out-Null
