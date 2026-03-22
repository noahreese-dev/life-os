# Life-OS Autonomous Morning Planner
# Runs daily at 8:30am via Windows Task Scheduler
# Reads project state -> creates today's task list -> pushes to Google Tasks -> saves briefing
#
# IMPORTANT: Uses Start-Job (not inline claude -p) to invoke claude.
# Start-Job runs a background PowerShell worker that resolves claude.ps1 correctly.
# Inline claude -p with @"..."@ here-strings fails when multiple tasks fire
# simultaneously (batch catch-up after sleep/wake). Start-Job isolates each run.
# Pattern proven in autoresearch-loop.ps1 (Fix #32, Mar 19 2026).
# Rewritten to Start-Job pattern: Fix #52, autoresearch Cycle #22, Mar 22 2026.
#
# ENCODING: Every Out-File call MUST use -Encoding utf8. Windows PowerShell 5.1
# defaults to UTF-16LE which produces double-spaced output in logs and garbled
# Telegram messages. This was the root cause of the Mar 20 encoding bug.

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "8000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\morning-$date.log"
$briefingFile = "$lifeOS\briefings\$date.md"
$TimeoutMinutes = 20

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $briefingFile) -ErrorAction SilentlyContinue | Out-Null

# Pre-compute HW Ad+ render stall detection
$hwAdPath = "C:\Users\Pc\Desktop\social-star"
$hwStallMsg = ""
if (Test-Path $hwAdPath) {
    $outputDirs = @("$hwAdPath\out", "$hwAdPath\build", "$hwAdPath\output", "$hwAdPath\dist")
    $latestFile = $null
    foreach ($dir in $outputDirs) {
        if (Test-Path $dir) {
            $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($files -and (-not $latestFile -or $files.LastWriteTime -gt $latestFile.LastWriteTime)) {
                $latestFile = $files
            }
        }
    }
    # Also check root-level video/render files
    $renderFiles = Get-ChildItem -Path $hwAdPath -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(mp4|webm|mov|avi|mkv)$' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($renderFiles -and (-not $latestFile -or $renderFiles.LastWriteTime -gt $latestFile.LastWriteTime)) {
        $latestFile = $renderFiles
    }

    if ($latestFile) {
        $daysSinceRender = [math]::Floor(((Get-Date) - $latestFile.LastWriteTime).TotalDays)
        if ($daysSinceRender -gt 2) {
            $hwStallMsg = "HW_AD_STALL_DAYS=$daysSinceRender"
        }
    } else {
        # No output files found at all -- check any file in the project
        $anyFile = Get-ChildItem -Path $hwAdPath -Recurse -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($anyFile) {
            $daysSinceAny = [math]::Floor(((Get-Date) - $anyFile.LastWriteTime).TotalDays)
            if ($daysSinceAny -gt 2) {
                $hwStallMsg = "HW_AD_STALL_DAYS=$daysSinceAny"
            }
        }
    }
}

Set-Location $lifeOS

# --- Centralized stagger delay (config.ps1 Get-StaggerDelay) ---
# Normal: 3-10s. Wake-from-sleep batch: 90-120s (Tier 3, heavy claude-p)
$delay = Get-StaggerDelay -ScriptName "morning-briefing"
"[$(Get-Date -Format 'HH:mm:ss')] Morning briefing starting (delay: ${delay}s)" | Out-File $logFile -Encoding utf8
Start-Sleep -Seconds $delay

# --- Build prompt ---
$prompt = @"
You are the Life-OS Chief of Staff running an autonomous morning planning session. You work FOR the CEO -- proactively creating today's plan and pushing it to his phone for approval.

## Step 1: Read the State
1. Read STATUS.md for current project states and blockers
2. Read the latest Days/day-XXX.md for yesterday's contract, carry-forward items, and patterns
3. Read PRIORITIES.md for priority framework
4. Read WEEKLY-LOG.md for this week's commitments

## Step 2: Check External Inputs
5. Run this Bash command to get unread emails: gws gmail +triage
   - Review the output for any actionable emails
   - Specifically flag emails from known contacts: Mo, Boz, Summer, Nebo, Kourosh, Hadi, Tiffany
   - Count total unread
6. Run this Bash command to get today's calendar: gws calendar +today
   - If that fails, try: gws calendar events list --params '{"calendarId":"primary","timeMin":"$(date -u +%Y-%m-%dT00:00:00Z)","timeMax":"$(date -u +%Y-%m-%dT23:59:59Z)","singleEvents":true}'

## Step 3: Create Today's Task List + Time-Blocked Schedule
Based on everything above, determine the 3-5 most important tasks for today. Consider:
- Yesterday's contract items that carry forward (incomplete items)
- Funded + deadline projects always first
- Max 2 projects per day
- What's blocked vs. what can move right now
- Urgent emails that need response
- Calendar commitments

Then BUILD A TIME-BLOCKED SCHEDULE for the day:
- Deep work (coding, rendering, creative) -> morning slots (8am-12pm)
- Admin work (emails, follow-ups, calls) -> afternoon slots (1pm-4pm)
- Respect calendar events -- block around them
- Max 2 project contexts in the schedule
- Include 15-min transition buffers between project switches

## Step 4: Push to Google Tasks
Use this Bash command to push tasks: gws tasks tasks insert --params '{"tasklist":"TASK_LIST_ID"}' --body '{"title":"TASK_TITLE","notes":"NOTES","due":"DATE"}'
Read the task list ID from config.local.json and push each task:
- Title: clear, actionable task name
- Notes: context, "done when" criteria, any relevant details
- Due: today's date

