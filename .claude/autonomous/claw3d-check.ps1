# Life-OS Claw3D Open Source Monitor
# Runs daily -- checks if claw3d.ai has released their GitHub repo
# Notifies CEO via Telegram when it goes live

. "$PSScriptRoot\..\config.ps1"

try {
    # Use HttpClient with strict timeout -- Invoke-WebRequest -TimeoutSec hangs on DNS/connection failures
    $handler = New-Object System.Net.Http.HttpClientHandler
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [TimeSpan]::FromSeconds(10)

    $task = $client.GetStringAsync("https://www.claw3d.ai/")
    $completed = $task.Wait(15000)  # 15 second hard cutoff

    if ($completed -and $task.Status -eq 'RanToCompletion') {
        $content = $task.Result

        # Look for GitHub links, open source mentions, or repo URLs
        $hasGitHub = $content -match "github\.com" -or $content -match "open.?source" -or $content -match "repository"

        if ($hasGitHub) {
            $githubUrl = [regex]::Match($content, 'href="(https?://github\.com/[^"]+)"').Groups[1].Value

            $msg = "CLAW3D ALERT: Open source detected on claw3d.ai!`n`n"
            if ($githubUrl) {
                $msg += "GitHub: $githubUrl`n"
            }
            $msg += "Go check it out: https://www.claw3d.ai/"

            node "$lifeOS\.claude\telegram\send.js" $msg
        }
    }
    # If not completed or not successful -- site is down, silent pass

    $client.Dispose()
} catch {
    # Site down, DNS failure, timeout, or any other error -- silent fail
}

exit 0
