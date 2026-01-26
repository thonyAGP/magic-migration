# Generate-TestsFromSpec.ps1
# P3-E: Generate test scaffolds from program specification
# Creates xUnit test files with test cases based on spec data
#
# Usage:
#   .\Generate-TestsFromSpec.ps1 -Project ADH -IDE 238
#   .\Generate-TestsFromSpec.ps1 -SpecFile ".openspec/specs/ADH-IDE-238.md" -OutputPath "tests/"

param(
    [Parameter(ParameterSetName='ByProject', Mandatory=$true)]
    [string]$Project,

    [Parameter(ParameterSetName='ByProject', Mandatory=$true)]
    [int]$IDE,

    [Parameter(ParameterSetName='ByFile', Mandatory=$true)]
    [string]$SpecFile,

    [string]$OutputPath = $null,

    [ValidateSet('xunit', 'nunit', 'vitest')]
    [string]$TestFramework = 'xunit',

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# ============================================================================
# SPEC PARSING (reuse from Generate-MigrationBlueprint.ps1)
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

function ConvertTo-PascalCase {
    param([string]$Text)
    $Words = $Text -split '[_\s\-]+'
    $Result = ($Words | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_.ToLower()) }) -join ''
    return $Result -replace '[^a-zA-Z0-9]', ''
}

# ============================================================================
# TEST GENERATION - xUnit
# ============================================================================

function Generate-XUnitTests {
    param($Spec)

    $ClassName = ConvertTo-PascalCase $Spec.Description
    if ($ClassName -eq '' -or $ClassName -eq $null) {
        $ClassName = "$($Spec.Project)Ide$($Spec.IDE)"
    }

    $IsQuery = $Spec.WriteTables.Count -eq 0
    $HandlerType = if ($IsQuery) { 'Query' } else { 'Command' }

    $Tests = @()

    # Test 1: Basic validation - required parameters
    if ($Spec.Parameters.Count -gt 0) {
        $Tests += @"
    [Fact]
    public void Should_RequireParameters_WhenCreatingRequest()
    {
        // Arrange
        // From spec: $($Spec.Parameters.Count) parameters required

        // Act & Assert
        // TODO: Validate that required parameters are checked
        // Parameters:
$($Spec.Parameters | ForEach-Object { "        //   P$($_.Index): $($_.Name) ($($_.Type))" } | Out-String)
        throw new NotImplementedException("Generated from spec - implement me!");
    }
"@
    }

    # Test 2: Table access validation
    if ($Spec.WriteTables.Count -gt 0) {
        $Tests += @"
    [Fact]
    public async Task Should_WriteToExpectedTables_WhenExecuted()
    {
        // Arrange
        // From spec: $($Spec.WriteTables.Count) write table(s)

        // Act
        // TODO: Execute handler

        // Assert - Verify writes to:
$($Spec.WriteTables | ForEach-Object { "        //   Table #$($_.Id): $($_.LogicalName) (used $($_.UsageCount)x)" } | Out-String)
        throw new NotImplementedException("Generated from spec - implement me!");
    }
"@
    }

    if ($Spec.ReadTables.Count -gt 0) {
        $Tests += @"
    [Fact]
    public async Task Should_ReadFromExpectedTables_WhenExecuted()
    {
        // Arrange
        // From spec: $($Spec.ReadTables.Count) read table(s)

        // Act
        // TODO: Execute handler with mock data

        // Assert - Verify reads from:
$($Spec.ReadTables | Select-Object -First 10 | ForEach-Object { "        //   Table #$($_.Id): $($_.LogicalName) (used $($_.UsageCount)x)" } | Out-String)
        throw new NotImplementedException("Generated from spec - implement me!");
    }
"@
    }

    # Test 3: Success case
    $Tests += @"
    [Fact]
    public async Task Should_ReturnSuccess_WhenValidRequest()
    {
        // Arrange
        var request = new ${ClassName}${HandlerType}
        {
            // TODO: Set valid parameters
        };

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
    }
"@

    # Test 4: Error case - invalid data
    $Tests += @"
    [Fact]
    public async Task Should_ReturnError_WhenInvalidData()
    {
        // Arrange
        var request = new ${ClassName}${HandlerType}
        {
            // TODO: Set invalid parameters
        };

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
    }
"@

    # Test 5: Specific to batch programs
    if ($Spec.Type -eq 'Batch') {
        $Tests += @"
    [Fact]
    public async Task Should_ProcessBatchCorrectly_WhenMultipleRecords()
    {
        // Arrange
        // From spec: This is a BATCH program
        // TODO: Set up multiple records to process

        // Act
        var result = await _handler.Handle(new ${ClassName}${HandlerType}(), CancellationToken.None);

        // Assert
        // Verify all records processed
        throw new NotImplementedException("Generated from spec - implement me!");
    }
"@
    }

    # Generate full test class
    $TestClass = @"
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;

namespace Migration.Tests;

/// <summary>
/// Tests for $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)
/// Generated from spec on $(Get-Date -Format 'yyyy-MM-dd')
///
/// Spec Stats:
///   - Type: $($Spec.Type)
///   - Parameters: $($Spec.Parameters.Count)
///   - Tables: $($Spec.Tables.Count) ($($Spec.WriteTables.Count) W / $($Spec.ReadTables.Count) R)
///   - Expressions: $($Spec.ExpressionCount)
/// </summary>
public class ${ClassName}${HandlerType}Tests
{
    private readonly Mock<MigrationDbContext> _mockContext;
    private readonly ${ClassName}${HandlerType}Handler _handler;

    public ${ClassName}${HandlerType}Tests()
    {
        _mockContext = new Mock<MigrationDbContext>();
        _handler = new ${ClassName}${HandlerType}Handler(_mockContext.Object);
    }

$($Tests -join "`n`n")
}
"@

    return @{
        FileName = "${ClassName}${HandlerType}Tests.cs"
        Content = $TestClass
        TestCount = $Tests.Count
    }
}

