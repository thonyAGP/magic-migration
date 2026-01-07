param(
    [Parameter(Mandatory=$true)]
    [string]$IssueKey,

    [switch]$WithComments,
    [switch]$WithAttachments,
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

function Get-JiraIssue {
    param([string]$Key)

    $expand = "renderedFields"
    $url = "$baseUrl/rest/api/3/issue/${Key}?expand=$expand"

    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers
        return $response
    } catch {
        Write-Error "Failed to fetch issue $Key : $($_.Exception.Message)"
        return $null
    }
}

function Get-JiraComments {
    param([string]$Key)

    $url = "$baseUrl/rest/api/3/issue/$Key/comment"

    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers
        return $response.comments
    } catch {
        Write-Error "Failed to fetch comments: $($_.Exception.Message)"
        return @()
    }
}

function Get-JiraAttachments {
    param($Issue)

    $attachments = $Issue.fields.attachment
    if (-not $attachments) { return @() }

    return $attachments | ForEach-Object {
        @{
            filename = $_.filename
            size = $_.size
            mimeType = $_.mimeType
            url = $_.content
            thumbnail = $_.thumbnail
            created = $_.created
        }
    }
}

function ConvertFrom-AtlassianDoc {
    param($Doc)

    if (-not $Doc -or -not $Doc.content) { return "" }

    $nl = [Environment]::NewLine
    $text = ""

    foreach ($block in $Doc.content) {
        switch ($block.type) {
            "paragraph" {
                foreach ($item in $block.content) {
                    if ($item.type -eq "text") {
                        $text += $item.text
                    } elseif ($item.type -eq "hardBreak") {
                        $text += $nl
                    } elseif ($item.type -eq "mention") {
                        $text += "@" + $item.attrs.text
                    }
                }
                $text += $nl
            }
            "bulletList" {
                foreach ($listItem in $block.content) {
                    $text += "  - "
                    foreach ($p in $listItem.content) {
                        foreach ($item in $p.content) {
                            if ($item.type -eq "text") {
                                $text += $item.text
                            }
                        }
                    }
                    $text += $nl
                }
            }
            "orderedList" {
                $i = 1
                foreach ($listItem in $block.content) {
                    $text += "  $i. "
                    foreach ($p in $listItem.content) {
                        foreach ($item in $p.content) {
                            if ($item.type -eq "text") {
                                $text += $item.text
                            }
                        }
                    }
                    $text += $nl
                    $i++
                }
            }
            "codeBlock" {
                $text += "[CODE BLOCK]" + $nl
                foreach ($item in $block.content) {
                    if ($item.type -eq "text") {
                        $text += $item.text
                    }
                }
                $text += $nl + "[/CODE BLOCK]" + $nl
            }
            "mediaSingle" {
                $text += "[IMAGE]" + $nl
            }
        }
    }

    return $text.Trim()
}

function Format-IssueOutput {
    param($Issue, $Comments, $Attachments)

    $fields = $Issue.fields
    $nl = [Environment]::NewLine
    $sep = "=" * 80

    $output = $sep + $nl
    $output += "JIRA TICKET: $($Issue.key)" + $nl
    $output += $sep + $nl + $nl

    $output += "TITLE: $($fields.summary)" + $nl
    $output += "STATUS: $($fields.status.name)" + $nl
    $output += "PRIORITY: $(if($fields.priority) { $fields.priority.name } else { 'None' })" + $nl
    $output += "TYPE: $($fields.issuetype.name)" + $nl + $nl

    $reporterEmail = if($fields.reporter.emailAddress) { $fields.reporter.emailAddress } else { "N/A" }
    $output += "REPORTER: $($fields.reporter.displayName) ($reporterEmail)" + $nl

    if($fields.assignee) {
        $assigneeEmail = if($fields.assignee.emailAddress) { $fields.assignee.emailAddress } else { "N/A" }
        $output += "ASSIGNEE: $($fields.assignee.displayName) ($assigneeEmail)" + $nl
    } else {
        $output += "ASSIGNEE: Unassigned" + $nl
    }

    $output += $nl
    $output += "CREATED: $($fields.created)" + $nl
    $output += "UPDATED: $($fields.updated)" + $nl + $nl

    $output += "LABELS: $(if($fields.labels.Count -gt 0) { $fields.labels -join ', ' } else { 'None' })" + $nl + $nl

    $output += "-" * 80 + $nl
    $output += "DESCRIPTION:" + $nl
    $output += "-" * 80 + $nl
    $output += (ConvertFrom-AtlassianDoc $fields.description) + $nl

    if ($Comments -and $Comments.Count -gt 0) {
        $output += $nl + "-" * 80 + $nl
        $output += "COMMENTS ($($Comments.Count)):" + $nl
        $output += "-" * 80 + $nl

        foreach ($comment in $Comments) {
            $output += $nl + "[$($comment.created)] $($comment.author.displayName):" + $nl
            $output += (ConvertFrom-AtlassianDoc $comment.body) + $nl
            $output += "---" + $nl
        }
    }

    if ($Attachments -and $Attachments.Count -gt 0) {
        $output += $nl + "-" * 80 + $nl
        $output += "ATTACHMENTS ($($Attachments.Count)):" + $nl
        $output += "-" * 80 + $nl

        foreach ($att in $Attachments) {
            $sizeKB = [math]::Round($att.size / 1024, 1)
            $output += "  - $($att.filename) (${sizeKB} KB) - $($att.mimeType)" + $nl
            $output += "    URL: $($att.url)" + $nl
        }
    }

    return $output
}

# Main execution
$issue = Get-JiraIssue -Key $IssueKey

if (-not $issue) {
    exit 1
}

if ($Raw) {
    $issue | ConvertTo-Json -Depth 10
    exit 0
}

$comments = @()
if ($WithComments) {
    $comments = Get-JiraComments -Key $IssueKey
}

$attachments = @()
if ($WithAttachments) {
    $attachments = Get-JiraAttachments -Issue $issue
}

Format-IssueOutput -Issue $issue -Comments $comments -Attachments $attachments
