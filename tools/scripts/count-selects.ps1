# Count Select operations in Main program (Prg_1.xml) for each project
# This gives the Main offset needed for variable naming

param(
    [string]$Project = "ADH"
)

$projectsPath = "D:\Data\Migration\XPA\PMS"
$path = "$projectsPath\$Project\Source\Prg_1.xml"

if (-not (Test-Path $path)) {
    Write-Error "File not found: $path"
    exit 1
}

[xml]$xml = Get-Content $path -Encoding UTF8
$task = $xml.Application.ProgramsRepository.Programs.Task

$count = 0
foreach ($lu in $task.TaskLogic.LogicUnit) {
    $count += @($lu.LogicLines.LogicLine | Where-Object { $_.Select }).Count
}

Write-Host "$Project Main offset: $count"
