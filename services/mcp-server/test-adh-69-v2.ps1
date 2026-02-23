$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"
$exe = "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"

function Invoke-McpTool {
    param($ToolName, $Arguments)
    $json = @{
        jsonrpc = "2.0"
        id = 1
        method = "tools/call"
        params = @{
            name = $ToolName
            arguments = $Arguments
        }
    } | ConvertTo-Json -Depth 10 -Compress

    # Redirect stderr to $null, capture stdout
    $output = $json | & $exe 2>$null

    # Find the JSON-RPC response in the output
    foreach ($line in $output) {
        if ($line -match '^{"jsonrpc"') {
            return $line | ConvertFrom-Json
        }
    }
    return $null
}

Write-Host "=== Testing MagicMcp on ADH IDE 69 ===" -ForegroundColor Cyan
Write-Host "Loading projects..." -ForegroundColor Gray

# Test 1: magic_get_position
Write-Host "`n1. magic_get_position (ADH, program 69)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_position" @{ project = "ADH"; programId = 69 }
if ($result -and $result.result) {
    $content = $result.result.content[0].text
    Write-Host $content
} elseif ($result -and $result.error) {
    Write-Host "ERROR: $($result.error.message)" -ForegroundColor Red
} else {
    Write-Host "No result" -ForegroundColor Red
}

# Test 2: magic_get_tree
Write-Host "`n2. magic_get_tree (ADH, program 69)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_tree" @{ project = "ADH"; programId = 69 }
if ($result -and $result.result) {
    $content = $result.result.content[0].text
    # Show first 30 lines
    $lines = $content -split "`n"
    $lines | Select-Object -First 30 | ForEach-Object { Write-Host $_ }
    if ($lines.Count -gt 30) {
        Write-Host "... ($($lines.Count - 30) more lines)" -ForegroundColor Gray
    }
} elseif ($result -and $result.error) {
    Write-Host "ERROR: $($result.error.message)" -ForegroundColor Red
}

# Test 3: magic_get_dataview (root task)
Write-Host "`n3. magic_get_dataview (ADH, program 69, isn2=1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_dataview" @{ project = "ADH"; programId = 69; isn2 = 1 }
if ($result -and $result.result) {
    $content = $result.result.content[0].text
    $lines = $content -split "`n"
    $lines | Select-Object -First 50 | ForEach-Object { Write-Host $_ }
    if ($lines.Count -gt 50) {
        Write-Host "... ($($lines.Count - 50) more lines)" -ForegroundColor Gray
    }
} elseif ($result -and $result.error) {
    Write-Host "ERROR: $($result.error.message)" -ForegroundColor Red
}

# Test 4: magic_get_logic (root task, first 10 lines)
Write-Host "`n4. magic_get_logic (ADH, program 69, isn2=1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_logic" @{ project = "ADH"; programId = 69; isn2 = 1 }
if ($result -and $result.result) {
    $content = $result.result.content[0].text
    $lines = $content -split "`n"
    $lines | Select-Object -First 25 | ForEach-Object { Write-Host $_ }
    if ($lines.Count -gt 25) {
        Write-Host "... ($($lines.Count - 25) more lines)" -ForegroundColor Gray
    }
} elseif ($result -and $result.error) {
    Write-Host "ERROR: $($result.error.message)" -ForegroundColor Red
}

# Test 5: magic_get_expression
Write-Host "`n5. magic_get_expression (ADH, program 69, expression 1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_expression" @{ project = "ADH"; programId = 69; expressionId = 1 }
if ($result -and $result.result) {
    $content = $result.result.content[0].text
    Write-Host $content
} elseif ($result -and $result.error) {
    Write-Host "ERROR: $($result.error.message)" -ForegroundColor Red
}

Write-Host "`n=== Tests complete ===" -ForegroundColor Cyan
