# Parse-RVHST.ps1 - Outil de lecture des fichiers RV.HST (import NA)
# Usage: parse-rvhst.ps1 -Path <chemin> [-Account <compte>] [-Name <nom>] [-Type <ILOG|ICLI|IPRE|IDOS|IIDE>]

param(
    [Parameter(Mandatory=$true)]
    [string]$Path,

    [string]$Account,
    [string]$Name,
    [string]$Type = "ALL",
    [switch]$Raw,
    [switch]$Summary
)

# Validation
if (-not (Test-Path $Path)) {
    Write-Error "Fichier introuvable: $Path"
    exit 1
}

# Formats de dates
function Format-MagicDate {
    param([string]$date)
    if ($date.Length -eq 6) {
        # JJMMAA -> DD/MM/YY
        return "$($date.Substring(0,2))/$($date.Substring(2,2))/$($date.Substring(4,2))"
    }
    return $date
}

# Parse ligne ILOG (logement)
function Parse-ILOG {
    param([string]$line)
    if ($line.Length -lt 75) { return $null }

    return [PSCustomObject]@{
        Type        = "ILOG"
        Village     = $line.Substring(4,4).Trim()
        DateFichier = Format-MagicDate $line.Substring(22,6)
        Compte      = $line.Substring(28,9).Trim()
        Filiation   = $line.Substring(37,3)
        Chambre     = $line.Substring(52,7).Trim()
        DateDebut   = Format-MagicDate $line.Substring(59,6)
        DateFin     = Format-MagicDate $line.Substring(65,6)
        RawLine     = $line
    }
}

# Parse ligne ICLI (client)
function Parse-ICLI {
    param([string]$line)
    if ($line.Length -lt 100) { return $null }

    return [PSCustomObject]@{
        Type        = "ICLI"
        Village     = $line.Substring(4,4).Trim()
        DateFichier = Format-MagicDate $line.Substring(22,6)
        Compte      = $line.Substring(28,9).Trim()
        Filiation   = $line.Substring(37,3)
        Nom         = $line.Substring(49,30).Trim()
        Prenom      = $line.Substring(79,20).Trim()
        Genre       = if ($line.Length -gt 122) { $line.Substring(122,1) } else { "?" }
        RawLine     = $line
    }
}

# Parse ligne IPRE (prestation)
function Parse-IPRE {
    param([string]$line)
    if ($line.Length -lt 60) { return $null }

    return [PSCustomObject]@{
        Type        = "IPRE"
        Village     = $line.Substring(4,4).Trim()
        DateFichier = Format-MagicDate $line.Substring(22,6)
        Compte      = $line.Substring(28,9).Trim()
        Filiation   = $line.Substring(37,3)
        CodePresta  = $line.Substring(40,6).Trim()
        DateDebut   = Format-MagicDate $line.Substring(46,6)
        DateFin     = Format-MagicDate $line.Substring(52,6)
        RawLine     = $line
    }
}

# Parse ligne IDOS (dossier)
function Parse-IDOS {
    param([string]$line)
    if ($line.Length -lt 40) { return $null }

    return [PSCustomObject]@{
        Type        = "IDOS"
        Village     = $line.Substring(4,4).Trim()
        DateFichier = Format-MagicDate $line.Substring(22,6)
        Compte      = $line.Substring(28,9).Trim()
        RawLine     = $line
    }
}

# Parse ligne IIDE (identite)
function Parse-IIDE {
    param([string]$line)
    if ($line.Length -lt 50) { return $null }

    return [PSCustomObject]@{
        Type        = "IIDE"
        Village     = $line.Substring(4,4).Trim()
        DateFichier = Format-MagicDate $line.Substring(22,6)
        Compte      = $line.Substring(28,9).Trim()
        Filiation   = $line.Substring(37,3)
        RawLine     = $line
    }
}

# Lecture et parsing du fichier
$records = @()
$content = Get-Content $Path -Encoding Default

foreach ($line in $content) {
    if ($line.Length -lt 4) { continue }

    $recordType = $line.Substring(0,4)
    $record = $null

    switch ($recordType) {
        "ILOG" { if ($Type -eq "ALL" -or $Type -eq "ILOG") { $record = Parse-ILOG $line } }
        "ICLI" { if ($Type -eq "ALL" -or $Type -eq "ICLI") { $record = Parse-ICLI $line } }
        "IPRE" { if ($Type -eq "ALL" -or $Type -eq "IPRE") { $record = Parse-IPRE $line } }
        "IDOS" { if ($Type -eq "ALL" -or $Type -eq "IDOS") { $record = Parse-IDOS $line } }
        "IIDE" { if ($Type -eq "ALL" -or $Type -eq "IIDE") { $record = Parse-IIDE $line } }
    }

    if ($record -eq $null) { continue }

    # Filtrage par compte
    if ($Account -and $record.Compte -notlike "*$Account*") { continue }

    # Filtrage par nom (seulement pour ICLI)
    if ($Name -and $record.Type -eq "ICLI" -and $record.Nom -notlike "*$Name*") { continue }

    $records += $record
}

# Affichage
if ($Summary) {
    Write-Host "`n=== RESUME FICHIER RV.HST ==="
    Write-Host "Chemin: $Path"
    Write-Host "Total enregistrements: $($records.Count)"
    $records | Group-Object Type | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Count)"
    }

    if ($Account) {
        Write-Host "`n=== DETAILS COMPTE $Account ==="
        $ilog = $records | Where-Object { $_.Type -eq "ILOG" } | Select-Object -First 1
        if ($ilog) {
            Write-Host "Village: $($ilog.Village)"
            Write-Host "Date fichier: $($ilog.DateFichier)"
            Write-Host "Date debut: $($ilog.DateDebut)"
            Write-Host "Date fin: $($ilog.DateFin)"
        }

        Write-Host "`nMembres du dossier:"
        $records | Where-Object { $_.Type -eq "ICLI" } | ForEach-Object {
            Write-Host "  Filiation $($_.Filiation): $($_.Nom) $($_.Prenom) ($($_.Genre))"
        }
    }
} elseif ($Raw) {
    $records | ForEach-Object { $_.RawLine }
} else {
    # Affichage tabulaire
    $records | Select-Object Type, Village, Compte, Filiation, @{N='Nom';E={if($_.Nom){$_.Nom}else{'-'}}}, @{N='DateDebut';E={if($_.DateDebut){$_.DateDebut}else{'-'}}}, @{N='DateFin';E={if($_.DateFin){$_.DateFin}else{'-'}}} | Format-Table -AutoSize
}
