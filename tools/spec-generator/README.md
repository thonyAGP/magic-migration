# Spec Generator

> Pipeline de generation et maintenance des specifications ADH

## Scripts Disponibles

| Script | Phase | Description |
|--------|-------|-------------|
| `Generate-TechSpec.ps1` | P1 | Generation initiale spec V2.1 |
| `Upgrade-SpecsToV35.ps1` | P2 | Upgrade structure V2.1 → V3.5 |
| **`Populate-SpecData.ps1`** | **P4** | **Peuple les specs avec donnees MCP** |
| `Generate-MigrationBlueprint.ps1` | P3 | Genere squelette C# depuis spec |
| `Generate-TestsFromSpec.ps1` | P3 | Genere tests xUnit/Vitest |

## Workflow Recommande

```
1. Generate-TechSpec.ps1      → Cree spec V2.1 basique
2. Upgrade-SpecsToV35.ps1     → Ajoute TAB markers + Mermaid
3. Populate-SpecData.ps1      → Extrait VRAIES donnees via MCP
4. Generate-MigrationBlueprint → Genere code C# depuis spec
```

## Usage

### Peupler une spec unique

```powershell
.\Populate-SpecData.ps1 -IDE 237
```

### Peupler un lot de specs

```powershell
.\Populate-SpecData.ps1 -StartIDE 1 -EndIDE 50
```

### Peupler TOUTES les specs (322 vides)

```powershell
.\Populate-SpecData.ps1 -All
```

### Mode dry-run (previsualisation)

```powershell
.\Populate-SpecData.ps1 -IDE 237 -DryRun
```

## Prerequis

- MCP Server doit etre demarre (`dotnet run` dans tools/MagicMcp)
- Knowledge Base peuplee (`KbIndexRunner.exe`)
- Specs V3.5 existantes (via Upgrade-SpecsToV35.ps1)

## Donnees Extraites

| Section | Source MCP | Contenu |
|---------|------------|---------|
| 2.2 Tables | `magic_get_table` | Tables utilisees avec acces R/W |
| 2.3 Parametres | `magic_get_params` | Parametres d'entree du programme |
| 2.5 Expressions | `magic_kb_expressions` | Expressions cles decodees |
| 3.2 Callers | `magic_kb_callers` | Programmes appelants |
| 3.3 Callees | `magic_kb_callees` | Programmes appeles (3 niveaux) |

## Statistiques PDCA (2026-01-27)

| Metrique | Avant | Apres | Gap |
|----------|-------|-------|-----|
| Specs V3.5 | 323 | 323 | - |
| Specs avec DATA | **1** | **323** | **+322** |
| Tables extraites | 30 | ~3000 | - |
| Expressions decodees | 547 | ~10000 | - |

## Troubleshooting

### MCP Server non connecte

```
MCP call failed for magic_get_table : Connection refused
```

**Solution**: Demarrer le MCP Server
```powershell
cd D:\Projects\Lecteur_Magic\tools\MagicMcp
dotnet run
```

### Spec non trouvee

```
[SKIP] ADH-IDE-999 (File not found)
```

**Solution**: Verifier que le spec existe dans `.openspec/specs/`

### Deja peuplee

```
[SKIP] ADH-IDE-237 (Already has data)
```

**Solution**: Utiliser `-Force` pour re-peupler
```powershell
.\Populate-SpecData.ps1 -IDE 237 -Force
```

---

*Dernier audit PDCA: 2026-01-27 - Gap critique corrige: 322 specs vides*
