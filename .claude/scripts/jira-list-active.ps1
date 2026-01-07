param(
    [string[]]$Projects = @("CMDS", "PMS"),
    [string]$StatusFilter = "NOT IN (Done, Closed, Resolved, Termine, Ferme)",
    [switch]$Raw
)

# Load credentials from .env file
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Missing .env file at $envFile - Create it with JIRA_EMAIL, JIRA_TOKEN, JIRA_BASE_URL"
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

if (-not $email -or -not $token -or -not $baseUrl) {
    Write-Error "Missing JIRA_EMAIL, JIRA_TOKEN or JIRA_BASE_URL in .env"
    exit 1
}

$cred = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${email}:${token}"))
$headers = @{
    Authorization = "Basic $cred"
}

# Build JQL query
$projectFilter = ($Projects | ForEach-Object { "project = $_" }) -join " OR "
$jql = "($projectFilter) AND status $StatusFilter ORDER BY updated DESC"

$fields = "key,summary,status,assignee,priority,updated,created"
$url = "$baseUrl/rest/api/3/search?jql=$([Uri]::EscapeDataString($jql))&fields=$fields&maxResults=50"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers

    if ($Raw) {
        $response | ConvertTo-Json -Depth 10
        exit 0
    }

    $tickets = $response.issues | ForEach-Object {
        [PSCustomObject]@{
            key = $_.key
            summary = $_.fields.summary
            status = $_.fields.status.name
            assignee = if ($_.fields.assignee) { $_.fields.assignee.displayName } else { "Non assigne" }
            priority = if ($_.fields.priority) { $_.fields.priority.name } else { "None" }
            updated = $_.fields.updated
            created = $_.fields.created
        }
    }

    # Output as JSON for easy parsing
    $tickets | ConvertTo-Json -Depth 5

} catch {
    Write-Error "Jira API Error: $($_.Exception.Message)"
    exit 1
}
