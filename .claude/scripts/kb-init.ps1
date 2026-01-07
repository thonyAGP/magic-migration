# Initialize Knowledge Base SQLite
# Creates the patterns.sqlite database with schema

param(
    [switch]$Force
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ticketsDir = Join-Path $projectRoot ".openspec\tickets"
$dbFile = Join-Path $ticketsDir "patterns.sqlite"

# Check if SQLite is available
$sqliteCmd = $null
$possiblePaths = @(
    "sqlite3",
    "C:\ProgramData\chocolatey\bin\sqlite3.exe",
    "$env:LOCALAPPDATA\Programs\sqlite\sqlite3.exe"
)

foreach ($path in $possiblePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $sqliteCmd = $path
        break
    }
}

if (-not $sqliteCmd) {
    Write-Host "[KB] SQLite not found. Install via: choco install sqlite" -ForegroundColor Yellow
    Write-Host "[KB] Using JSON fallback mode" -ForegroundColor Yellow

    # Create JSON-based KB as fallback
    $jsonFile = Join-Path $ticketsDir "patterns.json"
    if (-not (Test-Path $jsonFile)) {
        @{
            patterns = @()
            version = "1.0"
            created = (Get-Date).ToString("o")
        } | ConvertTo-Json -Depth 5 | Out-File $jsonFile -Encoding UTF8
        Write-Host "[KB] Created patterns.json (JSON fallback)"
    }
    exit 0
}

# Create tickets directory if needed
if (-not (Test-Path $ticketsDir)) {
    New-Item -ItemType Directory -Path $ticketsDir -Force | Out-Null
}

# Check if DB exists
if ((Test-Path $dbFile) -and -not $Force) {
    Write-Host "[KB] Database already exists at $dbFile"
    Write-Host "[KB] Use -Force to recreate"
    exit 0
}

# Create database with schema
$schema = @"
CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_key TEXT NOT NULL UNIQUE,
    symptom TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    domain TEXT,
    programs TEXT,
    tables_involved TEXT,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolution_time_hours INTEGER
);

CREATE INDEX IF NOT EXISTS idx_domain ON patterns(domain);
CREATE INDEX IF NOT EXISTS idx_keywords ON patterns(keywords);
CREATE INDEX IF NOT EXISTS idx_ticket_key ON patterns(ticket_key);

-- Metadata table
CREATE TABLE IF NOT EXISTS kb_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

INSERT OR REPLACE INTO kb_metadata (key, value) VALUES ('version', '1.0');
INSERT OR REPLACE INTO kb_metadata (key, value) VALUES ('created', datetime('now'));
"@

# Execute schema
$schema | & $sqliteCmd $dbFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "[KB] Database created at $dbFile" -ForegroundColor Green
} else {
    Write-Error "[KB] Failed to create database"
    exit 1
}
