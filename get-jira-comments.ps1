param(
    [Parameter(Mandatory=$true)]
    [string]$IssueKey
)

# Load credentials
$envPath = Join-Path $PSScriptRoot ".claude\scripts\.env.ps1"
if (Test-Path $envPath) {
    . $envPath
} else {
    Write-Host "Fichier .env.ps1 non trouve: $envPath" -ForegroundColor Red
    exit 1
}

$headers = @{
    'Authorization' = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${env:JIRA_EMAIL}:${env:JIRA_API_TOKEN}"))
    'Content-Type' = 'application/json'
}

$baseUrl = $env:JIRA_BASE_URL
$response = Invoke-RestMethod -Uri "$baseUrl/rest/api/3/issue/$IssueKey/comment" -Headers $headers -Method Get

Write-Host "`n=== COMMENTAIRES $IssueKey ===" -ForegroundColor Cyan

if ($response.comments.Count -eq 0) {
    Write-Host "Aucun commentaire" -ForegroundColor Yellow
} else {
    foreach ($comment in $response.comments) {
        Write-Host "`n---" -ForegroundColor DarkGray
        Write-Host "Auteur: $($comment.author.displayName)" -ForegroundColor Green
        Write-Host "Date: $($comment.created)"

        # Extract text from Atlassian Document Format
        $body = ""
        foreach ($content in $comment.body.content) {
            foreach ($item in $content.content) {
                if ($item.text) {
                    $body += $item.text
                }
            }
            $body += "`n"
        }
        Write-Host "Message:`n$body"
    }
}
