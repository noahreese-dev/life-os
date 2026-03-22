# Life-OS AutoResearch Loop -- Fully Autonomous System Self-Improvement
# Runs every 2 hours via Windows Task Scheduler
# Spawns the autoresearch agent for one improvement cycle, then the verifier
#
# Design:
#   - Each run = 1 autoresearch cycle + 1 verifier cycle
#   - Session-independent: uses claude -p (headless mode), no active session needed
#   - Budget-capped: prevents runaway spend
#   - Conflict-safe: claude -p runs in its own process, does not interfere with
#     interactive sessions or other Task Scheduler scripts
#   - Self-logging: writes structured logs + sends Telegram summary
#   - Zombie cleanup: kills stale processes at startup (prevents orphan pileup)
#   - Timeout: per phase via Start-Job + Wait-Job -Timeout (prevents hangs)
#
# IMPORTANT: Uses Start-Job (not Start-Process) to invoke claude -p.
# Start-Process -FilePath "claude" fails on Windows because "claude" is a .ps1
# shim, not a Win32 .exe. Start-Job runs a background PowerShell worker that
# resolves claude.ps1 correctly. Proven working Mar 19, 2026.
#
# Usage:
#   .\autoresearch-loop.ps1                   # Normal run
#   .\autoresearch-loop.ps1 -DryRun           # Show what would happen
#   .\autoresearch-loop.ps1 -SkipVerifier     # Run autoresearch only
#   .\autoresearch-loop.ps1 -MaxBudget 3.00   # Override budget per phase

param(
    [decimal]$MaxBudget = 5.00,
    [int]$TimeoutMinutes = 45,
    [switch]$SkipVerifier,
    [switch]$DryRun
)

# Load config
. "$PSScriptRoot\..\config.ps1"

$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$logDir = "$lifeOS\.claude\autonomous\logs"
$logFile = "$logDir\autoresearch-$timestamp.log"
$briefingDir = "$lifeOS\briefings\singularity"

# Ensure directories exist
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $briefingDir | Out-Null

# --- ZOMBIE CLEANUP ---
# Kill stale AutoResearch claude -p processes from previous runs.
# When Task Scheduler kills the PowerShell parent on timeout, child node.exe
# processes survive as orphans. This cleanup prevents pileup.
$zombiesKilled = 0
$staleProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'AutoResearch agent' }

foreach ($proc in $staleProcs) {
    $age = (Get-Date) - $proc.CreationDate
    if ($age.TotalMinutes -gt 90) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $zombiesKilled++
        } catch { }
    }
}

# Kill stale non-AutoResearch claude -p processes (>2h old, not resume/RC)
$staleOther = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -match 'claude.*-p ' -and
        $_.CommandLine -notmatch 'AutoResearch' -and
        $_.CommandLine -notmatch 'remote-control' -and
        $_.CommandLine -notmatch '--resume'
    }

foreach ($proc in $staleOther) {
    $age = (Get-Date) - $proc.CreationDate
    if ($age.TotalHours -gt 2) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $zombiesKilled++
        } catch { }
    }
}

if ($zombiesKilled -gt 0) {
    Write-Host "Zombie cleanup: killed $zombiesKilled stale processes"
}

# --- DRY RUN ---
if ($DryRun) {
    Write-Host "=== AUTORESEARCH LOOP - DRY RUN ==="
    Write-Host "Life-OS root:    $lifeOS"
    Write-Host "Max budget:      `$$MaxBudget per phase"
    Write-Host "Skip verifier:   $SkipVerifier"
    Write-Host "Log file:        $logFile"
    Write-Host ""
    Write-Host "Would run:"
    Write-Host "  1. AutoResearch agent (audit -> identify -> experiment -> verify -> score)"
    Write-Host "  2. Verifier agent (independently check autoresearch claims)"
    Write-Host "  3. Send Telegram summary"
    exit 0
}

# --- HEADER ---
$header = @"
# AutoResearch Loop - $timestamp
# Budget per phase: `$$MaxBudget
# ==========================================

"@
$header | Out-File $logFile -Encoding utf8

# --- Helper: Run claude -p with timeout via Start-Job ---
# Start-Process cannot launch "claude" on Windows (it's a .ps1 shim, not a .exe).
# Start-Job runs a background PowerShell that resolves claude.ps1 correctly.
function Invoke-ClaudeWithTimeout {
    param(
        [string]$Prompt,
        [string]$WorkDir,
        [decimal]$Budget,
        [int]$TimeoutSec,
        [string]$PermissionMode = "auto"
    )

    $job = Start-Job -ScriptBlock {
        param($p, $wd, $b, $pm)
        Set-Location $wd
        $result = claude -p $p --permission-mode $pm --max-budget-usd $b --no-session-persistence 2>&1
        $result -join "`n"
    } -ArgumentList $Prompt, $WorkDir, $Budget, $PermissionMode

    $completed = $job | Wait-Job -Timeout $TimeoutSec

    if ($completed) {
        $output = Receive-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        return @{ Output = $output; TimedOut = $false }
    } else {
        # Timeout -- kill the job and any child claude processes it spawned
        $job | Stop-Job -PassThru | Remove-Job -Force -ErrorAction SilentlyContinue
        return @{ Output = "[TIMEOUT] Phase killed after $([math]::Round($TimeoutSec/60))min"; TimedOut = $true }
    }
}

# --- PHASE 1: AUTORESEARCH ---
$phaseStart = Get-Date
"[$(Get-Date -Format 'HH:mm:ss')] Phase 1: AutoResearch agent starting..." | Out-File $logFile -Append

