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

## Erreur #4: Cold Start dotnet - Timing trompeur

### Contexte
Lors de l'analyse de plusieurs programmes en sequence, les temps d'execution semblaient incoherents:
- ADH IDE 236 (19 expressions): **2m04s** wall-clock
- ADH IDE 237 (305 expressions): **34s** wall-clock

Comment un programme plus complexe peut-il s'executer 4x plus vite?

### Cause: Cold Start vs Warm Start

Le runtime .NET doit etre compile/charge lors de la **premiere** execution:

| Execution | Programme | Pipeline | Startup dotnet | Wall-Clock |
|-----------|-----------|----------|----------------|------------|
| 1ere (cold) | IDE 236 | 23.3s | **101s** | 124s (2m04s) |
| 2eme (warm) | IDE 237 | 15.8s | **18s** | 34s |

### Decomposition du temps

```
Wall-Clock = Temps Pipeline + Temps Startup dotnet

Cold start (1ere execution):
  - Compilation JIT du code .NET
  - Chargement des assemblies
  - Initialisation SQLite
  - ~100s d'overhead

Warm start (executions suivantes):
  - Runtime deja en memoire
  - Assemblies deja charges
  - ~15-20s d'overhead
```

### Impact sur les mesures

| Metrique | Signification | Utiliser pour |
|----------|---------------|---------------|
| **Wall-clock** | Temps reel ecoule | Planning, SLA utilisateur |
| **Pipeline duration** | Temps de traitement pur | Comparaison entre programmes |

### Solution: Toujours rapporter les DEUX temps

```markdown
> **Debut**: 2026-01-28 17:45:05
> **Fin**: 2026-01-28 17:47:09
> **Duree pipeline**: 23.3s
```

Le champ `pipeline-report.json` contient `duration_seconds` qui est le temps pipeline pur.

### Lecon
- Ne JAMAIS comparer des wall-clock times entre programmes
- La premiere execution d'une session a un overhead de ~100s
- Utiliser `duration_seconds` du rapport pour les comparaisons
- Pour des benchmarks fiables, faire un "warm-up run" d'abord

### Comment eviter la confusion

1. **Batch d'analyses**: Lancer un programme "dummy" d'abord pour warmer le runtime
2. **Documentation**: Toujours indiquer si c'etait un cold/warm start
3. **Rapports**: Utiliser la duree pipeline, pas le wall-clock

---

## Erreur #5: KB partiellement indexee - Expressions non liees

### Contexte
Lors de l'execution de Phase1-Discovery, les donnees retournaient 0 pour tables, callers, callees et expressions, bien que le programme existait dans la KB.

### Symptomes
```
DEBUG: dbProgramId = 50054
DEBUG: exprCount for 50054 = 0, total expressions = 2353
```

Les expressions existaient (2353) mais aucune n'etait liee au program_id du programme demande.

### Diagnostic
```powershell
# Ajouter ce debug dans spec-data pour voir quels programs ont des expressions
SELECT e.program_id, p.ide_position, p.name, COUNT(*) as cnt
FROM expressions e
JOIN programs p ON e.program_id = p.id
GROUP BY e.program_id
ORDER BY cnt DESC LIMIT 10
```

### Cause
La KB avait ete partiellement reindexee ou corrompue. Les IDs de programmes avaient change entre les indexations, creant des orphelins.

### Solution
Reindexer completement la KB:
```bash
cd tools/KbIndexRunner
dotnet run -- "D:/Data/Migration/XPA/PMS"
```

### Verification post-reindexation
```
DEBUG: dbProgramId = 233
DEBUG: exprCount for 233 = 305, total expressions = 43539
```

### Lecon
- Toujours verifier que les donnees sont bien liees apres une reindexation
- Utiliser les logs DEBUG pour confirmer les IDs
- En cas de doute, reindexer completement plutot que incrementalement

---

## Resume des Regles

| Regle | Faire | Ne pas faire |
|-------|-------|--------------|
| Acces KB SQLite | KbIndexRunner CLI | Charger DLL SQLite |
| Structure JSON | Verifier avant coder | Supposer la structure |
| Types PowerShell | Caster explicitement | Laisser l'inference |
| Nouveaux scripts | Copier patterns valides | Reinventer |
| Timing comparaisons | `duration_seconds` pipeline | Wall-clock time |
| Batch analyses | Warm-up run d'abord | Comparer cold vs warm |
| KB suspecte | Reindexer completement | Indexation incrementale |
| Donnees manquantes | Verifier DEBUG logs | Supposer que ca marche |

---

*Derniere mise a jour: 2026-01-28 - Post diagnostic KB corrompue et plan enrichissement KB*
