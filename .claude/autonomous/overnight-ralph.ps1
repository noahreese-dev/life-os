# Life-OS Overnight Ralph Wiggum Worker
# Autonomous overnight agent that works through a task queue
# Uses the Ralph Wiggum pattern: loop claude -p until tasks are done
#
# IMPORTANT: Uses Start-Job (not Start-Process) to invoke claude -p.
# Start-Process -FilePath "claude" fails on Windows because "claude" is a .ps1
# shim, not a Win32 .exe. Start-Job runs a background PowerShell worker that
# resolves claude.ps1 correctly. Proven working Mar 19, 2026.
#
# Usage:
#   .\overnight-ralph.ps1                          # Run default task queue
#   .\overnight-ralph.ps1 -TaskFile "custom.md"    # Run custom task file
#   .\overnight-ralph.ps1 -MaxIterations 20        # Limit iterations
#   .\overnight-ralph.ps1 -MaxBudget 2.00          # Limit budget per iteration
#   .\overnight-ralph.ps1 -TimeoutMinutes 30       # Override per-iteration timeout
#   .\overnight-ralph.ps1 -DryRun                  # Show what would happen

param(
    [string]$TaskFile = "",
    [int]$MaxIterations = 30,
    [decimal]$MaxBudget = 1.00,
    [int]$TimeoutMinutes = 30,
    [switch]$DryRun
)

. "$PSScriptRoot\..\config.ps1"
$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "HH-mm"
$logDir = "$lifeOS\.claude\autonomous\logs"
$logFile = "$logDir\ralph-$date-$timestamp.log"
$resultFile = "$lifeOS\briefings\overnight-ralph-$date.md"

# Ensure log directory exists
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

# --- ZOMBIE CLEANUP ---
# Kill stale Ralph claude -p processes from previous runs
$zombiesKilled = 0
$staleProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'Ralph Wiggum' -or $_.CommandLine -match 'overnight.*worker' }

foreach ($proc in $staleProcs) {
    $age = (Get-Date) - $proc.CreationDate
    if ($age.TotalMinutes -gt 90) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $zombiesKilled++
        } catch { }
    }
}

if ($zombiesKilled -gt 0) {
    Write-Host "Zombie cleanup: killed $zombiesKilled stale processes"
}

# Default task queue location
if (-not $TaskFile) {
    $TaskFile = "$lifeOS\.claude\autonomous\overnight-tasks.md"
}

# Check if task file exists
if (-not (Test-Path $TaskFile)) {
    Write-Host "No task file found at $TaskFile"
    Write-Host "Create it with tasks for the overnight worker."
    Write-Host ""
    Write-Host "Example format:"
    Write-Host "# Overnight Task Queue"
    Write-Host "- [ ] Run code review on Agent-BTD"
    Write-Host "- [ ] Update STATUS.md with latest project states"
    Write-Host "- [ ] Generate test coverage report for Garage33"
    exit 0
}

$tasks = Get-Content $TaskFile -Raw

if ($DryRun) {
    Write-Host "=== DRY RUN ==="
    Write-Host "Task file: $TaskFile"
    Write-Host "Max iterations: $MaxIterations"
    Write-Host "Max budget per iteration: $MaxBudget"
    Write-Host "Timeout per iteration: ${TimeoutMinutes}min"
    Write-Host ""
    Write-Host "Tasks:"
    Write-Host $tasks
    exit 0
}

# Log header
$header = @"
# Overnight Ralph Wiggum Session
# Started: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Task file: $TaskFile
# Max iterations: $MaxIterations
# Max budget per iteration: $MaxBudget
# Timeout per iteration: ${TimeoutMinutes}min
# Working directory: $lifeOS
# ========================================

"@
$header | Out-File $logFile -Encoding utf8

# Initialize result file
$resultHeader = @"
# Overnight Work Report -- $date

Started: $(Get-Date -Format "HH:mm")
Mode: Ralph Wiggum autonomous loop
Max iterations: $MaxIterations

## Tasks Assigned
$tasks

## Iteration Log

"@
$resultHeader | Out-File $resultFile -Encoding utf8

# The Ralph Wiggum Loop
$iteration = 0
$totalErrors = 0

