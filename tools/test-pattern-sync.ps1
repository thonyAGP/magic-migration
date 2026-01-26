# Test Pattern Sync Service
# Usage: .\test-pattern-sync.ps1

$ErrorActionPreference = "Stop"

# Build first
Write-Host "Building MagicMcp..." -ForegroundColor Cyan
Push-Location "D:\Projects\Lecteur_Magic\tools\MagicMcp"
dotnet build --configuration Release -v q 2>&1 | Out-Null
Pop-Location

# Create a simple test script
$testCode = @'
using System;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;

var db = new KnowledgeDb();

Console.WriteLine("=== Knowledge Base Status ===");
Console.WriteLine($"DB Path: {db.DbPath}");
Console.WriteLine($"Initialized: {db.IsInitialized()}");

// Check patterns table
try {
    var count = db.ExecuteScalar<int>("SELECT COUNT(*) FROM resolution_patterns");
    Console.WriteLine($"Patterns in KB: {count}");
} catch (Exception ex) {
    Console.WriteLine($"Patterns table error: {ex.Message}");
}

// Check FTS5 table
try {
    var ftsCount = db.ExecuteScalar<int>("SELECT COUNT(*) FROM patterns_fts");
    Console.WriteLine($"Patterns in FTS: {ftsCount}");
} catch (Exception ex) {
    Console.WriteLine($"FTS table error: {ex.Message}");
}

// Test sync
Console.WriteLine();
Console.WriteLine("=== Pattern Sync Test ===");
var syncService = new PatternSyncService(db);
var patternsDir = @"D:\Projects\Lecteur_Magic\.openspec\patterns";

var status = syncService.GetSyncStatus(patternsDir);
Console.WriteLine($"Files on disk: {status.FilesOnDisk}");
Console.WriteLine($"Patterns in KB: {status.PatternsInKb}");
Console.WriteLine($"Missing in KB: {string.Join(", ", status.MissingInKb)}");
Console.WriteLine($"Synchronized: {status.IsSynced}");

if (!status.IsSynced) {
    Console.WriteLine();
    Console.WriteLine("=== Running Sync ===");
    var result = syncService.SyncFromDirectory(patternsDir);
    Console.WriteLine($"Total files: {result.TotalFiles}");
    Console.WriteLine($"Synced: {result.Synced}");
    Console.WriteLine($"Skipped: {result.Skipped}");
    if (result.Errors.Count > 0) {
        Console.WriteLine("Errors:");
        foreach (var err in result.Errors) {
            Console.WriteLine($"  - {err}");
        }
    }
    Console.WriteLine();
    Console.WriteLine("Synced patterns:");
    foreach (var p in result.SyncedPatterns) {
        Console.WriteLine($"  - {p}");
    }
}

// Verify FTS after sync
Console.WriteLine();
Console.WriteLine("=== FTS5 Search Test ===");
var searchResults = db.SearchPatterns("date", 5).ToList();
Console.WriteLine($"Search 'date' returned {searchResults.Count} results:");
foreach (var r in searchResults) {
    Console.WriteLine($"  - {r.PatternName} (score: {r.Score:F2})");
}
'@

# Save test code
$testFile = "D:\Projects\Lecteur_Magic\tools\PatternSyncTest.cs"
$testCode | Out-File -FilePath $testFile -Encoding UTF8

Write-Host ""
Write-Host "Test code saved to: $testFile" -ForegroundColor Green
Write-Host ""
Write-Host "To run, use 'dotnet script' or integrate into test project."
Write-Host ""

# Alternative: run via MCP tool directly if available
Write-Host "Checking KB status via direct SQL..." -ForegroundColor Cyan

# Use sqlite3 if available, otherwise show manual steps
$sqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue
if ($sqlite) {
    $dbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
    Write-Host ""
    Write-Host "=== Direct SQL Check ===" -ForegroundColor Yellow
    sqlite3 $dbPath "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'pattern%';"
    sqlite3 $dbPath "SELECT COUNT(*) as count FROM resolution_patterns;"
    sqlite3 $dbPath "SELECT COUNT(*) as fts_count FROM patterns_fts;"
} else {
    Write-Host ""
    Write-Host "sqlite3 CLI not found. Install with: choco install sqlite" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Run the MagicMcp with magic_pattern_sync tool"
}
