param(
    [Parameter(Mandatory=$true)]
    [string]$IssueKey,

    [string]$OutputDir
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

# Get issue with attachments
$url = "$baseUrl/rest/api/3/issue/$IssueKey"
try {
    $issue = Invoke-RestMethod -Uri $url -Headers $headers
} catch {
    Write-Error "Failed to fetch issue $IssueKey : $($_.Exception.Message)"
    exit 1
}

$attachments = $issue.fields.attachment
if (-not $attachments -or $attachments.Count -eq 0) {
    Write-Host "No attachments found for $IssueKey"
    exit 0
}

# Determine output directory
if (-not $OutputDir) {
    # Default: .openspec/tickets/{KEY}/attachments/
    $OutputDir = Join-Path $projectRoot ".openspec\tickets\$IssueKey\attachments"
}

# Create output directory
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

Write-Host "Downloading $($attachments.Count) attachments to $OutputDir"

foreach ($att in $attachments) {
    $outPath = Join-Path $OutputDir $att.filename
    Write-Host "  Downloading: $($att.filename)..."
    try {
        Invoke-WebRequest -Uri $att.content -Headers $headers -OutFile $outPath
    } catch {
        Write-Warning "Failed to download $($att.filename): $($_.Exception.Message)"
    }
}

Write-Host "Done!"
Get-ChildItem $OutputDir | Format-Table Name, Length
