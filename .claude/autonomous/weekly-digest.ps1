# Life-OS Autonomous Weekly Digest
# Runs Friday at 6:00pm via Windows Task Scheduler
# Compiles the week's day logs, completed tasks, and project progress into a digest

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "12000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\weekly-$date.log"

Set-Location $lifeOS
claude -p @"
You are the Life-OS Chief of Staff generating the weekly digest. This runs autonomously every Friday evening.

## Step 1: Read the Week
1. Read all Days/day-XXX.md files from this week (last 7 days)
2. Read STATUS.md for current project states
3. Read briefings/completed.md for all completed tasks this week
4. Read WEEKLY-LOG.md for what was planned vs what happened

## Step 2: Analyze
Calculate for the week:
- Contract scores (how many contract items completed vs total)
- Projects that moved forward vs stalled
- Patterns: what helped, what held back, recurring blockers
- Revenue: payments collected, invoices sent, deals progressed
- Phone/digital discipline trends
- Energy and focus patterns across the week

## Step 3: Generate the Digest
Save to: $lifeOS\briefings\weekly-$date.md

Format:
---
# Weekly Digest — [date range]

## Week Score: X/10

## What Shipped (actualized outcomes only)
- [list of things that crossed a finish line]

## What Moved But Didn't Ship
- [progress that matters but isn't done]

## What Stalled
- [projects/tasks that didn't move at all]

## Contract Performance
- Total items: X | Completed: X | Score: X%
- Best day: [day] | Worst day: [day]

## Revenue This Week
- Collected: $X | Invoiced: $X | Pipeline: $X

## Patterns
### Helped
- [recurring positive patterns]
### Held Back
- [recurring negative patterns]

## Next Week Priority
1. [highest impact task]
2. [second highest]
3. [third]

## One Line Truth
[week-level insight]
---

## Step 4: Push Summary to Google Tasks
Use ToolSearch to load Google Tasks tools. Read the task list ID from config.local.json and create a single task:
- Title: "Weekly Digest Ready — [date]"
- Notes: The One Line Truth + top 3 priorities for next week
- Due: Monday

Keep it honest. Actualized Outcome Rule applies — only count what shipped, not what moved.
"@ --permission-mode auto --max-budget-usd 0.50 2>&1 | Out-File $logFile

# Send digest summary to Telegram
$digestFile = "$lifeOS\briefings\weekly-$date.md"
if (Test-Path $digestFile) {
    $digest = Get-Content $digestFile -Raw
    if ($digest.Length -gt 3500) { $digest = $digest.Substring(0, 3500) + "`n`n... (see full digest in Life-OS)" }
    node "$lifeOS\.claude\telegram\send.js" $digest
}
