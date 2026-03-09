# Life-OS Telegram Tunnel — One-shot FileSystemWatcher (synchronous)
# Uses WaitForChanged — blocks until queue.json is modified, then checks for "pending"

$dir = $PSScriptRoot
$queueFile = Join-Path $dir "queue.json"

# Check immediately on startup in case a message is already pending
if (Test-Path $queueFile) {
    try {
        $queue = Get-Content $queueFile -Raw -ErrorAction Stop | ConvertFrom-Json
        if ($queue.status -eq "pending") {
            Write-Output "QUEUE_MESSAGE|$($queue.id)|$($queue.message)"
            exit 0
        }
    } catch {}
}

$watcher = New-Object System.IO.FileSystemWatcher $dir, "queue.json"
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::Size
$watcher.EnableRaisingEvents = $false  # using synchronous WaitForChanged

$deadline = (Get-Date).AddSeconds(540)

while ((Get-Date) -lt $deadline) {
    $remainingMs = [int](($deadline - (Get-Date)).TotalMilliseconds)
    if ($remainingMs -le 0) { break }
    $waitMs = [Math]::Min($remainingMs, 10000)  # wait up to 10s per cycle

    $result = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::Changed, $waitMs)

    if (-not $result.TimedOut) {
        Start-Sleep -Milliseconds 150  # debounce

        if (Test-Path $queueFile) {
            try {
                $raw = Get-Content $queueFile -Raw -ErrorAction Stop
                $queue = $raw | ConvertFrom-Json
                if ($queue.status -eq "pending") {
                    Write-Output "QUEUE_MESSAGE|$($queue.id)|$($queue.message)"
                    $watcher.Dispose()
                    exit 0
                }
            } catch {
                continue
            }
        }
    }
}

$watcher.Dispose()
Write-Output "WATCHER_TIMEOUT"
