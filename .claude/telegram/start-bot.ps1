# Life-OS Telegram Bot — Persistent Launcher with Crash Recovery
# Registered as LifeOS-TelegramBot in Task Scheduler (runs at login)

. "$PSScriptRoot\..\config.ps1"
$botDir = "$lifeOS\.claude\telegram"
$logFile = "$botDir\bot.log"

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

# Auto-restart loop — if bot crashes, wait 5s and restart
while ($true) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') — Bot starting..." >> $logFile
    & node "$botDir\bot.js" *>> $logFile
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') — Bot exited. Restarting in 5s..." >> $logFile
    Start-Sleep -Seconds 5
}