while ($iteration -lt $MaxIterations) {
    $iteration++
    $iterStart = Get-Date

    Write-Host "=== Iteration $iteration / $MaxIterations ==="
    "--- Iteration $iteration started at $(Get-Date -Format 'HH:mm:ss') ---" | Out-File $logFile -Append

    # Build the prompt
    $promptContent = @"
You are the Life-OS overnight autonomous worker (Ralph Wiggum mode).
This is iteration $iteration of $MaxIterations.

## Your Task Queue
$tasks

## Instructions
1. Read the task queue above
2. Pick the NEXT uncompleted task (marked with [ ])
3. Execute it fully -- don't stop at 70%
4. When done, output a brief status of what you completed
5. If ALL tasks are complete, output: RALPH_COMPLETE

## Rules
- Work in the Life-OS directory: $lifeOS
- Do NOT modify CLAUDE.md or settings files
- Do NOT push to git
- Focus on one task per iteration
- Be thorough but efficient
- If a task requires external access you don't have, skip it and note why

## Previous iterations completed: $($iteration - 1)
"@

    try {
        # Use Start-Job for timeout control (Start-Process can't launch claude.ps1 shim)
        $timeoutSec = $TimeoutMinutes * 60
        $job = Start-Job -ScriptBlock {
            param($p, $wd, $b)
            Set-Location $wd
            $result = claude -p $p --permission-mode bypassPermissions --max-budget-usd $b --no-session-persistence 2>&1
            $result -join "`n"
        } -ArgumentList $promptContent, $lifeOS, $MaxBudget

        $completed = $job | Wait-Job -Timeout $timeoutSec

        $output = ""
        if ($completed) {
            $output = Receive-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -Force -ErrorAction SilentlyContinue
        } else {
            $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
            "[TIMEOUT] Iteration $iteration killed after ${TimeoutMinutes}min" | Out-File $logFile -Append
            $totalErrors++
        }

        # Log the output
        if ($output) {
            $output | Out-File $logFile -Append
        } else {
            "[WARNING] No output from claude -p" | Out-File $logFile -Append
        }

        # Append to result file
        "### Iteration $iteration ($(Get-Date -Format 'HH:mm'))`n$output`n" | Out-File $resultFile -Append

        $duration = (Get-Date) - $iterStart
        "[$(Get-Date -Format 'HH:mm:ss')] Iteration $iteration complete. Duration: $duration" | Out-File $logFile -Append

        # Check for completion signal
        if ($output -match "RALPH_COMPLETE") {
            Write-Host "All tasks completed at iteration $iteration!"
            "ALL TASKS COMPLETED at iteration $iteration" | Out-File $logFile -Append
            break
        }

        # Check for errors (but don't count every mention -- look for actual failures)
        if ($output -match "(?i)(fatal|EFATAL|permission denied|cannot access)" -or -not $output) {
            $totalErrors++
            if ($totalErrors -ge 5) {
                Write-Host "Too many errors ($totalErrors). Stopping."
                "STOPPED: Too many errors ($totalErrors)" | Out-File $logFile -Append
                break
            }
        }
    }
    catch {
        $totalErrors++
        "ERROR in iteration $iteration : $_" | Out-File $logFile -Append
        Write-Host "Error in iteration $iteration : $_"

        if ($totalErrors -ge 5) {
            Write-Host "Too many errors. Stopping."
            break
        }
    }

    # Brief pause between iterations to avoid rate limiting
    Start-Sleep -Seconds 5
}

# Write summary
$summary = @"

## Summary
- Iterations completed: $iteration / $MaxIterations
- Errors encountered: $totalErrors
- Finished: $(Get-Date -Format "HH:mm")
- Log file: $logFile
"@
$summary | Out-File $resultFile -Append

Write-Host ""
Write-Host "=== Overnight Ralph complete ==="
Write-Host "Iterations: $iteration"
Write-Host "Errors: $totalErrors"
Write-Host "Results: $resultFile"
Write-Host "Full log: $logFile"

# Send summary to Telegram if available
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    $telegramMsg = "Overnight Ralph complete. $iteration iterations, $totalErrors errors. Check briefings/overnight-ralph-$date.md"
    try {
        node $sendScript $telegramMsg 2>&1 | Out-Null
    } catch {
        "WARNING: Failed to send Telegram notification" | Out-File $logFile -Append
    }
}

# Cleanup old logs (7 days)
$cutoff = (Get-Date).AddDays(-7)
Get-ChildItem "$logDir\ralph-*.log" -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force -ErrorAction SilentlyContinue

exit 0