## Step 5: HW Ad+ Render Stall Check
$hwStallMsg
If HW_AD_STALL_DAYS is set above and the number is greater than 2, include a prominent alert in the briefing:
"[!] HW Ad+ STALL ALERT: No render attempt in [N] days. The block is not technical."
If not set or <= 2 days, skip this section.

## Step 6: Save Briefing
Save a concise morning briefing to: $lifeOS\briefings\$date.md

Format:
---
# Morning Briefing -- [date]

## Today's Contract Items (carry-forward from yesterday)
[List yesterday's incomplete contract items PROMINENTLY at the top -- these are the day's anchors]

## HW Ad+ Render Status
[Include stall alert if applicable, otherwise "On track" or skip]

## Time-Blocked Schedule
| Time | Block | Task |
|------|-------|------|
| 7:30 | Wake  | Review this briefing |
| 8:00-10:00 | Deep Work | [project task] |
| 10:00-12:00 | Deep Work | [project task] |
| 12:00-1:00 | Break | Lunch |
| 1:00-2:30 | Admin | [emails, follow-ups] |
| 2:30-4:00 | Admin | [task] |
| ... | ... | ... |

## Yesterday's Contract Score
[what got done / didn't]

## Email Zero
[X unread total | From known contacts: Mo (Y), Boz (Y), Summer (Y), Nebo (Y)]

## Urgent Emails
[any, or "none"]

## Calendar
[today's events]

## Health Checklist
- [ ] Morning skin routine (cleanser, moisturizer, SPF)
- [ ] Supplements taken
- [ ] Phone-free first hour

## One-Line CEO Reminder
[sharp, direct]
---

Keep it concise. The CEO reads this when he wakes up. His phone already has the tasks.
"@

# --- Run claude -p via Start-Job with timeout ---
"[$(Get-Date -Format 'HH:mm:ss')] Launching claude -p via Start-Job (timeout: ${TimeoutMinutes}min)" | Out-File $logFile -Append -Encoding utf8

$job = Start-Job -ScriptBlock {
    param($p, $wd, $budget)
    Set-Location $wd
    $result = claude -p $p --permission-mode auto --max-budget-usd $budget --model claude-sonnet-4-6 --no-session-persistence 2>&1
    $result -join "`n"
} -ArgumentList $prompt, $lifeOS, 3.00

$completed = $job | Wait-Job -Timeout ($TimeoutMinutes * 60)

if ($completed) {
    $output = Receive-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
    "[$(Get-Date -Format 'HH:mm:ss')] Claude completed successfully" | Out-File $logFile -Append -Encoding utf8
} else {
    # Timeout -- kill job
    $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
    $output = ""
    "[$(Get-Date -Format 'HH:mm:ss')] TIMEOUT: Claude killed after ${TimeoutMinutes}min" | Out-File $logFile -Append -Encoding utf8
}

# --- Log claude output ---
if ($output) {
    $output | Out-File $logFile -Append -Encoding utf8
}

# --- Fallback if claude produced no output or briefing file ---
if (-not $output -or $output.Trim().Length -lt 20 -or $output -match "Exceeded USD budget" -or $output -match "^Error:") {
    $fallback = @"
# Morning Briefing -- $date (Automated Fallback)

The full morning briefing could not be generated (claude timed out or failed).

## Quick Start
1. Check your latest day log for yesterday's contract items
2. Run ``/prime`` in Claude Code for a full session start
3. Check email manually: ``gws gmail +triage``

## Health Checklist
- [ ] Morning skin routine (cleanser, moisturizer, SPF)
- [ ] Supplements taken
- [ ] Phone-free first hour

-- Life-OS Autonomous Layer (fallback)
"@
    # Write fallback briefing only if no real briefing exists yet
    if (-not (Test-Path $briefingFile) -or (Get-Item $briefingFile).Length -lt 50) {
        $fallback | Out-File $briefingFile -Encoding utf8
    }
    "[$(Get-Date -Format 'HH:mm:ss')] Used fallback message (claude output was empty)" | Out-File $logFile -Append -Encoding utf8
    $telegramMsg = "[Morning Briefing] Claude failed or timed out. Fallback written. Run /prime for full start."
} else {
    $telegramMsg = $null
}

# --- Send briefing summary to Telegram ---
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    if ($telegramMsg) {
        # Send fallback notification
        try {
            node $sendScript $telegramMsg 2>&1 | Out-Null
            "[$(Get-Date -Format 'HH:mm:ss')] Telegram sent (fallback notification)" | Out-File $logFile -Append -Encoding utf8
        } catch {
            "[$(Get-Date -Format 'HH:mm:ss')] WARNING: Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
        }
    } elseif (Test-Path $briefingFile) {
        $briefing = Get-Content $briefingFile -Raw -Encoding UTF8
        if ($briefing -and $briefing.Trim().Length -gt 20) {
            if ($briefing.Length -gt 3500) { $briefing = $briefing.Substring(0, 3500) + "`n`n... (see full briefing in Life-OS)" }
            try {
                node $sendScript $briefing 2>&1 | Out-Null
                "[$(Get-Date -Format 'HH:mm:ss')] Telegram sent (full briefing)" | Out-File $logFile -Append -Encoding utf8
            } catch {
                "[$(Get-Date -Format 'HH:mm:ss')] WARNING: Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
            }
        }
    }
}

"[$(Get-Date -Format 'HH:mm:ss')] Morning briefing complete" | Out-File $logFile -Append -Encoding utf8
exit 0

