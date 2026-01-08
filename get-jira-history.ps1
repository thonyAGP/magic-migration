param(
    [Parameter(Mandatory=$true)]
    [string]$IssueKey
)

# Load credentials from .env file
$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Missing .env file at $envFile"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

$email = $env:JIRA_EMAIL
$token = $env:JIRA_TOKEN
$baseUrl = $env:JIRA_BASE_URL

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${token}"))
$headers = @{
    'Authorization' = "Basic $auth"
    'Content-Type' = 'application/json'
}

# Get issue with changelog
$response = Invoke-RestMethod -Uri "$baseUrl/rest/api/3/issue/${IssueKey}?expand=changelog" -Headers $headers -Method Get

Write-Host "`n=== HISTORIQUE $IssueKey ===" -ForegroundColor Cyan

$statusChanges = $response.changelog.histories | ForEach-Object {
    $history = $_
    $_.items | Where-Object { $_.field -eq "status" } | ForEach-Object {
        [PSCustomObject]@{
            Date = $history.created
            Author = $history.author.displayName
            From = $_.fromString
            To = $_.toString
        }
    }
}

if ($statusChanges) {
    Write-Host "`nChangements de statut:" -ForegroundColor Yellow
    $statusChanges | ForEach-Object {
        $date = [DateTime]::Parse($_.Date).ToString("yyyy-MM-dd HH:mm")
        Write-Host "  $date - $($_.Author): $($_.From) -> $($_.To)"
    }
} else {
    Write-Host "Aucun changement de statut trouve" -ForegroundColor Yellow
}

# Also show last 5 changes
Write-Host "`nDernieres modifications:" -ForegroundColor Yellow
$response.changelog.histories | Select-Object -Last 10 | ForEach-Object {
    $date = [DateTime]::Parse($_.created).ToString("yyyy-MM-dd HH:mm")
    $author = $_.author.displayName
    $changes = ($_.items | ForEach-Object { "$($_.field): $($_.fromString) -> $($_.toString)" }) -join ", "
    Write-Host "  $date - $author"
    Write-Host "    $changes" -ForegroundColor DarkGray
}
