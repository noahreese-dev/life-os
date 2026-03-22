# Life-OS Overnight Research -- Deep Research + HTML Briefing
# Runs daily at 1:00am via Windows Task Scheduler
#
# DIAGNOSTIC: Fix #54 (Cycle #24, Mar 22 2026) added error trapping + granular logging.
# Uses [System.IO.File]::AppendAllText for immediate flush.

param(
    [decimal]$MaxBudget = 5.00,
    [int]$TimeoutMinutes = 30,
    [switch]$DryRun
)

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
    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
    $logDir = "$lifeOS\.claude\autonomous\logs"
    $script:diagLogFile = "$logDir\overnight-research-$timestamp.log"
    $briefingMd = "$lifeOS\briefings\singularity\overnight-research-$date.md"
    $briefingHtml = "$lifeOS\briefings\singularity\overnight-research-$date.html"

    New-Item -ItemType Directory -Force -Path $logDir -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Force -Path (Split-Path $briefingMd) -ErrorAction SilentlyContinue | Out-Null

    Set-Location $lifeOS
    Write-DiagLog "CONFIG: loaded. lifeOS=$lifeOS"

    # ZOMBIE CLEANUP
    $zombiesKilled = 0
    $staleProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match 'overnight.*research' -or $_.CommandLine -match 'OvernightResearch' }
    foreach ($proc in $staleProcs) {
        $age = (Get-Date) - $proc.CreationDate
        if ($age.TotalMinutes -gt 60) {
            try { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue; $zombiesKilled++ } catch { }
        }
    }
    if ($zombiesKilled -gt 0) { Write-DiagLog "ZOMBIE: killed $zombiesKilled stale processes" }

    if ($DryRun) {
        Write-Host "=== OVERNIGHT RESEARCH - DRY RUN ==="
        Write-Host "Life-OS root:     $lifeOS"
        Write-Host "Max budget:       $MaxBudget"
        Write-Host "Timeout:          ${TimeoutMinutes}min"
        exit 0
    }

    # Stagger delay with diagnostics
    $delay = Get-StaggerDelay -ScriptName "overnight-research"
    $nodeCount = @(Get-Process node -ErrorAction SilentlyContinue).Count
    $uptimeObj = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    $uptimeMin = if ($uptimeObj) { [int]((Get-Date) - $uptimeObj.LastBootUpTime).TotalMinutes } else { -1 }
    Write-DiagLog "STAGGER: delay=${delay}s PID=$PID nodes=$nodeCount uptime=${uptimeMin}min zombies=$zombiesKilled"

    Start-Sleep -Seconds $delay
    Write-DiagLog "SLEEP: completed"

    # Build prompt
    $prompt = @"
You are the OvernightResearch agent for Life-OS. This is an AUTONOMOUS scheduled run at 1am -- no human is watching. The CEO will read your output in the morning on his phone.

## Your Mission
Deep research on what builders are shipping in the AI agent / personal OS / Claude Code ecosystem. Generate TWO output files.

## Research Tasks (do ALL)

### 1. Twitter/X Landscape Scan
Search Twitter/X for recent posts about:
- "claude code" -- new tricks, workflows, plugins, hooks
- "life os" OR "personal os" OR "second brain"
- "ai agent" AND "always on" -- persistent agent architectures
- "mcp server" -- new MCP tools and integrations

### 2. Claude Code Changelog
Check for new features, updates, changelog entries.

### 3. Competitor Intelligence
Cursor/Windsurf, Notion AI, Obsidian plugins, CrewAI, AutoGen, LangGraph, claude-flow.

### 4. Life-OS Improvement Opportunities
Read METRICS.md. Identify what is dragging the score down and what to fix.

### 5. Rank Everything by Impact
Score each finding 1-5 on Relevance, Urgency, Effort. Sort by impact.

## Output File 1: Markdown Briefing
Write to: briefings/singularity/overnight-research-YYYY-MM-DD.md

## Output File 2: HTML Briefing (Phone-Optimized)
Write to: briefings/singularity/overnight-research-YYYY-MM-DD.html
Design: Alchemy dark theme (#0f1419 bg, #d4a853 accents), mobile-first, cards, collapsible sections.

## Rules
- Working directory: $lifeOS
- WRITE BOTH FILES.
- If web search tools are unavailable, note it and focus on what you CAN do.
"@
    Write-DiagLog "PROMPT: built ($($prompt.Length) chars)"

    # Launch claude via Start-Job
    Write-DiagLog "CLAUDE: launching Start-Job (timeout=${TimeoutMinutes}min budget=$MaxBudget)"

    $timeoutSec = $TimeoutMinutes * 60
    $job = Start-Job -ScriptBlock {
        param($p, $wd, $budget)
        Set-Location $wd
        $result = claude -p $p --permission-mode bypassPermissions --max-budget-usd $budget --no-session-persistence 2>&1
        $result -join "`n"
    } -ArgumentList $prompt, $lifeOS, $MaxBudget

    Write-DiagLog "CLAUDE: job created (Id=$($job.Id) State=$($job.State))"

    $completed = $job | Wait-Job -Timeout $timeoutSec

    $output = ""
    if ($completed) {
        $output = Receive-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        Write-DiagLog "CLAUDE: completed ($($output.Length) chars)"
    } else {
        $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
        Write-DiagLog "CLAUDE: TIMEOUT after ${TimeoutMinutes}min"
    }

    if ($output) {
        $output | Out-File $script:diagLogFile -Append -Encoding utf8
    } else {
        Write-DiagLog "WARNING: No output from claude"
    }

    $mdCreated = Test-Path $briefingMd
    $htmlCreated = Test-Path $briefingHtml
    Write-DiagLog "FILES: MD=$mdCreated HTML=$htmlCreated"

    # Telegram (quiet hours)
    $sendScript = "$lifeOS\.claude\telegram\send.js"
    if (Test-Path $sendScript) {
        $hour = (Get-Date).Hour
        if ($hour -ge 8 -and $hour -lt 23) {
            $telegramMsg = "Overnight Research complete ($date). MD=$mdCreated HTML=$htmlCreated"
            try {
                node $sendScript $telegramMsg 2>&1 | Out-Null
                Write-DiagLog "TELEGRAM: sent"
            } catch {
                Write-DiagLog "TELEGRAM: failed - $_"
            }
        } else {
            Write-DiagLog "TELEGRAM: skipped (quiet hours)"
        }
    }

    # Cleanup old logs
    $cutoff = (Get-Date).AddDays(-7)
    Get-ChildItem "$logDir\overnight-research-*.log" -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff } |
        Remove-Item -Force -ErrorAction SilentlyContinue

    Write-DiagLog "COMPLETE: overnight research finished"

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
