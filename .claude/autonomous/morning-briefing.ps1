# Life-OS Autonomous Morning Planner
# Runs daily at 7:30am via Windows Task Scheduler
# Reads project state → creates today's task list → pushes to Google Tasks → saves briefing

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "8000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\morning-$date.log"

Set-Location $lifeOS
claude -p @"
You are the Life-OS Chief of Staff running an autonomous morning planning session. You work FOR the CEO — proactively creating today's plan and pushing it to his phone for approval.

## Step 1: Read the State
1. Read STATUS.md for current project states and blockers
2. Read the latest Days/day-XXX.md for yesterday's contract, carry-forward items, and patterns
3. Read PRIORITIES.md for priority framework
4. Read WEEKLY-LOG.md for this week's commitments

## Step 2: Check External Inputs
5. Use ToolSearch to load Gmail tools. Check unread emails (userId: "me", q: "is:unread newer_than:1d", maxResults: 10). Flag urgent ones only.
6. Use ToolSearch to load Calendar tools. Check today's events (calendarId: "primary", timeMin/timeMax for today, singleEvents: true).

## Step 3: Create Today's Task List
Based on everything above, determine the 3-5 most important tasks for today. Consider:
- Yesterday's contract items that carry forward (incomplete items)
- Funded + deadline projects always first
- Max 2 projects per day
- What's blocked vs. what can move right now
- Urgent emails that need response
- Calendar commitments

## Step 4: Push to Google Tasks
Use ToolSearch to load Google Tasks tools. Read the task list ID from config.local.json and push each task:
- Title: clear, actionable task name
- Notes: context, "done when" criteria, any relevant details
- Due: today's date

## Step 5: Save Briefing
Save a concise morning briefing to: $lifeOS\briefings\$date.md

Format:
---
# Morning Briefing — [date]
## Yesterday's Contract Score
[what got done / didn't]
## Today's Tasks (pushed to Google Tasks)
1. [task] — done when [criteria]
2. [task] — done when [criteria]
3. [task] — done when [criteria]
## Urgent Emails
[any, or "none"]
## Calendar
[today's events]
## One-Line CEO Reminder
[sharp, direct]
---

Keep it concise. The CEO reads this when he wakes up. His phone already has the tasks.
"@ --permission-mode auto --max-budget-usd 0.50 2>&1 | Out-File $logFile

# Send briefing summary to Telegram
$briefingFile = "$lifeOS\briefings\$date.md"
if (Test-Path $briefingFile) {
    $briefing = Get-Content $briefingFile -Raw
    if ($briefing.Length -gt 3500) { $briefing = $briefing.Substring(0, 3500) + "`n`n... (see full briefing in Life-OS)" }
    node "$lifeOS\.claude\telegram\send.js" $briefing
}
