# Life-OS Weekly Log Reminder
# Runs every Monday at 9:00am via Windows Task Scheduler
# Sends a Telegram reminder to do the weekly planning ritual

. "$PSScriptRoot\..\config.ps1"

$message = @"
MONDAY -- WEEKLY LOG DUE

Open Life-OS and run /weekly-plan.

3-5 checkable commitments for the week.
WEEKLY-LOG.md hasn't been updated since Feb 14.
The Monday ritual is the backbone of accountability.

Cash-first. Max 2 projects/day. What ships this week?
"@

node "$lifeOS\.claude\telegram\send.js" $message
