# Lessons Learned - Pipeline V6.0

> Ce fichier documente les erreurs commises et les solutions validees pour eviter de les repeter.

---

## Erreur #1: SQLite DLL vs KbIndexRunner CLI

### Contexte
Les Phases 2-4 du pipeline ont besoin d'acceder a la Knowledge Base SQLite pour extraire variables, expressions et forms.

### Approche INCORRECTE (a ne plus utiliser)

```powershell
# MAUVAIS - Chargement direct de la DLL SQLite dans PowerShell
Add-Type -Path "$KbIndexRunnerPath\bin\Debug\net8.0\Microsoft.Data.Sqlite.dll"
$connection = New-Object Microsoft.Data.Sqlite.SqliteConnection("Data Source=$kbPath")
```

**Pourquoi ca echoue:**
- La DLL `Microsoft.Data.Sqlite.dll` a des dependances natives (SQLitePCLRaw)
- PowerShell ne resout pas correctement ces dependances
- Erreur: "Impossible de charger un ou plusieurs des types requis. Extrayez la propriete LoaderExceptions"

### Approche CORRECTE (validee)

```powershell
# BON - Utiliser KbIndexRunner CLI qui gere ses propres dependances
$cmd = "cd '$KbIndexRunnerPath'; dotnet run -- variables '$Project $IdePosition'"
$jsonOutput = powershell -NoProfile -Command $cmd 2>&1
$data = $jsonOutput | ConvertFrom-Json
```

**Pourquoi ca marche:**
- `dotnet run` charge correctement toutes les dependances .NET
- Le CLI retourne du JSON propre
- Pas de probleme de resolution de DLL natives

### Commandes CLI disponibles

| Commande | Usage | Output |
|----------|-------|--------|
| `variables` | `dotnet run -- variables "ADH 237"` | JSON avec local/virtual/global/parameters |
| `expressions` | `dotnet run -- expressions "ADH 237" --limit 500` | JSON avec toutes les expressions |
| `forms-json` | `dotnet run -- forms-json "ADH 237"` | JSON avec forms et dimensions |
| `spec-data` | `dotnet run -- spec-data "ADH 237"` | JSON complet pour specs |

### Performance

| Approche | Temps startup | Fiabilite |
|----------|---------------|-----------|
| SQLite DLL direct | ~0ms | **FRAGILE** - echoue souvent |
| KbIndexRunner CLI | ~1-2s | **FIABLE** - toujours fonctionne |

**Decision:** Le leger overhead du CLI est acceptable car la fiabilite est prioritaire.

---

## Erreur #2: Structure JSON discovery.json

### Probleme
Le code Phase2-Mapping.ps1 attendait une structure differente de celle generee par Phase1.

### Mauvais code
```powershell
foreach ($table in $discovery.tables) {
    $tableColumns[$table.id] = @{ ... }  # ERREUR: tables est un objet, pas un array
}
```

### Bon code
```powershell
$tablesArray = $discovery.tables.all  # L'array est dans .all
foreach ($table in $tablesArray) {
    if ($table.id) {
        $tableColumns["$($table.id)"] = @{
            logical = $table.logical_name    # PAS "logical"
            physical = $table.physical_name  # PAS "physical"
            access = $table.access_mode      # PAS "access"
        }
    }
}
```

### Lecon
Toujours verifier la structure JSON reelle avec `Get-Content | Select-Object -First 50` avant d'ecrire le code de parsing.

---

## Erreur #3: Types PowerShell dans les regex

### Probleme
La fonction `Convert-FieldToLetter` echouait avec "Cast non valide de 'Decimal' en 'Char'".

### Mauvais code
```powershell
$result = [char](($n % 26) + [int][char]'A') + $result
# $n % 26 peut retourner un Decimal selon le contexte
```

### Bon code
```powershell
[int]$remainder = $n % 26
[int]$charCode = $remainder + 65  # 65 = 'A'
$result = [char]$charCode + $result
```

### Lecon
Dans PowerShell, toujours caster explicitement les types intermediaires, surtout avec les operations mathematiques qui peuvent retourner des Decimal.

---

## Resume des Regles

| Regle | Faire | Ne pas faire |
|-------|-------|--------------|
| Acces KB SQLite | KbIndexRunner CLI | Charger DLL SQLite |
| Structure JSON | Verifier avant coder | Supposer la structure |
| Types PowerShell | Caster explicitement | Laisser l'inference |
| Nouveaux scripts | Copier patterns valides | Reinventer |

---

*Derniere mise a jour: 2026-01-28 - Post correction Phases 2-4*
