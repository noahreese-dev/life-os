# Life-OS Autonomous Weekly Digest
# Runs Friday at 7:00pm via Windows Task Scheduler
# Compiles the week's day logs, completed tasks, and project progress into a digest
#
# IMPORTANT: Uses Start-Job (not inline claude -p) to invoke claude.
# Start-Job runs a background PowerShell worker that resolves claude.ps1 correctly.
# Inline claude -p with @"..."@ here-strings fails when multiple tasks fire
# simultaneously (batch catch-up after sleep/wake). Start-Job isolates each run.
# Pattern proven in nightly-accountability.ps1 (Fix #33, Mar 20 2026).

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "12000"
. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = "$lifeOS\.claude\autonomous\logs\weekly-$date.log"
$briefingFile = "$lifeOS\briefings\weekly-$date.md"
$TimeoutMinutes = 20

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $briefingFile) -ErrorAction SilentlyContinue | Out-Null

Set-Location $lifeOS

# --- Centralized stagger delay (config.ps1 Get-StaggerDelay) ---
# Normal: 3-10s. Wake-from-sleep batch: 330-360s (Tier 7, heavy claude-p)
$delay = Get-StaggerDelay -ScriptName "weekly-digest"
"[$(Get-Date -Format 'HH:mm:ss')] Weekly digest starting (delay: ${delay}s)" | Out-File $logFile -Encoding utf8
Start-Sleep -Seconds $delay

# --- Build prompt ---
$prompt = @"
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

Also read:
- ACCOUNTING.md or any financial tracking files for cash position and receivables
- Check for any mentions of payments from Boz, Garage33, Mo, Summer across day logs

## Step 3: Generate the Digest
Save to: briefings/weekly-$date.md

Format:
---
# Weekly Digest -- [date range]

## Week Score: X/10

## Project Progress Matrix
| Project | Status | % Complete | Movement This Week | Blocker |
|---------|--------|------------|-------------------|---------|
| Garage33 | [status] | [%] | [moved/stalled/shipped] | [if any] |
| HW Ad+ | [status] | [%] | [moved/stalled/shipped] | [if any] |
| Boz App | [status] | [%] | [moved/stalled/shipped] | [if any] |
| UltrawashAPP | [status] | [%] | [moved/stalled/shipped] | [if any] |
| IM Website | [status] | [%] | [moved/stalled/shipped] | [if any] |

## Financial Pulse
- **Cash Position**: estimated from last known + collections - burn
- **Monthly Burn**: ~525/mo (subscriptions ~354/mo)
- **Receivables Aging**: table of client, owed, days outstanding, status
- **Collection Velocity**: collected this week vs last week

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
- Collected: X | Invoiced: X | Pipeline: X

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

Keep it honest. Actualized Outcome Rule applies -- only count what shipped, not what moved.
"@

# --- Run claude -p via Start-Job with timeout ---
"[$(Get-Date -Format 'HH:mm:ss')] Launching claude -p via Start-Job (timeout: ${TimeoutMinutes}min, budget: 1.00)" | Out-File $logFile -Append -Encoding utf8

$job = Start-Job -ScriptBlock {
    param($p, $wd, $budget)
    Set-Location $wd
    $result = claude -p $p --permission-mode auto --max-budget-usd $budget --model claude-sonnet-4-6 --no-session-persistence 2>&1
    $result -join "`n"
} -ArgumentList $prompt, $lifeOS, 1.00

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

# --- Fallback if claude produced no output ---
if (-not $output -or $output.Trim().Length -lt 50) {
    $output = @"
# Weekly Digest -- $date (Fallback)

The weekly digest could not be generated this Friday (claude timed out or failed).

## Quick Status
- Check STATUS.md for current project states
- Check Days/ folder for this week's day logs
- Check ACCOUNTING.md for financial position

## Action Required
Run /review-week manually in your next Claude Code session to get the full digest.

-- Life-OS Autonomous Layer (fallback)
"@
    "[$(Get-Date -Format 'HH:mm:ss')] Used fallback message (claude output was empty/short)" | Out-File $logFile -Append -Encoding utf8
}

# --- Save to log and briefing ---
$output | Out-File $logFile -Append -Encoding utf8
$output | Out-File $briefingFile -Encoding utf8

# --- Send to Telegram ---
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    $msg = $output
    if ($msg.Length -gt 3500) { $msg = $msg.Substring(0, 3500) + "`n`n... (see full digest in Life-OS)" }
    try {
        node $sendScript $msg 2>&1 | Out-Null
        "[$(Get-Date -Format 'HH:mm:ss')] Telegram sent" | Out-File $logFile -Append -Encoding utf8
    } catch {
        "[$(Get-Date -Format 'HH:mm:ss')] WARNING: Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
    }
}

"[$(Get-Date -Format 'HH:mm:ss')] Weekly digest complete" | Out-File $logFile -Append -Encoding utf8
exit 0
