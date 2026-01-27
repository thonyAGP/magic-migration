# Generate-MigrationBlueprint.ps1
# P3-B: Generate migration code skeleton from program specification
# Creates Entity classes, Handlers, and DTOs based on spec data
#
# Usage:
#   .\Generate-MigrationBlueprint.ps1 -Project ADH -IDE 238 [-TargetLanguage csharp]
#   .\Generate-MigrationBlueprint.ps1 -SpecFile ".openspec/specs/ADH-IDE-238.md"

param(
    [Parameter(ParameterSetName='ByProject', Mandatory=$true)]
    [string]$Project,

    [Parameter(ParameterSetName='ByProject', Mandatory=$true)]
    [int]$IDE,

    [Parameter(ParameterSetName='ByFile', Mandatory=$true)]
    [string]$SpecFile,

    [ValidateSet('csharp', 'typescript', 'python')]
    [string]$TargetLanguage = 'csharp',

    [string]$OutputPath = $null,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# ============================================================================
# SPEC PARSING
# ============================================================================

function Parse-SpecFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        throw "Spec file not found: $FilePath"
    }

    $Content = Get-Content $FilePath -Raw -Encoding UTF8

    $Spec = @{
        Project = $null
        IDE = $null
        Title = $null
        Description = $null
        Type = 'Online'
        Tables = @()
        WriteTables = @()
        ReadTables = @()
        Parameters = @()
        Variables = @()
        ExpressionCount = 0
    }

    # Extract project and IDE from title
    if ($Content -match '^# ([A-Z]+) IDE (\d+) - (.+)$' -or $Content -match '^# ([A-Z]+) IDE (\d+)') {
        $Spec.Project = $Matches[1]
        $Spec.IDE = [int]$Matches[2]
        if ($Matches.Count -gt 3) {
            $Spec.Description = $Matches[3].Trim()
        }
    }

    # Extract type
    if ($Content -match '\| \*\*Type\*\* \| ([OB]) ') {
        $Spec.Type = if ($Matches[1] -eq 'O') { 'Online' } else { 'Batch' }
    }

    # Extract tables
    $TableMatches = [regex]::Matches($Content, '\|\s*#(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*\*?\*?([WR])\*?\*?\s*\|\s*(\d+)x')
    foreach ($Match in $TableMatches) {
        $Table = @{
            Id = [int]$Match.Groups[1].Value
            PhysicalName = $Match.Groups[2].Value.Trim()
            LogicalName = $Match.Groups[3].Value.Trim()
            Access = $Match.Groups[4].Value
            UsageCount = [int]$Match.Groups[5].Value
        }
        $Spec.Tables += $Table
        if ($Table.Access -eq 'W') {
            $Spec.WriteTables += $Table
        } else {
            $Spec.ReadTables += $Table
        }
    }

    # Extract parameters
    $ParamMatches = [regex]::Matches($Content, '\|\s*P(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
    foreach ($Match in $ParamMatches) {
        $Spec.Parameters += @{
            Index = [int]$Match.Groups[1].Value
            Name = $Match.Groups[2].Value.Trim()
            Type = $Match.Groups[3].Value.Trim()
        }
    }

    # Extract expression count
    if ($Content -match '##\s*5\.\s*EXPRESSIONS\s*\((\d+)\s*total') {
        $Spec.ExpressionCount = [int]$Matches[1]
    }

    return $Spec
}

# ============================================================================
# CODE GENERATION - C#
# ============================================================================

function ConvertTo-PascalCase {
    param([string]$Text)
    $Words = $Text -split '[_\s\-]+'
    $Result = ($Words | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_.ToLower()) }) -join ''
    return $Result -replace '[^a-zA-Z0-9]', ''
}

function ConvertTo-CamelCase {
    param([string]$Text)
    $Pascal = ConvertTo-PascalCase $Text
    if ($Pascal.Length -gt 0) {
        return $Pascal.Substring(0,1).ToLower() + $Pascal.Substring(1)
    }
    return $Pascal
}

function Map-MagicTypeToCSharp {
    param([string]$MagicType)
    switch ($MagicType.ToUpper()) {
        'ALPHA' { return 'string' }
        'NUMERIC' { return 'decimal' }
        'LOGICAL' { return 'bool' }
        'DATE' { return 'DateTime?' }
        'TIME' { return 'TimeSpan?' }
        'UNICODE' { return 'string' }
        default { return 'string' }
    }
}

