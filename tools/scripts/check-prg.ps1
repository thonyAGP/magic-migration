# Check program header
param([string]$Project = "ADH", [int]$PrgId = 159)

$xmlPath = "D:\Data\Migration\XPA\PMS\$Project\Source\Prg_$PrgId.xml"
[xml]$xml = Get-Content $xmlPath -Encoding UTF8

$task = $xml.Application.ProgramsRepository.Programs.Task
if (-not $task) {
    $task = $xml.Application.Task | Select-Object -First 1
}

$header = $task.Header
Write-Host "=== Prg_$PrgId.xml ==="
Write-Host "  id        = $($header.id)"
Write-Host "  ISN_2     = $($header.ISN_2)"
Write-Host "  Description = $($header.Description)"
Write-Host "  Public    = $($header.Public.val)"
Write-Host ""

# Count all columns in Resource
$columns = $task.Resource.Columns.Column
Write-Host "Columns in Resource: $($columns.Count)"

# Check for Links
$links = $task.Resource.Links.Link
if ($links) {
    Write-Host "Links: $(@($links).Count)"
    foreach ($link in $links) {
        $obj = $link.DataObject.obj
        $idx = $link.DataObject.IDX
        Write-Host "  Link obj=$obj IDX=$idx"
    }
}
