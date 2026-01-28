# Phase4-UIForms.ps1 - V6.0 Pipeline
# Extraction des Forms (ecrans) et Controls (boutons, champs, tables) via CLI
# Generation de mockup ASCII de l'interface

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KbIndexRunnerPath = Join-Path (Split-Path -Parent $ScriptDir) "KbIndexRunner"

# Default output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "=== Phase 4: UI FORMS (V6.0) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "IDE Position: $IdePosition"
Write-Host ""

# Step 1: Query KB for Forms via CLI
Write-Host "[1/4] Fetching forms via CLI..." -ForegroundColor Yellow

$formsCmd = "cd '$KbIndexRunnerPath'; dotnet run -- forms-json '$Project $IdePosition'"
$jsonOutput = powershell -NoProfile -Command $formsCmd 2>&1

# Parse JSON output
try {
    $formsData = $jsonOutput | ConvertFrom-Json

    if ($formsData.error) {
        Write-Host "ERROR: $($formsData.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to parse forms output" -ForegroundColor Red
    Write-Host $jsonOutput
    exit 1
}

$forms = $formsData.forms
$programName = $formsData.program

Write-Host "  Program: $programName" -ForegroundColor Green
Write-Host "  Forms found: $($forms.Count)" -ForegroundColor $(if ($forms.Count -gt 0) { "Green" } else { "Yellow" })
Write-Host ""

# Step 2: Controls extraction (placeholder)
Write-Host "[2/4] Extracting controls (placeholder)..." -ForegroundColor Yellow
$controls = @{
    buttons = @()
    inputs = @()
    tables = @()
    labels = @()
}

Write-Host "  NOTE: Detailed control extraction requires KB schema extension" -ForegroundColor DarkYellow
Write-Host ""

# Step 3: Generate ASCII mockup for main form
Write-Host "[3/4] Generating ASCII mockup..." -ForegroundColor Yellow

$mockupLines = @()

if ($forms.Count -gt 0) {
    $mainForm = $forms[0]
    $formWidth = [math]::Max([math]::Min($mainForm.dimensions.width / 10, 70), 40)  # Scale down, min 40
    $formHeight = [math]::Max([math]::Min($mainForm.dimensions.height / 15, 15), 6)

    # Header
    $title = $mainForm.name
    if ([string]::IsNullOrWhiteSpace($title)) {
        $title = $programName
    }
    if ($title.Length -gt ($formWidth - 4)) {
        $title = $title.Substring(0, $formWidth - 7) + "..."
    }

    $mockupLines += "+" + ("-" * ($formWidth - 2)) + "+"
    $padLeft = [math]::Floor((($formWidth - 2 - $title.Length) / 2))
    $padRight = $formWidth - 2 - $title.Length - $padLeft
    $mockupLines += "|" + (" " * $padLeft) + $title + (" " * $padRight) + "|"
    $mockupLines += "+" + ("-" * ($formWidth - 2)) + "+"

    # Body placeholder
    for ($i = 0; $i -lt ($formHeight - 4); $i++) {
        if ($i -eq 0) {
            $content = "  [Form content - $($mainForm.window_type_str)]"
            $mockupLines += "|" + $content.PadRight($formWidth - 2) + "|"
        } elseif ($i -eq 1 -and $mainForm.dimensions.width -gt 0) {
            $content = "  Size: $($mainForm.dimensions.width) x $($mainForm.dimensions.height) DLU"
            $mockupLines += "|" + $content.PadRight($formWidth - 2) + "|"
        } elseif ($i -eq 2) {
            $content = "  Task: $($mainForm.task_isn2)"
            $mockupLines += "|" + $content.PadRight($formWidth - 2) + "|"
        } else {
            $mockupLines += "|" + (" " * ($formWidth - 2)) + "|"
        }
    }

    # Footer
    $mockupLines += "+" + ("-" * ($formWidth - 2)) + "+"
} else {
    $mockupLines += "+-----------------------------------+"
    $mockupLines += "|  No forms defined in this task   |"
    $mockupLines += "+-----------------------------------+"
}

$mockup = $mockupLines -join "`n"

Write-Host ""
Write-Host $mockup
Write-Host ""

# Step 4: Build and save ui_forms.json
Write-Host "[4/4] Saving ui_forms.json..." -ForegroundColor Yellow

$uiForms = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $programName
        generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "6.0"
    }

    forms = @($forms | ForEach-Object {
        @{
            form_id = $_.form_id
            name = $_.name
            window_type = $_.window_type
            window_type_str = $_.window_type_str
            dimensions = $_.dimensions
            task_isn2 = $_.task_isn2
            font = $_.font
        }
    })

    controls = $controls

    screen_mockup_ascii = $mockupLines

    statistics = @{
        form_count = $forms.Count
        button_count = $controls.buttons.Count
        input_count = $controls.inputs.Count
        table_count = $controls.tables.Count
        label_count = $controls.labels.Count
    }

    notes = $formsData.notes
}

$uiFormsPath = Join-Path $OutputPath "ui_forms.json"
$uiForms | ConvertTo-Json -Depth 10 | Set-Content -Path $uiFormsPath -Encoding UTF8

Write-Host "=== Phase 4 COMPLETE ===" -ForegroundColor Green
Write-Host "Output: $uiFormsPath"
Write-Host ""

# Summary
Write-Host "UI FORMS SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Forms: $($forms.Count)"
foreach ($form in $forms | Select-Object -First 10) {
    $dims = if ($form.dimensions.width -gt 0) { "$($form.dimensions.width)x$($form.dimensions.height)" } else { "N/A" }
    Write-Host "    - $($form.name) [$($form.window_type_str)] $dims"
}
if ($forms.Count -gt 10) {
    Write-Host "    ... and $($forms.Count - 10) more forms"
}
Write-Host "  - Controls: Requires KB extension"

return $uiForms
