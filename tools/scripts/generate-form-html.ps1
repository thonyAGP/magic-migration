# generate-form-html.ps1
# Generate HTML from Magic form controls using MCP
# Usage: .\generate-form-html.ps1 -Project ADH -ProgramId 121 -OutputFile index.html

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$ProgramId,

    [Parameter(Mandatory=$false)]
    [int]$TaskIsn2 = 1,

    [Parameter(Mandatory=$false)]
    [string]$OutputFile,

    [switch]$Preview
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# MCP Executable
$McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
if (-not (Test-Path $McpExe)) {
    $McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Debug\net8.0\MagicMcp.exe"
}

if (-not (Test-Path $McpExe)) {
    Write-Error "MagicMcp.exe not found. Build with: dotnet build tools/MagicMcp -c Release"
    exit 1
}

# Output file
if (-not $OutputFile) {
    $OutputFile = Join-Path $env:TEMP "form-$Project-$ProgramId.html"
}

Write-Host "=== Magic Form to HTML Generator ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "Program: IDE $ProgramId"
Write-Host "Task: ISN_2 $TaskIsn2"
Write-Host ""

# Get forms using MCP (by calling the tool directly with KB)
# For now, we'll read the XML directly as a workaround
$XmlPath = "D:\Data\Migration\XPA\PMS\$Project\Source\Prg_$ProgramId.xml"

if (-not (Test-Path $XmlPath)) {
    Write-Error "Program XML not found: $XmlPath"
    exit 1
}

Write-Host "Reading: $XmlPath" -ForegroundColor Gray

[xml]$PrgXml = Get-Content $XmlPath -Encoding UTF8

# Find task with ISN_2 match (ISN_2 is in Header element)
$Task = $PrgXml.Application.Task | Where-Object { $_.Header.ISN_2 -eq $TaskIsn2 }
if (-not $Task) {
    # Try nested tasks
    $AllTasks = $PrgXml.SelectNodes("//Task[Header/@ISN_2='$TaskIsn2']")
    if ($AllTasks.Count -gt 0) {
        $Task = $AllTasks[0]
    }
}
if (-not $Task) {
    Write-Error "Task ISN_2=$TaskIsn2 not found"
    exit 1
}

$TaskName = $Task.Header.Description
if (-not $TaskName) { $TaskName = "Task $TaskIsn2" }
Write-Host "Task: $TaskName" -ForegroundColor Gray

# Extract forms
$Forms = @()
$FormEntries = $Task.Forms.FormEntry

if (-not $FormEntries) {
    Write-Host "[WARN] No forms found in this task" -ForegroundColor Yellow
    exit 0
}

foreach ($FormEntry in $FormEntries) {
    $FormData = $FormEntry.Property | Where-Object { $_.name -eq "Form" }
    $Form = @{
        Name = $FormEntry.name
        Id = $FormEntry.ISN
        Width = ($FormEntry.Property | Where-Object { $_.name -eq "Width" }).val
        Height = ($FormEntry.Property | Where-Object { $_.name -eq "Height" }).val
        WindowType = ($FormEntry.Property | Where-Object { $_.name -eq "WindowType" }).val
        Controls = @()
    }

    # Extract controls
    $Columns = $FormEntry.Columns.Column
    if ($Columns) {
        foreach ($Col in $Columns) {
            $Control = @{
                Type = ($Col.Property | Where-Object { $_.name -eq "ControlStyle" }).val
                X = ($Col.Property | Where-Object { $_.name -eq "X1" }).val
                Y = ($Col.Property | Where-Object { $_.name -eq "Y1" }).val
                Width = ($Col.Property | Where-Object { $_.name -eq "Width" }).val
                Height = ($Col.Property | Where-Object { $_.name -eq "Height" }).val
                Label = ($Col.Property | Where-Object { $_.name -eq "Text" }).val
                FieldId = ($Col.Property | Where-Object { $_.name -eq "FieldID" }).val
                Visible = ($Col.Property | Where-Object { $_.name -eq "Visible" }).val
            }
            $Form.Controls += $Control
        }
    }

    $Forms += $Form
}

Write-Host "Found $($Forms.Count) form(s)" -ForegroundColor Green

# DLU to Pixel conversion factors (calibrated for Magic)
$DLU_X = 0.65
$DLU_Y = 2.0