# ============================================================================
# TEST GENERATION - Vitest (TypeScript)
# ============================================================================

function Generate-VitestTests {
    param($Spec)

    $FunctionName = (ConvertTo-PascalCase $Spec.Description).Substring(0,1).ToLower() + (ConvertTo-PascalCase $Spec.Description).Substring(1)
    if ($FunctionName -eq '' -or $FunctionName -eq $null) {
        $FunctionName = "$($Spec.Project.ToLower())Ide$($Spec.IDE)"
    }

    $IsQuery = $Spec.WriteTables.Count -eq 0

    $TestContent = @"
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)
 * Generated from spec on $(Get-Date -Format 'yyyy-MM-dd')
 *
 * Spec Stats:
 *   - Type: $($Spec.Type)
 *   - Parameters: $($Spec.Parameters.Count)
 *   - Tables: $($Spec.Tables.Count) ($($Spec.WriteTables.Count) W / $($Spec.ReadTables.Count) R)
 *   - Expressions: $($Spec.ExpressionCount)
 */
describe('$FunctionName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should require parameters', () => {
      // From spec: $($Spec.Parameters.Count) parameters
      // TODO: Test parameter validation
      expect(() => {
        // Call function without required params
      }).toThrow();
    });
  });

  describe('success cases', () => {
    it('should return success with valid input', async () => {
      // Arrange
      const input = {
        // TODO: Add valid input based on parameters
      };

      // Act
      const result = await $FunctionName(input);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should return error with invalid input', async () => {
      // Arrange
      const input = {
        // TODO: Add invalid input
      };

      // Act
      const result = await $FunctionName(input);

      // Assert
      expect(result.success).toBe(false);
    });
  });
$(if ($Spec.WriteTables.Count -gt 0) {
@"

  describe('database writes', () => {
    it('should write to expected tables', async () => {
      // From spec: $($Spec.WriteTables.Count) write table(s)
      // Tables: $($Spec.WriteTables.LogicalName -join ', ')

      // TODO: Mock database and verify writes
      throw new Error('Generated from spec - implement me!');
    });
  });
"@
})
});
"@

    return @{
        FileName = "$FunctionName.test.ts"
        Content = $TestContent
        TestCount = 4
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host "=== Test Generator from Spec ===" -ForegroundColor Cyan
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
Write-Host "Framework: $TestFramework" -ForegroundColor Gray
Write-Host ""

# Parse spec
$Spec = Parse-SpecFile -FilePath $ResolvedSpecFile

Write-Host "Parsed: $($Spec.Project) IDE $($Spec.IDE) - $($Spec.Description)" -ForegroundColor White
Write-Host "  Type: $($Spec.Type)" -ForegroundColor Gray
Write-Host "  Tables: $($Spec.Tables.Count) ($($Spec.WriteTables.Count) W / $($Spec.ReadTables.Count) R)" -ForegroundColor Gray
Write-Host "  Parameters: $($Spec.Parameters.Count)" -ForegroundColor Gray
Write-Host ""

# Determine output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ProjectRoot "migration\$($Spec.Project)\IDE-$($Spec.IDE)\Tests"
}

# Generate tests
$TestFile = switch ($TestFramework) {
    'xunit' { Generate-XUnitTests -Spec $Spec }
    'nunit' { Generate-XUnitTests -Spec $Spec } # Same structure
    'vitest' { Generate-VitestTests -Spec $Spec }
}

Write-Host "Generated $($TestFile.TestCount) test(s)" -ForegroundColor Yellow

# Output or write
if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would create: $OutputPath\$($TestFile.FileName)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "=== $($TestFile.FileName) ===" -ForegroundColor Yellow
    Write-Host $TestFile.Content -ForegroundColor DarkGray
} else {
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }

    $FullPath = Join-Path $OutputPath $TestFile.FileName
    $TestFile.Content | Set-Content $FullPath -Encoding UTF8

    Write-Host ""
    Write-Host "[DONE] Tests created: $FullPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review generated tests and fill in TODOs" -ForegroundColor Gray
    Write-Host "  2. Add mock data for table reads" -ForegroundColor Gray
    Write-Host "  3. Run tests: dotnet test (or pnpm test)" -ForegroundColor Gray
}