function Generate-CSharpEntity {
    param($Table)

    $ClassName = ConvertTo-PascalCase $Table.LogicalName
    if ($ClassName -eq 'Unknown' -or $ClassName -eq '') {
        $ClassName = "Table$($Table.Id)"
    }

    $Code = @"
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Migration.Entities;

/// <summary>
/// Entity for Magic table #$($Table.Id) - $($Table.PhysicalName)
/// Access mode in source: $($Table.Access) | Usage: $($Table.UsageCount)x
/// </summary>
[Table("$($Table.PhysicalName)")]
public class $ClassName
{
    // TODO: Add primary key from table schema
    [Key]
    public int Id { get; set; }

    // TODO: Add properties based on table columns
    // Use magic_get_table $($Table.Id) to get column details
}
"@
    return @{
        FileName = "$ClassName.cs"
        Content = $Code
        ClassName = $ClassName
    }
}

function Generate-CSharpDto {
    param($Spec)

    $DtoName = "$(ConvertTo-PascalCase $Spec.Description)Dto"
    if ($DtoName -eq 'Dto' -or $DtoName -eq '') {
        $DtoName = "$($Spec.Project)Ide$($Spec.IDE)Dto"
    }

    $Properties = @()
    foreach ($Param in $Spec.Parameters) {
        $PropName = ConvertTo-PascalCase $Param.Name
        $PropType = Map-MagicTypeToCSharp $Param.Type
        $Properties += "    public $PropType $PropName { get; set; }"
    }

    $Code = @"
namespace Migration.Dtos;

/// <summary>
/// DTO for $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)
/// Generated from spec with $($Spec.Parameters.Count) parameters
/// </summary>
public record $DtoName
{
$($Properties -join "`n")
}
"@
    return @{
        FileName = "$DtoName.cs"
        Content = $Code
        ClassName = $DtoName
    }
}

