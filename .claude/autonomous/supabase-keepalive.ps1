# Life-OS Supabase Keep-Alive
# Runs every 5 days via Windows Task Scheduler
# Pings Supabase REST API to prevent free-tier auto-pause (7-day inactivity limit)

$supabaseUrl = "https://vfzqeatoaswwdupibgup.supabase.co/rest/v1/"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenFlYXRvYXN3d2R1cGliZ3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDY3MDEsImV4cCI6MjA4NDA4MjcwMX0.8FKc_PxpGC3vdys1Rg0sTHVIKrFRKDfEYVFtZbF5vZ8"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$lifeOS = "C:\Users\Pc\desktop\life-os"
$logFile = "$lifeOS\.claude\autonomous\logs\supabase-keepalive.log"

try {
    $response = Invoke-WebRequest -Uri $supabaseUrl -Headers @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
    } -TimeoutSec 15 -UseBasicParsing

    $status = $response.StatusCode
    "$timestamp | OK ($status) - Supabase alive" | Out-File $logFile -Append

} catch {
    $error_msg = $_.Exception.Message
    "$timestamp | FAIL - $error_msg" | Out-File $logFile -Append

    # Alert via Telegram if Supabase is down
    $sendJs = "$lifeOS\.claude\telegram\send.js"
    if (Test-Path $sendJs) {
        node $sendJs "SUPABASE DOWN: Al Wilaya database unreachable. Error: $error_msg. Go to supabase.com/dashboard to restore the project."
    }

    # Also write to urgent briefings
    $urgentFile = "$lifeOS\briefings\urgent.md"
    "## [$timestamp] Supabase Down`n- Al Wilaya database unreachable`n- Error: $error_msg`n- Action: Restore at supabase.com/dashboard`n" | Out-File $urgentFile -Append
}