# Generate HTML
$Html = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Project IDE $ProgramId - $TaskName</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #1a1a2e;
            color: #eee;
            padding: 20px;
        }
        .form-container {
            background: #16213e;
            border: 1px solid #0f3460;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }
        .form-header {
            background: #0f3460;
            margin: -20px -20px 20px -20px;
            padding: 15px 20px;
            border-radius: 8px 8px 0 0;
        }
        .form-header h2 {
            color: #00d9ff;
            font-size: 1.2rem;
        }
        .form-header .meta {
            color: #888;
            font-size: 0.85rem;
            margin-top: 5px;
        }
        .form-canvas {
            position: relative;
            background: #0a0a12;
            border: 1px solid #333;
            min-height: 200px;
        }
        .control {
            position: absolute;
            font-size: 12px;
        }
        .control.button {
            background: linear-gradient(180deg, #4a4a6a 0%, #2a2a4a 100%);
            border: 1px solid #666;
            border-radius: 3px;
            padding: 4px 8px;
            cursor: pointer;
            text-align: center;
            color: #fff;
        }
        .control.edit {
            background: #fff;
            border: 1px solid #999;
            padding: 2px 4px;
            color: #000;
        }
        .control.static {
            color: #ccc;
            padding: 2px;
        }
        .control.table {
            background: #1a1a3a;
            border: 1px solid #444;
        }
        .info { color: #888; font-size: 0.85rem; margin-top: 20px; }
        .info code { background: #333; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1 style="color: #00d9ff; margin-bottom: 20px;">$Project IDE $ProgramId - $TaskName</h1>
    <p class="info">Generated from Magic Unipaas form definition.</p>
    <p class="info">Use <code>magic_get_form_controls</code> MCP tool for detailed control info.</p>
    <br/>

"@

foreach ($Form in $Forms) {
    $CanvasWidth = [int]([double]$Form.Width * $DLU_X)
    $CanvasHeight = [int]([double]$Form.Height * $DLU_Y)

    $WindowTypeDesc = switch ($Form.WindowType) {
        "1" { "MDI Child" }
        "2" { "SDI" }
        "3" { "Modal" }
        "4" { "Floating" }
        default { "Unknown ($($Form.WindowType))" }
    }

    $Html += @"

    <div class="form-container">
        <div class="form-header">
            <h2>$($Form.Name)</h2>
            <div class="meta">
                ID: $($Form.Id) |
                Size: $($Form.Width) x $($Form.Height) DLU ($CanvasWidth x $CanvasHeight px) |
                Type: $WindowTypeDesc
            </div>
        </div>
        <div class="form-canvas" style="width: ${CanvasWidth}px; height: ${CanvasHeight}px;">

"@

    foreach ($Control in $Form.Controls) {
        if (-not $Control.X -or -not $Control.Y) { continue }

        $PxX = [int]([double]$Control.X * $DLU_X)
        $PxY = [int]([double]$Control.Y * $DLU_Y)
        $PxW = if ($Control.Width) { [int]([double]$Control.Width * $DLU_X) } else { 80 }
        $PxH = if ($Control.Height) { [int]([double]$Control.Height * $DLU_Y) } else { 24 }

        $ControlClass = switch -Wildcard ($Control.Type) {
            "*Button*" { "button" }
            "*Edit*" { "edit" }
            "*Static*" { "static" }
            "*Table*" { "table" }
            "*Column*" { "edit" }
            default { "static" }
        }

        $Label = if ($Control.Label) { $Control.Label } else { "[Field $($Control.FieldId)]" }

        $Html += @"
            <div class="control $ControlClass"
                 style="left: ${PxX}px; top: ${PxY}px; width: ${PxW}px; height: ${PxH}px;"
                 title="Type: $($Control.Type), Field: $($Control.FieldId)">
                $Label
            </div>

"@
    }

    $Html += @"
        </div>
    </div>

"@
}

$Html += @"

    <div class="info">
        <p><strong>Control Summary:</strong></p>
        <ul>
"@

foreach ($Form in $Forms) {
    $Html += "            <li>$($Form.Name): $($Form.Controls.Count) controls</li>`n"
}

$Html += @"
        </ul>
        <p style="margin-top: 10px;">Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
</body>
</html>
"@

# Write output
$Html | Set-Content -Path $OutputFile -Encoding UTF8
Write-Host ""
Write-Host "HTML generated: $OutputFile" -ForegroundColor Green

if ($Preview) {
    Start-Process $OutputFile
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
foreach ($Form in $Forms) {
    Write-Host "  $($Form.Name): $($Form.Controls.Count) controls" -ForegroundColor White
}
