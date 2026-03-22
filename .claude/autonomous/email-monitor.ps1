# Life-OS Autonomous Email Monitor
# Runs every 2 hours via Task Scheduler
# Uses gws CLI directly (no Claude API cost)
# Checks for urgent emails from known contacts and flags them

. "$PSScriptRoot\..\config.ps1"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$logFile = "$lifeOS\.claude\autonomous\logs\email-$timestamp.log"
$briefingFile = "$lifeOS\briefings\email-check-${timestamp}.md"

# Centralized stagger delay (config.ps1 Get-StaggerDelay)
# Normal: 3-10s. Wake-from-sleep batch: 5-15s (Tier 1, lightweight gws)
$delay = Get-StaggerDelay -ScriptName "email-monitor"
Start-Sleep -Seconds $delay

"[$timestamp] Email monitor started (delayed ${delay}s)" | Out-File $logFile -Encoding utf8

try {
    $emailOutput = & gws gmail +triage 2>&1 | Out-String
    "[$timestamp] gws gmail +triage returned $($emailOutput.Length) chars" | Out-File $logFile -Append -Encoding utf8

    if (-not $emailOutput -or $emailOutput.Length -lt 10) {
        "[$timestamp] No email data returned" | Out-File $logFile -Append -Encoding utf8
        "No email data available at $(Get-Date -Format 'HH:mm'). gws may need re-auth." | Out-File $briefingFile -Encoding utf8
        exit 0
    }

    $knownContacts = @("Mo ", "Boz", "Summer", "Nebo", "Kourosh", "Hadi", "Tiffany", "Manas", "Dan ")
    $urgentKeywords = @("payment", "invoice", "deadline", "urgent", "milestone", "overdue", "wire", "transfer", "meeting changed", "cancell")

    $urgentItems = @()
    $lines = $emailOutput -split "`n"

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed -match "^date\s" -or $trimmed -match "^---") { continue }

        $isUrgent = $false
        $reason = ""

        foreach ($contact in $knownContacts) {
            if ($trimmed -match [regex]::Escape($contact)) {
                $isUrgent = $true
                $reason = "Known contact: $contact"
                break
            }
        }

        if (-not $isUrgent) {
            foreach ($keyword in $urgentKeywords) {
                if ($trimmed -match "(?i)$([regex]::Escape($keyword))") {
                    $isUrgent = $true
                    $reason = "Keyword: $keyword"
                    break
                }
            }
        }

        if ($isUrgent) {
            $urgentItems += @{ Line = $trimmed; Reason = $reason }
        }
    }

    $totalEmails = ($lines | Where-Object { $_ -match "\d{4}\s+\d{2}:\d{2}:\d{2}" }).Count

    $briefing = @()
    $briefing += "# Email Check -- $(Get-Date -Format 'HH:mm MMM dd')"
    $briefing += ""
    $briefing += "**Total unread**: $totalEmails"
    $briefing += ""

    if ($urgentItems.Count -gt 0) {
        $briefing += "## Flagged Items ($($urgentItems.Count))"
        $briefing += ""
        foreach ($item in $urgentItems) {
            $briefing += "- **[$($item.Reason)]** $($item.Line)"
        }
        $briefing += ""

        $urgentFile = "$lifeOS\briefings\urgent.md"
        $urgentEntry = @()
        $urgentEntry += ""
        $urgentEntry += "## Email Alert -- $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        foreach ($item in $urgentItems) {
            $urgentEntry += "- **[$($item.Reason)]** $($item.Line)"
        }
        ($urgentEntry -join "`n") | Out-File $urgentFile -Append -Encoding utf8

        $telegramMsg = "Email Alert ($($urgentItems.Count) flagged):`n"
        foreach ($item in $urgentItems) {
            $telegramMsg += "- [$($item.Reason)] $($item.Line)`n"
        }
        try {
            & # TELEGRAM DISABLED: node "$lifeOS\.claude\telegram\send.js" $telegramMsg 2>&1 | Out-Null
            "[$timestamp] Telegram sent: $($urgentItems.Count) urgent items" | Out-File $logFile -Append -Encoding utf8
        } catch {
            "[$timestamp] Telegram send failed: $_" | Out-File $logFile -Append -Encoding utf8
        }
    } else {
        $briefing += "No urgent emails. All clear."
    }

    ($briefing -join "`n") | Out-File $briefingFile -Encoding utf8
    "[$timestamp] Result: $totalEmails total, $($urgentItems.Count) flagged" | Out-File $logFile -Append -Encoding utf8

} catch {
    "[$timestamp] ERROR: $_" | Out-File $logFile -Append -Encoding utf8
    "Email monitor error at $(Get-Date -Format 'HH:mm'): $_" | Out-File $briefingFile -Encoding utf8
}

"[$timestamp] Email monitor complete" | Out-File $logFile -Append -Encoding utf8
exit 0