function Generate-CSharpHandler {
    param($Spec, $Entities)

    $HandlerName = "$(ConvertTo-PascalCase $Spec.Description)"
    if ($HandlerName -eq '' -or $HandlerName -eq $null) {
        $HandlerName = "$($Spec.Project)Ide$($Spec.IDE)"
    }

    $IsQuery = $Spec.WriteTables.Count -eq 0
    $HandlerType = if ($IsQuery) { 'Query' } else { 'Command' }

    $UsedEntities = ($Entities | ForEach-Object { $_.ClassName }) -join ', '

    # NOTE: Template updated 2026-01-27 to avoid CS8625/CS1998 warnings
    # - Result types use nullable (T?) for optional properties
    # - Handler uses Task.FromResult instead of async (no real DB call in stub)
    $Code = @"
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Migration.Handlers;

/// <summary>
/// $HandlerType handler for $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)
/// Source type: $($Spec.Type)
/// Tables: $($Spec.Tables.Count) ($($Spec.WriteTables.Count) Write / $($Spec.ReadTables.Count) Read)
/// Expressions: $($Spec.ExpressionCount)
/// </summary>
public record ${HandlerName}${HandlerType}(
    // TODO: Add request properties from spec parameters
    // Parameters: $($Spec.Parameters.Count)
    string Placeholder = ""
) : IRequest<${HandlerName}Result>;

/// <summary>
/// Result record - use nullable types (T?) for optional fields
/// </summary>
public record ${HandlerName}Result(
    bool Success,
    string? Message = null,
    object? Data = null
);

public class ${HandlerName}${HandlerType}Handler : IRequestHandler<${HandlerName}${HandlerType}, ${HandlerName}Result>
{
    private readonly MigrationDbContext _context;

    public ${HandlerName}${HandlerType}Handler(MigrationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Handler implementation - use async only when awaiting DB calls
    /// For stubs without real DB access, use Task.FromResult to avoid CS1998
    /// </summary>
    public Task<${HandlerName}Result> Handle(${HandlerName}${HandlerType} request, CancellationToken ct)
    {
        // TODO: Implement business logic
        // Tables used: $UsedEntities
$(if ($IsQuery) {
@"
        // This is a QUERY (read-only) - no writes detected
        // When adding real DB calls, change signature to:
        // public async Task<...> Handle(...) and use await _context...
"@
} else {
@"
        // This is a COMMAND (write) - $($Spec.WriteTables.Count) table(s) modified
        // Write tables: $($Spec.WriteTables.LogicalName -join ', ')
        // When adding real DB calls, change signature to:
        // public async Task<...> Handle(...) and use await _context.SaveChangesAsync(ct)
"@
})

        // Stub: return placeholder result (no async needed yet)
        return Task.FromResult(new ${HandlerName}Result(
            Success: false,
            Message: "Not implemented - generated from spec"));
    }
}
"@
    return @{
        FileName = "${HandlerName}${HandlerType}Handler.cs"
        Content = $Code
        HandlerName = $HandlerName
        HandlerType = $HandlerType
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host "=== Migration Blueprint Generator ===" -ForegroundColor Cyan
Write-Host ""

# Resolve spec file
if ($SpecFile) {
    $ResolvedSpecFile = $SpecFile
} else {
    $ResolvedSpecFile = Join-Path $ProjectRoot ".openspec\specs\$($Project.ToUpper())-IDE-$IDE.md"
}

if (-not (Test-Path $ResolvedSpecFile)) {
    Write-Error "Spec file not found: $ResolvedSpecFile"
    exit 1
}

Write-Host "Spec: $ResolvedSpecFile" -ForegroundColor Gray
Write-Host "Language: $TargetLanguage" -ForegroundColor Gray
Write-Host ""

# Parse spec
$Spec = Parse-SpecFile -FilePath $ResolvedSpecFile

Write-Host "Parsed: $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)" -ForegroundColor White
Write-Host "  Type: $($Spec.Type)" -ForegroundColor Gray
Write-Host "  Tables: $($Spec.Tables.Count) ($($Spec.WriteTables.Count) W / $($Spec.ReadTables.Count) R)" -ForegroundColor Gray
Write-Host "  Parameters: $($Spec.Parameters.Count)" -ForegroundColor Gray
Write-Host "  Expressions: $($Spec.ExpressionCount)" -ForegroundColor Gray
Write-Host ""

# Determine output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ProjectRoot "migration\$($Spec.Project)\IDE-$($Spec.IDE)"
}

# Generate code
$GeneratedFiles = @()

if ($TargetLanguage -eq 'csharp') {
    Write-Host "Generating C# code..." -ForegroundColor Yellow

    # 1. Generate entities for write tables (main ones)
    $Entities = @()
    foreach ($Table in $Spec.WriteTables) {
        $Entity = Generate-CSharpEntity -Table $Table
        $Entities += $Entity
        $GeneratedFiles += @{
            Path = "Entities\$($Entity.FileName)"
            Content = $Entity.Content
        }
        Write-Host "  [Entity] $($Entity.FileName)" -ForegroundColor Green
    }

    # 2. Generate DTO
    if ($Spec.Parameters.Count -gt 0) {
        $Dto = Generate-CSharpDto -Spec $Spec
        $GeneratedFiles += @{
            Path = "Dtos\$($Dto.FileName)"
            Content = $Dto.Content
        }
        Write-Host "  [DTO] $($Dto.FileName)" -ForegroundColor Green
    }

    # 3. Generate handler
    $Handler = Generate-CSharpHandler -Spec $Spec -Entities $Entities
    $GeneratedFiles += @{
        Path = "Handlers\$($Handler.FileName)"
        Content = $Handler.Content
    }
    Write-Host "  [$($Handler.HandlerType)] $($Handler.FileName)" -ForegroundColor Green

    # 4. Generate README
    $ReadmeContent = @"
# Migration: $($Spec.Project) IDE $($Spec.IDE)

> $($Spec.Description)

Generated from spec on $(Get-Date -Format 'yyyy-MM-dd HH:mm')

## Source Spec

- **Spec File**: $ResolvedSpecFile
- **Type**: $($Spec.Type)
- **Parameters**: $($Spec.Parameters.Count)
- **Expressions**: $($Spec.ExpressionCount)

## Tables

| # | Name | Access | Usage |
|---|------|--------|-------|
$($Spec.Tables | ForEach-Object { "| #$($_.Id) | $($_.LogicalName) | $($_.Access) | $($_.UsageCount)x |" } | Out-String)

## Generated Files

| File | Type | Status |
|------|------|--------|
$($GeneratedFiles | ForEach-Object { "| $($_.Path) | $(Split-Path -Parent $_.Path) | TODO |" } | Out-String)

## Next Steps

1. Review generated entities and add properties from table schema
2. Implement handler business logic based on spec expressions
3. Create tests using `Generate-TestsFromSpec.ps1`
4. Connect to existing migration infrastructure

---
*Generated by Generate-MigrationBlueprint.ps1*
"@
    $GeneratedFiles += @{
        Path = "README.md"
        Content = $ReadmeContent
    }
}
else {
    Write-Warning "Language '$TargetLanguage' not fully implemented yet. Only 'csharp' is complete."
}

# Output or write files
Write-Host ""
if ($DryRun) {
    Write-Host "[DRY RUN] Would generate $($GeneratedFiles.Count) file(s) to: $OutputPath" -ForegroundColor Magenta
    Write-Host ""
    foreach ($File in $GeneratedFiles) {
        Write-Host "=== $($File.Path) ===" -ForegroundColor Yellow
        Write-Host $File.Content -ForegroundColor DarkGray
        Write-Host ""
    }
} else {
    Write-Host "Writing $($GeneratedFiles.Count) file(s) to: $OutputPath" -ForegroundColor Yellow

    foreach ($File in $GeneratedFiles) {
        $FullPath = Join-Path $OutputPath $File.Path
        $Dir = Split-Path -Parent $FullPath
        if (-not (Test-Path $Dir)) {
            New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        }
        $File.Content | Set-Content $FullPath -Encoding UTF8
        Write-Host "  Created: $FullPath" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "[DONE] Blueprint generated at: $OutputPath" -ForegroundColor Green
}
