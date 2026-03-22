# Test: Does FileSystemWatcher detect changes to queue.json?
$dir = "C:\Users\Pc\desktop\life-os\.claude\telegram"
$queueFile = Join-Path $dir "queue.json"

# Reset queue
'{"status": "idle"}' | Set-Content $queueFile

# Start watcher
$watcher = New-Object System.IO.FileSystemWatcher $dir, "queue.json"
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::Size

Write-Output "Watcher ready. Writing test message in 2 seconds..."
Start-Sleep -Seconds 2

# Write a pending message from a background job (simulates bot.js)
$job = Start-Job -ArgumentList $queueFile -ScriptBlock {
    param($file)
    $data = @{
        id = "test_123"
        chatId = 8660809794
        message = "watcher test message"
        status = "pending"
        timestamp = (Get-Date -Format o)
        response = $null
        error = $null
    } | ConvertTo-Json
    Start-Sleep -Seconds 1
    Set-Content $file $data
    Write-Output "Wrote pending message"
}

# Wait for change
Write-Output "Waiting for file change..."
$result = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::Changed, 10000)

if (-not $result.TimedOut) {
    Start-Sleep -Milliseconds 200
    $q = Get-Content $queueFile -Raw | ConvertFrom-Json
    Write-Output "SUCCESS: Detected change! status=$($q.status) message=$($q.message)"
} else {
    Write-Output "FAIL: Timed out - no change detected"
}

$watcher.Dispose()
Receive-Job $job -Wait
Remove-Job $job -Force