$autoresearchPrompt = @"
You are the AutoResearch agent for Life-OS. This is an AUTONOMOUS scheduled run -- no human is watching.

Read your full protocol: .claude/agents/autoresearch.md
Read current metrics: METRICS.md

Execute ONE cycle of the Karpathy loop:
1. AUDIT - Check Task Scheduler status, running processes, logs, MCP servers, Telegram bot health
2. IDENTIFY - Find the single biggest gap (broken > not running > missing > suboptimal)
3. EXPERIMENT - Fix it. One thing, done properly.
4. VERIFY - Prove it works (run the script, check logs, confirm output)
5. SCORE - Update METRICS.md with what you did and any score changes

Rules:
- Working directory: $lifeOS
- One experiment only. Do not try to fix everything.
- Never modify CLAUDE.md content (structure ok, not behavioral rules)
- Never push to git
- Be honest in scoring -- inflating defeats the purpose
- Log everything to METRICS.md Active Experiments table
- If you find the Telegram bot is down, restart it
- If you find a Task Scheduler script failing, fix it

After your cycle, output a one-line summary of what you did, formatted as:
AUTORESEARCH_SUMMARY: [what you did] | Score impact: [+X or no change] | New rating: [XX/100]
"@

$timeoutSec = $TimeoutMinutes * 60
$result = Invoke-ClaudeWithTimeout -Prompt $autoresearchPrompt -WorkDir $lifeOS -Budget $MaxBudget -TimeoutSec $timeoutSec
$output = $result.Output
if ($result.TimedOut) {
    "[TIMEOUT] Phase 1 killed after ${TimeoutMinutes}min" | Out-File $logFile -Append
}
if ($output) { $output | Out-File $logFile -Append }
"[$(Get-Date -Format 'HH:mm:ss')] Phase 1 complete. Duration: $((Get-Date) - $phaseStart)" | Out-File $logFile -Append

# Extract summary line if present
$summaryLine = ""
if ($output -match "AUTORESEARCH_SUMMARY:\s*(.+)") {
    $summaryLine = $Matches[1].Trim()
}

# --- PHASE 2: VERIFIER ---
$verifierOutput = ""
$verifierSummary = ""
if (-not $SkipVerifier) {
    Start-Sleep -Seconds 10  # Brief pause between phases

    $verifierStart = Get-Date
    "`n[$(Get-Date -Format 'HH:mm:ss')] Phase 2: Verifier agent starting..." | Out-File $logFile -Append

    $verifierPrompt = @"
You are the Verifier agent for Life-OS. This is an AUTONOMOUS scheduled run.

Read your protocol: .claude/agents/verifier.md
Read current metrics: METRICS.md

Your job: independently verify the LAST autoresearch experiment logged in METRICS.md.
- Check the actual files, processes, logs, Task Scheduler status
- Confirm or deny each claim the autoresearch agent made
- If the score was inflated, adjust it down with explanation
- If something was missed, note it for the next autoresearch cycle
- Update METRICS.md with your verification notes

Be ruthlessly honest. The autoresearch agent's claims are not trusted until you verify them.

After verification, output:
VERIFIER_SUMMARY: [verified/adjusted/failed] | [one line explanation]
"@

    $vfResult = Invoke-ClaudeWithTimeout -Prompt $verifierPrompt -WorkDir $lifeOS -Budget $MaxBudget -TimeoutSec $timeoutSec
    $verifierOutput = $vfResult.Output
    if ($vfResult.TimedOut) {
        "[TIMEOUT] Phase 2 killed after ${TimeoutMinutes}min" | Out-File $logFile -Append
    }
    if ($verifierOutput) { $verifierOutput | Out-File $logFile -Append }
    "[$(Get-Date -Format 'HH:mm:ss')] Phase 2 complete. Duration: $((Get-Date) - $verifierStart)" | Out-File $logFile -Append

    # Extract verifier summary
    if ($verifierOutput -match "VERIFIER_SUMMARY:\s*(.+)") {
        $verifierSummary = $Matches[1].Trim()
    }
}

# --- SUMMARY ---
$totalDuration = (Get-Date) - $phaseStart
"`n# Run Complete" | Out-File $logFile -Append
"Total duration: $totalDuration" | Out-File $logFile -Append
"Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File $logFile -Append

# --- TELEGRAM NOTIFICATION ---
$sendScript = "$lifeOS\.claude\telegram\send.js"
if (Test-Path $sendScript) {
    $hour = (Get-Date).Hour
    # Only send Telegram notifications between 8am and 11pm to avoid waking the CEO
    if ($hour -ge 8 -and $hour -lt 23) {
        if ($summaryLine) {
            $telegramMsg = "AutoResearch: $summaryLine"
        } else {
            $telegramMsg = "AutoResearch cycle complete. Check logs: autoresearch-$timestamp.log"
        }
        if ($verifierSummary) {
            $telegramMsg += "`nVerifier: $verifierSummary"
        }
        try {
            node $sendScript $telegramMsg 2>&1 | Out-Null
        }
        catch {
            "WARNING: Failed to send Telegram notification: $_" | Out-File $logFile -Append
        }
    } else {
        "Skipping Telegram notification (quiet hours: $hour)" | Out-File $logFile -Append
    }
}

# --- CLEANUP OLD LOGS ---
# Keep last 7 days of autoresearch logs to prevent disk bloat
$cutoff = (Get-Date).AddDays(-7)
Get-ChildItem "$logDir\autoresearch-*.log" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force 2>$null
Get-ChildItem "$logDir\ar-*.txt" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force 2>$null
Get-ChildItem "$logDir\vf-*.txt" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force 2>$null

Write-Host "AutoResearch loop complete. Log: $logFile"
exit 0
