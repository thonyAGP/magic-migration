# Test Jira authentication
$envFile = "D:\Projects\Lecteur Magic\.env"

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

$email = $env:JIRA_EMAIL
$token = $env:JIRA_TOKEN
$baseUrl = $env:JIRA_BASE_URL

Write-Host "Email: $email"
Write-Host "Token: $($token.Substring(0, [Math]::Min(5, $token.Length)))..."
Write-Host "Base URL: $baseUrl"

$cred = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${email}:${token}"))
$headers = @{ Authorization = "Basic $cred" }

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/rest/api/3/myself" -Headers $headers
    Write-Host "`nAuth OK: $($r.displayName) ($($r.emailAddress))"
} catch {
    Write-Host "`nAuth FAILED: $($_.Exception.Message)"
}
