# Life-OS Telegram Bot -- Persistent Launcher with Crash Recovery + Log Rotation
# Registered as LifeOS-TelegramBot in Task Scheduler (runs at login)

. "$PSScriptRoot\..\config.ps1"
$botDir = "$lifeOS\.claude\telegram"
$logFile = "$botDir\bot.log"
$maxLogSizeKB = 100 # Rotate when log exceeds 100KB
$consecutiveCrashes = 0
$maxConsecutiveCrashes = 20

# Ensure clean environment
Remove-Item Env:\CLAUDECODE -ErrorAction SilentlyContinue
Remove-Item Env:\CLAUDE_CODE_ENTRYPOINT -ErrorAction SilentlyContinue
Get-Variable -Name "env:CLAUDE_CODE_*" -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item "Env:\$($_.Name)" -ErrorAction SilentlyContinue }

# Kill any existing bot instances
Get-WmiObject Win32_Process -Filter "CommandLine LIKE '%telegram%bot.js%' AND Name='node.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2
Set-Location $botDir

# Auto-restart loop -- if bot crashes, wait and restart with escalating backoff
while ($true) {
    # --- Log rotation: keep last 50 lines when log exceeds max size ---
    if (Test-Path $logFile) {
        $logSize = (Get-Item $logFile).Length / 1KB
        if ($logSize -gt $maxLogSizeKB) {
            $lastLines = Get-Content $logFile -Tail 50
            "--- LOG ROTATED $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ---" | Set-Content $logFile
            $lastLines | Add-Content $logFile
        }
    }

    $startTime = Get-Date
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -- Bot starting (crash count: $consecutiveCrashes)..." >> $logFile
    & node "$botDir\bot.js" *>> $logFile
    $exitCode = $LASTEXITCODE
    $runtime = ((Get-Date) - $startTime).TotalSeconds

    # If bot ran for more than 60 seconds, reset crash counter (it was stable for a while)
    if ($runtime -gt 60) {
        $consecutiveCrashes = 0
    } else {
        $consecutiveCrashes++
    }

    # Escalating backoff: 5s, 10s, 20s, 30s, 60s
    $delays = @(5, 10, 20, 30, 60)
    $delayIdx = [Math]::Min($consecutiveCrashes, $delays.Length - 1)
    $delay = $delays[$delayIdx]

    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -- Bot exited (code: $exitCode, runtime: $([Math]::Round($runtime))s). Restarting in ${delay}s..." >> $logFile

    # Circuit breaker: if too many rapid crashes, pause longer
    if ($consecutiveCrashes -ge $maxConsecutiveCrashes) {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -- CIRCUIT BREAKER: $maxConsecutiveCrashes rapid crashes. Pausing 5 minutes." >> $logFile
        Start-Sleep -Seconds 300
        $consecutiveCrashes = 0
    } else {
        Start-Sleep -Seconds $delay
    }
}
