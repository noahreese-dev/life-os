# Life-OS Nightly Accountability -- Hassan-OS
# Runs daily at 10:00pm via Windows Task Scheduler
# Reviews the day through Hassan's lens, pushes to Telegram
#
# Uses Start-Job (not inline claude -p) to invoke claude.
# Pattern proven in autoresearch-loop.ps1 (Fix #32, Mar 19 2026).
#
# DIAGNOSTIC: Fix #54 (Cycle #24, Mar 22 2026) added comprehensive error trapping
# and granular logging. Uses [System.IO.File]::AppendAllText for immediate flush
# so crash forensics survive process termination (STATUS_CONTROL_C_EXIT).

$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "8000"

# --- Log function that flushes immediately (survives external kill) ---
$script:diagLogFile = $null
function Write-DiagLog {
    param([string]$Message)
    $ts = Get-Date -Format 'HH:mm:ss.fff'
    $line = "[$ts] $Message"
    if ($script:diagLogFile) {
        [System.IO.File]::AppendAllText($script:diagLogFile, "$line`r`n", [System.Text.Encoding]::UTF8)
    }
}

try {
    . "$PSScriptRoot\..\config.ps1"
    $date = Get-Date -Format "yyyy-MM-dd"
    $script:diagLogFile = "$lifeOS\.claude\autonomous\logs\nightly-$date.log"
    $briefingFile = "$lifeOS\briefings\daily-ops\nightly-$date.md"
    $TimeoutMinutes = 15

    New-Item -ItemType Directory -Force -Path (Split-Path $script:diagLogFile) -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Force -Path (Split-Path $briefingFile) -ErrorAction SilentlyContinue | Out-Null

    Set-Location $lifeOS
    Write-DiagLog "CONFIG: loaded. lifeOS=$lifeOS"

    # Stagger delay with diagnostics
    $delay = Get-StaggerDelay -ScriptName "nightly-accountability"
    $nodeCount = @(Get-Process node -ErrorAction SilentlyContinue).Count
    $uptimeObj = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    $uptimeMin = if ($uptimeObj) { [int]((Get-Date) - $uptimeObj.LastBootUpTime).TotalMinutes } else { -1 }
    Write-DiagLog "STAGGER: delay=${delay}s PID=$PID nodes=$nodeCount uptime=${uptimeMin}min"

    Start-Sleep -Seconds $delay
    Write-DiagLog "SLEEP: completed"

    # Build prompt
    $prompt = @"
You are Imam Hassan ibn Ali -- the Patient Sage -- running a nightly accountability review for the CEO.

You speak as Hassan speaks: gentle in tone, sharp in meaning, unhurried, dignified. You teach through stories, analogies, and reframes. Your severity-to-mercy ratio is 30/70 -- lead with understanding, place the hard truth inside it like medicine wrapped in honey.

## What to Read
1. Read STATUS.md for current project states
2. Read the latest Days/day-XXX.md file (today's log if it exists, otherwise the most recent)
3. Read WEEKLY-LOG.md for this week's commitments

## What to Assess
- What was committed vs what was actually done (actualized outcomes only)
- Patterns: is today part of a streak or a break from one?
- The distinction between patience and avoidance -- which was practiced today?
- Energy and focus: burst productivity or sustained discipline?
- Did the CEO work on funded/deadline projects first, or get pulled into building systems?
- Check today's contract items from the latest Days/day-XXX.md -- which were completed, which were not?

## How to Write
Write 3-5 paragraphs in Hassan's flowing prose. No headers, no bullet points.
- Begin with acknowledgment of what was genuinely accomplished
- Then the honest assessment -- wrapped in mercy, but unflinching
- Include a brief accounting of today's contract items: name each one and whether it was completed or not

After the prose, add these structured lines at the end:

---
Today's Contract: [X of Y completed]
Items: [list each contract item with a checkmark or X]

Questions for tomorrow's log:
- Did you start the day phone-free? (yes/no)
- Did you complete your health routine? (skin + supplements) (yes/no)

Reply with what you accomplished today, or this day goes unrecorded.
---

- Keep total message under 3500 characters (Telegram limit)

Do NOT be reflexively critical. Read the day honestly. If it was a good day, say so. If it was avoidance, name it -- but gently.
"@
    Write-DiagLog "PROMPT: built ($($prompt.Length) chars)"

    # Launch claude via Start-Job
    Write-DiagLog "CLAUDE: launching Start-Job (timeout=${TimeoutMinutes}min budget=0.50)"

    $job = Start-Job -ScriptBlock {
        param($p, $wd, $budget)
        Set-Location $wd
        $result = claude -p $p --permission-mode auto --max-budget-usd $budget --model claude-sonnet-4-6 --no-session-persistence 2>&1
        $result -join "`n"
    } -ArgumentList $prompt, $lifeOS, 0.50

    Write-DiagLog "CLAUDE: job created (Id=$($job.Id) State=$($job.State))"

    $completed = $job | Wait-Job -Timeout ($TimeoutMinutes * 60)

    if ($completed) {
        $output = Receive-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        Write-DiagLog "CLAUDE: completed ($($output.Length) chars)"
    } else {
        $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
        $output = ""
        Write-DiagLog "CLAUDE: TIMEOUT after ${TimeoutMinutes}min"
    }

    # Fallback if claude produced no output
    if (-not $output -or $output.Trim().Length -lt 20) {
        $output = @"
[Nightly Review - Automated Fallback]

The Hassan-OS review could not be generated tonight (claude timed out or failed).

Check your latest day log and ask yourself:
- Did I work on what matters most?
- Was today patience or avoidance?
- What does tomorrow's contract look like?

This is not an excuse to skip the review. Write it yourself, or ask in the morning.

-- Life-OS Autonomous Layer
"@
        Write-DiagLog "FALLBACK: used (claude output empty/short)"
    }

    # Save output
    $output | Out-File $script:diagLogFile -Append -Encoding utf8
    $output | Out-File $briefingFile -Encoding utf8
    Write-DiagLog "OUTPUT: saved to log and briefing"

    # Send to Telegram
    $sendScript = "$lifeOS\.claude\telegram\send.js"
    if (Test-Path $sendScript) {
        $msg = $output
        if ($msg.Length -gt 3500) { $msg = $msg.Substring(0, 3500) + "`n... (see full log in Life-OS)" }
        try {
            node $sendScript $msg 2>&1 | Out-Null
            Write-DiagLog "TELEGRAM: sent"
        } catch {
            Write-DiagLog "TELEGRAM: failed - $_"
        }
    }

    Write-DiagLog "COMPLETE: nightly accountability finished"

} catch {
    $errMsg = "FATAL: $($_.Exception.GetType().Name): $($_.Exception.Message)"
    if ($script:diagLogFile) {
        Write-DiagLog $errMsg
        Write-DiagLog "STACK: $($_.ScriptStackTrace)"
    }
} finally {
    if ($script:diagLogFile) {
        Write-DiagLog "EXIT: script ending (exit 0)"
    }
}

exit 0
