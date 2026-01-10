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

    $result = $json | & $exe 2>$null | Where-Object { $_ -match '^\{' }
    return $result
}

Write-Host "=== Testing MagicMcp on ADH IDE 69 ===" -ForegroundColor Cyan

# Test 1: magic_get_position
Write-Host "`n1. magic_get_position (ADH, program 69)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_position" @{ project = "ADH"; programId = 69 }
Write-Host $result

# Test 2: magic_get_tree
Write-Host "`n2. magic_get_tree (ADH, program 69)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_tree" @{ project = "ADH"; programId = 69 }
Write-Host $result

# Test 3: magic_get_dataview (root task)
Write-Host "`n3. magic_get_dataview (ADH, program 69, isn2=1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_dataview" @{ project = "ADH"; programId = 69; isn2 = 1 }
Write-Host $result

# Test 4: magic_get_logic (root task)
Write-Host "`n4. magic_get_logic (ADH, program 69, isn2=1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_logic" @{ project = "ADH"; programId = 69; isn2 = 1 }
Write-Host $result

# Test 5: magic_get_expression
Write-Host "`n5. magic_get_expression (ADH, program 69, expression 1)" -ForegroundColor Yellow
$result = Invoke-McpTool "magic_get_expression" @{ project = "ADH"; programId = 69; expressionId = 1 }
Write-Host $result

Write-Host "`n=== Tests complete ===" -ForegroundColor Cyan
